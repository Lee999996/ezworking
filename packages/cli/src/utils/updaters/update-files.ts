import { existsSync, promises as fs } from 'node:fs'
import path, { basename } from 'node:path'
import prompts from 'prompts'

import type { Config } from '#utils/get-config'
import { getProjectInfo } from '#utils/get-project-info'
import { highlighter } from '#utils/highlighter'
import { logger } from '#utils/logger'
import { getRegistryItemFileTargetPath } from '#utils/registry'
import type { RegistryItem } from '#utils/registry/schema'
import { spinner } from '#utils/spinner'
import { transform } from '#utils/transformers'
import { transformImport } from '#utils/transformers/transform-import'
import { transformRsc } from '#utils/transformers/transform-rsc'

export function resolveTargetDir(
  projectInfo: Awaited<ReturnType<typeof getProjectInfo>>,
  config: Config,
  target: string,
) {
  if (target.startsWith('~/')) {
    return path.join(config.resolvedPaths.cwd, target.replace('~/', ''))
  }
  return projectInfo?.isSrcDir
    ? path.join(config.resolvedPaths.cwd, 'src', target)
    : path.join(config.resolvedPaths.cwd, target)
}

export async function updateFiles(
  files: RegistryItem['files'],
  config: Config,
  options: {
    overwrite?: boolean
    force?: boolean
    silent?: boolean
  },
) {
  if (!files?.length) {
    return
  }
  options = {
    overwrite: false,
    force: false,
    silent: false,
    ...options,
  }
  const filesCreatedSpinner = spinner(`Updating files.`, {
    silent: options.silent,
  })?.start()

  const [projectInfo] = await Promise.all([
    getProjectInfo(config.resolvedPaths.cwd),
    // getRegistryBaseColor(config.tailwind.baseColor),
  ])

  const filesCreated = []
  const filesUpdated = []
  const filesSkipped = []

  for (const file of files) {
    if (!file.content) {
      continue
    }

    let targetDir = getRegistryItemFileTargetPath(file, config)
    const fileName = basename(file.path)
    let filePath = path.join(targetDir, fileName)

    if (file.target) {
      filePath = resolveTargetDir(projectInfo, config, file.target)
      targetDir = path.dirname(filePath)
    }

    if (!config.tsx) {
      filePath = filePath.replace(/\.tsx?$/, (match) =>
        match === '.tsx' ? '.jsx' : '.js',
      )
    }

    const existingFile = existsSync(filePath)
    if (existingFile && !options.overwrite) {
      filesCreatedSpinner.stop()
      const { overwrite } = await prompts({
        type: 'confirm',
        name: 'overwrite',
        message: `The file ${highlighter.info(
          fileName,
        )} already exists. Would you like to overwrite?`,
        initial: false,
      })

      if (!overwrite) {
        filesSkipped.push(path.relative(config.resolvedPaths.cwd, filePath))
        continue
      }
      filesCreatedSpinner?.start()
    }

    // Create the target directory if it doesn't exist.
    if (!existsSync(targetDir)) {
      await fs.mkdir(targetDir, { recursive: true })
    }

    // Run our transformers.
    const content = await transform(
      {
        filename: file.path,
        raw: file.content,
        config,
        transformJsx: !config.tsx,
      },
      [transformImport, transformRsc],
    )

    await fs.writeFile(filePath, content, 'utf-8')
    existingFile
      ? filesUpdated.push(path.relative(config.resolvedPaths.cwd, filePath))
      : filesCreated.push(path.relative(config.resolvedPaths.cwd, filePath))
  }

  const hasUpdatedFiles = filesCreated.length || filesUpdated.length
  if (!hasUpdatedFiles && !filesSkipped.length) {
    filesCreatedSpinner?.info('No files updated.')
  }

  if (filesCreated.length) {
    filesCreatedSpinner?.succeed(
      `Created ${filesCreated.length} ${
        filesCreated.length === 1 ? 'file' : 'files'
      }:`,
    )
    if (!options.silent) {
      for (const file of filesCreated) {
        logger.log(`  - ${file}`)
      }
    }
  } else {
    filesCreatedSpinner?.stop()
  }

  if (filesUpdated.length) {
    spinner(
      `Updated ${filesUpdated.length} ${
        filesUpdated.length === 1 ? 'file' : 'files'
      }:`,
      {
        silent: options.silent,
      },
    )?.info()
    if (!options.silent) {
      for (const file of filesUpdated) {
        logger.log(`  - ${file}`)
      }
    }
  }

  if (filesSkipped.length) {
    spinner(
      `Skipped ${filesSkipped.length} ${
        filesUpdated.length === 1 ? 'file' : 'files'
      }:`,
      {
        silent: options.silent,
      },
    )?.info()
    if (!options.silent) {
      for (const file of filesSkipped) {
        logger.log(`  - ${file}`)
      }
    }
  }

  if (!options.silent) {
    logger.break()
  }
}

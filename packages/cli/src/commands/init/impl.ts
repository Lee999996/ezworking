import { promises as fs } from 'node:fs'
import path from 'node:path'
import prompts from 'prompts'
import { z } from 'zod'

import * as ERRORS from '#utils/errors'
import { SCHEMA_URL } from '#constants'
import type { LocalContext } from '#context'
import { preFlightInit } from '#preflights/preflight-init'
import { addComponents } from '#utils/add-components'
import {
  type Config,
  DEFAULT_COMPONENTS,
  DEFAULT_UTILS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
} from '#utils/get-config'
import { getProjectConfig, getProjectInfo } from '#utils/get-project-info'
import { handleError } from '#utils/handle-error'
import { highlighter } from '#utils/highlighter'
import { logger } from '#utils/logger'
import { getRegistryBaseColors, getRegistryStyles } from '#utils/registry'
import { spinner } from '#utils/spinner'

export const initOptionsSchema = z.object({
  cwd: z.string(),
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  defaults: z.boolean(),
  force: z.boolean(),
  silent: z.boolean(),
})

type InitCommandFlags = z.infer<typeof initOptionsSchema>

type InitOptions = InitCommandFlags & {
  isNewProject?: boolean
  skipPreflight?: boolean
}

export async function init(
  this: LocalContext,
  flags: InitCommandFlags,
  ...components: Array<string>
): Promise<void> {
  try {
    const options = initOptionsSchema.parse({
      ...flags,
      cwd: path.resolve(flags.cwd ?? process.cwd()),
      isNewProject: false,
      components,
    })

    await runInit(options)

    logger.log(
      `${highlighter.success(
        'Success!',
      )} Project initialization completed.\nYou may now add components.`,
    )
    logger.break()
  } catch (error) {
    logger.break()
    handleError(error)
  }
}

export async function runInit(options: InitOptions) {
  let projectInfo
  if (!options.skipPreflight) {
    const preflight = await preFlightInit(options)
    if (preflight.errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT]) {
      process.exit(1)
    }
    projectInfo = preflight.projectInfo
  } else {
    projectInfo = await getProjectInfo(options.cwd)
  }

  const projectConfig = await getProjectConfig(options.cwd, projectInfo)
  const config = projectConfig
    ? await promptForMinimalConfig(projectConfig, options)
    : await promptForConfig(await getConfig(options.cwd))

  if (!options.yes) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Write configuration to ${highlighter.info(
        'components.json',
      )}. Proceed?`,
      initial: true,
    })

    if (!proceed) {
      process.exit(0)
    }
  }

  // Write components.json.
  const componentSpinner = spinner(`Writing components.json.`).start()
  const targetPath = path.resolve(options.cwd, 'components.json')
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8')
  componentSpinner.succeed()

  // Add components.
  const fullConfig = await resolveConfigPaths(options.cwd, config)
  const components = ['index', ...(options.components || [])]
  await addComponents(components, fullConfig, {
    // Init will always overwrite files.
    overwrite: true,
    silent: options.silent,
    isNewProject:
      options.isNewProject || projectInfo?.framework.name === 'next-app',
  })

  return fullConfig
}

async function promptForConfig(defaultConfig: Config | null = null) {
  logger.info('')
  const options = await prompts([
    {
      type: 'toggle',
      name: 'typescript',
      message: `Would you like to use ${highlighter.info(
        'TypeScript',
      )} (recommended)?`,
      initial: defaultConfig?.tsx ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      name: 'components',
      message: `Configure the import alias for ${highlighter.info(
        'components',
      )}:`,
      initial: defaultConfig?.aliases['components'] ?? DEFAULT_COMPONENTS,
    },
    {
      type: 'text',
      name: 'utils',
      message: `Configure the import alias for ${highlighter.info('utils')}:`,
      initial: defaultConfig?.aliases['utils'] ?? DEFAULT_UTILS,
    },
    {
      type: 'toggle',
      name: 'rsc',
      message: `Are you using ${highlighter.info('React Server Components')}?`,
      initial: defaultConfig?.rsc ?? true,
      active: 'yes',
      inactive: 'no',
    },
  ])

  return rawConfigSchema.parse({
    $schema: SCHEMA_URL,
    system: 'chakra',
    style: 'default',
    rsc: options.rsc,
    tsx: options.typescript,
    aliases: {
      utils: options.utils,
      components: options.components,
      // TODO: fix this.
      lib: options.components.replace(/\/components$/, 'lib'),
      hooks: options.components.replace(/\/components$/, 'hooks'),
    },
  })
}

async function promptForMinimalConfig(
  defaultConfig: Config,
  opts: z.infer<typeof initOptionsSchema>,
) {
  let style = defaultConfig.style

  if (!opts.defaults) {
    const [styles, baseColors] = await Promise.all([
      getRegistryStyles(),
      getRegistryBaseColors(),
    ])

    const options = await prompts([
      {
        type: 'select',
        name: 'style',
        message: `Which ${highlighter.info('style')} would you like to use?`,
        choices: styles.map((style) => ({
          title: style.label,
          value: style.name,
        })),
        initial: styles.findIndex((s) => s.name === style),
      },
    ])

    style = options.style
  }

  return rawConfigSchema.parse({
    $schema: defaultConfig?.$schema,
    style,
    rsc: defaultConfig?.rsc,
    tsx: defaultConfig?.tsx,
    aliases: defaultConfig?.aliases,
  })
}

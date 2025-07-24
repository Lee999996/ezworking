import kleur from 'kleur'
import path from 'path'
import prompts from 'prompts'
import { z } from 'zod'

import * as ERRORS from '#utils/errors'
import { runInit } from '#commands/init/impl'
import { preFlightAdd } from '#preflights/preflight-add'
import { addComponents } from '#utils/add-components'
import { handleError } from '#utils/handle-error'
import { highlighter } from '#utils/highlighter'
import { logger } from '#utils/logger'
import { getRegistryIndex } from '#utils/registry'

import type { LocalContext } from '../../context'

export const addOptionsSchema = z.object({
  components: z.array(z.string()).optional(),
  yes: z.boolean(),
  overwrite: z.boolean(),
  cwd: z.string().optional(),
  all: z.boolean(),
  path: z.string().optional(),
  silent: z.boolean(),
  srcDir: z.boolean().optional(),
})

type AddCommandFlags = z.infer<typeof addOptionsSchema>

export type AddOptions = AddCommandFlags & {
  cwd: string
}

export async function add(
  this: LocalContext,
  flags: AddCommandFlags,
  ...components: Array<string>
): Promise<void> {
  try {
    const parsedFlags = addOptionsSchema.parse({
      ...flags,
      components: components ?? [],
    })

    const options = {
      ...parsedFlags,
      cwd: path.resolve(parsedFlags.cwd ?? process.cwd()),
    }

    if (!options.components?.length) {
      options.components = await promptForRegistryComponents(options)
    }

    /* @eslint-ignore: dont care about const here */
    const result = await preFlightAdd(options)

    let config = result.config

    // No components.json file. Prompt the user to run init.
    if (result.errors[ERRORS.MISSING_CONFIG]) {
      const { proceed } = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: `You need to create a ${highlighter.info(
          'components.json',
        )} file to add components. Proceed?`,
        initial: true,
      })

      if (!proceed) {
        logger.break()
        process.exit(1)
      }

      config = await runInit({
        cwd: options.cwd,
        yes: true,
        force: true,
        defaults: false,
        skipPreflight: false,
        silent: true,
        isNewProject: false,
      })
    }

    if (!config) {
      throw new Error(
        `Failed to read config at ${highlighter.info(options.cwd)}.`,
      )
    }

    await addComponents(options.components, config, options)
  } catch (error) {
    logger.break()
    handleError(error)
  }
}

async function installTheme(options: AddOptions) {
  // Confirm if user is installing themes.
  // For now, we assume a theme is prefixed with "theme-".
  const isTheme = options.components?.some((component) =>
    component.includes('theme-'),
  )
  if (!options.yes && isTheme) {
    logger.break()
    const { confirm } = await prompts({
      type: 'confirm',
      name: 'confirm',
      message: highlighter.warn(
        'You are about to install a new theme. \nExisting CSS variables will be overwritten. Continue?',
      ),
    })
    if (!confirm) {
      logger.break()
      logger.log('Theme installation cancelled.')
      logger.break()
      process.exit(1)
    }
  }
}

async function promptForRegistryComponents(
  options: z.infer<typeof addOptionsSchema>,
) {
  const registryIndex = await getRegistryIndex()
  if (!registryIndex) {
    logger.break()
    handleError(new Error('Failed to fetch registry index.'))
    return []
  }

  if (options.all) {
    return registryIndex.map((entry) => entry.name)
  }

  if (options.components?.length) {
    return options.components
  }

  const { components } = await prompts({
    type: 'autocompleteMultiselect',
    name: 'components',
    message: 'Which components would you like to add?',
    hint: 'Space to select. A to toggle all. Enter to submit.',
    instructions: false,
    choices: registryIndex
      .filter((entry) => entry.type === 'registry:block')
      .map((entry) => ({
        title: `${entry.category}/${entry.subcategory}/${entry.name} ${entry.private ? kleur.blue(kleur.bold('(PRO)')) : ''}`,
        value: entry.name,
        selected: options.all ? true : options.components?.includes(entry.name),
      })),
  })

  if (!components?.length) {
    logger.warn('No components selected. Exiting.')
    logger.info('')
    process.exit(1)
  }

  const result = z.array(z.string()).safeParse(components)
  if (!result.success) {
    logger.error('')
    handleError(new Error('Something went wrong. Please try again.'))
    return []
  }
  return result.data
}

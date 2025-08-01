import fs from 'fs-extra'
import path from 'path'

import * as ERRORS from '#utils/errors'
import { type AddOptions } from '#commands/add/impl'
import { getConfig } from '#utils/get-config'
import { highlighter } from '#utils/highlighter'
import { logger } from '#utils/logger'

export async function preFlightAdd(options: AddOptions) {
  const errors: Record<string, boolean> = {}

  // Ensure target directory exists.
  // Check for empty project. We assume if no package.json exists, the project is empty.
  if (
    !fs.existsSync(options.cwd) ||
    !fs.existsSync(path.resolve(options.cwd, 'package.json'))
  ) {
    errors[ERRORS.MISSING_DIR_OR_EMPTY_PROJECT] = true
    return {
      errors,
      config: null,
    }
  }

  // Check for existing components.json file.
  if (!fs.existsSync(path.resolve(options.cwd, 'components.json'))) {
    errors[ERRORS.MISSING_CONFIG] = true
    return {
      errors,
      config: null,
    }
  }

  try {
    const config = await getConfig(options.cwd!)

    return {
      errors,
      config: config!,
    }
  } catch (error) {
    logger.debug(error)
    console.log(error)
    logger.break()
    logger.error(
      `An invalid ${highlighter.info(
        'components.json',
      )} file was found at ${highlighter.info(
        options.cwd,
      )}.\nBefore you can add components, you must create a valid ${highlighter.info(
        'components.json',
      )} file by running the ${highlighter.info('init')} command.`,
    )
    logger.error(
      `Learn more at ${highlighter.info(
        'https://saas-ui.dev/docs/components-json',
      )}.`,
    )
    logger.break()
    process.exit(1)
  }
}

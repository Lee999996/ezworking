import { cosmiconfig } from 'cosmiconfig'
import path from 'node:path'
import { loadConfig } from 'tsconfig-paths'
import { z } from 'zod'

import { highlighter } from '#utils/highlighter'
import { resolveImport } from '#utils/resolve-import'

export const DEFAULT_STYLE = 'default'
export const DEFAULT_COMPONENTS = '@/components'
export const DEFAULT_UTILS = '@/lib/utils'
export const DEFAULT_TAILWIND_CSS = 'app/globals.css'
export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js'
export const DEFAULT_TAILWIND_BASE_COLOR = 'slate'

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
const explorer = cosmiconfig('components', {
  searchPlaces: ['components.json'],
})

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    system: z.string().optional().default('chakra'),
    style: z.string().optional().default('default'),
    rsc: z.coerce.boolean().default(false),
    tsx: z.coerce.boolean().default(true),
    // theme: z.object({
    //   config: z.string(),
    // }),
    aliases: z.object({
      components: z.string(),
      utils: z.string(),
      ui: z.string().optional(),
      lib: z.string().optional(),
      hooks: z.string().optional(),
    }),
  })
  .strict()

export type RawConfig = z.infer<typeof rawConfigSchema>

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    cwd: z.string(),
    utils: z.string(),
    components: z.string(),
    lib: z.string(),
    hooks: z.string(),
    ui: z.string(),
  }),
})

export type Config = z.infer<typeof configSchema>

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd)

  if (!config) {
    return null
  }

  return await resolveConfigPaths(cwd, config)
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {
  // Read tsconfig.json.
  const tsConfig = await loadConfig(cwd)

  if (tsConfig.resultType === 'failed') {
    throw new Error(
      `Failed to load ${config.tsx ? 'tsconfig' : 'jsconfig'}.json. ${
        tsConfig.message ?? ''
      }`.trim(),
    )
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      cwd,
      utils: await resolveImport(config.aliases['utils'], tsConfig),
      components: await resolveImport(config.aliases['components'], tsConfig),
      ui: config.aliases['ui']
        ? await resolveImport(config.aliases['ui'], tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases['components'], tsConfig)) ??
              cwd,
            'ui',
          ),
      // TODO: Make this configurable.
      // For now, we assume the lib and hooks directories are one level up from the components directory.
      lib: config.aliases['lib']
        ? await resolveImport(config.aliases['lib'], tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases['utils'], tsConfig)) ?? cwd,
            '..',
          ),
      hooks: config.aliases['hooks']
        ? await resolveImport(config.aliases['hooks'], tsConfig)
        : path.resolve(
            (await resolveImport(config.aliases['components'], tsConfig)) ??
              cwd,
            '..',
            'hooks',
          ),
    },
  })
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd)

    if (!configResult) {
      return null
    }

    return rawConfigSchema.parse(configResult.config)
  } catch (error) {
    const componentPath = `${cwd}/components.json`
    throw new Error(
      `Invalid configuration found in ${highlighter.info(componentPath)}.`,
    )
  }
}

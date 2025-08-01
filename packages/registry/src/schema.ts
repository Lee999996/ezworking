import { z } from 'zod'

export const blockChunkSchema = z.object({
  name: z.string(),
  description: z.string(),
  component: z.any(),
  file: z.string(),
  code: z.string().optional(),
  container: z
    .object({
      className: z.string().nullish(),
    })
    .optional(),
})

export const registryItemTypeSchema = z.enum([
  'registry:style',
  'registry:lib',
  'registry:example',
  'registry:block',
  'registry:component',
  'registry:ui',
  'registry:hook',
  'registry:theme',
  'registry:page',
  'registry:story',
])

export const registryItemFileSchema = z.union([
  z.string(),
  z.object({
    path: z.string(),
    content: z.string().optional(),
    type: registryItemTypeSchema,
    target: z.string().optional(),
  }),
])

export const registryItemTailwindSchema = z.object({
  config: z.object({
    content: z.array(z.string()).optional(),
    theme: z.record(z.string(), z.any()).optional(),
    plugins: z.array(z.string()).optional(),
  }),
})

export const registryItemCssVarsSchema = z.object({
  light: z.record(z.string(), z.string()).optional(),
  dark: z.record(z.string(), z.string()).optional(),
})

export const registryEntrySchema = z.object({
  name: z.string(),
  type: registryItemTypeSchema,
  version: z.string().optional(),
  private: z.boolean().optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(registryItemFileSchema).optional(),
  cssVars: registryItemCssVarsSchema.optional(),
  source: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  chunks: z.array(blockChunkSchema).optional(),
  docs: z.string().optional(),
  canvas: z
    .object({
      center: z.boolean().optional(),
      maxWidth: z.string().optional(),
      height: z.string().optional(),
      className: z.string().optional(),
    })
    .optional(),
})

export const registrySchema = z.array(registryEntrySchema)

export type RegistryEntry = z.infer<typeof registryEntrySchema>

export type Registry = z.infer<typeof registrySchema>

export const blockSchema = registryEntrySchema.extend({
  type: z.literal('registry:block'),
  component: z.any(),
  code: z.string(),
  highlightedCode: z.string(),
})

export type Block = z.infer<typeof blockSchema>

export type BlockChunk = z.infer<typeof blockChunkSchema>

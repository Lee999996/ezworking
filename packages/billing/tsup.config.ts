import { defineConfig } from 'tsup'

export default defineConfig({
  target: 'es2019',
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  external: ['react', '@chakra-ui/react', '@chakra-ui/utils'],
  format: ['esm', 'cjs'],
  banner: {
    js: "'use client'",
  },
})

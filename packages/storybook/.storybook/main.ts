import type { StorybookConfig } from '@storybook/react-vite'

export default {
  stories: [
    {
      directory: '../../',
      files: '*/!(node_modules)/**/*.@(mdx|stories.@(tsx))',
    },
  ],

  core: {
    builder: '@storybook/builder-vite',
  },

  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-toolbars',
    '@storybook/addon-viewport',
    '@storybook/addon-docs',
    '@storybook/addon-controls',
    '@storybook/addon-links',
  ],

  staticDirs: ['./static'],

  typescript: {
    reactDocgen: false,
  },

  refs: (config, { configType }) => {
    const refs = {
      '@chakra-ui/react': {
        disable: true, // Make sure Chakra gets loaded last
      },

      chakra: {
        title: 'Chakra UI',
        url: 'https://storybook.chakra-ui.com',
      },
    }
    return {
      '@saas-ui/react': {
        title: 'Saas UI',
        url: 'https://storybook.saas-ui.dev',
      },
      ...refs,
    }
  },

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
} satisfies StorybookConfig

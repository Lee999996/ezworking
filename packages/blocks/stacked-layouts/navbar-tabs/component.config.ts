import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'navbar-tabs',
  description: 'Navbar with tabs.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Layouts',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/stacked-layouts/navbar-tabs/navbar-tabs.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/stacked-layouts/navbar-tabs/navbar-tabs.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

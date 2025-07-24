import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'sidebar-with-navbar',
  description: 'Sidebar layout with navbar.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Layouts',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/sidebar-layouts/sidebar-with-navbar/sidebar-with-navbar.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/sidebar-layouts/sidebar-with-navbar/sidebar-with-navbar.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

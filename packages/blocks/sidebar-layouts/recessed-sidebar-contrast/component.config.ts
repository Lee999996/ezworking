import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'recessed-sidebar-contrast',
  description: 'Recessed sidebar layout with contrast.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Layouts',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/sidebar-layouts/recessed-sidebar-contrast/recessed-sidebar-contrast.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/sidebar-layouts/recessed-sidebar-contrast/recessed-sidebar-contrast.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

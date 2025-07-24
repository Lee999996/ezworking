import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'navbar-branded',
  description: 'Navbar with brand background color.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Layouts',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/stacked-layouts/navbar-branded/navbar-branded.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/stacked-layouts/navbar-branded/navbar-branded.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

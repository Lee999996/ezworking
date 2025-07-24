import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'sortable-nav-group-items',
  description: 'Sortable nav group items.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Layouts',
  type: 'registry:block',
  dependencies: [
    '@chakra-ui/react',
    '@saas-ui/react',
    'react-icons',
    '@dnd-kit/utilities',
    '@dnd-kit/core',
    '@dnd-kit/sortable',
  ],
  files: [
    {
      path: 'blocks/sidebar-layouts/sortable-nav-group/sortable-nav-group.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/sidebar-layouts/sortable-nav-group/sortable-nav-group.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'sortable-task-list',
  description: 'A list of tasks with drag and drop sorting.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Lists',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/lists/sortable-task-list/sortable-task-list.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/lists/sortable-task-list/sortable-task-list.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '400px',
  },
} satisfies RegistryEntry

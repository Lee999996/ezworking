import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'task-card-with-properties',
  description: 'A task card with properties',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Cards',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/cards/task-card-with-properties/task-card-with-properties.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/cards/task-card-with-properties/task-card-with-properties.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    maxWidth: '380px',
  },
} satisfies RegistryEntry

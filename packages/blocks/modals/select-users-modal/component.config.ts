import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'select-users-modal',
  description: 'A modal for selecting users.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Modals',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/modals/select-users-modal/select-users-modal.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/modals/select-users-modal/user-persona.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/modals/select-users-modal/select-users-modal.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '840px',
  },
} satisfies RegistryEntry

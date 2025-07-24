import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'manage-tags-modal',
  description: 'A modal for managing tags.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Modals',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/modals/manage-tags-modal/manage-tags-modal.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/modals/manage-tags-modal/manage-tags-modal.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '840px',
  },
} satisfies RegistryEntry

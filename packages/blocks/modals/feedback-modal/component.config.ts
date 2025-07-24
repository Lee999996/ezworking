import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'feedback-modal',
  description: 'A modal for providing feedback.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Modals',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/modals/feedback-modal/feedback-modal.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/modals/feedback-modal/feedback-modal.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '540px',
  },
} satisfies RegistryEntry

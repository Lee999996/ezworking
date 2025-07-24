import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'invite-people-modal',
  description: 'A modal for inviting people to a workspace.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Modals',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/modals/invite-people-modal/invite-people-modal.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/modals/invite-people-modal/invite-people-modal.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '500px',
  },
} satisfies RegistryEntry

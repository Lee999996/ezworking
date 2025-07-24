import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'workspace-members-settings',
  description: 'Settings section for managing workspace members.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Settings',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/settings/workspace-members-settings/workspace-members-settings.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/settings/workspace-members-settings/workspace-members-settings.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

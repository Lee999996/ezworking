import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'notification-settings',
  description: 'Settings section for managing notifications.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Settings',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/settings/notification-settings/notification-settings.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/settings/notification-settings/notification-settings.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

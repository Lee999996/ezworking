import { RegistryEntry } from '@saas-ui/registry'

export default {
  name: 'chat-details',
  description: 'A panel with chat bubbles',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Communication',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/communication/chat-details/chat-details.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/communication/chat-details/chat-details.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

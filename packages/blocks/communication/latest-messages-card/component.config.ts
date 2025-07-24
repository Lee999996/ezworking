import { RegistryEntry } from '@saas-ui/registry'

export default {
  name: 'latest-messages-card',
  description: 'A card that displays the latest messages',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Communication',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/communication/latest-messages-card/latest-messages-card.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/communication/latest-messages-card/latest-messages-card.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    maxWidth: '480px',
  },
} satisfies RegistryEntry

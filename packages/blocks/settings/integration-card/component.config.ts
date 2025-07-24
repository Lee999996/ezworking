import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'integration-card',
  description: 'A card for displaying an integration.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Settings',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/settings/integration-card/integration-card.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/settings/integration-card/integration-card.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

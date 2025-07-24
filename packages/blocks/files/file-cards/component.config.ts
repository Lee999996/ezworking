import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'file-cards',
  description: 'A list of file card with a preview, icon and metadata',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Files',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/drawers/add-contact-drawer/add-contact-drawer.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/drawers/add-contact-drawer/add-contact-drawer.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

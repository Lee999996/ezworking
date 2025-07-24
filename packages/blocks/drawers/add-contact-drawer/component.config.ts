import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'add-contact-drawer',
  description: 'Drawer with a form to add a new contact',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Drawers',
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
    height: '800px',
  },
} satisfies RegistryEntry

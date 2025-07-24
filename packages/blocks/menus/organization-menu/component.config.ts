import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'organization-menu',
  description: 'A menu for switching organizations.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Menus',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/menus/organization-menu/organization-menu.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/menus/organization-menu/organization-menu.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '480px',
  },
} satisfies RegistryEntry

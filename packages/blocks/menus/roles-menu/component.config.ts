import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'roles-menu',
  description: 'A menu for switching roles.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Menus',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/menus/roles-menu/roles-menu.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/menus/roles-menu/roles-menu.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '480px',
  },
} satisfies RegistryEntry

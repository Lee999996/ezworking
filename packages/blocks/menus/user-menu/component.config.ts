import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: false,
  name: 'user-menu',
  description:
    'A menu that displays the logged in user information and actions.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'Menus',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/menus/user-menu/user-menu.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/menus/user-menu/user-menu.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
    height: '480px',
  },
} satisfies RegistryEntry

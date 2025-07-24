import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'metric-card-with-button',
  description:
    'A metric card that displays a KPI metric with a label, value, icon, difference and view reports button.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'KPI Cards',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/kpi-cards/metric-card-with-button/metric-card-with-button.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/kpi-cards/metric-card-with-button/metric-card-with-button.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'metric-card-with-icon',
  description:
    'A metric card that displays a KPI metric with a label, value, difference and icon.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'KPI Cards',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/kpi-cards/metric-card-with-icon/metric-card-with-icon.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/kpi-cards/metric-card-with-icon/metric-card-with-icon.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

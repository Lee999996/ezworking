import { RegistryEntry } from '@saas-ui/registry'

export default {
  private: true,
  name: 'metric-card-simple',
  description:
    'A metric card that displays a KPI metric with a label, value and difference.',
  version: '1.1.0',
  category: 'Application',
  subcategory: 'KPI Cards',
  type: 'registry:block',
  dependencies: ['@chakra-ui/react', '@saas-ui/react', 'react-icons'],
  files: [
    {
      path: 'blocks/kpi-cards/metric-card-simple/metric-card-simple.tsx',
      type: 'registry:component',
    },
    {
      path: 'blocks/kpi-cards/metric-card-simple/metric-card-simple.stories.tsx',
      type: 'registry:story',
    },
  ],
  canvas: {
    center: true,
  },
} satisfies RegistryEntry

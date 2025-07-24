// Mock career directions data structure
export interface CareerPath {
  id: string
  title: string
  description: string
  suitabilityScore: number
  timeframe: string
  priority: 'primary' | 'secondary' | 'alternative'
  requiredSkills: string[]
  skillGaps: string[]
  nextSteps: ActionItem[]
  careerProgression: CareerStep[]
  salaryProgression: SalaryRange[]
  marketOutlook: {
    demand: 'high' | 'medium' | 'low'
    growth: string
    description: string
  }
  resources: Resource[]
}

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  timeframe: string
  category: 'skill-development' | 'networking' | 'job-search' | 'certification' | 'experience'
  completed?: boolean
}

export interface CareerStep {
  position: string
  timeframe: string
  description: string
  requirements: string[]
  salaryRange?: SalaryRange
}

export interface SalaryRange {
  min: number
  max: number
  currency: string
  period: 'monthly' | 'yearly'
}

export interface Resource {
  id: string
  title: string
  type: 'course' | 'book' | 'website' | 'certification' | 'community' | 'tool'
  url?: string
  description: string
  cost?: 'free' | 'paid' | 'subscription'
  rating?: number
}

export interface CareerDirectionsData {
  summary: {
    totalPaths: number
    recommendedPath: string
    confidenceScore: number
    analysisDate: string
  }
  careerPaths: CareerPath[]
  overallRecommendations: string[]
  nextMilestones: ActionItem[]
  followUpActions: string[]
}

// Mock career directions data
export const mockCareerDirections: CareerDirectionsData = {
  summary: {
    totalPaths: 3,
    recommendedPath: 'path-1',
    confidenceScore: 88,
    analysisDate: new Date().toISOString()
  },
  careerPaths: [
    {
      id: 'path-1',
      title: '前端技术专家路线',
      description: '基于您的技术背景和兴趣，专注于前端技术深度发展，成为技术专家或架构师',
      suitabilityScore: 92,
      timeframe: '2-3年',
      priority: 'primary',
      requiredSkills: [
        '深度掌握React/Vue生态系统',
        '前端工程化和构建工具',
        '性能优化和监控',
        '微前端架构设计',
        '团队协作和技术分享'
      ],
      skillGaps: [
        '大型项目架构经验',
        '团队技术领导能力',
        '跨端开发技能'
      ],
      nextSteps: [
        {
          id: 'step-1-1',
          title: '提升架构设计能力',
          description: '学习微前端、模块联邦等前端架构模式，参与或主导大型项目架构设计',
          priority: 'high',
          timeframe: '3-6个月',
          category: 'skill-development'
        },
        {
          id: 'step-1-2',
          title: '建立技术影响力',
          description: '在技术社区分享经验，写技术博客，参与开源项目贡献',
          priority: 'medium',
          timeframe: '持续进行',
          category: 'networking'
        },
        {
          id: 'step-1-3',
          title: '寻找高级前端职位',
          description: '目标大厂高级前端工程师或技术专家岗位，薪资范围25-40K',
          priority: 'high',
          timeframe: '1-3个月',
          category: 'job-search'
        }
      ],
      careerProgression: [
        {
          position: '高级前端工程师',
          timeframe: '当前-1年',
          description: '负责复杂前端项目开发，参与技术选型和架构设计',
          requirements: ['3年以上前端经验', '精通主流框架', '有大型项目经验'],
          salaryRange: { min: 25000, max: 40000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '前端技术专家',
          timeframe: '1-2年',
          description: '制定前端技术标准，指导团队技术发展，参与产品架构决策',
          requirements: ['5年以上前端经验', '架构设计能力', '团队领导经验'],
          salaryRange: { min: 35000, max: 55000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '前端架构师/技术总监',
          timeframe: '2-3年',
          description: '负责整体前端技术战略，跨团队技术协调，技术创新推动',
          requirements: ['7年以上经验', '深度技术专长', '战略思维'],
          salaryRange: { min: 50000, max: 80000, currency: 'CNY', period: 'monthly' }
        }
      ],
      salaryProgression: [
        { min: 25000, max: 40000, currency: 'CNY', period: 'monthly' },
        { min: 35000, max: 55000, currency: 'CNY', period: 'monthly' },
        { min: 50000, max: 80000, currency: 'CNY', period: 'monthly' }
      ],
      marketOutlook: {
        demand: 'high',
        growth: '+15%年增长',
        description: '前端技术专家需求持续增长，特别是在大型互联网公司和新兴科技企业'
      },
      resources: [
        {
          id: 'res-1-1',
          title: '前端架构设计实战',
          type: 'course',
          url: 'https://example.com/frontend-architecture',
          description: '深入学习前端架构设计模式和最佳实践',
          cost: 'paid',
          rating: 4.8
        },
        {
          id: 'res-1-2',
          title: 'React源码解析',
          type: 'book',
          description: '深入理解React内部机制，提升技术深度',
          cost: 'paid',
          rating: 4.6
        },
        {
          id: 'res-1-3',
          title: '前端技术社区',
          type: 'community',
          url: 'https://github.com/frontend',
          description: '参与前端开源社区，建立技术影响力',
          cost: 'free'
        }
      ]
    },
    {
      id: 'path-2',
      title: '全栈技术管理路线',
      description: '结合技术背景发展管理能力，成为技术团队负责人或产品技术经理',
      suitabilityScore: 85,
      timeframe: '2-4年',
      priority: 'secondary',
      requiredSkills: [
        '全栈技术能力',
        '团队管理和沟通',
        '产品思维和业务理解',
        '项目管理和协调',
        '技术决策和规划'
      ],
      skillGaps: [
        '管理经验和领导力',
        '商业思维和市场洞察',
        '跨部门协作能力'
      ],
      nextSteps: [
        {
          id: 'step-2-1',
          title: '补强后端技术栈',
          description: '深入学习Node.js、数据库设计、系统架构等后端技术',
          priority: 'high',
          timeframe: '6-12个月',
          category: 'skill-development'
        },
        {
          id: 'step-2-2',
          title: '培养管理技能',
          description: '学习团队管理、项目管理、沟通协调等软技能',
          priority: 'high',
          timeframe: '持续进行',
          category: 'skill-development'
        },
        {
          id: 'step-2-3',
          title: '寻找技术管理机会',
          description: '在当前公司争取带团队机会，或寻找技术经理职位',
          priority: 'medium',
          timeframe: '6-12个月',
          category: 'job-search'
        }
      ],
      careerProgression: [
        {
          position: '全栈工程师',
          timeframe: '当前-1年',
          description: '掌握前后端技术，能够独立完成完整项目开发',
          requirements: ['前后端技术栈', '项目经验', '学习能力'],
          salaryRange: { min: 22000, max: 38000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '技术经理/Team Lead',
          timeframe: '1-2年',
          description: '带领小团队完成项目，参与技术决策和人员管理',
          requirements: ['技术深度', '管理能力', '沟通协调'],
          salaryRange: { min: 30000, max: 50000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '技术总监/VP',
          timeframe: '3-4年',
          description: '负责技术战略规划，管理多个技术团队，参与公司决策',
          requirements: ['管理经验', '战略思维', '业务理解'],
          salaryRange: { min: 45000, max: 80000, currency: 'CNY', period: 'monthly' }
        }
      ],
      salaryProgression: [
        { min: 22000, max: 38000, currency: 'CNY', period: 'monthly' },
        { min: 30000, max: 50000, currency: 'CNY', period: 'monthly' },
        { min: 45000, max: 80000, currency: 'CNY', period: 'monthly' }
      ],
      marketOutlook: {
        demand: 'high',
        growth: '+12%年增长',
        description: '技术管理人才稀缺，既懂技术又懂管理的复合型人才需求旺盛'
      },
      resources: [
        {
          id: 'res-2-1',
          title: '技术管理实战',
          type: 'course',
          description: '学习技术团队管理的方法和实践',
          cost: 'paid',
          rating: 4.5
        },
        {
          id: 'res-2-2',
          title: 'Node.js全栈开发',
          type: 'course',
          description: '补强后端技术能力，成为真正的全栈工程师',
          cost: 'paid',
          rating: 4.7
        },
        {
          id: 'res-2-3',
          title: 'PMP项目管理认证',
          type: 'certification',
          description: '获得项目管理专业认证，提升管理能力',
          cost: 'paid',
          rating: 4.3
        }
      ]
    },
    {
      id: 'path-3',
      title: '技术咨询专家路线',
      description: '利用技术专长进入咨询行业，为企业提供技术解决方案和数字化转型服务',
      suitabilityScore: 78,
      timeframe: '3-5年',
      priority: 'alternative',
      requiredSkills: [
        '深度技术专长',
        '商业思维和行业洞察',
        '客户沟通和演讲能力',
        '解决方案设计',
        '英语沟通能力'
      ],
      skillGaps: [
        '咨询方法论和框架',
        '商业分析能力',
        '客户关系管理',
        '行业知识积累'
      ],
      nextSteps: [
        {
          id: 'step-3-1',
          title: '积累行业经验',
          description: '在当前技术岗位深耕，积累不同行业的技术解决方案经验',
          priority: 'high',
          timeframe: '1-2年',
          category: 'experience'
        },
        {
          id: 'step-3-2',
          title: '提升商业技能',
          description: '学习商业分析、咨询方法论、客户沟通等技能',
          priority: 'medium',
          timeframe: '6-12个月',
          category: 'skill-development'
        },
        {
          id: 'step-3-3',
          title: '建立专业网络',
          description: '参加行业会议，建立咨询行业人脉，了解市场机会',
          priority: 'medium',
          timeframe: '持续进行',
          category: 'networking'
        }
      ],
      careerProgression: [
        {
          position: '技术顾问',
          timeframe: '2-3年',
          description: '为客户提供技术咨询服务，参与数字化转型项目',
          requirements: ['5年技术经验', '咨询技能', '客户沟通'],
          salaryRange: { min: 30000, max: 50000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '高级顾问',
          timeframe: '3-4年',
          description: '主导大型咨询项目，负责解决方案设计和客户关系',
          requirements: ['咨询经验', '行业专长', '项目管理'],
          salaryRange: { min: 45000, max: 70000, currency: 'CNY', period: 'monthly' }
        },
        {
          position: '合伙人/独立咨询师',
          timeframe: '5年+',
          description: '成为咨询公司合伙人或创立独立咨询业务',
          requirements: ['深度专长', '客户资源', '商业能力'],
          salaryRange: { min: 60000, max: 120000, currency: 'CNY', period: 'monthly' }
        }
      ],
      salaryProgression: [
        { min: 30000, max: 50000, currency: 'CNY', period: 'monthly' },
        { min: 45000, max: 70000, currency: 'CNY', period: 'monthly' },
        { min: 60000, max: 120000, currency: 'CNY', period: 'monthly' }
      ],
      marketOutlook: {
        demand: 'medium',
        growth: '+8%年增长',
        description: '数字化转型推动技术咨询需求增长，但竞争激烈，需要差异化优势'
      },
      resources: [
        {
          id: 'res-3-1',
          title: '咨询思维与方法',
          type: 'course',
          description: '学习咨询行业的思维模式和工作方法',
          cost: 'paid',
          rating: 4.4
        },
        {
          id: 'res-3-2',
          title: '商业分析师认证',
          type: 'certification',
          description: '获得商业分析专业认证，提升咨询能力',
          cost: 'paid',
          rating: 4.2
        },
        {
          id: 'res-3-3',
          title: '技术咨询案例库',
          type: 'website',
          description: '学习成功的技术咨询案例和解决方案',
          cost: 'free',
          rating: 4.0
        }
      ]
    }
  ],
  overallRecommendations: [
    '建议优先考虑前端技术专家路线，与您的技术背景和兴趣最匹配',
    '可以同时培养一些管理技能，为未来转向技术管理做准备',
    '保持技术学习的同时，注重软技能和行业视野的提升',
    '建立个人技术品牌，在技术社区保持活跃度',
    '定期评估市场趋势，适时调整职业发展方向'
  ],
  nextMilestones: [
    {
      id: 'milestone-1',
      title: '完成简历优化',
      description: '根据目标职位要求，优化简历内容和技术栈展示',
      priority: 'high',
      timeframe: '1周内',
      category: 'job-search'
    },
    {
      id: 'milestone-2',
      title: '制定学习计划',
      description: '基于技能差距分析，制定3-6个月的技能提升计划',
      priority: 'high',
      timeframe: '2周内',
      category: 'skill-development'
    },
    {
      id: 'milestone-3',
      title: '开始求职准备',
      description: '准备面试材料，开始投递目标公司的高级前端职位',
      priority: 'medium',
      timeframe: '1个月内',
      category: 'job-search'
    }
  ],
  followUpActions: [
    '每月回顾职业发展进度，调整行动计划',
    '持续关注技术趋势和市场变化',
    '建立导师关系，获得职业发展指导',
    '参与技术社区活动，扩展职业网络',
    '定期更新技能评估和职业目标'
  ]
}

// Helper functions
export function getRecommendedPath(careerDirections: CareerDirectionsData): CareerPath | undefined {
  return careerDirections.careerPaths.find(path => path.id === careerDirections.summary.recommendedPath)
}

export function getPathsByPriority(careerDirections: CareerDirectionsData): {
  primary: CareerPath[]
  secondary: CareerPath[]
  alternative: CareerPath[]
} {
  return careerDirections.careerPaths.reduce(
    (acc, path) => {
      acc[path.priority].push(path)
      return acc
    },
    { primary: [], secondary: [], alternative: [] } as {
      primary: CareerPath[]
      secondary: CareerPath[]
      alternative: CareerPath[]
    }
  )
}

export function getActionItemsByCategory(actionItems: ActionItem[]): Record<string, ActionItem[]> {
  return actionItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ActionItem[]>)
}

export function getPriorityColor(priority: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return 'red'
    case 'medium':
      return 'yellow'
    case 'low':
      return 'green'
    default:
      return 'gray'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'green'
  if (score >= 75) return 'blue'
  if (score >= 65) return 'yellow'
  return 'orange'
}
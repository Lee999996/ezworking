// Mock job recommendations data structure
export interface JobRecommendation {
  id: string
  title: string
  company: string
  industry: string
  location: string
  fitScore: number
  matchReasons: string[]
  requirements: string[]
  salaryRange?: {
    min: number
    max: number
    currency: string
  }
  description: string
  careerProgression: string[]
  userFeedback?: 'interested' | 'not-interested' | 'maybe'
}

export interface JobRecommendationsData {
  recommendations: JobRecommendation[]
  totalCount: number
  refinementSuggestions: string[]
}

// Mock job recommendations
export const mockJobRecommendations: JobRecommendationsData = {
  recommendations: [
    {
      id: 'job-1',
      title: '高级前端工程师',
      company: '字节跳动',
      industry: '互联网科技',
      location: '北京',
      fitScore: 92,
      matchReasons: [
        '技术栈完全匹配：React、TypeScript、Node.js',
        '逻辑思维能力强，适合复杂前端架构设计',
        '注重代码质量，符合大厂开发标准',
        '学习能力强，能快速适应新技术栈'
      ],
      requirements: [
        '3年以上前端开发经验',
        '精通React、Vue等主流框架',
        '熟悉TypeScript、Webpack等工具',
        '有大型项目经验'
      ],
      salaryRange: {
        min: 25000,
        max: 40000,
        currency: 'CNY'
      },
      description: '负责字节跳动核心产品的前端开发，参与架构设计和技术选型，带领团队完成高质量的前端项目。',
      careerProgression: [
        '高级前端工程师 → 前端技术专家',
        '可转向全栈开发或技术管理',
        '有机会参与开源项目和技术分享'
      ]
    },
    {
      id: 'job-2',
      title: '数据分析师',
      company: '腾讯',
      industry: '互联网科技',
      location: '深圳',
      fitScore: 88,
      matchReasons: [
        '分析能力突出，善于从数据中发现规律',
        'SQL技能强，能够处理复杂数据查询',
        '细心严谨的工作态度适合数据分析',
        '技术背景有助于理解业务逻辑'
      ],
      requirements: [
        '熟练使用SQL、Python等分析工具',
        '有数据可视化经验',
        '具备统计学基础',
        '良好的业务理解能力'
      ],
      salaryRange: {
        min: 20000,
        max: 35000,
        currency: 'CNY'
      },
      description: '负责腾讯产品的数据分析工作，通过数据洞察为产品决策提供支持，制作数据报告和可视化图表。',
      careerProgression: [
        '数据分析师 → 高级数据分析师',
        '可发展为数据科学家或产品分析专家',
        '有机会转向商业智能或数据产品方向'
      ]
    },
    {
      id: 'job-3',
      title: '全栈工程师',
      company: '美团',
      industry: '互联网科技',
      location: '北京',
      fitScore: 85,
      matchReasons: [
        '前后端技术能力均衡，适合全栈开发',
        '系统性思维有助于整体架构设计',
        '学习能力强，能够快速掌握新技术',
        '独立工作能力强，适合承担完整项目'
      ],
      requirements: [
        '前端：React/Vue + 后端：Node.js/Java',
        '熟悉数据库设计和优化',
        '有完整项目开发经验',
        '了解DevOps和部署流程'
      ],
      salaryRange: {
        min: 22000,
        max: 38000,
        currency: 'CNY'
      },
      description: '负责美团业务系统的全栈开发，从前端用户界面到后端API设计，参与完整的产品开发生命周期。',
      careerProgression: [
        '全栈工程师 → 技术专家',
        '可发展为架构师或技术管理',
        '有机会参与技术决策和团队建设'
      ]
    },
    {
      id: 'job-4',
      title: '产品技术经理',
      company: '阿里巴巴',
      industry: '互联网科技',
      location: '杭州',
      fitScore: 75,
      matchReasons: [
        '技术背景有助于与开发团队沟通',
        '逻辑思维能力强，适合产品规划',
        '分析能力有助于用户需求洞察',
        '需要提升市场敏感度和沟通技巧'
      ],
      requirements: [
        '3年以上技术开发经验',
        '有产品思维和用户洞察',
        '良好的沟通协调能力',
        '了解敏捷开发流程'
      ],
      salaryRange: {
        min: 28000,
        max: 45000,
        currency: 'CNY'
      },
      description: '负责阿里云产品的技术规划和团队协调，连接产品需求与技术实现，推动产品迭代和优化。',
      careerProgression: [
        '产品技术经理 → 高级产品经理',
        '可发展为产品总监或技术VP',
        '有机会参与战略规划和业务决策'
      ]
    },
    {
      id: 'job-5',
      title: '技术顾问',
      company: '德勤咨询',
      industry: '专业服务',
      location: '上海',
      fitScore: 82,
      matchReasons: [
        '技术专业性强，能够提供专业建议',
        '分析问题能力突出，适合解决复杂技术问题',
        '学习能力强，能够快速了解不同行业',
        '需要提升客户沟通和商务技能'
      ],
      requirements: [
        '5年以上技术开发经验',
        '有系统架构和技术选型经验',
        '良好的英语沟通能力',
        '有咨询或客户服务经验优先'
      ],
      salaryRange: {
        min: 30000,
        max: 50000,
        currency: 'CNY'
      },
      description: '为企业客户提供技术咨询服务，参与数字化转型项目，设计技术解决方案并指导实施。',
      careerProgression: [
        '技术顾问 → 高级顾问',
        '可发展为合伙人或独立创业',
        '有机会接触多个行业和前沿技术'
      ]
    },
    {
      id: 'job-6',
      title: '软件架构师',
      company: '华为',
      industry: '通信技术',
      location: '深圳',
      fitScore: 80,
      matchReasons: [
        '系统性思维适合架构设计',
        '技术深度足够，能够做出架构决策',
        '注重质量和细节，符合架构师要求',
        '需要提升团队领导和沟通能力'
      ],
      requirements: [
        '5年以上开发经验，2年以上架构经验',
        '精通多种技术栈和设计模式',
        '有大型系统设计经验',
        '良好的技术文档编写能力'
      ],
      salaryRange: {
        min: 35000,
        max: 60000,
        currency: 'CNY'
      },
      description: '负责华为企业级软件产品的架构设计，制定技术标准和开发规范，指导开发团队实施。',
      careerProgression: [
        '软件架构师 → 首席架构师',
        '可发展为技术总监或CTO',
        '有机会参与技术战略和创新项目'
      ]
    }
  ],
  totalCount: 6,
  refinementSuggestions: [
    '根据您的反馈调整推荐算法',
    '可以按地区、薪资范围或公司规模筛选',
    '如需要更多某类职位，请告诉我您的偏好',
    '可以为您推荐相关的技能提升建议'
  ]
}

// Helper function to get recommendations based on user feedback
export function refineRecommendations(
  originalRecommendations: JobRecommendation[],
  userFeedback: Record<string, 'interested' | 'not-interested' | 'maybe'>
): JobRecommendation[] {
  // In a real implementation, this would use ML algorithms to refine recommendations
  // For now, we'll return a filtered and reordered list based on feedback
  
  const interestedJobs = originalRecommendations.filter(job => 
    userFeedback[job.id] === 'interested'
  )
  
  const maybeJobs = originalRecommendations.filter(job => 
    userFeedback[job.id] === 'maybe'
  )
  

  
  // Generate new similar recommendations based on interested jobs
  // This is a simplified version - in reality, you'd use the job characteristics
  // to find similar positions
  
  return [
    ...interestedJobs,
    ...maybeJobs,
    // Add some new recommendations based on patterns from interested jobs
    ...originalRecommendations.filter(job => !userFeedback[job.id])
  ]
}

// Helper function to get feedback statistics
export function getFeedbackStats(
  recommendations: JobRecommendation[]
): {
  interested: number
  notInterested: number
  maybe: number
  noFeedback: number
} {
  return recommendations.reduce(
    (stats, job) => {
      switch (job.userFeedback) {
        case 'interested':
          stats.interested++
          break
        case 'not-interested':
          stats.notInterested++
          break
        case 'maybe':
          stats.maybe++
          break
        default:
          stats.noFeedback++
      }
      return stats
    },
    { interested: 0, notInterested: 0, maybe: 0, noFeedback: 0 }
  )
}
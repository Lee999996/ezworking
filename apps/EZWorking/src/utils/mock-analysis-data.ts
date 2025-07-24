import type { AssessmentResult } from '../types/assessment'

// Mock analysis data structure
export interface CareerAnalysisData {
  personalityProfile: {
    primaryType: string
    traits: Array<{
      name: string
      score: number
      description: string
    }>
    strengths: string[]
    developmentAreas: string[]
  }
  careerFit: {
    suitableRoles: Array<{
      title: string
      fitScore: number
      reasons: string[]
    }>
    industries: Array<{
      name: string
      fitScore: number
      description: string
    }>
    workEnvironments: string[]
  }
  skillsAnalysis: {
    technicalSkills: Array<{
      category: string
      skills: Array<{
        name: string
        currentLevel: number
        recommendedLevel: number
        importance: number
      }>
    }>
    softSkills: Array<{
      name: string
      score: number
      description: string
    }>
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
  }
}

// Mock analysis result
export const mockAnalysisData: CareerAnalysisData = {
  personalityProfile: {
    primaryType: '分析型思考者',
    traits: [
      {
        name: '逻辑思维',
        score: 85,
        description: '擅长逻辑分析和系统性思考，能够快速识别问题的核心'
      },
      {
        name: '创新能力',
        score: 78,
        description: '具有较强的创新意识，喜欢探索新的解决方案'
      },
      {
        name: '团队协作',
        score: 72,
        description: '能够与团队成员良好合作，但更倾向于独立工作'
      },
      {
        name: '沟通表达',
        score: 68,
        description: '沟通能力良好，但在大型会议中可能较为内向'
      },
      {
        name: '抗压能力',
        score: 80,
        description: '面对压力时能够保持冷静，善于制定应对策略'
      }
    ],
    strengths: [
      '强大的分析和解决问题能力',
      '注重细节和质量',
      '学习能力强，适应性好',
      '独立工作能力突出',
      '技术理解能力强'
    ],
    developmentAreas: [
      '提升公众演讲和展示技能',
      '加强跨部门沟通协调',
      '培养领导和管理能力',
      '增强商业敏感度'
    ]
  },
  careerFit: {
    suitableRoles: [
      {
        title: '软件工程师',
        fitScore: 92,
        reasons: [
          '技术能力强，逻辑思维清晰',
          '注重代码质量和系统设计',
          '适合独立或小团队工作环境'
        ]
      },
      {
        title: '数据分析师',
        fitScore: 88,
        reasons: [
          '分析能力突出，善于发现数据规律',
          '细心严谨，适合处理复杂数据',
          '具备技术背景，能够使用分析工具'
        ]
      },
      {
        title: '产品经理',
        fitScore: 75,
        reasons: [
          '逻辑思维有助于产品规划',
          '技术背景便于与开发团队沟通',
          '需要加强市场敏感度和用户洞察'
        ]
      },
      {
        title: '技术顾问',
        fitScore: 82,
        reasons: [
          '技术专业性强',
          '分析问题能力突出',
          '能够为客户提供专业建议'
        ]
      }
    ],
    industries: [
      {
        name: '互联网科技',
        fitScore: 90,
        description: '快速发展的技术环境，注重创新和效率'
      },
      {
        name: '金融科技',
        fitScore: 85,
        description: '结合技术和金融，需要严谨的分析能力'
      },
      {
        name: '数据服务',
        fitScore: 88,
        description: '专注数据分析和商业智能，匹配分析能力'
      },
      {
        name: '企业软件',
        fitScore: 83,
        description: 'B2B软件开发，需要深度技术理解'
      }
    ],
    workEnvironments: [
      '小到中型技术团队',
      '灵活的远程工作环境',
      '注重技术创新的公司文化',
      '扁平化管理结构',
      '持续学习和成长的氛围'
    ]
  },
  skillsAnalysis: {
    technicalSkills: [
      {
        category: '编程开发',
        skills: [
          { name: 'JavaScript/TypeScript', currentLevel: 4, recommendedLevel: 5, importance: 5 },
          { name: 'React/Vue.js', currentLevel: 4, recommendedLevel: 4, importance: 4 },
          { name: 'Node.js', currentLevel: 3, recommendedLevel: 4, importance: 4 },
          { name: 'Python', currentLevel: 3, recommendedLevel: 4, importance: 4 }
        ]
      },
      {
        category: '数据分析',
        skills: [
          { name: 'SQL', currentLevel: 4, recommendedLevel: 5, importance: 5 },
          { name: 'Excel/数据处理', currentLevel: 4, recommendedLevel: 4, importance: 4 },
          { name: 'Tableau/Power BI', currentLevel: 2, recommendedLevel: 4, importance: 4 },
          { name: '统计分析', currentLevel: 3, recommendedLevel: 4, importance: 4 }
        ]
      },
      {
        category: '系统设计',
        skills: [
          { name: '数据库设计', currentLevel: 3, recommendedLevel: 4, importance: 4 },
          { name: '系统架构', currentLevel: 3, recommendedLevel: 4, importance: 4 },
          { name: 'API设计', currentLevel: 4, recommendedLevel: 4, importance: 4 },
          { name: '云服务(AWS/Azure)', currentLevel: 2, recommendedLevel: 3, importance: 3 }
        ]
      }
    ],
    softSkills: [
      {
        name: '问题解决',
        score: 88,
        description: '能够系统性地分析和解决复杂问题'
      },
      {
        name: '学习能力',
        score: 85,
        description: '快速掌握新技术和概念的能力'
      },
      {
        name: '注意细节',
        score: 82,
        description: '对细节的关注有助于提高工作质量'
      },
      {
        name: '时间管理',
        score: 78,
        description: '能够有效规划和管理工作时间'
      },
      {
        name: '团队合作',
        score: 72,
        description: '与团队成员协作良好，但更适合技术角色'
      }
    ]
  },
  recommendations: {
    immediate: [
      '完善个人技术作品集，展示编程和分析项目',
      '参与开源项目，提升代码协作经验',
      '学习一门数据可视化工具(如Tableau)',
      '准备技术面试，重点练习算法和系统设计'
    ],
    shortTerm: [
      '考虑获得相关技术认证(如AWS、Google Analytics)',
      '参加技术会议和meetup，扩展专业网络',
      '尝试技术写作，分享学习心得',
      '寻找导师或加入技术社区'
    ],
    longTerm: [
      '发展领域专业知识，成为某个技术领域的专家',
      '培养产品思维和商业理解',
      '考虑技术管理或架构师发展路径',
      '建立个人品牌和影响力'
    ]
  }
}

// Helper function to convert assessment result to analysis data
export function convertAssessmentToAnalysis(result: AssessmentResult): CareerAnalysisData {
  // In a real implementation, this would process the assessment result
  // and generate personalized analysis based on the answers
  return mockAnalysisData
}
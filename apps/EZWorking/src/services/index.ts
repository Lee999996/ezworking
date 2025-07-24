/**
 * 服务层统一导出
 * 遵循简洁优雅的设计原则
 */

export { UserService } from './user'
export { AssessmentService } from './assessment'
export { CareerService } from './career'
export { InterviewService } from './interview'

// 预留AI服务接口
export interface AIService {
  generateQuestions: (type: string, params: any) => Promise<any>
  analyzeProfile: (userId: string) => Promise<any>
  generateRecommendations: (userId: string) => Promise<any>
  evaluateInterview: (responses: any[]) => Promise<any>
}

// 模拟AI服务实现（预留接口）
export const mockAIService: AIService = {
  async generateQuestions(type: string, params: any) {
    // 预留：接入实际AI服务
    return {
      questions: [],
      confidence: 0.8,
    }
  },

  async analyzeProfile(userId: string) {
    // 预留：AI分析用户档案
    return {
      strengths: ['学习能力强', '适应性好'],
      weaknesses: ['沟通技巧待提升'],
      recommendations: ['建议加强技术深度'],
    }
  },

  async generateRecommendations(userId: string) {
    // 预留：AI生成岗位推荐
    return {
      jobs: [],
      reasons: [],
    }
  },

  async evaluateInterview(responses: any[]) {
    // 预留：AI评估面试表现
    return {
      overallScore: 0.75,
      detailedFeedback: [],
      suggestions: [],
    }
  },
} 
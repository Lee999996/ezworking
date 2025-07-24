import { supabase } from '../lib/db/supabase'

/**
 * 面试服务 - 处理面试准备、模拟面试和面试记录
 */

export interface InterviewSession {
  id: string
  user_id: string
  position_id?: string
  type: 'mock' | 'practice' | 'behavioral' | 'technical' | 'case_study'
  questions: Array<InterviewQuestion>
  answers: Array<InterviewAnswer>
  feedback?: InterviewFeedback
  score?: number
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface InterviewQuestion {
  id: string
  question: string
  type: 'technical' | 'behavioral' | 'case_study' | 'general'
  difficulty: 'easy' | 'medium' | 'hard'
  category?: string
  expected_duration?: number
  keywords?: Array<string>
}

export interface InterviewAnswer {
  question_id: string
  answer: string
  duration?: number
  timestamp: string
  confidence_level?: number
}

export interface InterviewFeedback {
  overall_score: number
  question_scores: Record<string, number>
  strengths: Array<string>
  areas_for_improvement: Array<string>
  detailed_feedback: Record<string, any>
  suggestions: Array<string>
}

export interface InterviewLog {
  id: string
  user_id: string
  company: string
  position: string
  interview_date: string
  stage: 'phone_screen' | 'first_round' | 'second_round' | 'final_round' | 'other'
  result?: 'pending' | 'passed' | 'rejected' | 'cancelled' | 'rescheduled'
  feedback?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateInterviewSessionInput {
  user_id: string
  position_id?: string
  type: 'mock' | 'practice' | 'behavioral' | 'technical' | 'case_study'
  questions?: Array<InterviewQuestion>
}

export interface CreateInterviewLogInput {
  user_id: string
  company: string
  position: string
  interview_date: string
  stage: 'phone_screen' | 'first_round' | 'second_round' | 'final_round' | 'other'
  result?: 'pending' | 'passed' | 'rejected' | 'cancelled' | 'rescheduled'
  feedback?: string
  notes?: string
}

export class InterviewService {
  /**
   * 获取用户的面试会话列表
   */
  static async getUserInterviewSessions(userId: string): Promise<Array<InterviewSession>> {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error || !data) return []
      return data
    } catch (error) {
      console.error('Error getting user interview sessions:', error)
      return []
    }
  }

  /**
   * 创建面试会话
   */
  static async createInterviewSession(input: CreateInterviewSessionInput): Promise<InterviewSession | null> {
    try {
      // 生成默认题目（后续可以通过AI生成）
      const questions = input.questions || this.getDefaultQuestions(input.type)

      const { data, error } = await supabase
        .from('interview_sessions')
        .insert([{
          user_id: input.user_id,
          position_id: input.position_id,
          type: input.type,
          questions: questions,
          answers: [],
          feedback: {}
        }])
        .select()
        .single()

      if (error || !data) {
        console.error('Error creating interview session:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error creating interview session:', error)
      return null
    }
  }

  /**
   * 提交面试答案
   */
  static async submitInterviewAnswers(
    sessionId: string, 
    answers: Array<InterviewAnswer>
  ): Promise<InterviewSession | null> {
    try {
      // 计算面试评分（这里可以集成AI评估）
      const feedback = await this.generateFeedback(sessionId, answers)
      const score = this.calculateOverallScore(feedback)

      const { data, error } = await supabase
        .from('interview_sessions')
        .update({
          answers: answers,
          feedback: feedback,
          score: score,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single()

      if (error || !data) {
        console.error('Error submitting interview answers:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error submitting interview answers:', error)
      return null
    }
  }

  /**
   * 获取面试会话详情
   */
  static async getInterviewSession(sessionId: string): Promise<InterviewSession | null> {
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !data) return null
      return data
    } catch (error) {
      console.error('Error getting interview session:', error)
      return null
    }
  }

  /**
   * 删除面试会话
   */
  static async deleteInterviewSession(sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) {
        console.error('Error deleting interview session:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error deleting interview session:', error)
      return false
    }
  }

  /**
   * 获取用户的面试记录
   */
  static async getUserInterviewLogs(userId: string): Promise<Array<InterviewLog>> {
    try {
      const { data, error } = await supabase
        .from('interview_logs')
        .select('*')
        .eq('user_id', userId)
        .order('interview_date', { ascending: false })

      if (error || !data) return []
      return data
    } catch (error) {
      console.error('Error getting user interview logs:', error)
      return []
    }
  }

  /**
   * 创建面试记录
   */
  static async createInterviewLog(input: CreateInterviewLogInput): Promise<InterviewLog | null> {
    try {
      const { data, error } = await supabase
        .from('interview_logs')
        .insert([{
          user_id: input.user_id,
          company: input.company,
          position: input.position,
          interview_date: input.interview_date,
          stage: input.stage,
          result: input.result,
          feedback: input.feedback,
          notes: input.notes
        }])
        .select()
        .single()

      if (error || !data) {
        console.error('Error creating interview log:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error creating interview log:', error)
      return null
    }
  }

  /**
   * 更新面试记录
   */
  static async updateInterviewLog(
    logId: string, 
    updates: Partial<CreateInterviewLogInput>
  ): Promise<InterviewLog | null> {
    try {
      const { data, error } = await supabase
        .from('interview_logs')
        .update(updates)
        .eq('id', logId)
        .select()
        .single()

      if (error || !data) {
        console.error('Error updating interview log:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error updating interview log:', error)
      return null
    }
  }

  /**
   * 删除面试记录
   */
  static async deleteInterviewLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('interview_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        console.error('Error deleting interview log:', error)
        return false
      }
      return true
    } catch (error) {
      console.error('Error deleting interview log:', error)
      return false
    }
  }

  /**
   * 获取面试统计数据
   */
  static async getInterviewStats(userId: string) {
    try {
      const sessions = await this.getUserInterviewSessions(userId)
      const logs = await this.getUserInterviewLogs(userId)

      const completedSessions = sessions.filter(s => s.completed_at)
      const avgScore = completedSessions.length > 0 
        ? completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length 
        : 0

      const passedInterviews = logs.filter(l => l.result === 'passed').length
      const totalInterviews = logs.filter(l => l.result && l.result !== 'pending').length
      const successRate = totalInterviews > 0 ? passedInterviews / totalInterviews : 0

      return {
        total_sessions: sessions.length,
        completed_sessions: completedSessions.length,
        average_score: Math.round(avgScore),
        total_real_interviews: logs.length,
        success_rate: Math.round(successRate * 100),
        recent_activity: sessions.slice(0, 5)
      }
    } catch (error) {
      console.error('Error getting interview stats:', error)
      return {
        total_sessions: 0,
        completed_sessions: 0,
        average_score: 0,
        total_real_interviews: 0,
        success_rate: 0,
        recent_activity: []
      }
    }
  }

  /**
   * 获取默认面试题目
   */
  private static getDefaultQuestions(type: string): Array<InterviewQuestion> {
    const questionSets = {
      mock: [
        {
          id: 'mock_1',
          question: '请简单介绍一下自己',
          type: 'general' as const,
          difficulty: 'easy' as const,
          category: 'self_introduction',
          expected_duration: 120
        },
        {
          id: 'mock_2',
          question: '为什么选择我们公司？',
          type: 'behavioral' as const,
          difficulty: 'medium' as const,
          category: 'motivation',
          expected_duration: 90
        }
      ],
      technical: [
        {
          id: 'tech_1',
          question: '请解释一下JavaScript的闭包概念',
          type: 'technical' as const,
          difficulty: 'medium' as const,
          category: 'javascript',
          expected_duration: 180,
          keywords: ['javascript', 'closure', 'scope']
        },
        {
          id: 'tech_2',
          question: '如何优化React应用的性能？',
          type: 'technical' as const,
          difficulty: 'hard' as const,
          category: 'react',
          expected_duration: 240,
          keywords: ['react', 'performance', 'optimization']
        }
      ],
      behavioral: [
        {
          id: 'beh_1',
          question: '描述一次你在团队中解决冲突的经历',
          type: 'behavioral' as const,
          difficulty: 'medium' as const,
          category: 'teamwork',
          expected_duration: 180
        },
        {
          id: 'beh_2',
          question: '谈谈你最大的职业挑战是什么',
          type: 'behavioral' as const,
          difficulty: 'medium' as const,
          category: 'self_reflection',
          expected_duration: 150
        }
      ]
    }

    return questionSets[type as keyof typeof questionSets] || questionSets.mock
  }

  /**
   * 生成面试反馈（预留AI接口）
   */
  private static async generateFeedback(
    sessionId: string, 
    answers: Array<InterviewAnswer>
  ): Promise<InterviewFeedback> {
    try {
      // 这里将来可以集成AI服务进行智能评估
      // 现在提供基础的评估逻辑

      const questionScores: Record<string, number> = {}
      const strengths: Array<string> = []
      const improvements: Array<string> = []

      // 基础评分逻辑
      answers.forEach(answer => {
        const answerLength = answer.answer.length
        const duration = answer.duration || 60
        
        // 基于回答长度和时间的简单评分
        let score = 60 // 基础分
        
        if (answerLength > 100) score += 20
        if (answerLength > 200) score += 10
        if (duration >= 60 && duration <= 180) score += 10
        
        questionScores[answer.question_id] = Math.min(score, 100)
      })

      // 生成建议
      const avgScore = Object.values(questionScores).reduce((a, b) => a + b, 0) / Object.keys(questionScores).length

      if (avgScore >= 80) {
        strengths.push('回答完整详细')
        strengths.push('表达清晰')
      } else {
        improvements.push('可以提供更多具体例子')
        improvements.push('注意控制回答时间')
      }

      return {
        overall_score: Math.round(avgScore),
        question_scores: questionScores,
        strengths,
        areas_for_improvement: improvements,
        detailed_feedback: {
          communication: avgScore >= 75 ? 'good' : 'needs_improvement',
          content_quality: avgScore >= 80 ? 'excellent' : 'average',
          time_management: 'good'
        },
        suggestions: [
          '继续练习STAR方法',
          '准备更多具体的项目案例',
          '加强对公司和岗位的了解'
        ]
      }
    } catch (error) {
      console.error('Error generating feedback:', error)
      return {
        overall_score: 60,
        question_scores: {},
        strengths: [],
        areas_for_improvement: ['需要更多练习'],
        detailed_feedback: {},
        suggestions: ['多练习面试技巧']
      }
    }
  }

  /**
   * 计算总体评分
   */
  private static calculateOverallScore(feedback: InterviewFeedback): number {
    return feedback.overall_score
  }
} 
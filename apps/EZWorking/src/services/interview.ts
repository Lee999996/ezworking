/**
 * 面试服务层
 * 处理面试题库、模拟面试、面试记录等业务逻辑
 */

import { supabase, handleDatabaseError, type DatabaseResult } from '../lib/db/supabase'
import type {
  InterviewRecord,
  InterviewRecordInsert,
  InterviewRecordUpdate
} from '../lib/db/types'
import type {
  InterviewQuestion,
  InterviewSession,
  RealInterviewRecord,
  InterviewAnalytics,
  StartInterviewSessionRequest,
  SubmitResponseRequest,
  GetRecommendedQuestionsRequest,
  InterviewAnalyticsRequest,
  SessionType,
  InterviewCategory
} from '../types'

export class InterviewService {
  /**
   * 获取面试题库
   */
  static async getInterviewQuestions(
    category?: InterviewCategory,
    difficulty?: 'easy' | 'medium' | 'hard',
    limit: number = 20
  ): Promise<DatabaseResult<Array<InterviewQuestion>>> {
    let query = supabase
      .from('interview_questions')
      .select('*')
      .eq('is_active', true)

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return handleDatabaseError(null, error)
    }

    const questions: Array<InterviewQuestion> = (data || []).map(item => ({
      id: item.id,
      category: item.category as InterviewCategory,
      type: item.type as any,
      question: item.question,
      context: item.context || undefined,
      difficulty: item.difficulty as any,
      tags: item.tags || [],
      industry: item.industry || undefined,
      jobLevel: item.job_level as any,
      sampleAnswers: item.sample_answers as any || [],
      evaluationCriteria: item.evaluation_criteria as any || [],
      followUpQuestions: item.follow_up_questions || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))

    return handleDatabaseError(questions, null)
  }

  /**
   * 获取推荐的面试题目
   */
  static async getRecommendedQuestions(
    request: GetRecommendedQuestionsRequest
  ): Promise<DatabaseResult<Array<InterviewQuestion>>> {
    // 获取用户的技能和经验信息来智能推荐题目
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('skills, work_experience')
      .eq('user_id', request.userId)
      .single()

    // 根据用户信息和岗位要求推荐题目
    let query = supabase
      .from('interview_questions')
      .select('*')
      .eq('is_active', true)

    // 如果指定了面试类型，添加相应的筛选
    if (request.interviewType === 'technical') {
      query = query.eq('category', 'technical')
    } else if (request.interviewType === 'behavioral') {
      query = query.eq('category', 'behavioral')
    }

    // 根据工作经验选择难度
    const workExperience = userProfile?.work_experience || 0
    let difficulty: 'easy' | 'medium' | 'hard' = 'easy'
    if (workExperience >= 3) difficulty = 'medium'
    if (workExperience >= 5) difficulty = 'hard'

    const { data, error } = await query
      .eq('difficulty', difficulty)
      .limit(request.limit || 10)
      .order('created_at', { ascending: false })

    if (error) {
      return handleDatabaseError(null, error)
    }

    const questions: Array<InterviewQuestion> = (data || []).map(item => ({
      id: item.id,
      category: item.category as InterviewCategory,
      type: item.type as any,
      question: item.question,
      context: item.context || undefined,
      difficulty: item.difficulty as any,
      tags: item.tags || [],
      industry: item.industry || undefined,
      jobLevel: item.job_level as any,
      sampleAnswers: item.sample_answers as any || [],
      evaluationCriteria: item.evaluation_criteria as any || [],
      followUpQuestions: item.follow_up_questions || [],
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }))

    return handleDatabaseError(questions, null)
  }

  /**
   * 开始面试会话
   */
  static async startInterviewSession(
    request: StartInterviewSessionRequest
  ): Promise<DatabaseResult<InterviewSession>> {
    // 获取推荐的题目
    const questionsResult = await this.getRecommendedQuestions({
      userId: request.userId,
      jobTitle: request.jobTitle,
      companyName: request.companyName,
      interviewType: request.type,
      limit: request.questionCount || 10,
    })

    if (!questionsResult.success || !questionsResult.data) {
      return handleDatabaseError(null, { message: 'Failed to get interview questions' })
    }

    const sessionData = {
      user_id: request.userId,
      type: request.type,
      job_title: request.jobTitle,
      company_name: request.companyName,
      questions: questionsResult.data,
      responses: [],
      status: 'in_progress' as const,
      started_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      return handleDatabaseError(null, error)
    }

    const session: InterviewSession = {
      id: data.id,
      userId: data.user_id,
      type: data.type as SessionType,
      jobTitle: data.job_title || undefined,
      companyName: data.company_name || undefined,
      questions: data.questions as Array<InterviewQuestion>,
      responses: data.responses as any || [],
      status: data.status as any,
      startedAt: data.started_at,
      completedAt: data.completed_at || undefined,
      totalDuration: data.total_duration || undefined,
      overallScore: data.overall_score ? Number(data.overall_score) : undefined,
      feedback: data.feedback as any || undefined,
    }

    return handleDatabaseError(session, null)
  }

  /**
   * 提交面试回答
   */
  static async submitResponse(request: SubmitResponseRequest): Promise<DatabaseResult<boolean>> {
    // 获取现有会话数据
    const { data: session, error: fetchError } = await supabase
      .from('interview_sessions')
      .select('responses, questions, started_at')
      .eq('id', request.sessionId)
      .single()

    if (fetchError || !session) {
      return handleDatabaseError(null, fetchError || { message: 'Session not found' })
    }

    const existingResponses = session.responses as Array<any> || []
    const newResponses = [...existingResponses, request.response]

    // 检查是否完成所有题目
    const questions = session.questions as Array<any>
    const isCompleted = newResponses.length >= questions.length

    const updateData: any = {
      responses: newResponses,
    }

    if (isCompleted) {
      const totalDuration = Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
      updateData.status = 'completed'
      updateData.completed_at = new Date().toISOString()
      updateData.total_duration = totalDuration
      updateData.overall_score = this.calculateOverallScore(newResponses)
      updateData.feedback = this.generateSessionFeedback(questions, newResponses)
    }

    const { error } = await supabase
      .from('interview_sessions')
      .update(updateData)
      .eq('id', request.sessionId)

    return handleDatabaseError(!error, error)
  }

  /**
   * 获取面试会话详情
   */
  static async getInterviewSession(sessionId: string): Promise<DatabaseResult<InterviewSession>> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      return handleDatabaseError(null, error)
    }

    const session: InterviewSession = {
      id: data.id,
      userId: data.user_id,
      type: data.type as SessionType,
      jobTitle: data.job_title || undefined,
      companyName: data.company_name || undefined,
      questions: data.questions as Array<InterviewQuestion>,
      responses: data.responses as any || [],
      status: data.status as any,
      startedAt: data.started_at,
      completedAt: data.completed_at || undefined,
      totalDuration: data.total_duration || undefined,
      overallScore: data.overall_score ? Number(data.overall_score) : undefined,
      feedback: data.feedback as any || undefined,
    }

    return handleDatabaseError(session, null)
  }

  /**
   * 获取用户的面试会话列表
   */
  static async getUserInterviewSessions(
    userId: string,
    limit: number = 20
  ): Promise<DatabaseResult<Array<InterviewSession>>> {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return handleDatabaseError(null, error)
    }

    const sessions: Array<InterviewSession> = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      type: item.type as SessionType,
      jobTitle: item.job_title || undefined,
      companyName: item.company_name || undefined,
      questions: item.questions as Array<InterviewQuestion>,
      responses: item.responses as any || [],
      status: item.status as any,
      startedAt: item.started_at,
      completedAt: item.completed_at || undefined,
      totalDuration: item.total_duration || undefined,
      overallScore: item.overall_score ? Number(item.overall_score) : undefined,
      feedback: item.feedback as any || undefined,
    }))

    return handleDatabaseError(sessions, null)
  }

  /**
   * 记录真实面试经历
   */
  static async recordRealInterview(
    userId: string,
    interviewData: Omit<RealInterviewRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<DatabaseResult<RealInterviewRecord>> {
    const recordData: InterviewRecordInsert = {
      user_id: userId,
      job_title: interviewData.jobApplication.jobTitle,
      company_name: interviewData.jobApplication.companyName,
      interview_date: interviewData.interviewDetails.date,
      interview_type: interviewData.interviewDetails.format,
      questions: interviewData.actualQuestions || [],
      feedback: interviewData.feedback.overallExperience?.toString(),
      result: interviewData.outcome.result,
      follow_up_actions: interviewData.followUp.questionsAsked || [],
    }

    const { data, error } = await supabase
      .from('interview_records')
      .insert(recordData)
      .select()
      .single()

    if (error) {
      return handleDatabaseError(null, error)
    }

    // 转换为业务类型
    const record: RealInterviewRecord = {
      id: data.id,
      userId: data.user_id,
      jobApplication: {
        jobTitle: data.job_title,
        companyName: data.company_name,
        applicationDate: data.created_at,
      },
      interviewDetails: {
        date: data.interview_date,
        time: '',
        duration: 0,
        format: data.interview_type as any,
        interviewers: [],
        rounds: 1,
        currentRound: 1,
      },
      preparation: {
        researchTime: 0,
        practiceSession: [],
        reviewedQuestions: [],
        preparedQuestions: [],
        confidence: 3,
      },
      actualQuestions: data.questions as any || [],
      outcome: {
        result: data.result as any,
        feedback: data.feedback || undefined,
      },
      feedback: {
        strengths: [],
        weaknesses: [],
        surprisingQuestions: [],
        overallExperience: Number(data.feedback) || 3,
        interviewerProfessionalism: 3,
        companyImpression: 3,
        likelihood: 3,
      },
      followUp: {
        thankYouSent: false,
        questionsAsked: data.follow_up_actions || [],
      },
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }

    return handleDatabaseError(record, null)
  }

  /**
   * 获取用户的面试分析数据
   */
  static async getInterviewAnalytics(
    request: InterviewAnalyticsRequest
  ): Promise<DatabaseResult<InterviewAnalytics>> {
    const userId = request.userId

    // 获取面试会话统计
    const { data: sessions } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)

    // 获取真实面试记录
    const { data: realInterviews } = await supabase
      .from('interview_records')
      .select('*')
      .eq('user_id', userId)

    const completedSessions = (sessions || []).filter(s => s.status === 'completed')
    const totalInterviews = (realInterviews || []).length
    const passedInterviews = (realInterviews || []).filter(i => i.result === 'passed').length
    const successRate = totalInterviews > 0 ? passedInterviews / totalInterviews : 0

    // 计算平均准备时间（模拟数据）
    const averagePreparationTime = completedSessions.length > 0 ? 
      completedSessions.reduce((sum, s) => sum + (s.total_duration || 0), 0) / completedSessions.length / 3600 : 0

    const analytics: InterviewAnalytics = {
      totalInterviews: totalInterviews,
      successRate: successRate,
      averagePreparationTime: averagePreparationTime,
      strongestCategories: await this.calculateStrongestCategories(completedSessions),
      improvementAreas: await this.calculateImprovementAreas(completedSessions),
      progressTrend: await this.calculateProgressTrend(completedSessions),
      companyTypePerformance: [],
    }

    return handleDatabaseError(analytics, null)
  }

  /**
   * 计算总体得分
   */
  private static calculateOverallScore(responses: Array<any>): number {
    if (!responses || responses.length === 0) return 0
    
    // 简化的评分逻辑：基于回答时长和信心度
    const avgConfidence = responses.reduce((sum, r) => sum + (r.confidence || 3), 0) / responses.length
    const avgTimeScore = responses.reduce((sum, r) => {
      const duration = r.duration || 60
      // 理想回答时间60-120秒，给予最高分
      const timeScore = duration >= 60 && duration <= 120 ? 5 : Math.max(1, 5 - Math.abs(duration - 90) / 30)
      return sum + timeScore
    }, 0) / responses.length

    return Math.round((avgConfidence + avgTimeScore) / 2 * 20) / 100 // 转换为0-1分制
  }

  /**
   * 生成会话反馈
   */
  private static generateSessionFeedback(questions: Array<any>, responses: Array<any>) {
    return {
      overallPerformance: {
        communicationScore: Math.random() * 40 + 60,
        contentScore: Math.random() * 40 + 60,
        confidenceScore: Math.random() * 40 + 60,
        structureScore: Math.random() * 40 + 60,
        timeManagementScore: Math.random() * 40 + 60,
        overallTrend: 'improving' as const,
      },
      questionAnalysis: questions.map((q: any, index: number) => ({
        questionId: q.id,
        category: q.category,
        performance: Math.random() > 0.5 ? 'good' : 'average' as const,
        keyStrengths: ['回答结构清晰'],
        areasForImprovement: ['可以增加更多具体例子'],
        timeSpent: responses[index]?.duration || 90,
      })),
      recommendations: [
        {
          category: '沟通技巧',
          priority: 'medium' as const,
          suggestion: '建议多练习用STAR方法回答行为问题',
          actionable: true,
          resources: [],
        },
      ],
      nextSteps: [
        {
          type: 'practice_more' as const,
          title: '继续练习',
          description: '建议再练习5-10道类似问题',
          priority: 1,
        },
      ],
    }
  }

  /**
   * 计算最强分类
   */
  private static async calculateStrongestCategories(sessions: Array<any>) {
    const categoryPerformance: Record<string, { total: number, count: number }> = {}
    
    sessions.forEach(session => {
      const questions = session.questions as Array<any> || []
      const score = session.overall_score || 0.5
      
      questions.forEach((q: any) => {
        if (!categoryPerformance[q.category]) {
          categoryPerformance[q.category] = { total: 0, count: 0 }
        }
        categoryPerformance[q.category].total += score
        categoryPerformance[q.category].count += 1
      })
    })

    return Object.entries(categoryPerformance).map(([category, data]) => ({
      category: category as InterviewCategory,
      averageScore: data.count > 0 ? data.total / data.count : 0,
      interviewCount: data.count,
      trend: 'stable' as const,
    }))
  }

  /**
   * 计算改进领域
   */
  private static async calculateImprovementAreas(sessions: Array<any>) {
    return [
      {
        area: '技术深度',
        currentScore: 65,
        targetScore: 80,
        actionPlan: ['多做算法练习', '深入学习框架原理'],
        priority: 1,
      },
      {
        area: '沟通表达',
        currentScore: 70,
        targetScore: 85,
        actionPlan: ['练习STAR方法', '提高语言组织能力'],
        priority: 2,
      },
    ]
  }

  /**
   * 计算进度趋势
   */
  private static async calculateProgressTrend(sessions: Array<any>) {
    const dataPoints = sessions.slice(0, 10).map((session, index) => ({
      date: session.completed_at || session.created_at,
      score: (session.overall_score || 0.5) * 100,
      interviewCount: 1,
    }))

    return {
      timeframe: 'month' as const,
      dataPoints,
      overallTrend: 'up' as const,
    }
  }
} 
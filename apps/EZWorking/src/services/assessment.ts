import { supabase } from '../lib/db/supabase'
import type {
  AssessmentTemplate,
  AssessmentQuestion,
  AssessmentSession,
  AssessmentAnswer,
  AssessmentResult,
  AssessmentType,
} from '../types/assessment'
import { 
  mockAssessmentTemplates, 
  mockAssessmentQuestions,
  getMockQuestionsByTemplateId,
  getMockTemplateById 
} from '../utils/mock-assessment-data'

export class AssessmentService {
  static async getTemplates(type?: AssessmentType): Promise<Array<AssessmentTemplate>> {
    try {
      let query = supabase.from('assessment_templates').select('*')
      if (type) {
        query = query.eq('type', type)
      }
      const { data, error } = await query.order('created_at', { ascending: false })
      if (error) throw error
      return data
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Using mock assessment templates:', error)
      let templates = mockAssessmentTemplates
      if (type) {
        templates = templates.filter(t => t.type === type)
      }
      return templates
    }
  }

  static async startSession(userId: string, templateId: string): Promise<AssessmentSession> {
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .insert({ user_id: userId, template_id: templateId, status: 'started' })
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      // Fallback to mock session for development
      console.warn('Using mock assessment session:', error)
      const mockSession: AssessmentSession = {
        id: `mock-session-${Date.now()}`,
        user_id: userId,
        template_id: templateId,
        status: 'started',
        started_at: new Date().toISOString(),
        current_question_order: 1,
        time_spent_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return mockSession
    }
  }

  static async submitAnswer(
    sessionId: string,
    questionId: string,
    answerValue: any
  ): Promise<AssessmentAnswer> {
    try {
      const { data, error } = await supabase
        .from('assessment_answers')
        .insert({ session_id: sessionId, question_id: questionId, answer_value: answerValue })
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      // Fallback to mock answer for development
      console.warn('Using mock assessment answer:', error)
      const mockAnswer: AssessmentAnswer = {
        id: `mock-answer-${Date.now()}`,
        session_id: sessionId,
        question_id: questionId,
        answer_value: answerValue,
        time_spent_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return mockAnswer
    }
  }

  static async completeSession(sessionId: string): Promise<AssessmentSession> {
    try {
      const { data, error } = await supabase
        .from('assessment_sessions')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .select()
        .single()
      if (error) throw error
      // Here you would typically trigger result calculation
      return data
    } catch (error) {
      // Fallback to mock completion for development
      console.warn('Using mock assessment completion:', error)
      const mockCompletedSession: AssessmentSession = {
        id: sessionId,
        user_id: 'mock-user',
        template_id: 'mock-template',
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_question_order: 0,
        time_spent_seconds: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      return mockCompletedSession
    }
  }

  static async getResult(sessionId: string): Promise<AssessmentResult | null> {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null // Not found is ok
      throw error
    }
    return data
  }

  static async getQuestions(templateId: string): Promise<Array<AssessmentQuestion>> {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('template_id', templateId)
        .order('order_num', { ascending: true })
      if (error) throw error
      return data
    } catch (error) {
      // Fallback to mock data for development
      console.warn('Using mock assessment questions:', error)
      return getMockQuestionsByTemplateId(templateId)
    }
  }

  static async getSession(sessionId: string): Promise<AssessmentSession | null> {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null // Not found is ok
      throw error
    }
    return data
  }

  static async getSessionAnswers(sessionId: string): Promise<Array<AssessmentAnswer>> {
    const { data, error } = await supabase
      .from('assessment_answers')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data || []
  }

  static async updateSessionProgress(sessionId: string, currentQuestionOrder: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('assessment_sessions')
        .update({ current_question_order: currentQuestionOrder })
        .eq('id', sessionId)
      if (error) throw error
    } catch (error) {
      // Fallback to mock progress update for development
      console.warn('Using mock progress update:', error)
      // No-op for mock data
    }
  }
} 
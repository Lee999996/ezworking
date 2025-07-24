import { supabase } from '../lib/db/supabase'
import type {
  AssessmentTemplate,
  AssessmentSession,
  AssessmentAnswer,
  AssessmentResult,
  AssessmentType,
} from '../types/assessment'

export class AssessmentService {
  static async getTemplates(type?: AssessmentType): Promise<Array<AssessmentTemplate>> {
    let query = supabase.from('assessment_templates').select('*')
    if (type) {
      query = query.eq('type', type)
    }
    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  static async startSession(userId: string, templateId: string): Promise<AssessmentSession> {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .insert({ user_id: userId, template_id: templateId, status: 'started' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async submitAnswer(
    sessionId: string,
    questionId: string,
    answerValue: any
  ): Promise<AssessmentAnswer> {
    const { data, error } = await supabase
      .from('assessment_answers')
      .insert({ session_id: sessionId, question_id: questionId, answer_value: answerValue })
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async completeSession(sessionId: string): Promise<AssessmentSession> {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', sessionId)
      .select()
      .single()
    if (error) throw error
    // Here you would typically trigger result calculation
    return data
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
} 
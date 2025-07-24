import { supabase } from '../lib/db/supabase'
import type { CareerRecommendation } from '../types/career'

export class CareerService {
  static async getCareerRecommendation(userId: string): Promise<CareerRecommendation | null> {
    const { data, error } = await supabase
      .from('career_recommendations')
      .select('*')
      .eq('user_id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async createCareerRecommendation(
    recommendation: Omit<CareerRecommendation, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CareerRecommendation> {
    const { data, error } = await supabase
      .from('career_recommendations')
      .insert(recommendation)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateCareerRecommendation(
    userId: string,
    updates: Partial<Omit<CareerRecommendation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<CareerRecommendation> {
    const { data, error } = await supabase
      .from('career_recommendations')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteCareerRecommendation(userId: string): Promise<void> {
    const { error } = await supabase
      .from('career_recommendations')
      .delete()
      .eq('user_id', userId)
    if (error) throw error
  }
} 
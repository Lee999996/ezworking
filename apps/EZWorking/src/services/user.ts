import { supabase } from '../lib/db/supabase'
import type { UserProfile } from '../types/user'

export class UserService {
  static async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  static async createProfile(
    profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'> & { id: string }
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async updateProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteUser(userId: string): Promise<void> {
    // This should be handled with care, typically in a more secure environment
    // For simplicity, we call the Supabase user deletion here.
    // Note: This requires the service_role key on the server.
    const { error } = await supabase.auth.admin.deleteUser(userId)
    if (error) throw error
  }
} 
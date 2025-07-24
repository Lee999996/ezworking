import { supabase } from '../lib/db/supabase'
import type { Job, JobApplication, JobMatch } from '../types/job'

export class JobService {
  static async searchJobs(filters: any): Promise<Array<Job>> {
    let query = supabase.from('jobs').select('*')
    // Add filters based on the `filters` object
    // For example:
    if (filters.title) {
      query = query.ilike('title', `%${filters.title}%`)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  }

  static async apply(application: Omit<JobApplication, 'id' | 'created_at' | 'updated_at'>): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async getMatch(userId: string, jobId: string): Promise<JobMatch | null> {
    const { data, error } = await supabase
      .from('job_matches')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }
} 
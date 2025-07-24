export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          age?: number
          gender?: string
          location?: string
          education_level?: string
          major?: string
          work_experience?: number
          skills: Array<string>
          interests: Array<string>
          personality_traits?: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number
          gender?: string
          location?: string
          education_level?: string
          major?: string
          work_experience?: number
          skills?: Array<string>
          interests?: Array<string>
          personality_traits?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          age?: number
          gender?: string
          location?: string
          education_level?: string
          major?: string
          work_experience?: number
          skills?: Array<string>
          interests?: Array<string>
          personality_traits?: Record<string, any>
          updated_at?: string
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          type: string
          questions: Array<Record<string, any>>
          answers: Array<Record<string, any>>
          results: Record<string, any>
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          questions?: Array<Record<string, any>>
          answers?: Array<Record<string, any>>
          results?: Record<string, any>
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          questions?: Array<Record<string, any>>
          answers?: Array<Record<string, any>>
          results?: Record<string, any>
          completed_at?: string
          updated_at?: string
        }
      }
      job_positions: {
        Row: {
          id: string
          title: string
          company: string
          location: string
          salary_range?: string
          requirements: Array<string>
          description: string
          tags: Array<string>
          external_url?: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          location: string
          salary_range?: string
          requirements?: Array<string>
          description: string
          tags?: Array<string>
          external_url?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          location?: string
          salary_range?: string
          requirements?: Array<string>
          description?: string
          tags?: Array<string>
          external_url?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      career_recommendations: {
        Row: {
          id: string
          user_id: string
          recommended_positions: Array<string>
          primary_choice?: string
          backup_choices: Array<string>
          match_scores: Record<string, number>
          analysis_result: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recommended_positions?: Array<string>
          primary_choice?: string
          backup_choices?: Array<string>
          match_scores?: Record<string, number>
          analysis_result?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          recommended_positions?: Array<string>
          primary_choice?: string
          backup_choices?: Array<string>
          match_scores?: Record<string, number>
          analysis_result?: Record<string, any>
          updated_at?: string
        }
      }
      interview_sessions: {
        Row: {
          id: string
          user_id: string
          position_id?: string
          type: string
          questions: Array<Record<string, any>>
          answers: Array<Record<string, any>>
          feedback?: Record<string, any>
          score?: number
          completed_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          position_id?: string
          type: string
          questions?: Array<Record<string, any>>
          answers?: Array<Record<string, any>>
          feedback?: Record<string, any>
          score?: number
          completed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          position_id?: string
          questions?: Array<Record<string, any>>
          answers?: Array<Record<string, any>>
          feedback?: Record<string, any>
          score?: number
          completed_at?: string
          updated_at?: string
        }
      }
      interview_logs: {
        Row: {
          id: string
          user_id: string
          company: string
          position: string
          interview_date: string
          stage: string
          result?: string
          feedback?: string
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company: string
          position: string
          interview_date: string
          stage: string
          result?: string
          feedback?: string
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company?: string
          position?: string
          interview_date?: string
          stage?: string
          result?: string
          feedback?: string
          notes?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 
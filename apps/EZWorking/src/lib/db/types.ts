/**
 * Supabase 数据库类型定义
 * 此文件由 supabase gen types 命令生成，请勿手动修改
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // 用户画像表
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          age: number | null
          gender: 'male' | 'female' | 'other' | null
          location: string | null
          education_level: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | null
          major: string | null
          work_experience_years: number | null
          phone: string | null
          avatar_url: string | null
          bio: string | null
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string | null
          preferred_job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          preferred_salary_min: number | null
          preferred_salary_max: number | null
          preferred_locations: string[] | null
          skills: string[] | null
          interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          location?: string | null
          education_level?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | null
          major?: string | null
          work_experience_years?: number | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          preferred_job_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          preferred_salary_min?: number | null
          preferred_salary_max?: number | null
          preferred_locations?: string[] | null
          skills?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          age?: number | null
          gender?: 'male' | 'female' | 'other' | null
          location?: string | null
          education_level?: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | null
          major?: string | null
          work_experience_years?: number | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          preferred_job_type?: 'full_time' | 'part_time' | 'contract' | 'internship' | null
          preferred_salary_min?: number | null
          preferred_salary_max?: number | null
          preferred_locations?: string[] | null
          skills?: string[] | null
          interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      
      // 测评问题表
      assessment_questions: {
        Row: {
          id: string
          category: 'personality' | 'skills' | 'interests' | 'values' | 'work_style'
          question_text: string
          question_type: 'single_choice' | 'multiple_choice' | 'rating' | 'text'
          options: Json | null
          weight: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: 'personality' | 'skills' | 'interests' | 'values' | 'work_style'
          question_text: string
          question_type: 'single_choice' | 'multiple_choice' | 'rating' | 'text'
          options?: Json | null
          weight?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: 'personality' | 'skills' | 'interests' | 'values' | 'work_style'
          question_text?: string
          question_type?: 'single_choice' | 'multiple_choice' | 'rating' | 'text'
          options?: Json | null
          weight?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // 用户测评结果表
      assessment_results: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: Json
          score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer: Json
          score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: Json
          score?: number | null
          created_at?: string
        }
      }

      // 职业定位结果表
      career_assessments: {
        Row: {
          id: string
          user_id: string
          assessment_type: 'initial' | 'update' | 'custom'
          personality_scores: Json
          skill_scores: Json
          interest_scores: Json
          recommended_careers: Json
          career_match_scores: Json
          analysis_summary: string | null
          strengths: string[] | null
          improvement_areas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          assessment_type: 'initial' | 'update' | 'custom'
          personality_scores: Json
          skill_scores: Json
          interest_scores: Json
          recommended_careers: Json
          career_match_scores: Json
          analysis_summary?: string | null
          strengths?: string[] | null
          improvement_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          assessment_type?: 'initial' | 'update' | 'custom'
          personality_scores?: Json
          skill_scores?: Json
          interest_scores?: Json
          recommended_careers?: Json
          career_match_scores?: Json
          analysis_summary?: string | null
          strengths?: string[] | null
          improvement_areas?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }

      // 岗位信息表（预留接口）
      job_positions: {
        Row: {
          id: string
          title: string
          company_name: string
          company_id: string | null
          description: string
          requirements: string[] | null
          responsibilities: string[] | null
          benefits: string[] | null
          salary_min: number | null
          salary_max: number | null
          location: string
          job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
          skills_required: string[] | null
          application_url: string | null
          source: string
          source_job_id: string | null
          is_active: boolean
          posted_date: string | null
          application_deadline: string | null
          remote_option: boolean
          industry: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company_name: string
          company_id?: string | null
          description: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          salary_min?: number | null
          salary_max?: number | null
          location: string
          job_type: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
          skills_required?: string[] | null
          application_url?: string | null
          source: string
          source_job_id?: string | null
          is_active?: boolean
          posted_date?: string | null
          application_deadline?: string | null
          remote_option?: boolean
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company_name?: string
          company_id?: string | null
          description?: string
          requirements?: string[] | null
          responsibilities?: string[] | null
          benefits?: string[] | null
          salary_min?: number | null
          salary_max?: number | null
          location?: string
          job_type?: 'full_time' | 'part_time' | 'contract' | 'internship'
          experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'lead'
          skills_required?: string[] | null
          application_url?: string | null
          source?: string
          source_job_id?: string | null
          is_active?: boolean
          posted_date?: string | null
          application_deadline?: string | null
          remote_option?: boolean
          industry?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // 面试记录表（预留接口）
      interview_records: {
        Row: {
          id: string
          user_id: string
          job_position_id: string | null
          company_name: string
          position_title: string
          interview_date: string
          interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral'
          interviewer_name: string | null
          questions_asked: Json | null
          user_answers: Json | null
          feedback_received: string | null
          user_notes: string | null
          result: 'pending' | 'passed' | 'rejected' | 'cancelled'
          next_steps: string | null
          overall_rating: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          job_position_id?: string | null
          company_name: string
          position_title: string
          interview_date: string
          interview_type: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral'
          interviewer_name?: string | null
          questions_asked?: Json | null
          user_answers?: Json | null
          feedback_received?: string | null
          user_notes?: string | null
          result?: 'pending' | 'passed' | 'rejected' | 'cancelled'
          next_steps?: string | null
          overall_rating?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          job_position_id?: string | null
          company_name?: string
          position_title?: string
          interview_date?: string
          interview_type?: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral'
          interviewer_name?: string | null
          questions_asked?: Json | null
          user_answers?: Json | null
          feedback_received?: string | null
          user_notes?: string | null
          result?: 'pending' | 'passed' | 'rejected' | 'cancelled'
          next_steps?: string | null
          overall_rating?: number | null
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 
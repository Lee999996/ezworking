export interface Career {
  id: string; // UUID
  name: string;
  description?: string;
  category?: string;
  industry?: Array<string>;
  required_skills?: any; // JSONB
  salary_range?: any; // JSONB
  education_requirements?: Array<string>;
  career_path?: any; // JSONB
  growth_outlook?: any; // JSONB
  work_environment?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CareerPreference {
  id: string; // UUID
  user_id: string; // UUID
  preferred_industries?: Array<string>;
  preferred_roles?: Array<string>;
  work_environment_preferences?: any; // JSONB
  salary_expectations?: any; // JSONB
  location_preferences?: any; // JSONB
  career_values?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CareerMatch {
  id: string; // UUID
  user_id: string; // UUID
  career_id: string; // UUID
  overall_match_score: number;
  skill_match_score?: number;
  interest_match_score?: number;
  value_match_score?: number;
  experience_match_score?: number;
  match_details?: any; // JSONB
  confidence_level?: number;
  created_at: string;
  updated_at: string;
}

export interface CareerRecommendation {
  id: string; // UUID
  user_id: string; // UUID
  recommendation_type: string;
  careers?: any; // JSONB
  generated_at?: string;
  expires_at?: string;
  feedback?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface CareerPath {
  id: string; // UUID
  user_id: string; // UUID
  target_career_id: string; // UUID
  current_position?: string;
  timeline_months: number;
  milestones?: any; // JSONB
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface SkillGapAnalysis {
  id: string; // UUID
  user_id: string; // UUID
  target_career_id: string; // UUID
  analysis_date: string; // Date
  skill_gaps?: any; // JSONB
  overall_readiness_score?: number;
  estimated_time_to_ready_months?: number;
  created_at: string;
  updated_at: string;
} 
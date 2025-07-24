export type AssessmentType = 'personality' | 'career_interest' | 'skill_assessment' | 'career_values' | 'work_style' | 'aptitude';
export type QuestionType = 'single_choice' | 'multiple_choice' | 'rating_scale' | 'text_input' | 'ranking';

export interface AssessmentTemplate {
  id: string; // UUID
  name: string;
  description?: string;
  type: AssessmentType;
  version?: string;
  duration_minutes: number;
  questions_count: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssessmentQuestion {
  id: string; // UUID
  template_id: string; // UUID
  order_num: number;
  type: QuestionType;
  title: string;
  description?: string;
  options?: any; // JSONB
  required?: boolean;
  validation_rules?: any; // JSONB
  scoring_weights?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface AssessmentSession {
  id: string; // UUID
  user_id: string; // UUID
  template_id: string; // UUID
  status?: string;
  started_at?: string;
  completed_at?: string;
  current_question_order?: number;
  time_spent_seconds?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentAnswer {
  id: string; // UUID
  session_id: string; // UUID
  question_id: string; // UUID
  answer_value: any; // JSONB
  answer_text?: string;
  time_spent_seconds?: number;
  confidence_level?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentResult {
  id: string; // UUID
  session_id: string; // UUID
  user_id: string; // UUID
  template_id: string; // UUID
  overall_score?: number;
  dimension_scores?: any; // JSONB
  personality_traits?: any; // JSONB
  career_suggestions?: any; // JSONB
  strengths?: Array<string>;
  weaknesses?: Array<string>;
  recommendations?: Array<string>;
  raw_data?: any; // JSONB
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentDimension {
  id: string; // UUID
  template_id: string; // UUID
  name: string;
  description?: string;
  weight: number;
  scoring_formula?: string;
  interpretation_rules?: any; // JSONB
  created_at: string;
  updated_at: string;
} 
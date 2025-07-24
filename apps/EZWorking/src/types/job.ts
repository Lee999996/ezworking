import {
  EmploymentType,
  ExperienceLevel,
  CompanySize,
  ApplicationStatus,
  Location,
  SalaryRange
} from './user';

export interface Company {
  id: string; // UUID
  name: string;
  description?: string;
  industry?: Array<string>;
  size?: CompanySize;
  founded_year?: number;
  headquarters?: any; // JSONB
  locations?: any; // JSONB
  website?: string;
  logo_url?: string;
  culture_values?: Array<string>;
  employee_benefits?: Array<string>;
  rating?: any; // JSONB
  social_links?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string; // UUID
  title: string;
  company_id: string; // UUID
  department?: string;
  description: string;
  requirements?: Array<string>;
  responsibilities?: Array<string>;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_range?: SalaryRange; // JSONB
  location: Location; // JSONB
  skills_required?: any; // JSONB
  benefits?: Array<string>;
  application_deadline?: string; // Date
  start_date?: string; // Date
  status?: string;
  posted_date: string; // Date
  source: string;
  external_url?: string;
  application_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string; // UUID
  user_id: string; // UUID
  job_id: string; // UUID
  status?: ApplicationStatus;
  applied_date?: string; // Date
  last_update_date: string; // Date
  application_method: string;
  cover_letter?: string;
  resume_version?: string;
  notes?: string;
  recruiter_contact?: any; // JSONB
  interview_history?: any; // JSONB
  salary_negotiation?: any; // JSONB
  created_at: string;
  updated_at: string;
}

export interface JobMatch {
  id: string; // UUID
  user_id: string; // UUID
  job_id: string; // UUID
  overall_match_score: number;
  skill_match_score?: number;
  experience_match_score?: number;
  location_match_score?: number;
  salary_match_score?: number;
  company_culture_match_score?: number;
  match_breakdown?: any; // JSONB
  recommendation?: string;
  confidence_level?: number;
  created_at: string;
  updated_at: string;
}

export interface JobFilter {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  search_params: any; // JSONB
  is_active?: boolean;
  notification_enabled?: boolean;
  last_run_date?: string; // Date
  created_at: string;
  updated_at: string;
}

export interface JobRecommendationSetting {
  id: string; // UUID
  user_id: string; // UUID
  notification_frequency?: string;
  notification_enabled?: boolean;
  preferred_job_types?: Array<EmploymentType>;
  preferred_experience_levels?: Array<ExperienceLevel>;
  location_preferences?: any; // JSONB
  remote_work_preference?: string;
  salary_expectations?: any; // JSONB
  industry_preferences?: Array<string>;
  company_size_preferences?: Array<CompanySize>;
  created_at: string;
  updated_at: string;
} 
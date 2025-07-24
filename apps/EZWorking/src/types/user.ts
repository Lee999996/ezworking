export type GenderType = 'male' | 'female' | 'other';
export type DegreeType = 'high_school' | 'associate' | 'bachelor' | 'master' | 'doctor';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'temporary';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type ApplicationStatus = 'saved' | 'draft' | 'submitted' | 'under_review' | 'phone_screen' | 'interview' | 'final_interview' | 'offer' | 'accepted' | 'rejected' | 'withdrawn';


export interface Location {
  city?: string;
  province?: string;
  country?: string;
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface UserProfile {
  id: string; // UUID, references auth.users(id)
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  birth_date?: string; // Date
  gender?: GenderType;
  location?: Location;
  bio?: string;
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

export interface Education {
  id: string; // UUID
  user_id: string; // UUID
  school: string;
  major: string;
  degree: DegreeType;
  start_date: string; // Date
  end_date?: string; // Date
  is_current?: boolean;
  gpa?: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  id: string; // UUID
  user_id: string; // UUID
  company: string;
  position: string;
  department?: string;
  employment_type: EmploymentType;
  start_date: string; // Date
  end_date?: string; // Date
  is_current?: boolean;
  location?: string;
  description?: string;
  achievements?: Array<string>;
  skills_used?: Array<string>;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  category: string;
  level: SkillLevel;
  years_experience?: number;
  verified?: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Language {
  id: string; // UUID
  user_id: string; // UUID
  language: string;
  proficiency: string;
  reading_level?: string;
  writing_level?: string;
  speaking_level?: string;
  certification?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  description: string;
  role: string;
  start_date: string; // Date
  end_date?: string; // Date
  is_current?: boolean;
  technologies?: Array<string>;
  url?: string;
  repository_url?: string;
  achievements?: Array<string>;
  team_size?: number;
  created_at: string;
  updated_at: string;
} 
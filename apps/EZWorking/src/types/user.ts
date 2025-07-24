import type { Database } from '../lib/db/types';

// 数据库表类型别名
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

/**
 * 用户基础信息接口
 */
export interface UserBasicInfo {
  email: string;
  fullName: string | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  location: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

/**
 * 教育背景信息
 */
export interface EducationInfo {
  educationLevel: 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd' | null;
  major: string | null;
  graduationYear: number | null;
  institution: string | null;
  gpa: number | null;
}

/**
 * 工作经历信息
 */
export interface WorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string | null; // null 表示当前工作
  description: string | null;
  skills: Array<string>;
  achievements: Array<string>;
}

/**
 * 项目经历信息
 */
export interface ProjectExperience {
  id: string;
  projectName: string;
  description: string;
  role: string;
  startDate: string;
  endDate: string | null;
  technologies: Array<string>;
  achievements: Array<string>;
  projectUrl: string | null;
  githubUrl: string | null;
}

/**
 * 求职偏好设置
 */
export interface JobPreferences {
  preferredJobType: 'full_time' | 'part_time' | 'contract' | 'internship' | null;
  preferredSalaryMin: number | null;
  preferredSalaryMax: number | null;
  preferredLocations: Array<string>;
  remoteWorkPreference: 'remote_only' | 'hybrid' | 'onsite' | 'no_preference';
  willingToRelocate: boolean;
  availableStartDate: string | null;
  targetIndustries: Array<string>;
  targetCompanySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise' | null;
}

/**
 * 技能评估
 */
export interface SkillAssessment {
  skillName: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  proficiencyLevel: 1 | 2 | 3 | 4 | 5; // 1-初学者, 5-专家
  yearsOfExperience: number | null;
  lastUsed: string | null; // 最后使用时间
  certifications: Array<string>;
}

/**
 * 兴趣爱好
 */
export interface Interest {
  name: string;
  category: 'professional' | 'personal' | 'hobby';
  description: string | null;
}

/**
 * 完整用户画像（组合类型）
 */
export interface CompleteUserProfile {
  basicInfo: UserBasicInfo;
  education: EducationInfo;
  workExperiences: Array<WorkExperience>;
  projectExperiences: Array<ProjectExperience>;
  jobPreferences: JobPreferences;
  skills: Array<SkillAssessment>;
  interests: Array<Interest>;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  resumeUrl: string | null;
  profileCompleteness: number; // 0-100, 画像完整度
  lastUpdated: string;
}

/**
 * 用户状态
 */
export interface UserStatus {
  isActive: boolean;
  lastLoginAt: string | null;
  profileSetupCompleted: boolean;
  assessmentCompleted: boolean;
  jobSearchActive: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    jobRecommendations: boolean;
    interviewReminders: boolean;
    applicationUpdates: boolean;
  };
}

/**
 * API 响应格式
 */
export interface UserApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 用户搜索/筛选参数
 */
export interface UserSearchParams extends PaginationParams {
  email?: string;
  location?: string;
  educationLevel?: string;
  experienceRange?: {
    min: number;
    max: number;
  };
  skills?: Array<string>;
  createdAfter?: string;
  createdBefore?: string;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  profileCompletionRate: number;
  assessmentCompletionRate: number;
  averageExperienceYears: number;
  topSkills: Array<{ skill: string; count: number }>;
  locationDistribution: Array<{ location: string; count: number }>;
} 
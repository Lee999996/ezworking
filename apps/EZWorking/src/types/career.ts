/**
 * 职业定位功能类型定义
 * 包含岗位信息、匹配度分析、推荐系统等
 */

export interface JobPosition {
  id: string
  title: string
  company: CompanyInfo
  description: string
  requirements: JobRequirements
  benefits: JobBenefits
  location: LocationInfo
  salaryRange?: SalaryRange
  employmentType: EmploymentType
  experienceLevel: ExperienceLevel
  postedDate: string
  expiryDate?: string
  externalUrl?: string
  source: 'internal' | 'external_api' | 'manual'
  status: 'active' | 'closed' | 'draft'
  tags: Array<string>
  createdAt: string
  updatedAt: string
}

export interface CompanyInfo {
  id?: string
  name: string
  logo?: string
  industry: string
  size: CompanySize
  description?: string
  website?: string
  culture?: Array<string>
  rating?: number
  reviewCount?: number
}

export type CompanySize = 
  | 'startup'        // 1-50人
  | 'small'          // 51-200人
  | 'medium'         // 201-1000人
  | 'large'          // 1000+人
  | 'enterprise'     // 5000+人

export interface JobRequirements {
  skills: Array<SkillRequirement>
  education?: EducationRequirement
  experience?: ExperienceRequirement
  languages?: Array<LanguageRequirement>
  certifications?: Array<string>
  soft_skills?: Array<string>
  technical_skills?: Array<string>
}

export interface SkillRequirement {
  name: string
  level: SkillLevel
  isRequired: boolean
  category?: 'technical' | 'soft' | 'language' | 'certification'
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface EducationRequirement {
  minLevel: 'high_school' | 'bachelor' | 'master' | 'phd'
  preferredMajors?: Array<string>
  isRequired: boolean
}

export interface ExperienceRequirement {
  minYears: number
  maxYears?: number
  relevantFields?: Array<string>
  isRequired: boolean
}

export interface LanguageRequirement {
  language: string
  level: 'basic' | 'conversational' | 'business' | 'native'
  isRequired: boolean
}

export interface JobBenefits {
  healthInsurance?: boolean
  retirement?: boolean
  paidTimeOff?: number
  flexibleSchedule?: boolean
  remoteWork?: boolean
  stockOptions?: boolean
  bonuses?: boolean
  professionalDevelopment?: boolean
  other?: Array<string>
}

export interface LocationInfo {
  city: string
  state?: string
  country: string
  isRemote: boolean
  isHybrid?: boolean
  address?: string
  timezone?: string
}

export interface SalaryRange {
  min: number
  max: number
  currency: 'CNY' | 'USD' | 'EUR'
  period: 'hourly' | 'monthly' | 'yearly'
  isNegotiable?: boolean
}

export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance'
export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'

/**
 * 岗位推荐和匹配相关
 */
export interface JobRecommendation {
  id: string
  userId: string
  job: JobPosition
  matchScore: number
  matchDetails: MatchAnalysis
  recommendationReason: string
  status: RecommendationStatus
  viewedAt?: string
  appliedAt?: string
  rejectedAt?: string
  savedAt?: string
  createdAt: string
}

export interface MatchAnalysis {
  overallScore: number
  skillsMatch: SkillsMatchAnalysis
  experienceMatch: ExperienceMatchAnalysis
  locationMatch: LocationMatchAnalysis
  salaryMatch: SalaryMatchAnalysis
  culturalFit?: CulturalFitAnalysis
  improvementSuggestions: Array<ImprovementSuggestion>
}

export interface SkillsMatchAnalysis {
  score: number
  matchedSkills: Array<SkillMatch>
  missingSkills: Array<SkillRequirement>
  strengthAreas: Array<string>
}

export interface SkillMatch {
  skillName: string
  userLevel: SkillLevel
  requiredLevel: SkillLevel
  isMatch: boolean
  gap?: number // 技能差距评分
}

export interface ExperienceMatchAnalysis {
  score: number
  userExperience: number
  requiredExperience: number
  relevantExperience: number
  isQualified: boolean
}

export interface LocationMatchAnalysis {
  score: number
  userPreferences: Array<string>
  jobLocation: LocationInfo
  distance?: number
  transportationOptions?: Array<string>
}

export interface SalaryMatchAnalysis {
  score: number
  userExpectation?: number
  jobSalaryRange: SalaryRange
  meetExpectation: boolean
  percentageDifference?: number
}

export interface CulturalFitAnalysis {
  score: number
  companyValues: Array<string>
  userValues: Array<string>
  alignment: Array<string>
  potential_conflicts?: Array<string>
}

export interface ImprovementSuggestion {
  category: 'skills' | 'experience' | 'education' | 'certification'
  suggestion: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime?: string
  resources?: Array<LearningResource>
}

export interface LearningResource {
  title: string
  type: 'course' | 'certification' | 'book' | 'tutorial' | 'practice'
  url?: string
  provider?: string
  estimatedHours?: number
  cost?: number
}

export type RecommendationStatus = 
  | 'pending'      // 待查看
  | 'viewed'       // 已查看
  | 'saved'        // 已收藏
  | 'applied'      // 已申请
  | 'rejected'     // 已拒绝
  | 'expired'      // 已过期

/**
 * 职业路径规划
 */
export interface CareerPath {
  id: string
  userId: string
  currentPosition?: JobPosition
  targetPosition: JobPosition
  milestones: Array<CareerMilestone>
  timeline: number // 预计时间（月）
  difficulty: 'easy' | 'medium' | 'hard'
  confidence: number // 成功概率 (0-100)
  createdAt: string
  updatedAt: string
}

export interface CareerMilestone {
  id: string
  title: string
  description: string
  category: 'skill' | 'experience' | 'education' | 'networking' | 'project'
  targetDate: string
  isCompleted: boolean
  completedDate?: string
  resources: Array<LearningResource>
  progress: number // 完成进度 (0-100)
}

/**
 * API 请求/响应类型
 */
export interface JobSearchRequest {
  keywords?: string
  location?: string
  salary_min?: number
  salary_max?: number
  experience_level?: ExperienceLevel
  employment_type?: EmploymentType
  company_size?: CompanySize
  skills?: Array<string>
  remote_only?: boolean
  posted_within_days?: number
  page?: number
  limit?: number
}

export interface JobSearchResponse {
  jobs: Array<JobPosition>
  totalCount: number
  currentPage: number
  totalPages: number
  filters: SearchFilters
}

export interface SearchFilters {
  locations: Array<string>
  companies: Array<string>
  skills: Array<string>
  salary_ranges: Array<SalaryRange>
  experience_levels: Array<ExperienceLevel>
}

export interface GenerateRecommendationsRequest {
  userId: string
  limit?: number
  includeApplied?: boolean
  refreshCache?: boolean
}

export interface CareerAnalysisRequest {
  userId: string
  targetJobId?: string
  targetJobTitle?: string
  timeframe?: number // 时间范围（月）
}

export interface CareerAnalysisResponse {
  currentProfile: UserCareerProfile
  recommendations: Array<JobRecommendation>
  careerPaths: Array<CareerPath>
  marketInsights: MarketInsights
}

export interface UserCareerProfile {
  strengths: Array<string>
  weaknesses: Array<string>
  marketability: number // 市场竞争力 (0-100)
  careerStage: 'entry' | 'growth' | 'established' | 'transition'
  topSkills: Array<SkillAssessment>
}

export interface SkillAssessment {
  skillName: string
  currentLevel: SkillLevel
  marketDemand: number // 市场需求度 (0-100)
  salaryImpact: number // 薪资影响度 (0-100)
}

export interface MarketInsights {
  trendingSkills: Array<string>
  growingIndustries: Array<string>
  salaryTrends: Record<string, number>
  competitionLevel: 'low' | 'medium' | 'high'
  bestMarkets: Array<string>
} 
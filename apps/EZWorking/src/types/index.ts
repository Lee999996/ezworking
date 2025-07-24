/**
 * EZWorking 类型定义统一导出
 * 遵循简洁优雅的设计原则，方便引用
 */

// 用户相关类型
export type {
  UserBasicInfo,
  UserProfileData,
  PersonalityTraits,
  UserCompleteProfile,
  UserStatus,
  UserPreferences,
  NotificationSettings,
  PrivacySettings,
  CreateUserRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
  UserAction,
  UserAnalytics
} from './user'

// 测评系统类型
export type {
  AssessmentQuestion,
  QuestionOption,
  QuestionType,
  AssessmentType,
  AssessmentAnswer,
  Assessment,
  AssessmentStatus,
  AssessmentResults,
  ResultInsight,
  CareerMatch,
  AssessmentTemplate,
  AssessmentConfig,
  ScoringRule,
  ValidationRule,
  StartAssessmentRequest,
  SubmitAnswerRequest,
  AssessmentProgressResponse,
  AssessmentResultsResponse,
  NextStepSuggestion,
  GenerateQuestionsRequest,
  AIQuestionGenerationResponse
} from './assessment'

// 职业和岗位相关类型
export type {
  JobPosition,
  CompanyInfo,
  CompanySize,
  JobRequirements,
  SkillRequirement,
  SkillLevel,
  EducationRequirement,
  ExperienceRequirement,
  LanguageRequirement,
  JobBenefits,
  LocationInfo,
  SalaryRange,
  EmploymentType,
  ExperienceLevel,
  JobRecommendation,
  MatchAnalysis,
  SkillsMatchAnalysis,
  SkillMatch,
  ExperienceMatchAnalysis,
  LocationMatchAnalysis,
  SalaryMatchAnalysis,
  CulturalFitAnalysis,
  ImprovementSuggestion,
  LearningResource,
  RecommendationStatus,
  CareerPath,
  CareerMilestone,
  JobSearchRequest,
  JobSearchResponse,
  SearchFilters,
  GenerateRecommendationsRequest,
  CareerAnalysisRequest,
  CareerAnalysisResponse,
  UserCareerProfile,
  SkillAssessment,
  MarketInsights
} from './career'

// 面试相关类型
export type {
  InterviewQuestion,
  InterviewCategory,
  QuestionType as InterviewQuestionType,
  SampleAnswer,
  EvaluationCriterion,
  ScoreDescription,
  InterviewSession,
  SessionType,
  SessionStatus,
  InterviewResponse,
  ResponseRecording,
  AIEvaluation,
  AspectScore,
  SelfAssessment,
  SessionFeedback,
  PerformanceAnalysis,
  QuestionAnalysis,
  ImprovementRecommendation,
  NextStep,
  RealInterviewRecord,
  JobApplicationInfo,
  InterviewDetails,
  InterviewerInfo,
  PreparationRecord,
  ActualQuestion,
  InterviewOutcome,
  OfferDetails,
  InterviewFeedback,
  FollowUpActions,
  InterviewAnalytics,
  CategoryStrength,
  ImprovementArea,
  ProgressTrend,
  ProgressDataPoint,
  CompanyTypeStats,
  StartInterviewSessionRequest,
  SubmitResponseRequest,
  GetRecommendedQuestionsRequest,
  InterviewAnalyticsRequest
} from './interview'

// 数据库相关类型
export type {
  Database,
  User,
  UserProfile,
  Assessment as DBAssessment,
  JobRecommendation as DBJobRecommendation,
  InterviewRecord,
  UserInsert,
  UserProfileInsert,
  AssessmentInsert,
  JobRecommendationInsert,
  InterviewRecordInsert,
  UserUpdate,
  UserProfileUpdate,
  AssessmentUpdate,
  JobRecommendationUpdate,
  InterviewRecordUpdate
} from '../lib/db/types'

// 通用API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

// 通用分页类型
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: Array<T>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// 通用错误类型
export interface AppError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
}

// AI服务接口类型（预留）
export interface AIServiceRequest {
  type: 'assessment' | 'recommendation' | 'analysis' | 'feedback'
  payload: Record<string, any>
  userId: string
  metadata?: Record<string, any>
}

export interface AIServiceResponse<T = any> {
  success: boolean
  data: T
  confidence: number
  processing_time: number
  model_version: string
  error?: string
} 
/**
 * 面试准备和记录功能类型定义
 * 包含面试题库、模拟面试、面试记录等
 */

export interface InterviewQuestion {
  id: string
  category: InterviewCategory
  type: QuestionType
  question: string
  context?: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: Array<string>
  industry?: string
  jobLevel?: ExperienceLevel
  sampleAnswers?: Array<SampleAnswer>
  evaluationCriteria?: Array<EvaluationCriterion>
  followUpQuestions?: Array<string>
  createdAt: string
  updatedAt: string
}

export type InterviewCategory = 
  | 'behavioral'      // 行为面试
  | 'technical'       // 技术面试
  | 'situational'     // 情景面试
  | 'case_study'      // 案例分析
  | 'culture_fit'     // 文化匹配
  | 'leadership'      // 领导力
  | 'problem_solving' // 问题解决
  | 'communication'   // 沟通能力

export type QuestionType = 
  | 'open_ended'      // 开放式问题
  | 'coding'          // 编程题
  | 'design'          // 设计题
  | 'presentation'    // 演示题
  | 'role_play'       // 角色扮演

export type ExperienceLevel = 'entry' | 'junior' | 'mid' | 'senior' | 'lead' | 'executive'

export interface SampleAnswer {
  id: string
  answer: string
  quality: 'poor' | 'average' | 'good' | 'excellent'
  explanation: string
  keyPoints: Array<string>
}

export interface EvaluationCriterion {
  aspect: string
  description: string
  weight: number // 权重 (0-1)
  scoringGuide: Array<ScoreDescription>
}

export interface ScoreDescription {
  score: number
  description: string
  indicators: Array<string>
}

/**
 * 面试会话和练习
 */
export interface InterviewSession {
  id: string
  userId: string
  type: SessionType
  jobTitle?: string
  companyName?: string
  questions: Array<InterviewQuestion>
  responses: Array<InterviewResponse>
  status: SessionStatus
  startedAt: string
  completedAt?: string
  totalDuration?: number // 总用时（秒）
  overallScore?: number
  feedback?: SessionFeedback
}

export type SessionType = 
  | 'practice'        // 练习模式
  | 'mock_interview'  // 模拟面试
  | 'quick_prep'      // 快速准备
  | 'targeted_prep'   // 针对性准备

export type SessionStatus = 'in_progress' | 'completed' | 'paused' | 'abandoned'

export interface InterviewResponse {
  questionId: string
  answer: string
  duration: number // 回答用时（秒）
  confidence: number // 自信度 (1-5)
  recording?: ResponseRecording
  aiEvaluation?: AIEvaluation
  selfAssessment?: SelfAssessment
}

export interface ResponseRecording {
  audioUrl?: string
  videoUrl?: string
  transcript?: string
  duration: number
}

export interface AIEvaluation {
  overallScore: number
  aspects: Array<AspectScore>
  suggestions: Array<string>
  strengths: Array<string>
  improvements: Array<string>
  confidence: number // AI评估置信度
}

export interface AspectScore {
  aspect: string
  score: number
  feedback: string
}

export interface SelfAssessment {
  satisfaction: number // 满意度 (1-5)
  difficulty: number // 难度感知 (1-5)
  preparedness: number // 准备充分度 (1-5)
  notes: string
}

export interface SessionFeedback {
  overallPerformance: PerformanceAnalysis
  questionAnalysis: Array<QuestionAnalysis>
  recommendations: Array<ImprovementRecommendation>
  nextSteps: Array<NextStep>
}

export interface PerformanceAnalysis {
  communicationScore: number
  contentScore: number
  confidenceScore: number
  structureScore: number
  timeManagementScore: number
  overallTrend: 'improving' | 'stable' | 'declining'
}

export interface QuestionAnalysis {
  questionId: string
  category: InterviewCategory
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement'
  keyStrengths: Array<string>
  areasForImprovement: Array<string>
  timeSpent: number
}

export interface ImprovementRecommendation {
  category: string
  priority: 'high' | 'medium' | 'low'
  suggestion: string
  actionable: boolean
  resources: Array<LearningResource>
}

export interface LearningResource {
  title: string
  type: 'article' | 'video' | 'course' | 'practice' | 'template'
  url?: string
  description: string
  estimatedTime?: number
}

export interface NextStep {
  type: 'practice_more' | 'focus_area' | 'take_course' | 'schedule_mock'
  title: string
  description: string
  priority: number
}

/**
 * 真实面试记录
 */
export interface RealInterviewRecord {
  id: string
  userId: string
  jobApplication: JobApplicationInfo
  interviewDetails: InterviewDetails
  preparation: PreparationRecord
  actualQuestions?: Array<ActualQuestion>
  outcome: InterviewOutcome
  feedback: InterviewFeedback
  followUp: FollowUpActions
  createdAt: string
  updatedAt: string
}

export interface JobApplicationInfo {
  jobTitle: string
  companyName: string
  jobDescription?: string
  applicationDate: string
  referenceSource?: string
  recruiterId?: string
}

export interface InterviewDetails {
  date: string
  time: string
  duration: number // 实际面试时长（分钟）
  format: 'in_person' | 'video_call' | 'phone' | 'hybrid'
  location?: string
  interviewers: Array<InterviewerInfo>
  rounds: number
  currentRound: number
}

export interface InterviewerInfo {
  name?: string
  role: string
  department?: string
  notes?: string
}

export interface PreparationRecord {
  researchTime: number // 研究准备时间（小时）
  practiceSession: Array<string> // 练习的面试会话ID
  reviewedQuestions: Array<string>
  preparedQuestions: Array<string> // 准备的问题
  confidence: number // 准备后的信心度 (1-5)
}

export interface ActualQuestion {
  question: string
  category: InterviewCategory
  difficulty: 'easy' | 'medium' | 'hard'
  yourAnswer?: string
  interviewerReaction?: string
  notes?: string
}

export interface InterviewOutcome {
  result: 'pending' | 'passed' | 'rejected' | 'on_hold'
  feedback?: string
  nextRoundScheduled?: boolean
  nextRoundDate?: string
  offerReceived?: boolean
  offerDetails?: OfferDetails
}

export interface OfferDetails {
  salary: number
  currency: string
  benefits: Array<string>
  startDate?: string
  negotiationStatus?: 'accepted' | 'negotiating' | 'declined'
}

export interface InterviewFeedback {
  strengths: Array<string>
  weaknesses: Array<string>
  surprisingQuestions: Array<string>
  overallExperience: number // 面试体验 (1-5)
  interviewerProfessionalism: number // 面试官专业度 (1-5)
  companyImpression: number // 公司印象 (1-5)
  likelihood: number // 推荐该公司的可能性 (1-5)
}

export interface FollowUpActions {
  thankYouSent: boolean
  thankYouDate?: string
  additionalMaterials?: Array<string>
  questionsAsked?: Array<string>
  nextContactDate?: string
  notes?: string
}

/**
 * 面试分析和统计
 */
export interface InterviewAnalytics {
  totalInterviews: number
  successRate: number
  averagePreparationTime: number
  strongestCategories: Array<CategoryStrength>
  improvementAreas: Array<ImprovementArea>
  progressTrend: ProgressTrend
  companyTypePerformance: Array<CompanyTypeStats>
}

export interface CategoryStrength {
  category: InterviewCategory
  averageScore: number
  interviewCount: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface ImprovementArea {
  area: string
  currentScore: number
  targetScore: number
  actionPlan: Array<string>
  priority: number
}

export interface ProgressTrend {
  timeframe: 'week' | 'month' | 'quarter'
  dataPoints: Array<ProgressDataPoint>
  overallTrend: 'up' | 'down' | 'stable'
}

export interface ProgressDataPoint {
  date: string
  score: number
  interviewCount: number
}

export interface CompanyTypeStats {
  companySize: string
  industry: string
  successRate: number
  averageScore: number
  commonQuestions: Array<string>
}

/**
 * API 请求/响应类型
 */
export interface StartInterviewSessionRequest {
  userId: string
  type: SessionType
  jobTitle?: string
  companyName?: string
  questionCategories?: Array<InterviewCategory>
  difficulty?: 'easy' | 'medium' | 'hard'
  questionCount?: number
}

export interface SubmitResponseRequest {
  sessionId: string
  questionId: string
  response: InterviewResponse
}

export interface GetRecommendedQuestionsRequest {
  userId: string
  jobTitle?: string
  companyName?: string
  interviewType?: SessionType
  limit?: number
}

export interface InterviewAnalyticsRequest {
  userId: string
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  includeDetails?: boolean
} 
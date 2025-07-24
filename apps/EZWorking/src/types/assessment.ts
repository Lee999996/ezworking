import type { Database } from '../lib/db/types';

// 数据库表类型别名  
export type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row'];
export type AssessmentQuestionInsert = Database['public']['Tables']['assessment_questions']['Insert'];
export type AssessmentQuestionUpdate = Database['public']['Tables']['assessment_questions']['Update'];

export type AssessmentResult = Database['public']['Tables']['assessment_results']['Row'];
export type AssessmentResultInsert = Database['public']['Tables']['assessment_results']['Insert'];
export type AssessmentResultUpdate = Database['public']['Tables']['assessment_results']['Update'];

export type CareerAssessment = Database['public']['Tables']['career_assessments']['Row'];
export type CareerAssessmentInsert = Database['public']['Tables']['career_assessments']['Insert'];
export type CareerAssessmentUpdate = Database['public']['Tables']['career_assessments']['Update'];

/**
 * 测评问题类别
 */
export type QuestionCategory = 'personality' | 'skills' | 'interests' | 'values' | 'work_style';

/**
 * 问题类型
 */
export type QuestionType = 'single_choice' | 'multiple_choice' | 'rating' | 'text';

/**
 * 选择题选项
 */
export interface QuestionOption {
  id: string;
  text: string;
  value: number | string;
  description?: string;
}

/**
 * 评分选项 (1-5 星级)
 */
export interface RatingOption {
  value: number;
  label: string;
  description?: string;
}

/**
 * 测评问题详细信息
 */
export interface DetailedAssessmentQuestion {
  id: string;
  category: QuestionCategory;
  questionText: string;
  questionType: QuestionType;
  description?: string;
  options?: Array<QuestionOption>;
  ratingOptions?: Array<RatingOption>;
  weight: number;
  isRequired: boolean;
  isActive: boolean;
  tags: Array<string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户答案
 */
export interface UserAnswer {
  questionId: string;
  answer: string | number | Array<string> | Array<number>;
  confidence?: number; // 0-100，答案置信度
  timeSpent?: number; // 秒数，答题用时
  skipped?: boolean;
}

/**
 * 测评会话
 */
export interface AssessmentSession {
  id: string;
  userId: string;
  assessmentType: 'initial' | 'update' | 'custom';
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: Array<UserAnswer>;
  startedAt: string;
  completedAt: string | null;
  timeLimit?: number; // 分钟数，时间限制
  allowReview: boolean;
  allowSkip: boolean;
}

/**
 * 性格测评结果
 */
export interface PersonalityScores {
  openness: number; // 开放性 (0-100)
  conscientiousness: number; // 责任心 (0-100)
  extraversion: number; // 外向性 (0-100)
  agreeableness: number; // 宜人性 (0-100)
  neuroticism: number; // 神经质 (0-100)
  // 工作风格维度
  teamwork: number; // 团队合作
  leadership: number; // 领导力
  communication: number; // 沟通能力
  problemSolving: number; // 问题解决
  adaptability: number; // 适应性
}

/**
 * 技能评估结果
 */
export interface SkillScores {
  technical: Record<string, number>; // 技术技能分数
  soft: Record<string, number>; // 软技能分数
  language: Record<string, number>; // 语言技能分数
  domain: Record<string, number>; // 领域知识分数
  overallTechnical: number; // 技术能力总分
  overallSoft: number; // 软技能总分
}

/**
 * 兴趣评估结果
 */
export interface InterestScores {
  realistic: number; // 实用型 (R)
  investigative: number; // 研究型 (I)
  artistic: number; // 艺术型 (A)
  social: number; // 社会型 (S)
  enterprising: number; // 企业型 (E)
  conventional: number; // 常规型 (C)
  // Holland 代码
  hollandCode: string; // 如 "RIA"
  primaryInterest: string;
  secondaryInterest: string;
}

/**
 * 职业价值观评估
 */
export interface ValueScores {
  workLifeBalance: number; // 工作生活平衡
  salary: number; // 薪资重要性
  careerGrowth: number; // 职业发展
  jobSecurity: number; // 工作稳定性
  autonomy: number; // 自主性
  socialImpact: number; // 社会影响力
  creativity: number; // 创造性
  recognition: number; // 认可度
  challengeLevel: number; // 挑战性
  teamEnvironment: number; // 团队环境
}

/**
 * 推荐职业信息
 */
export interface RecommendedCareer {
  careerName: string;
  careerCode: string; // O*NET SOC 代码
  matchScore: number; // 匹配分数 (0-100)
  matchReasons: Array<string>;
  description: string;
  typicalTasks: Array<string>;
  requiredSkills: Array<string>;
  educationRequirements: Array<string>;
  salaryRange: {
    min: number;
    max: number;
    median: number;
  };
  jobOutlook: 'excellent' | 'good' | 'average' | 'below_average';
  relatedJobs: Array<string>;
  industryOptions: Array<string>;
}

/**
 * 职业匹配详情
 */
export interface CareerMatchScore {
  careerId: string;
  careerName: string;
  overallScore: number;
  personalityMatch: number;
  skillsMatch: number;
  interestsMatch: number;
  valuesMatch: number;
  experienceMatch: number;
  educationMatch: number;
  strengthsAlignment: Array<string>;
  gapsIdentified: Array<string>;
  improvementSuggestions: Array<string>;
}

/**
 * 完整的职业定位评估结果
 */
export interface CompleteCareerAssessment {
  id: string;
  userId: string;
  assessmentType: 'initial' | 'update' | 'custom';
  personalityScores: PersonalityScores;
  skillScores: SkillScores;
  interestScores: InterestScores;
  valueScores: ValueScores;
  recommendedCareers: Array<RecommendedCareer>;
  careerMatchScores: Array<CareerMatchScore>;
  analysisSummary: string;
  keyStrengths: Array<string>;
  developmentAreas: Array<string>;
  actionPlan: Array<string>;
  confidenceLevel: number; // 结果可信度 (0-100)
  completedAt: string;
  validUntil: string; // 结果有效期
  createdAt: string;
  updatedAt: string;
}

/**
 * 测评进度统计
 */
export interface AssessmentProgress {
  userId: string;
  totalQuestions: number;
  answeredQuestions: number;
  completionPercentage: number;
  estimatedTimeRemaining: number; // 分钟
  categoryProgress: Record<QuestionCategory, {
    total: number;
    completed: number;
    percentage: number;
  }>;
  lastSavedAt: string;
}

/**
 * 测评配置
 */
export interface AssessmentConfig {
  id: string;
  name: string;
  description: string;
  categories: Array<QuestionCategory>;
  questionCount: Record<QuestionCategory, number>;
  timeLimit: number | null; // 分钟
  allowReview: boolean;
  allowSkip: boolean;
  randomizeQuestions: boolean;
  passingScore: number | null;
  isActive: boolean;
  targetAudience: Array<string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * API 响应类型
 */
export interface AssessmentApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/**
 * 测评统计信息
 */
export interface AssessmentStats {
  totalAssessments: number;
  completedAssessments: number;
  averageCompletionTime: number; // 分钟
  completionRate: number; // 0-100
  categoryStats: Record<QuestionCategory, {
    averageScore: number;
    completionRate: number;
  }>;
  topCareerRecommendations: Array<{
    careerName: string;
    recommendationCount: number;
  }>;
} 
/**
 * 职业定位服务层
 * 处理岗位推荐、匹配分析等业务逻辑
 */

import { supabase, handleDatabaseError, type DatabaseResult } from '../lib/db/supabase'
import type {
  JobRecommendation as DBJobRecommendation,
  JobRecommendationInsert,
  JobRecommendationUpdate
} from '../lib/db/types'
import type {
  JobPosition,
  JobRecommendation,
  MatchAnalysis,
  JobSearchRequest,
  JobSearchResponse,
  GenerateRecommendationsRequest,
  CareerAnalysisRequest,
  CareerAnalysisResponse,
  UserCareerProfile,
  RecommendationStatus
} from '../types'
import { UserService } from './user'

export class CareerService {
  /**
   * 生成岗位推荐
   */
  static async generateRecommendations(
    request: GenerateRecommendationsRequest
  ): Promise<DatabaseResult<Array<JobRecommendation>>> {
    // 获取用户完整档案
    const profileResult = await UserService.getCompleteProfile(request.userId)
    if (!profileResult.success || !profileResult.data) {
      return handleDatabaseError(null, { message: 'User profile not found' })
    }

    const userProfile = profileResult.data
    
    // 获取模拟岗位数据（实际应从外部API或数据库获取）
    const mockJobs = await this.getMockJobPositions()
    
    // 计算匹配度并生成推荐
    const recommendations: Array<JobRecommendation> = []
    
    for (const job of mockJobs.slice(0, request.limit || 10)) {
      const matchAnalysis = await this.calculateJobMatch(userProfile, job)
      
      if (matchAnalysis.overallScore >= 0.3) { // 最低匹配门槛
        const recommendation: JobRecommendation = {
          id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: request.userId,
          job,
          matchScore: matchAnalysis.overallScore,
          matchDetails: matchAnalysis,
          recommendationReason: this.generateRecommendationReason(matchAnalysis),
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
        
        recommendations.push(recommendation)
      }
    }

    // 按匹配度排序
    recommendations.sort((a, b) => b.matchScore - a.matchScore)

    // 保存推荐到数据库
    for (const rec of recommendations) {
      await this.saveRecommendation(rec)
    }

    return handleDatabaseError(recommendations, null)
  }

  /**
   * 获取用户的岗位推荐
   */
  static async getUserRecommendations(
    userId: string,
    status?: RecommendationStatus,
    limit: number = 20
  ): Promise<DatabaseResult<Array<JobRecommendation>>> {
    let query = supabase
      .from('job_recommendations')
      .select('*')
      .eq('user_id', userId)

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('match_score', { ascending: false })
      .limit(limit)

    if (error) {
      return handleDatabaseError(null, error)
    }

    const recommendations: Array<JobRecommendation> = (data || []).map(item => ({
      id: item.id,
      userId: item.user_id,
      job: {
        id: item.id,
        title: item.job_title,
        company: {
          name: item.company_name || '',
          industry: '',
          size: 'medium',
        },
        description: item.job_description || '',
        requirements: {
          skills: (item.required_skills || []).map(skill => ({
            name: skill,
            level: 'intermediate',
            isRequired: true,
          })),
        },
        benefits: {},
        location: {
          city: item.location || '',
          country: 'CN',
          isRemote: false,
        },
        employmentType: 'full_time',
        experienceLevel: 'junior',
        postedDate: item.created_at,
        status: 'active',
        tags: [],
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      },
      matchScore: Number(item.match_score) || 0,
      matchDetails: {
        overallScore: Number(item.match_score) || 0,
        skillsMatch: { score: 0, matchedSkills: [], missingSkills: [], strengthAreas: [] },
        experienceMatch: { score: 0, userExperience: 0, requiredExperience: 0, relevantExperience: 0, isQualified: false },
        locationMatch: { score: 0, userPreferences: [], jobLocation: { city: '', country: 'CN', isRemote: false } },
        salaryMatch: { score: 0, jobSalaryRange: { min: 0, max: 0, currency: 'CNY', period: 'monthly' }, meetExpectation: false },
        improvementSuggestions: [],
      },
      recommendationReason: item.recommendation_reason || '',
      status: item.status as RecommendationStatus,
      createdAt: item.created_at,
    }))

    return handleDatabaseError(recommendations, null)
  }

  /**
   * 更新推荐状态
   */
  static async updateRecommendationStatus(
    recommendationId: string,
    userId: string,
    status: RecommendationStatus
  ): Promise<DatabaseResult<boolean>> {
    const updateData: JobRecommendationUpdate = {
      status,
    }

    // 根据状态添加时间戳
    if (status === 'viewed') {
      updateData.created_at = new Date().toISOString() // 使用created_at字段记录查看时间
    } else if (status === 'applied') {
      updateData.created_at = new Date().toISOString() // 使用created_at字段记录申请时间
    }

    const { error } = await supabase
      .from('job_recommendations')
      .update(updateData)
      .eq('id', recommendationId)
      .eq('user_id', userId)

    return handleDatabaseError(!error, error)
  }

  /**
   * 搜索岗位（预留接口）
   */
  static async searchJobs(request: JobSearchRequest): Promise<DatabaseResult<JobSearchResponse>> {
    // 预留接口：实际应调用外部招聘API或内部岗位数据库
    const mockJobs = await this.getMockJobPositions()
    
    let filteredJobs = mockJobs

    // 简单的过滤逻辑
    if (request.keywords) {
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(request.keywords!.toLowerCase()) ||
        job.description.toLowerCase().includes(request.keywords!.toLowerCase())
      )
    }

    if (request.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.city.toLowerCase().includes(request.location!.toLowerCase())
      )
    }

    if (request.experience_level) {
      filteredJobs = filteredJobs.filter(job => job.experienceLevel === request.experience_level)
    }

    // 分页
    const page = request.page || 1
    const limit = request.limit || 20
    const offset = (page - 1) * limit
    const paginatedJobs = filteredJobs.slice(offset, offset + limit)

    const response: JobSearchResponse = {
      jobs: paginatedJobs,
      totalCount: filteredJobs.length,
      currentPage: page,
      totalPages: Math.ceil(filteredJobs.length / limit),
      filters: {
        locations: ['北京', '上海', '深圳', '杭州'],
        companies: ['阿里巴巴', '腾讯', '字节跳动', '美团'],
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        salary_ranges: [
          { min: 8000, max: 15000, currency: 'CNY', period: 'monthly' },
          { min: 15000, max: 25000, currency: 'CNY', period: 'monthly' },
        ],
        experience_levels: ['entry', 'junior', 'mid', 'senior'],
      },
    }

    return handleDatabaseError(response, null)
  }

  /**
   * 职业分析
   */
  static async analyzeCareer(request: CareerAnalysisRequest): Promise<DatabaseResult<CareerAnalysisResponse>> {
    // 获取用户完整档案
    const profileResult = await UserService.getCompleteProfile(request.userId)
    if (!profileResult.success || !profileResult.data) {
      return handleDatabaseError(null, { message: 'User profile not found' })
    }

    const userProfile = profileResult.data

    // 生成用户职业画像
    const careerProfile = await this.generateUserCareerProfile(userProfile)
    
    // 获取推荐岗位
    const recommendationsResult = await this.getUserRecommendations(request.userId, undefined, 10)
    const recommendations = recommendationsResult.data || []

    // 生成市场洞察
    const marketInsights = await this.generateMarketInsights()

    const analysis: CareerAnalysisResponse = {
      currentProfile: careerProfile,
      recommendations,
      careerPaths: [], // 预留：职业路径规划
      marketInsights,
    }

    return handleDatabaseError(analysis, null)
  }

  /**
   * 保存推荐到数据库
   */
  private static async saveRecommendation(recommendation: JobRecommendation): Promise<void> {
    const data: JobRecommendationInsert = {
      user_id: recommendation.userId,
      job_title: recommendation.job.title,
      company_name: recommendation.job.company.name,
      job_description: recommendation.job.description,
      required_skills: recommendation.job.requirements.skills.map(s => s.name),
      salary_range: recommendation.job.salaryRange ? 
        `${recommendation.job.salaryRange.min}-${recommendation.job.salaryRange.max} ${recommendation.job.salaryRange.currency}` : 
        null,
      location: recommendation.job.location.city,
      match_score: recommendation.matchScore,
      recommendation_reason: recommendation.recommendationReason,
      external_url: recommendation.job.externalUrl,
      status: recommendation.status,
    }

    await supabase.from('job_recommendations').insert(data)
  }

  /**
   * 计算岗位匹配度
   */
  private static async calculateJobMatch(
    userProfile: any,
    job: JobPosition
  ): Promise<MatchAnalysis> {
    // 简化的匹配度计算逻辑
    const skillsScore = this.calculateSkillsMatch(userProfile.skills || [], job.requirements.skills || [])
    const experienceScore = this.calculateExperienceMatch(userProfile.workExperience || 0, job.experienceLevel)
    const locationScore = this.calculateLocationMatch(userProfile.preferredLocations || [], job.location)
    const salaryScore = this.calculateSalaryMatch(userProfile.salaryExpectation, job.salaryRange)

    const overallScore = (skillsScore * 0.4 + experienceScore * 0.3 + locationScore * 0.2 + salaryScore * 0.1)

    return {
      overallScore,
      skillsMatch: {
        score: skillsScore,
        matchedSkills: [],
        missingSkills: [],
        strengthAreas: [],
      },
      experienceMatch: {
        score: experienceScore,
        userExperience: userProfile.workExperience || 0,
        requiredExperience: this.getRequiredExperienceYears(job.experienceLevel),
        relevantExperience: userProfile.workExperience || 0,
        isQualified: experienceScore >= 0.6,
      },
      locationMatch: {
        score: locationScore,
        userPreferences: userProfile.preferredLocations || [],
        jobLocation: job.location,
      },
      salaryMatch: {
        score: salaryScore,
        userExpectation: userProfile.salaryExpectation,
        jobSalaryRange: job.salaryRange || { min: 0, max: 0, currency: 'CNY', period: 'monthly' },
        meetExpectation: salaryScore >= 0.7,
      },
      improvementSuggestions: [],
    }
  }

  private static calculateSkillsMatch(userSkills: Array<string>, requiredSkills: Array<any>): number {
    if (requiredSkills.length === 0) return 1
    
    const requiredSkillNames = requiredSkills.map(s => s.name || s).map(name => name.toLowerCase())
    const userSkillNames = userSkills.map(s => s.toLowerCase())
    
    const matchedCount = requiredSkillNames.filter(skill => 
      userSkillNames.some(userSkill => userSkill.includes(skill))
    ).length
    
    return matchedCount / requiredSkillNames.length
  }

  private static calculateExperienceMatch(userExperience: number, requiredLevel: string): number {
    const requiredYears = this.getRequiredExperienceYears(requiredLevel)
    if (userExperience >= requiredYears) return 1
    return Math.max(0, userExperience / requiredYears)
  }

  private static calculateLocationMatch(userPreferences: Array<string>, jobLocation: any): number {
    if (userPreferences.length === 0) return 0.8 // 默认分数
    
    const jobCity = jobLocation.city.toLowerCase()
    const hasMatch = userPreferences.some(pref => 
      pref.toLowerCase().includes(jobCity) || jobCity.includes(pref.toLowerCase())
    )
    
    return hasMatch ? 1 : (jobLocation.isRemote ? 0.9 : 0.3)
  }

  private static calculateSalaryMatch(userExpectation?: number, jobSalary?: any): number {
    if (!userExpectation || !jobSalary) return 0.7 // 默认分数
    
    const jobAvg = (jobSalary.min + jobSalary.max) / 2
    if (jobAvg >= userExpectation) return 1
    
    return Math.max(0.3, jobAvg / userExpectation)
  }

  private static getRequiredExperienceYears(level: string): number {
    const mapping: Record<string, number> = {
      entry: 0,
      junior: 1,
      mid: 3,
      senior: 5,
      lead: 7,
      executive: 10,
    }
    return mapping[level] || 2
  }

  /**
   * 生成推荐理由
   */
  private static generateRecommendationReason(matchAnalysis: MatchAnalysis): string {
    const reasons = []
    
    if (matchAnalysis.skillsMatch.score >= 0.7) {
      reasons.push('技能匹配度高')
    }
    
    if (matchAnalysis.experienceMatch.score >= 0.8) {
      reasons.push('经验符合要求')
    }
    
    if (matchAnalysis.locationMatch.score >= 0.8) {
      reasons.push('地理位置理想')
    }
    
    if (matchAnalysis.salaryMatch.score >= 0.8) {
      reasons.push('薪资符合期望')
    }

    return reasons.length > 0 ? reasons.join('，') : '综合条件较为匹配'
  }

  /**
   * 生成用户职业画像
   */
  private static async generateUserCareerProfile(userProfile: any): Promise<UserCareerProfile> {
    return {
      strengths: userProfile.skills?.slice(0, 5) || ['学习能力强'],
      weaknesses: ['需要更多实践经验'],
      marketability: 75, // 基于档案完整度和技能匹配度计算
      careerStage: this.determineCareerStage(userProfile.workExperience || 0),
      topSkills: (userProfile.skills || []).slice(0, 10).map((skill: string) => ({
        skillName: skill,
        currentLevel: 'intermediate',
        marketDemand: Math.floor(Math.random() * 40) + 60, // 模拟市场需求度
        salaryImpact: Math.floor(Math.random() * 30) + 70, // 模拟薪资影响度
      })),
    }
  }

  private static determineCareerStage(experience: number): 'entry' | 'growth' | 'established' | 'transition' {
    if (experience <= 1) return 'entry'
    if (experience <= 5) return 'growth'
    if (experience <= 10) return 'established'
    return 'transition'
  }

  /**
   * 生成市场洞察
   */
  private static async generateMarketInsights() {
    return {
      trendingSkills: ['AI/机器学习', 'React', 'Python', 'Docker', '数据分析'],
      growingIndustries: ['人工智能', '新能源', '生物技术', '数字化营销'],
      salaryTrends: {
        'JavaScript': 15000,
        'Python': 18000,
        'React': 16000,
        'AI/ML': 25000,
      },
      competitionLevel: 'medium' as const,
      bestMarkets: ['北京', '上海', '深圳', '杭州', '成都'],
    }
  }

  /**
   * 获取模拟岗位数据
   */
  private static async getMockJobPositions(): Promise<Array<JobPosition>> {
    return [
      {
        id: 'job_1',
        title: '前端开发工程师',
        company: {
          name: '阿里巴巴',
          industry: '互联网',
          size: 'enterprise',
        },
        description: '负责Web应用的前端开发，使用React、TypeScript等技术栈',
        requirements: {
          skills: [
            { name: 'JavaScript', level: 'advanced', isRequired: true },
            { name: 'React', level: 'intermediate', isRequired: true },
            { name: 'TypeScript', level: 'intermediate', isRequired: false },
          ],
          experience: { minYears: 2, maxYears: 5, isRequired: true },
        },
        benefits: {
          healthInsurance: true,
          flexibleSchedule: true,
          stockOptions: true,
        },
        location: {
          city: '杭州',
          country: 'CN',
          isRemote: false,
        },
        salaryRange: {
          min: 15000,
          max: 25000,
          currency: 'CNY',
          period: 'monthly',
        },
        employmentType: 'full_time',
        experienceLevel: 'junior',
        postedDate: new Date().toISOString(),
        status: 'active',
        tags: ['前端', 'React', 'JavaScript'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'job_2',
        title: 'Python后端开发工程师',
        company: {
          name: '腾讯',
          industry: '互联网',
          size: 'enterprise',
        },
        description: '负责后端API开发，使用Python、Django等框架',
        requirements: {
          skills: [
            { name: 'Python', level: 'advanced', isRequired: true },
            { name: 'Django', level: 'intermediate', isRequired: true },
            { name: 'MySQL', level: 'intermediate', isRequired: true },
          ],
          experience: { minYears: 1, maxYears: 3, isRequired: true },
        },
        benefits: {
          healthInsurance: true,
          remoteWork: true,
        },
        location: {
          city: '深圳',
          country: 'CN',
          isRemote: false,
        },
        salaryRange: {
          min: 18000,
          max: 30000,
          currency: 'CNY',
          period: 'monthly',
        },
        employmentType: 'full_time',
        experienceLevel: 'junior',
        postedDate: new Date().toISOString(),
        status: 'active',
        tags: ['后端', 'Python', 'Django'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
} 
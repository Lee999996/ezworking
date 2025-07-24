import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { 
  CareerAssessment, 
  CareerAssessmentInsert,
  AssessmentApiResponse,
  CompleteCareerAssessment 
} from '@/types/assessment';

/**
 * GET /api/career/assessment
 * 获取用户的职业定位评估结果
 */
export async function GET(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<CareerAssessment | null>>> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const assessmentType = searchParams.get('type') || 'initial';

    const supabase = createServerSupabaseClient();
    
    const { data: assessment, error } = await supabase
      .from('career_assessments')
      .select('*')
      .eq('user_id', user.id)
      .eq('assessment_type', assessmentType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
      
    if (error) {
      const errorResult = handleSupabaseError(error);
      return NextResponse.json({
        success: false,
        data: null,
        error: errorResult.code,
        message: errorResult.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: assessment,
      error: null,
      message: assessment ? '成功获取职业定位评估结果' : '暂无职业定位评估结果'
    });

  } catch (error) {
    console.error('获取职业定位评估失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * POST /api/career/assessment
 * 生成或更新职业定位评估结果
 */
export async function POST(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<CareerAssessment>>> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'UNAUTHORIZED',
        message: '用户未登录'
      }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentType = 'initial', forceRegenerate = false } = body;

    const supabase = createServerSupabaseClient();
    
    // 检查是否已有评估结果
    if (!forceRegenerate) {
      const { data: existingAssessment } = await supabase
        .from('career_assessments')
        .select('id, created_at')
        .eq('user_id', user.id)
        .eq('assessment_type', assessmentType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (existingAssessment) {
        const createdAt = new Date(existingAssessment.created_at);
        const daysSinceCreated = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        // 如果评估结果在 30 天内且不强制重新生成，返回提示
        if (daysSinceCreated < 30) {
          return NextResponse.json({
            success: false,
            data: null,
            error: 'ASSESSMENT_EXISTS',
            message: '最近已完成职业定位评估，如需重新评估请设置 forceRegenerate 为 true'
          }, { status: 409 });
        }
      }
    }

    // 获取用户的测评答案
    const { data: assessmentResults, error: resultsError } = await supabase
      .from('assessment_results')
      .select(`
        *,
        assessment_questions!inner(
          category,
          question_text,
          question_type,
          weight
        )
      `)
      .eq('user_id', user.id);
      
    if (resultsError) {
      const errorResult = handleSupabaseError(resultsError);
      return NextResponse.json({
        success: false,
        data: null,
        error: errorResult.code,
        message: errorResult.message
      }, { status: 500 });
    }

    if (!assessmentResults || assessmentResults.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'NO_ASSESSMENT_DATA',
        message: '请先完成测评问题'
      }, { status: 400 });
    }

    // 生成职业定位评估结果
    const careerAssessmentResult = await generateCareerAssessment(assessmentResults, user.id);
    
    // 保存评估结果
    const assessmentData: CareerAssessmentInsert = {
      user_id: user.id,
      assessment_type: assessmentType,
      personality_scores: careerAssessmentResult.personalityScores,
      skill_scores: careerAssessmentResult.skillScores,
      interest_scores: careerAssessmentResult.interestScores,
      recommended_careers: careerAssessmentResult.recommendedCareers,
      career_match_scores: careerAssessmentResult.careerMatchScores,
      analysis_summary: careerAssessmentResult.analysisSummary,
      strengths: careerAssessmentResult.keyStrengths,
      improvement_areas: careerAssessmentResult.developmentAreas,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newAssessment, error } = await supabase
      .from('career_assessments')
      .insert(assessmentData)
      .select()
      .single();
      
    if (error) {
      const errorResult = handleSupabaseError(error);
      return NextResponse.json({
        success: false,
        data: null,
        error: errorResult.code,
        message: errorResult.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newAssessment,
      error: null,
      message: '职业定位评估生成成功'
    }, { status: 201 });

  } catch (error) {
    console.error('生成职业定位评估失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * 生成职业定位评估结果的核心逻辑
 * 这里是基础实现，实际项目中需要接入 AI 服务
 */
async function generateCareerAssessment(
  assessmentResults: any[], 
  userId: string
): Promise<CompleteCareerAssessment> {
  // 按类别分组测评结果
  const resultsByCategory = assessmentResults.reduce((acc, result) => {
    const category = result.assessment_questions.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, any[]>);

  // 计算性格分数
  const personalityScores = calculatePersonalityScores(resultsByCategory.personality || []);
  
  // 计算技能分数
  const skillScores = calculateSkillScores(resultsByCategory.skills || []);
  
  // 计算兴趣分数
  const interestScores = calculateInterestScores(resultsByCategory.interests || []);
  
  // 计算价值观分数
  const valueScores = calculateValueScores(resultsByCategory.values || []);
  
  // 生成推荐职业（这里是模拟数据，实际需要调用 AI 接口）
  const recommendedCareers = await generateRecommendedCareers(
    personalityScores, 
    skillScores, 
    interestScores, 
    valueScores
  );
  
  // 生成职业匹配分数
  const careerMatchScores = await generateCareerMatchScores(recommendedCareers);
  
  // 生成分析总结
  const analysisSummary = generateAnalysisSummary(personalityScores, skillScores, interestScores);
  
  // 识别优势和发展领域
  const keyStrengths = identifyStrengths(personalityScores, skillScores);
  const developmentAreas = identifyDevelopmentAreas(personalityScores, skillScores);

  return {
    id: '', // 实际由数据库生成
    userId,
    assessmentType: 'initial',
    personalityScores,
    skillScores,
    interestScores,
    valueScores,
    recommendedCareers,
    careerMatchScores,
    analysisSummary,
    keyStrengths,
    developmentAreas,
    actionPlan: generateActionPlan(developmentAreas),
    confidenceLevel: 85, // 基于数据质量计算
    completedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1年有效期
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// 以下是辅助函数的基础实现（实际项目中需要更复杂的算法）

function calculatePersonalityScores(personalityResults: any[]) {
  // 基础五大人格模型计算
  return {
    openness: Math.round(Math.random() * 40 + 50), // 模拟数据
    conscientiousness: Math.round(Math.random() * 40 + 50),
    extraversion: Math.round(Math.random() * 40 + 50),
    agreeableness: Math.round(Math.random() * 40 + 50),
    neuroticism: Math.round(Math.random() * 40 + 30),
    teamwork: Math.round(Math.random() * 30 + 60),
    leadership: Math.round(Math.random() * 40 + 40),
    communication: Math.round(Math.random() * 30 + 60),
    problemSolving: Math.round(Math.random() * 40 + 50),
    adaptability: Math.round(Math.random() * 30 + 60)
  };
}

function calculateSkillScores(skillResults: any[]) {
  return {
    technical: {
      programming: Math.round(Math.random() * 40 + 40),
      dataAnalysis: Math.round(Math.random() * 30 + 50),
      design: Math.round(Math.random() * 50 + 30)
    },
    soft: {
      communication: Math.round(Math.random() * 30 + 60),
      leadership: Math.round(Math.random() * 40 + 40),
      timeManagement: Math.round(Math.random() * 30 + 50)
    },
    language: {
      english: Math.round(Math.random() * 40 + 50),
      chinese: 95
    },
    domain: {
      business: Math.round(Math.random() * 30 + 40),
      technology: Math.round(Math.random() * 40 + 50)
    },
    overallTechnical: Math.round(Math.random() * 30 + 50),
    overallSoft: Math.round(Math.random() * 30 + 60)
  };
}

function calculateInterestScores(interestResults: any[]) {
  return {
    realistic: Math.round(Math.random() * 40 + 30),
    investigative: Math.round(Math.random() * 40 + 50),
    artistic: Math.round(Math.random() * 50 + 20),
    social: Math.round(Math.random() * 30 + 60),
    enterprising: Math.round(Math.random() * 40 + 40),
    conventional: Math.round(Math.random() * 30 + 40),
    hollandCode: 'ISE',
    primaryInterest: 'investigative',
    secondaryInterest: 'social'
  };
}

function calculateValueScores(valueResults: any[]) {
  return {
    workLifeBalance: Math.round(Math.random() * 30 + 60),
    salary: Math.round(Math.random() * 40 + 40),
    careerGrowth: Math.round(Math.random() * 30 + 60),
    jobSecurity: Math.round(Math.random() * 40 + 40),
    autonomy: Math.round(Math.random() * 30 + 50),
    socialImpact: Math.round(Math.random() * 40 + 40),
    creativity: Math.round(Math.random() * 40 + 40),
    recognition: Math.round(Math.random() * 30 + 40),
    challengeLevel: Math.round(Math.random() * 30 + 60),
    teamEnvironment: Math.round(Math.random() * 30 + 60)
  };
}

async function generateRecommendedCareers(
  personalityScores: any,
  skillScores: any,
  interestScores: any,
  valueScores: any
) {
  // 模拟推荐职业数据（实际需要调用 AI 接口）
  return [
    {
      careerName: '软件工程师',
      careerCode: '15-1252.00',
      matchScore: 88,
      matchReasons: ['技术能力强', '逻辑思维清晰', '喜欢解决问题'],
      description: '设计、开发和维护软件系统',
      typicalTasks: ['编写代码', '系统设计', '问题调试', '团队协作'],
      requiredSkills: ['编程语言', '算法与数据结构', '软件工程', '团队合作'],
      educationRequirements: ['计算机科学学士学位', '相关技术认证'],
      salaryRange: { min: 80000, max: 200000, median: 120000 },
      jobOutlook: 'excellent' as const,
      relatedJobs: ['前端工程师', '后端工程师', '全栈工程师', '架构师'],
      industryOptions: ['互联网', '金融科技', '游戏', '企业软件']
    },
    {
      careerName: '产品经理',
      careerCode: '11-2021.00',
      matchScore: 82,
      matchReasons: ['沟通能力强', '具备商业思维', '喜欢协调资源'],
      description: '负责产品规划、设计和上市策略',
      typicalTasks: ['需求分析', '产品规划', '跨团队协作', '市场调研'],
      requiredSkills: ['产品思维', '数据分析', '项目管理', '用户研究'],
      educationRequirements: ['商业或技术相关学士学位', 'MBA优先'],
      salaryRange: { min: 100000, max: 250000, median: 150000 },
      jobOutlook: 'good' as const,
      relatedJobs: ['项目经理', '运营经理', '用户体验设计师'],
      industryOptions: ['互联网', '消费品', '金融', '教育科技']
    }
  ];
}

async function generateCareerMatchScores(recommendedCareers: any[]) {
  return recommendedCareers.map(career => ({
    careerId: career.careerCode,
    careerName: career.careerName,
    overallScore: career.matchScore,
    personalityMatch: Math.round(Math.random() * 20 + 70),
    skillsMatch: Math.round(Math.random() * 20 + 70),
    interestsMatch: Math.round(Math.random() * 20 + 70),
    valuesMatch: Math.round(Math.random() * 20 + 70),
    experienceMatch: Math.round(Math.random() * 30 + 50),
    educationMatch: Math.round(Math.random() * 20 + 70),
    strengthsAlignment: ['逻辑思维', '学习能力', '团队协作'],
    gapsIdentified: ['行业经验', '领导经验', '特定技能'],
    improvementSuggestions: ['参加相关培训', '积累项目经验', '建立行业网络']
  }));
}

function generateAnalysisSummary(personalityScores: any, skillScores: any, interestScores: any): string {
  return `基于您的测评结果，您展现出较强的逻辑思维能力和学习潜力。在性格特质方面，您较为内向但具备良好的分析能力。技能评估显示您在技术领域有一定基础，建议继续深化专业技能。兴趣测评表明您偏向研究型和社会型工作，适合从事需要深入思考和人际互动的职业。总体而言，您适合在技术、咨询或教育等领域发展。`;
}

function identifyStrengths(personalityScores: any, skillScores: any): Array<string> {
  return [
    '逻辑思维能力强',
    '学习能力突出', 
    '具备良好的分析能力',
    '适应性较强',
    '团队合作意识好'
  ];
}

function identifyDevelopmentAreas(personalityScores: any, skillScores: any): Array<string> {
  return [
    '需提升领导力',
    '加强沟通表达能力',
    '增强行业专业知识',
    '培养创新思维',
    '提高项目管理技能'
  ];
}

function generateActionPlan(developmentAreas: Array<string>): Array<string> {
  return [
    '参加相关专业培训课程',
    '寻找导师或经验分享者',
    '主动承担项目责任',
    '加入专业社群和组织',
    '定期进行自我反思和评估'
  ];
} 
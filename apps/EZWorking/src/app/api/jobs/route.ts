import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { Database } from '@/lib/db/types';

type JobPosition = Database['public']['Tables']['job_positions']['Row'];
type JobPositionInsert = Database['public']['Tables']['job_positions']['Insert'];

interface JobApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/**
 * GET /api/jobs
 * 搜索和获取岗位信息列表（预留接口）
 * 支持查询参数: title, company, location, jobType, experienceLevel, skills, limit, offset
 */
export async function GET(request: NextRequest): Promise<NextResponse<JobApiResponse<Array<JobPosition>>>> {
  try {
    // TODO: 实现用户认证检查（可选，有些岗位信息可以公开访问）
    const { searchParams } = new URL(request.url);
    
    const title = searchParams.get('title');
    const company = searchParams.get('company');
    const location = searchParams.get('location');
    const jobType = searchParams.get('jobType');
    const experienceLevel = searchParams.get('experienceLevel');
    const skills = searchParams.get('skills')?.split(',');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const remoteOnly = searchParams.get('remote') === 'true';

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('job_positions')
      .select('*')
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('posted_date', { ascending: false });

    // 应用筛选条件
    if (title) {
      query = query.ilike('title', `%${title}%`);
    }
    
    if (company) {
      query = query.ilike('company_name', `%${company}%`);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (jobType) {
      query = query.eq('job_type', jobType);
    }
    
    if (experienceLevel) {
      query = query.eq('experience_level', experienceLevel);
    }
    
    if (remoteOnly) {
      query = query.eq('remote_option', true);
    }
    
    // TODO: 技能匹配需要更复杂的查询逻辑
    if (skills && skills.length > 0) {
      query = query.overlaps('skills_required', skills);
    }

    const { data: jobs, error } = await query;
      
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
      data: jobs || [],
      error: null,
      message: `成功获取 ${jobs?.length || 0} 个岗位信息`
    });

  } catch (error) {
    console.error('获取岗位信息失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * POST /api/jobs
 * 创建新的岗位信息（管理员或企业用户功能，预留接口）
 */
export async function POST(request: NextRequest): Promise<NextResponse<JobApiResponse<JobPosition>>> {
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

    // TODO: 验证用户是否有创建岗位的权限（企业用户或管理员）
    
    const body = await request.json();
    
    // 验证必填字段
    if (!body.title || !body.companyName || !body.description || !body.location) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '岗位标题、公司名称、岗位描述和工作地点为必填字段'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // 准备插入数据
    const jobData: JobPositionInsert = {
      title: body.title,
      company_name: body.companyName,
      company_id: body.companyId || null,
      description: body.description,
      requirements: body.requirements || null,
      responsibilities: body.responsibilities || null,
      benefits: body.benefits || null,
      salary_min: body.salaryMin || null,
      salary_max: body.salaryMax || null,
      location: body.location,
      job_type: body.jobType || 'full_time',
      experience_level: body.experienceLevel || 'mid',
      skills_required: body.skillsRequired || null,
      application_url: body.applicationUrl || null,
      source: body.source || 'manual',
      source_job_id: body.sourceJobId || null,
      is_active: body.isActive !== false,
      posted_date: body.postedDate || new Date().toISOString(),
      application_deadline: body.applicationDeadline || null,
      remote_option: body.remoteOption || false,
      industry: body.industry || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newJob, error } = await supabase
      .from('job_positions')
      .insert(jobData)
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
      data: newJob,
      error: null,
      message: '岗位信息创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建岗位信息失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * PUT /api/jobs
 * 批量更新岗位状态（管理员功能，预留接口）
 */
export async function PUT(request: NextRequest): Promise<NextResponse<JobApiResponse<null>>> {
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

    // TODO: 验证用户是否有管理员权限

    const body = await request.json();
    const { jobIds, updates } = body;
    
    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '岗位ID列表不能为空'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('job_positions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', jobIds);
      
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
      data: null,
      error: null,
      message: `成功更新 ${jobIds.length} 个岗位`
    });

  } catch (error) {
    console.error('批量更新岗位失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
} 
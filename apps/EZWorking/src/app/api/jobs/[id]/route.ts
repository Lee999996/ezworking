import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { Database } from '@/lib/db/types';

type JobPosition = Database['public']['Tables']['job_positions']['Row'];
type JobPositionUpdate = Database['public']['Tables']['job_positions']['Update'];

interface JobApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/**
 * GET /api/jobs/[id]
 * 获取单个岗位详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<JobApiResponse<JobPosition>>> {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '岗位ID不能为空'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { data: job, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('id', jobId)
      .eq('is_active', true)
      .single();
      
    if (error) {
      const errorResult = handleSupabaseError(error);
      return NextResponse.json({
        success: false,
        data: null,
        error: errorResult.code,
        message: errorResult.message
      }, { status: error.code === 'PGRST116' ? 404 : 500 });
    }

    return NextResponse.json({
      success: true,
      data: job,
      error: null,
      message: '成功获取岗位详情'
    });

  } catch (error) {
    console.error('获取岗位详情失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * PUT /api/jobs/[id]
 * 更新岗位信息（企业用户或管理员功能，预留接口）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<JobApiResponse<JobPosition>>> {
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

    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '岗位ID不能为空'
      }, { status: 400 });
    }

    // TODO: 验证用户是否有权限更新此岗位（岗位创建者、企业管理员或系统管理员）

    const body = await request.json();
    const supabase = createServerSupabaseClient();
    
    // 准备更新数据
    const updateData: JobPositionUpdate = {
      title: body.title,
      company_name: body.companyName,
      company_id: body.companyId,
      description: body.description,
      requirements: body.requirements,
      responsibilities: body.responsibilities,
      benefits: body.benefits,
      salary_min: body.salaryMin,
      salary_max: body.salaryMax,
      location: body.location,
      job_type: body.jobType,
      experience_level: body.experienceLevel,
      skills_required: body.skillsRequired,
      application_url: body.applicationUrl,
      application_deadline: body.applicationDeadline,
      remote_option: body.remoteOption,
      industry: body.industry,
      is_active: body.isActive,
      updated_at: new Date().toISOString()
    };

    // 移除 undefined 值
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    ) as JobPositionUpdate;

    const { data: updatedJob, error } = await supabase
      .from('job_positions')
      .update(cleanedUpdateData)
      .eq('id', jobId)
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
      data: updatedJob,
      error: null,
      message: '岗位信息更新成功'
    });

  } catch (error) {
    console.error('更新岗位信息失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/jobs/[id]
 * 删除岗位信息（软删除，设置为不活跃）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<JobApiResponse<null>>> {
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

    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '岗位ID不能为空'
      }, { status: 400 });
    }

    // TODO: 验证用户是否有权限删除此岗位

    const supabase = createServerSupabaseClient();
    
    // 软删除：设置为不活跃而不是物理删除
    const { error } = await supabase
      .from('job_positions')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);
      
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
      message: '岗位信息删除成功'
    });

  } catch (error) {
    console.error('删除岗位信息失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
} 
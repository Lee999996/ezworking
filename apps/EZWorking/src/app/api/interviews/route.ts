import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { Database } from '@/lib/db/types';

type InterviewRecord = Database['public']['Tables']['interview_records']['Row'];
type InterviewRecordInsert = Database['public']['Tables']['interview_records']['Insert'];

interface InterviewApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
  message: string | null;
}

/**
 * GET /api/interviews
 * 获取用户的面试记录列表
 * 支持查询参数: company, position, result, limit, offset
 */
export async function GET(request: NextRequest): Promise<NextResponse<InterviewApiResponse<Array<InterviewRecord>>>> {
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
    const company = searchParams.get('company');
    const position = searchParams.get('position');
    const result = searchParams.get('result');
    const interviewType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('interview_records')
      .select('*')
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)
      .order('interview_date', { ascending: false });

    // 应用筛选条件
    if (company) {
      query = query.ilike('company_name', `%${company}%`);
    }
    
    if (position) {
      query = query.ilike('position_title', `%${position}%`);
    }
    
    if (result) {
      query = query.eq('result', result);
    }
    
    if (interviewType) {
      query = query.eq('interview_type', interviewType);
    }

    const { data: interviews, error } = await query;
      
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
      data: interviews || [],
      error: null,
      message: `成功获取 ${interviews?.length || 0} 条面试记录`
    });

  } catch (error) {
    console.error('获取面试记录失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * POST /api/interviews
 * 创建新的面试记录
 */
export async function POST(request: NextRequest): Promise<NextResponse<InterviewApiResponse<InterviewRecord>>> {
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
    
    // 验证必填字段
    if (!body.companyName || !body.positionTitle || !body.interviewDate || !body.interviewType) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '公司名称、岗位标题、面试日期和面试类型为必填字段'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // 准备插入数据
    const interviewData: InterviewRecordInsert = {
      user_id: user.id,
      job_position_id: body.jobPositionId || null,
      company_name: body.companyName,
      position_title: body.positionTitle,
      interview_date: body.interviewDate,
      interview_type: body.interviewType,
      interviewer_name: body.interviewerName || null,
      questions_asked: body.questionsAsked || null,
      user_answers: body.userAnswers || null,
      feedback_received: body.feedbackReceived || null,
      user_notes: body.userNotes || null,
      result: body.result || 'pending',
      next_steps: body.nextSteps || null,
      overall_rating: body.overallRating || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newInterview, error } = await supabase
      .from('interview_records')
      .insert(interviewData)
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
      data: newInterview,
      error: null,
      message: '面试记录创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建面试记录失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * PUT /api/interviews
 * 批量更新面试记录状态
 */
export async function PUT(request: NextRequest): Promise<NextResponse<InterviewApiResponse<null>>> {
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
    const { interviewIds, updates } = body;
    
    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '面试记录ID列表不能为空'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('interview_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', interviewIds)
      .eq('user_id', user.id); // 确保只能更新自己的记录
      
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
      message: `成功更新 ${interviewIds.length} 条面试记录`
    });

  } catch (error) {
    console.error('批量更新面试记录失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
} 
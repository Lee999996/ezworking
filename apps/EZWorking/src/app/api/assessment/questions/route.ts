import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { 
  AssessmentQuestion, 
  AssessmentQuestionInsert, 
  AssessmentApiResponse,
  QuestionCategory 
} from '@/types/assessment';

/**
 * GET /api/assessment/questions
 * 获取测评问题列表
 * 支持查询参数: category, type, limit, offset, active
 */
export async function GET(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<Array<AssessmentQuestion>>>> {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as QuestionCategory | null;
    const questionType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const activeOnly = searchParams.get('active') !== 'false'; // 默认只返回活跃问题

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('assessment_questions')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('weight', { ascending: false })
      .order('created_at', { ascending: false });

    // 应用筛选条件
    if (category) {
      query = query.eq('category', category);
    }
    
    if (questionType) {
      query = query.eq('question_type', questionType);
    }
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data: questions, error } = await query;
      
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
      data: questions || [],
      error: null,
      message: `成功获取 ${questions?.length || 0} 个测评问题`
    });

  } catch (error) {
    console.error('获取测评问题失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * POST /api/assessment/questions
 * 创建新的测评问题（管理员功能，预留接口）
 */
export async function POST(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<AssessmentQuestion>>> {
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
    // 这里暂时留白，等待权限系统实现
    
    const body = await request.json();
    
    // 验证必填字段
    if (!body.category || !body.questionText || !body.questionType) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '问题类别、问题文本和问题类型为必填字段'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // 准备插入数据
    const questionData: AssessmentQuestionInsert = {
      category: body.category,
      question_text: body.questionText,
      question_type: body.questionType,
      options: body.options || null,
      weight: body.weight || 1,
      is_active: body.isActive !== false, // 默认为 true
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newQuestion, error } = await supabase
      .from('assessment_questions')
      .insert(questionData)
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
      data: newQuestion,
      error: null,
      message: '测评问题创建成功'
    }, { status: 201 });

  } catch (error) {
    console.error('创建测评问题失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * PUT /api/assessment/questions
 * 批量更新测评问题状态（管理员功能，预留接口）
 */
export async function PUT(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<null>>> {
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
    const { questionIds, updates } = body;
    
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '问题ID列表不能为空'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    const { error } = await supabase
      .from('assessment_questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('id', questionIds);
      
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
      message: `成功更新 ${questionIds.length} 个问题`
    });

  } catch (error) {
    console.error('批量更新测评问题失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentUser, handleSupabaseError } from '@/lib/db/supabase';
import type { 
  AssessmentResult, 
  AssessmentResultInsert,
  AssessmentApiResponse,
  UserAnswer 
} from '@/types/assessment';

/**
 * GET /api/assessment/results
 * 获取当前用户的测评结果
 * 支持查询参数: questionId, limit, offset
 */
export async function GET(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<Array<AssessmentResult>>>> {
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
    const questionId = searchParams.get('questionId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('assessment_results')
      .select(`
        *,
        assessment_questions!inner(
          category,
          question_text,
          question_type,
          options
        )
      `)
      .eq('user_id', user.id)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (questionId) {
      query = query.eq('question_id', questionId);
    }

    const { data: results, error } = await query;
      
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
      data: results || [],
      error: null,
      message: `成功获取 ${results?.length || 0} 个测评结果`
    });

  } catch (error) {
    console.error('获取测评结果失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * POST /api/assessment/results
 * 提交测评答案
 */
export async function POST(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<Array<AssessmentResult>>>> {
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
    const { answers } = body as { answers: Array<UserAnswer> };
    
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '答案列表不能为空'
      }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    
    // 验证问题是否存在且活跃
    const questionIds = answers.map(answer => answer.questionId);
    const { data: questions, error: questionError } = await supabase
      .from('assessment_questions')
      .select('id, category, weight')
      .in('id', questionIds)
      .eq('is_active', true);
      
    if (questionError) {
      const errorResult = handleSupabaseError(questionError);
      return NextResponse.json({
        success: false,
        data: null,
        error: errorResult.code,
        message: errorResult.message
      }, { status: 500 });
    }

    if (!questions || questions.length !== questionIds.length) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'VALIDATION_ERROR',
        message: '存在无效的问题ID'
      }, { status: 400 });
    }

    // 准备插入数据
    const resultData: Array<AssessmentResultInsert> = answers.map(answer => ({
      user_id: user.id,
      question_id: answer.questionId,
      answer: answer.answer,
      score: calculateAnswerScore(answer, questions.find(q => q.id === answer.questionId)),
      created_at: new Date().toISOString()
    }));

    // 检查是否已存在答案，如果存在则更新，否则插入
    const { data: existingResults } = await supabase
      .from('assessment_results')
      .select('question_id')
      .eq('user_id', user.id)
      .in('question_id', questionIds);

    const existingQuestionIds = existingResults?.map(r => r.question_id) || [];
    const newAnswers = resultData.filter(data => !existingQuestionIds.includes(data.question_id));
    const updateAnswers = resultData.filter(data => existingQuestionIds.includes(data.question_id));

    let results: Array<AssessmentResult> = [];

    // 插入新答案
    if (newAnswers.length > 0) {
      const { data: newResults, error: insertError } = await supabase
        .from('assessment_results')
        .insert(newAnswers)
        .select();
        
      if (insertError) {
        const errorResult = handleSupabaseError(insertError);
        return NextResponse.json({
          success: false,
          data: null,
          error: errorResult.code,
          message: errorResult.message
        }, { status: 500 });
      }
      
      results.push(...(newResults || []));
    }

    // 更新现有答案
    for (const updateData of updateAnswers) {
      const { data: updatedResult, error: updateError } = await supabase
        .from('assessment_results')
        .update({
          answer: updateData.answer,
          score: updateData.score,
          created_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('question_id', updateData.question_id)
        .select()
        .single();
        
      if (updateError) {
        console.error('更新答案失败:', updateError);
        continue;
      }
      
      if (updatedResult) {
        results.push(updatedResult);
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      error: null,
      message: `成功提交 ${results.length} 个答案`
    }, { status: 201 });

  } catch (error) {
    console.error('提交测评答案失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/assessment/results
 * 清除用户的测评结果
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<AssessmentApiResponse<null>>> {
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
    const category = searchParams.get('category');
    const questionId = searchParams.get('questionId');

    const supabase = createServerSupabaseClient();
    
    let query = supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', user.id);

    if (questionId) {
      query = query.eq('question_id', questionId);
    } else if (category) {
      // 通过 category 删除需要联表查询
      const { data: questionIds } = await supabase
        .from('assessment_questions')
        .select('id')
        .eq('category', category);
        
      if (questionIds && questionIds.length > 0) {
        query = query.in('question_id', questionIds.map(q => q.id));
      }
    }

    const { error } = await query;
      
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
      message: '测评结果清除成功'
    });

  } catch (error) {
    console.error('清除测评结果失败:', error);
    return NextResponse.json({
      success: false,
      data: null,
      error: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }, { status: 500 });
  }
}

/**
 * 计算答案分数的辅助函数
 * 这里是基础实现，实际项目中可能需要更复杂的算法
 */
function calculateAnswerScore(
  answer: UserAnswer, 
  question: { weight: number; category: string } | undefined
): number | null {
  if (!question) return null;
  
  // 基础评分逻辑（暂时简化）
  let baseScore = 0;
  
  if (typeof answer.answer === 'number') {
    // 评分题，直接使用分数
    baseScore = answer.answer;
  } else if (typeof answer.answer === 'string') {
    // 选择题，根据选项映射分数（这里需要根据实际选项设计）
    baseScore = 50; // 暂时给个中等分数
  } else if (Array.isArray(answer.answer)) {
    // 多选题，根据选择数量评分
    baseScore = Math.min(answer.answer.length * 20, 100);
  }
  
  // 应用权重
  return Math.round(baseScore * question.weight);
} 
/**
 * 测评答案提交 API 路由
 * POST /api/assessment/[assessmentId]/submit - 提交测评答案
 */

import { NextRequest, NextResponse } from 'next/server'
import { AssessmentService, UserService } from '@/services'
import type { ApiResponse, SubmitAnswerRequest } from '@/types'

interface RouteParams {
  params: {
    assessmentId: string
  }
}

/**
 * 提交测评答案
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { assessmentId } = params
    const body: Omit<SubmitAnswerRequest, 'assessmentId'> = await request.json()
    
    // 验证必要字段
    if (!body.answers || !Array.isArray(body.answers)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Answers array is required',
      }, { status: 400 })
    }

    const submitRequest: SubmitAnswerRequest = {
      assessmentId,
      answers: body.answers,
    }

    const result = await AssessmentService.submitAnswers(submitRequest)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to submit answers',
      }, { status: 400 })
    }

    // 如果测评完成，记录用户操作
    if (result.data?.status === 'completed') {
      await UserService.logUserAction(
        result.data.userId, 
        'assessment_complete', 
        assessmentId,
        { type: result.data.type }
      )
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: result.data?.status === 'completed' ? '测评完成' : '答案提交成功',
    })

  } catch (error) {
    console.error('POST /api/assessment/[assessmentId]/submit error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
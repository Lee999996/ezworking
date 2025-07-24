/**
 * 测评结果 API 路由
 * GET /api/assessment/[assessmentId]/results - 获取测评结果
 */

import { NextRequest, NextResponse } from 'next/server'
import { AssessmentService } from '@/services'
import type { ApiResponse } from '@/types'

interface RouteParams {
  params: {
    assessmentId: string
  }
}

/**
 * 获取测评结果
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { assessmentId } = params

    const result = await AssessmentService.getAssessmentResults(assessmentId)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get assessment results',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/assessment/[assessmentId]/results error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
/**
 * 测评系统 API 路由
 * GET /api/assessment - 获取用户测评列表
 * POST /api/assessment - 开始新测评
 */

import { NextRequest, NextResponse } from 'next/server'
import { AssessmentService } from '@/services'
import type { ApiResponse, StartAssessmentRequest } from '@/types'

/**
 * 获取用户测评列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await AssessmentService.getUserAssessments(userId)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get assessments',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/assessment error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * 开始新测评
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartAssessmentRequest = await request.json()
    
    // 验证必要字段
    if (!body.userId || !body.templateId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID and template ID are required',
      }, { status: 400 })
    }

    const result = await AssessmentService.startAssessment(body)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to start assessment',
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: '测评开始成功',
    })

  } catch (error) {
    console.error('POST /api/assessment error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
/**
 * 面试会话 API 路由
 * GET /api/interview/session - 获取用户面试会话列表
 * POST /api/interview/session - 开始新的面试会话
 */

import { NextRequest, NextResponse } from 'next/server'
import { InterviewService } from '@/services'
import type { ApiResponse, StartInterviewSessionRequest } from '@/types'

/**
 * 获取用户面试会话列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const limit = request.nextUrl.searchParams.get('limit')
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await InterviewService.getUserInterviewSessions(
      userId,
      limit ? parseInt(limit) : undefined
    )
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get interview sessions',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/interview/session error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * 开始新的面试会话
 */
export async function POST(request: NextRequest) {
  try {
    const body: StartInterviewSessionRequest = await request.json()
    
    if (!body.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await InterviewService.startInterviewSession(body)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to start interview session',
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: '面试会话开始成功',
    })

  } catch (error) {
    console.error('POST /api/interview/session error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
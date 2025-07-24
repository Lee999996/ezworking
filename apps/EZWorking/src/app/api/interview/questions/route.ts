/**
 * 面试题库 API 路由
 * GET /api/interview/questions - 获取面试题目
 */

import { NextRequest, NextResponse } from 'next/server'
import { InterviewService } from '@/services'
import type { ApiResponse, InterviewCategory } from '@/types'

/**
 * 获取面试题目
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category') as InterviewCategory | undefined
    const difficulty = searchParams.get('difficulty') as 'easy' | 'medium' | 'hard' | undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20

    const result = await InterviewService.getInterviewQuestions(category, difficulty, limit)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get interview questions',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/interview/questions error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
/**
 * 用户分析数据 API 路由
 * GET /api/user/analytics - 获取用户分析数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'
import type { ApiResponse } from '@/types'

/**
 * 获取用户分析数据
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

    const result = await UserService.getUserAnalytics(userId)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get user analytics',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/user/analytics error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
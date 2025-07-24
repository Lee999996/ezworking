/**
 * 用户档案 API 路由
 * GET /api/user/profile - 获取用户档案
 * PUT /api/user/profile - 更新用户档案
 */

import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services'
import type { ApiResponse, UpdateUserProfileRequest } from '@/types'

/**
 * 获取用户档案
 */
export async function GET(request: NextRequest) {
  try {
    // 从请求头或查询参数获取用户ID（实际应用中应从JWT token获取）
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await UserService.getCompleteProfile(userId)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get user profile',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/user/profile error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * 更新用户档案
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const body: UpdateUserProfileRequest = await request.json()
    
    // 验证必要字段
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid request body',
      }, { status: 400 })
    }

    const result = await UserService.upsertUserProfile(userId, body)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to update user profile',
      }, { status: 400 })
    }

    // 记录用户操作
    await UserService.logUserAction(userId, 'profile_update', result.data?.id, {
      updatedFields: Object.keys(body),
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: '用户档案更新成功',
    })

  } catch (error) {
    console.error('PUT /api/user/profile error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
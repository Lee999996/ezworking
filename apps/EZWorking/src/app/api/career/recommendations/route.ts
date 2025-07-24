/**
 * 岗位推荐 API 路由
 * GET /api/career/recommendations - 获取岗位推荐
 * POST /api/career/recommendations - 生成新的推荐
 */

import { NextRequest, NextResponse } from 'next/server'
import { CareerService } from '@/services'
import type { ApiResponse, GenerateRecommendationsRequest } from '@/types'

/**
 * 获取用户的岗位推荐
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const status = request.nextUrl.searchParams.get('status') as any
    const limit = request.nextUrl.searchParams.get('limit')
    
    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await CareerService.getUserRecommendations(
      userId,
      status,
      limit ? parseInt(limit) : undefined
    )
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to get recommendations',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/career/recommendations error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * 生成新的岗位推荐
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateRecommendationsRequest = await request.json()
    
    if (!body.userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 })
    }

    const result = await CareerService.generateRecommendations(body)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to generate recommendations',
      }, { status: 400 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: '岗位推荐生成成功',
    })

  } catch (error) {
    console.error('POST /api/career/recommendations error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
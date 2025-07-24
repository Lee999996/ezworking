/**
 * 岗位搜索 API 路由
 * GET /api/career/search - 搜索岗位信息
 */

import { NextRequest, NextResponse } from 'next/server'
import { CareerService } from '@/services'
import type { ApiResponse, JobSearchRequest } from '@/types'

/**
 * 搜索岗位信息
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    const searchRequest: JobSearchRequest = {
      keywords: searchParams.get('keywords') || undefined,
      location: searchParams.get('location') || undefined,
      salary_min: searchParams.get('salary_min') ? parseInt(searchParams.get('salary_min')!) : undefined,
      salary_max: searchParams.get('salary_max') ? parseInt(searchParams.get('salary_max')!) : undefined,
      experience_level: searchParams.get('experience_level') as any,
      employment_type: searchParams.get('employment_type') as any,
      company_size: searchParams.get('company_size') as any,
      skills: searchParams.get('skills')?.split(','),
      remote_only: searchParams.get('remote_only') === 'true',
      posted_within_days: searchParams.get('posted_within_days') ? parseInt(searchParams.get('posted_within_days')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    }

    const result = await CareerService.searchJobs(searchRequest)
    
    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Failed to search jobs',
      }, { status: 404 })
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
    })

  } catch (error) {
    console.error('GET /api/career/search error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CareerService } from '@/services/career'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const recommendation = await CareerService.getCareerRecommendation(session.user.id)
    
    if (!recommendation) {
      return NextResponse.json({ error: '职业推荐不存在' }, { status: 404 })
    }

    return NextResponse.json({ data: recommendation })
  } catch (error) {
    console.error('Error in GET /api/career:', error)
    return NextResponse.json(
      { error: '获取职业推荐失败' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const body = await request.json()
    
    const recommendation = await CareerService.createCareerRecommendation({
      ...body,
      user_id: session.user.id,
    })
    
    if (!recommendation) {
      return NextResponse.json({ error: '创建职业推荐失败' }, { status: 500 })
    }

    return NextResponse.json({ data: recommendation }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/career:', error)
    return NextResponse.json(
      { error: '创建职业推荐失败' }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const body = await request.json()

    const recommendation = await CareerService.updateCareerRecommendation(session.user.id, body)
    
    if (!recommendation) {
      return NextResponse.json({ error: '更新职业推荐失败' }, { status: 500 })
    }

    return NextResponse.json({ data: recommendation })
  } catch (error) {
    console.error('Error in PUT /api/career:', error)
    return NextResponse.json(
      { error: '更新职业推荐失败' }, 
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    await CareerService.deleteCareerRecommendation(session.user.id)
    
    return NextResponse.json({ message: '职业推荐删除成功' })
  } catch (error) {
    console.error('Error in DELETE /api/career:', error)
    return NextResponse.json(
      { error: '删除职业推荐失败' }, 
      { status: 500 }
    )
  }
} 
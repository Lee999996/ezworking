import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/user'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: '未认证' }, { status: 401 })

    const profile = await UserService.getProfile(session.user.id)
    if (!profile) return NextResponse.json({ error: '用户档案不存在' }, { status: 404 })

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error)
    return NextResponse.json({ error: '获取用户档案失败' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: '未认证' }, { status: 401 })

    const body = await request.json()
    const profile = await UserService.createProfile({ ...body, id: session.user.id })
    
    return NextResponse.json({ data: profile }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/user/profile:', error)
    return NextResponse.json({ error: '创建用户档案失败' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: '未认证' }, { status: 401 })

    const body = await request.json()
    const profile = await UserService.updateProfile(session.user.id, body)
    
    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error('Error in PUT /api/user/profile:', error)
    return NextResponse.json({ error: '更新用户档案失败' }, { status: 500 })
  }
}

export async function DELETE() {
  const supabase = createRouteHandlerClient({ cookies })
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: '未认证' }, { status: 401 })

    await UserService.deleteUser(session.user.id)
    
    return NextResponse.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('Error in DELETE /api/user/profile:', error)
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
} 
/**
 * Database Connection Test Utility
 * 用于测试数据库连接和表是否存在
 */

import { supabase } from '@/lib/db/supabase'

export async function testDatabaseConnection(): Promise<{
  success: boolean
  error?: string
  details?: any
}> {
  try {
    console.log('Testing database connection...')
    
    // Test 1: Basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('chat_sessions')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('Database connection error:', connectionError)
      
      if (connectionError.code === '42P01') {
        return {
          success: false,
          error: '数据库表 chat_sessions 不存在，请先运行数据库迁移脚本',
          details: connectionError
        }
      } else if (connectionError.message.includes('JWT')) {
        return {
          success: false,
          error: '数据库认证失败，请检查 Supabase 配置',
          details: connectionError
        }
      } else {
        return {
          success: false,
          error: `数据库连接失败: ${connectionError.message}`,
          details: connectionError
        }
      }
    }
    
    console.log('Database connection successful')
    
    // Test 2: Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      return {
        success: false,
        error: `用户认证检查失败: ${authError.message}`,
        details: authError
      }
    }
    
    if (!user) {
      return {
        success: false,
        error: '用户未登录，无法创建会话',
        details: { user: null }
      }
    }
    
    console.log('User authentication successful:', user.id)
    
    return {
      success: true,
      details: {
        userId: user.id,
        email: user.email,
        connectionTest: connectionTest
      }
    }
    
  } catch (error) {
    console.error('Database test failed:', error)
    return {
      success: false,
      error: `数据库测试失败: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    }
  }
}

export async function testCreateSession(userId: string, title: string = '测试会话'): Promise<{
  success: boolean
  sessionId?: string
  error?: string
  details?: any
}> {
  try {
    console.log('Testing session creation...', { userId, title })
    
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: title
      })
      .select()
      .single()
    
    if (error) {
      console.error('Session creation test failed:', error)
      return {
        success: false,
        error: `会话创建测试失败: ${error.message}`,
        details: error
      }
    }
    
    if (!data) {
      return {
        success: false,
        error: '会话创建成功但未返回数据'
      }
    }
    
    console.log('Session creation test successful:', data)
    
    return {
      success: true,
      sessionId: data.id,
      details: data
    }
    
  } catch (error) {
    console.error('Session creation test error:', error)
    return {
      success: false,
      error: `会话创建测试异常: ${error instanceof Error ? error.message : '未知错误'}`,
      details: error
    }
  }
}
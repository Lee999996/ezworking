import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * 客户端 Supabase 实例 - 用于客户端组件
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 服务端 Supabase 实例 - 用于服务端组件和 API 路由
 */
export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
};

/**
 * 获取当前认证用户
 */
export const getCurrentUser = async () => {
  const supabase = createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
  
  return user;
};

/**
 * 错误处理工具函数
 */
export const handleSupabaseError = (error: any) => {
  console.error('Supabase 错误:', error);
  
  if (error?.code === 'PGRST301') {
    return { message: '记录未找到', code: 'NOT_FOUND' };
  }
  
  if (error?.code === '23505') {
    return { message: '数据已存在', code: 'DUPLICATE' };
  }
  
  return { 
    message: error?.message || '操作失败', 
    code: error?.code || 'UNKNOWN' 
  };
}; 
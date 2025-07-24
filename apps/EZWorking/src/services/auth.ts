import { supabase } from '@/lib/supabase'
import { AuthParams, User } from '@saas-ui/auth'

export const authService = {
  onLogin: async (params: AuthParams) => {
    const { email, password } = params
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email!,
      password: password!,
    })
    if (error) {
      throw error
    }
    return data.user as User
  },
  onSignup: async (params: AuthParams) => {
    const { email, password, name } = params
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })
    if (error) {
      throw error
    }
    return data.user as User
  },
  onLogout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  },
  onLoadUser: async () => {
    const { data } = await supabase.auth.getUser()
    return data.user
  },
  onGetToken: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || null
  },
} 
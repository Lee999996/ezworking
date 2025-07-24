import { createServerSupabaseClient } from '@/lib/db/supabase';
import type { 
  UserProfile, 
  UserProfileInsert, 
  UserProfileUpdate,
  CompleteUserProfile,
  UserStats 
} from '@/types/user';

/**
 * 用户服务类
 * 处理用户画像相关的业务逻辑
 */
export class UserService {
  private supabase = createServerSupabaseClient();

  /**
   * 根据用户ID获取用户画像
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('获取用户画像失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 创建用户画像
   */
  async createUserProfile(profileData: UserProfileInsert): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      console.error('创建用户画像失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 更新用户画像
   */
  async updateUserProfile(userId: string, updates: UserProfileUpdate): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新用户画像失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 删除用户画像
   */
  async deleteUserProfile(userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('删除用户画像失败:', error);
      return false;
    }

    return true;
  }

  /**
   * 计算用户画像完整度
   */
  calculateProfileCompleteness(profile: UserProfile): number {
    const fields = [
      'email', 'full_name', 'age', 'gender', 'location', 
      'education_level', 'major', 'work_experience_years',
      'phone', 'bio', 'linkedin_url', 'preferred_job_type',
      'skills', 'interests'
    ];

    const completedFields = fields.filter(field => {
      const value = profile[field as keyof UserProfile];
      return value !== null && value !== undefined && 
             (Array.isArray(value) ? value.length > 0 : String(value).trim() !== '');
    });

    return Math.round((completedFields.length / fields.length) * 100);
  }

  /**
   * 获取完整的用户画像（包含计算字段）
   */
  async getCompleteUserProfile(userId: string): Promise<CompleteUserProfile | null> {
    const profile = await this.getUserProfile(userId);
    
    if (!profile) {
      return null;
    }

    // TODO: 这里可以添加更多的计算逻辑，比如从其他表获取相关数据
    const completeness = this.calculateProfileCompleteness(profile);

    // 将数据库字段映射到业务对象
    const completeProfile: CompleteUserProfile = {
      basicInfo: {
        email: profile.email,
        fullName: profile.full_name,
        age: profile.age,
        gender: profile.gender,
        location: profile.location,
        phone: profile.phone,
        avatarUrl: profile.avatar_url,
        bio: profile.bio
      },
      education: {
        educationLevel: profile.education_level,
        major: profile.major,
        graduationYear: null, // TODO: 添加到数据库字段
        institution: null, // TODO: 添加到数据库字段
        gpa: null // TODO: 添加到数据库字段
      },
      workExperiences: [], // TODO: 从单独的工作经历表获取
      projectExperiences: [], // TODO: 从单独的项目经历表获取
      jobPreferences: {
        preferredJobType: profile.preferred_job_type,
        preferredSalaryMin: profile.preferred_salary_min,
        preferredSalaryMax: profile.preferred_salary_max,
        preferredLocations: profile.preferred_locations || [],
        remoteWorkPreference: 'no_preference', // TODO: 添加到数据库
        willingToRelocate: false, // TODO: 添加到数据库
        availableStartDate: null, // TODO: 添加到数据库
        targetIndustries: [], // TODO: 添加到数据库
        targetCompanySize: null // TODO: 添加到数据库
      },
      skills: [], // TODO: 从技能评估结果计算
      interests: (profile.interests || []).map(interest => ({
        name: interest,
        category: 'personal',
        description: null
      })),
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url,
      resumeUrl: null, // TODO: 添加到数据库
      profileCompleteness: completeness,
      lastUpdated: profile.updated_at
    };

    return completeProfile;
  }

  /**
   * 搜索用户（管理员功能）
   */
  async searchUsers(params: {
    email?: string;
    location?: string;
    skills?: Array<string>;
    limit?: number;
    offset?: number;
  }): Promise<Array<UserProfile>> {
    let query = this.supabase
      .from('user_profiles')
      .select('*')
      .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1)
      .order('created_at', { ascending: false });

    if (params.email) {
      query = query.ilike('email', `%${params.email}%`);
    }

    if (params.location) {
      query = query.ilike('location', `%${params.location}%`);
    }

    if (params.skills && params.skills.length > 0) {
      query = query.overlaps('skills', params.skills);
    }

    const { data, error } = await query;

    if (error) {
      console.error('搜索用户失败:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取用户统计信息（管理员功能）
   */
  async getUserStats(): Promise<UserStats> {
    // 获取用户总数
    const { count: totalUsers } = await this.supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // TODO: 实现更复杂的统计查询
    // 这里是基础实现，实际项目中需要更详细的统计逻辑

    return {
      totalUsers: totalUsers || 0,
      activeUsers: Math.round((totalUsers || 0) * 0.7), // 模拟数据
      profileCompletionRate: 65, // 模拟数据
      assessmentCompletionRate: 45, // 模拟数据
      averageExperienceYears: 3.2, // 模拟数据
      topSkills: [
        { skill: 'JavaScript', count: 120 },
        { skill: 'Python', count: 95 },
        { skill: 'React', count: 88 },
        { skill: 'Node.js', count: 76 },
        { skill: 'TypeScript', count: 65 }
      ],
      locationDistribution: [
        { location: '北京', count: 150 },
        { location: '上海', count: 120 },
        { location: '深圳', count: 90 },
        { location: '杭州', count: 60 },
        { location: '广州', count: 45 }
      ]
    };
  }

  /**
   * 验证邮箱是否已存在
   */
  async isEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    let query = this.supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email);

    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('验证邮箱失败:', error);
      return false;
    }

    return (data && data.length > 0);
  }

  /**
   * 批量更新用户状态（管理员功能）
   */
  async batchUpdateUsers(userIds: Array<string>, updates: Partial<UserProfileUpdate>): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .in('user_id', userIds);

    if (error) {
      console.error('批量更新用户失败:', error);
      return false;
    }

    return true;
  }
}

// 导出单例实例
export const userService = new UserService(); 
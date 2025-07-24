import { createServerSupabaseClient } from '@/lib/db/supabase';
import type { 
  AssessmentQuestion,
  AssessmentResult,
  CareerAssessment,
  AssessmentProgress,
  CompleteCareerAssessment
} from '@/types/assessment';

/**
 * 测评服务类
 * 处理测评系统相关的业务逻辑
 */
export class AssessmentService {
  private supabase = createServerSupabaseClient();

  /**
   * 获取指定类别的测评问题
   */
  async getQuestionsByCategory(category: string, limit: number = 20): Promise<Array<AssessmentQuestion>> {
    const { data, error } = await this.supabase
      .from('assessment_questions')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('weight', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取测评问题失败:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 获取用户的测评进度
   */
  async getAssessmentProgress(userId: string): Promise<AssessmentProgress | null> {
    // 获取所有活跃问题
    const { data: questions } = await this.supabase
      .from('assessment_questions')
      .select('id, category')
      .eq('is_active', true);

    if (!questions) return null;

    // 获取用户已回答的问题
    const { data: answers } = await this.supabase
      .from('assessment_results')
      .select('question_id')
      .eq('user_id', userId);

    const answeredQuestionIds = answers?.map(a => a.question_id) || [];
    
    // 按类别统计进度
    const categoryProgress: Record<string, { total: number; completed: number; percentage: number }> = {};
    questions.forEach(q => {
      if (!categoryProgress[q.category]) {
        categoryProgress[q.category] = { total: 0, completed: 0, percentage: 0 };
      }
      categoryProgress[q.category].total++;
      if (answeredQuestionIds.includes(q.id)) {
        categoryProgress[q.category].completed++;
      }
    });

    // 计算百分比
    Object.keys(categoryProgress).forEach(category => {
      const progress = categoryProgress[category];
      progress.percentage = Math.round((progress.completed / progress.total) * 100);
    });

    const totalQuestions = questions.length;
    const answeredQuestions = answeredQuestionIds.length;
    const completionPercentage = Math.round((answeredQuestions / totalQuestions) * 100);

    return {
      userId,
      totalQuestions,
      answeredQuestions,
      completionPercentage,
      estimatedTimeRemaining: Math.max(0, (totalQuestions - answeredQuestions) * 2), // 假设每题2分钟
      categoryProgress: categoryProgress as any,
      lastSavedAt: new Date().toISOString()
    };
  }

  /**
   * 获取用户的职业定位评估结果
   */
  async getCareerAssessment(userId: string): Promise<CareerAssessment | null> {
    const { data, error } = await this.supabase
      .from('career_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('获取职业定位评估失败:', error);
      return null;
    }

    return data;
  }

  /**
   * 验证是否可以生成职业定位评估
   */
  async canGenerateCareerAssessment(userId: string): Promise<{ canGenerate: boolean; reason?: string }> {
    // 检查用户是否已完成足够的测评问题
    const progress = await this.getAssessmentProgress(userId);
    
    if (!progress) {
      return { canGenerate: false, reason: '无法获取测评进度' };
    }

    // 至少需要完成60%的问题
    if (progress.completionPercentage < 60) {
      return { 
        canGenerate: false, 
        reason: `测评完成度不足，当前为 ${progress.completionPercentage}%，需要至少60%` 
      };
    }

    // 检查每个类别是否都有回答
    const requiredCategories = ['personality', 'skills', 'interests', 'values'];
    const missingCategories = requiredCategories.filter(category => {
      const categoryProgress = progress.categoryProgress[category];
      return !categoryProgress || categoryProgress.completed === 0;
    });

    if (missingCategories.length > 0) {
      return {
        canGenerate: false,
        reason: `缺少以下类别的测评结果：${missingCategories.join(', ')}`
      };
    }

    return { canGenerate: true };
  }

  /**
   * 保存用户测评答案
   */
  async saveAssessmentAnswers(userId: string, answers: Array<{
    questionId: string;
    answer: any;
    timeSpent?: number;
  }>): Promise<boolean> {
    try {
      // 获取问题信息用于计算分数
      const questionIds = answers.map(a => a.questionId);
      const { data: questions } = await this.supabase
        .from('assessment_questions')
        .select('id, category, weight')
        .in('id', questionIds);

      if (!questions) return false;

      // 准备数据
      const resultData = answers.map(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        return {
          user_id: userId,
          question_id: answer.questionId,
          answer: answer.answer,
          score: this.calculateAnswerScore(answer.answer, question),
          created_at: new Date().toISOString()
        };
      });

      // 使用 upsert 来处理重复答案
      const { error } = await this.supabase
        .from('assessment_results')
        .upsert(resultData, { 
          onConflict: 'user_id,question_id' 
        });

      if (error) {
        console.error('保存测评答案失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('保存测评答案异常:', error);
      return false;
    }
  }

  /**
   * 获取推荐的测评问题
   */
  async getRecommendedQuestions(userId: string, count: number = 5): Promise<Array<AssessmentQuestion>> {
    // 获取用户已回答的问题ID
    const { data: answeredResults } = await this.supabase
      .from('assessment_results')
      .select('question_id')
      .eq('user_id', userId);

    const answeredQuestionIds = answeredResults?.map(r => r.question_id) || [];

    // 获取未回答的问题，优先选择权重高的
    let query = this.supabase
      .from('assessment_questions')
      .select('*')
      .eq('is_active', true)
      .order('weight', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(count);

    if (answeredQuestionIds.length > 0) {
      query = query.not('id', 'in', `(${answeredQuestionIds.join(',')})`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('获取推荐问题失败:', error);
      return [];
    }

    return data || [];
  }

  /**
   * 删除用户的测评结果
   */
  async clearAssessmentResults(userId: string, category?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('assessment_results')
        .delete()
        .eq('user_id', userId);

      if (category) {
        // 通过联表删除指定类别的结果
        const { data: questionIds } = await this.supabase
          .from('assessment_questions')
          .select('id')
          .eq('category', category);

        if (questionIds && questionIds.length > 0) {
          query = query.in('question_id', questionIds.map(q => q.id));
        }
      }

      const { error } = await query;

      if (error) {
        console.error('清除测评结果失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('清除测评结果异常:', error);
      return false;
    }
  }

  /**
   * 计算答案分数的辅助方法
   */
  private calculateAnswerScore(answer: any, question?: { weight: number; category: string }): number | null {
    if (!question) return null;

    let baseScore = 0;

    if (typeof answer === 'number') {
      baseScore = answer;
    } else if (typeof answer === 'string') {
      // 简单的选择题评分逻辑
      baseScore = 50; 
    } else if (Array.isArray(answer)) {
      baseScore = Math.min(answer.length * 20, 100);
    }

    return Math.round(baseScore * question.weight);
  }

  /**
   * 获取测评统计信息
   */
  async getAssessmentStats(): Promise<{
    totalQuestions: number;
    totalUsers: number;
    averageCompletionRate: number;
    categoryStats: Record<string, number>;
  }> {
    // 获取问题总数
    const { count: totalQuestions } = await this.supabase
      .from('assessment_questions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 获取参与测评的用户数
    const { data: uniqueUsers } = await this.supabase
      .from('assessment_results')
      .select('user_id')
      .neq('user_id', null);

    const totalUsers = new Set(uniqueUsers?.map(u => u.user_id)).size;

    // TODO: 实现更详细的统计逻辑

    return {
      totalQuestions: totalQuestions || 0,
      totalUsers,
      averageCompletionRate: 65, // 模拟数据
      categoryStats: {
        personality: 120,
        skills: 95,
        interests: 88,
        values: 76,
        work_style: 45
      }
    };
  }
}

// 导出单例实例
export const assessmentService = new AssessmentService(); 
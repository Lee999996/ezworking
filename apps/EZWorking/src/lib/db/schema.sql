-- EZWorking Database Schema for Supabase
-- 版本: v0.1.1 (新增认证功能)
-- 创建日期: 2024-01-XX

-- ==============================================
-- 启用必要的扩展
-- ==============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- 认证相关配置 (Supabase Auth)
-- ==============================================

-- 确保auth.users表存在（由Supabase自动创建）
-- 我们将使用auth.users作为用户认证的主表

-- 用户档案表扩展
-- 这个表与auth.users关联，存储额外的用户信息

-- ==============================================
-- 创建枚举类型
-- ==============================================

-- 就业类型
CREATE TYPE employment_type AS ENUM (
  'full_time', 'part_time', 'contract', 'internship', 'temporary'
);

-- 经验级别
CREATE TYPE experience_level AS ENUM (
  'entry', 'junior', 'mid', 'senior', 'lead', 'executive'
);

-- 技能级别
CREATE TYPE skill_level AS ENUM (
  'beginner', 'intermediate', 'advanced', 'expert'
);

-- 测评类型
CREATE TYPE assessment_type AS ENUM (
  'personality', 'career_interest', 'skill_assessment', 'career_values', 'work_style', 'aptitude'
);

-- 问题类型
CREATE TYPE question_type AS ENUM (
  'single_choice', 'multiple_choice', 'rating_scale', 'text_input', 'ranking'
);

-- 申请状态
CREATE TYPE application_status AS ENUM (
  'saved', 'draft', 'submitted', 'under_review', 'phone_screen', 
  'interview', 'final_interview', 'offer', 'accepted', 'rejected', 'withdrawn'
);

-- 学历类型
CREATE TYPE degree_type AS ENUM (
  'high_school', 'associate', 'bachelor', 'master', 'doctor'
);

-- 性别类型
CREATE TYPE gender_type AS ENUM (
  'male', 'female', 'other'
);

-- 公司规模
CREATE TYPE company_size AS ENUM (
  'startup', 'small', 'medium', 'large', 'enterprise'
);

-- ==============================================
-- 用户相关表
-- ==============================================

-- 用户档案表 (关联auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(500),
  phone VARCHAR(20),
  birth_date DATE,
  gender gender_type,
  location JSONB DEFAULT '{}',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 教育经历表
CREATE TABLE education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  school VARCHAR(200) NOT NULL,
  major VARCHAR(100) NOT NULL,
  degree degree_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  gpa DECIMAL(3,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 工作经历表
CREATE TABLE work_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  company VARCHAR(200) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  employment_type employment_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  location VARCHAR(100),
  description TEXT,
  achievements TEXT[],
  skills_used TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 技能表
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level skill_level NOT NULL,
  years_experience INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 语言能力表
CREATE TABLE languages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  proficiency VARCHAR(20) NOT NULL,
  reading_level VARCHAR(20),
  writing_level VARCHAR(20),
  speaking_level VARCHAR(20),
  certification VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 项目经历表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  role VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  technologies TEXT[],
  url VARCHAR(500),
  repository_url VARCHAR(500),
  achievements TEXT[],
  team_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 测评系统表
-- ==============================================

-- 测评模板表
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  type assessment_type NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  duration_minutes INTEGER NOT NULL,
  questions_count INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 测评问题表
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  order_num INTEGER NOT NULL,
  type question_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]',
  required BOOLEAN DEFAULT TRUE,
  validation_rules JSONB DEFAULT '{}',
  scoring_weights JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 测评会话表
CREATE TABLE assessment_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  current_question_order INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 测评答案表
CREATE TABLE assessment_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
  answer_value JSONB NOT NULL,
  answer_text TEXT,
  time_spent_seconds INTEGER DEFAULT 0,
  confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 测评结果表
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  overall_score DECIMAL(5,2),
  dimension_scores JSONB DEFAULT '{}',
  personality_traits JSONB DEFAULT '[]',
  career_suggestions JSONB DEFAULT '[]',
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  raw_data JSONB DEFAULT '{}',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 测评维度表
CREATE TABLE assessment_dimensions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  scoring_formula TEXT,
  interpretation_rules JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 职业定位表
-- ==============================================

-- 职业信息表
CREATE TABLE careers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  industry TEXT[],
  required_skills JSONB DEFAULT '[]',
  salary_range JSONB DEFAULT '{}',
  education_requirements TEXT[],
  career_path JSONB DEFAULT '[]',
  growth_outlook JSONB DEFAULT '{}',
  work_environment JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户职业偏好表
CREATE TABLE career_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  preferred_industries TEXT[],
  preferred_roles TEXT[],
  work_environment_preferences JSONB DEFAULT '{}',
  salary_expectations JSONB DEFAULT '{}',
  location_preferences JSONB DEFAULT '[]',
  career_values JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 职业匹配分析表
CREATE TABLE career_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  overall_match_score DECIMAL(5,2) NOT NULL,
  skill_match_score DECIMAL(5,2),
  interest_match_score DECIMAL(5,2),
  value_match_score DECIMAL(5,2),
  experience_match_score DECIMAL(5,2),
  match_details JSONB DEFAULT '{}',
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 职业推荐表
CREATE TABLE career_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(20) NOT NULL,
  careers JSONB DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  feedback JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 职业发展路径表
CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  current_position VARCHAR(200),
  timeline_months INTEGER NOT NULL,
  milestones JSONB DEFAULT '[]',
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 技能差距分析表
CREATE TABLE skill_gap_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  target_career_id UUID NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  skill_gaps JSONB DEFAULT '[]',
  overall_readiness_score DECIMAL(5,2),
  estimated_time_to_ready_months INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 岗位信息表
-- ==============================================

-- 公司信息表
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  industry TEXT[],
  size company_size,
  founded_year INTEGER,
  headquarters JSONB DEFAULT '{}',
  locations JSONB DEFAULT '[]',
  website VARCHAR(500),
  logo_url VARCHAR(500),
  culture_values TEXT[],
  employee_benefits TEXT[],
  rating JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位信息表
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  department VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT[],
  responsibilities TEXT[],
  employment_type employment_type NOT NULL,
  experience_level experience_level NOT NULL,
  salary_range JSONB DEFAULT '{}',
  location JSONB NOT NULL,
  skills_required JSONB DEFAULT '[]',
  benefits TEXT[],
  application_deadline DATE,
  start_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  posted_date DATE NOT NULL,
  source VARCHAR(50) NOT NULL,
  external_url VARCHAR(500),
  application_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位申请表
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status application_status DEFAULT 'saved',
  applied_date DATE,
  last_update_date DATE NOT NULL,
  application_method VARCHAR(20) NOT NULL,
  cover_letter TEXT,
  resume_version VARCHAR(100),
  notes TEXT,
  recruiter_contact JSONB DEFAULT '{}',
  interview_history JSONB DEFAULT '[]',
  salary_negotiation JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位匹配分析表
CREATE TABLE job_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  overall_match_score DECIMAL(5,2) NOT NULL,
  skill_match_score DECIMAL(5,2),
  experience_match_score DECIMAL(5,2),
  location_match_score DECIMAL(5,2),
  salary_match_score DECIMAL(5,2),
  company_culture_match_score DECIMAL(5,2),
  match_breakdown JSONB DEFAULT '{}',
  recommendation VARCHAR(50),
  confidence_level DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位筛选器表
CREATE TABLE job_filters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  search_params JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  notification_enabled BOOLEAN DEFAULT FALSE,
  last_run_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 岗位推荐设置表
CREATE TABLE job_recommendation_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  notification_frequency VARCHAR(20) DEFAULT 'weekly',
  notification_enabled BOOLEAN DEFAULT TRUE,
  preferred_job_types employment_type[],
  preferred_experience_levels experience_level[],
  location_preferences JSONB DEFAULT '[]',
  remote_work_preference VARCHAR(20) DEFAULT 'acceptable',
  salary_expectations JSONB DEFAULT '{}',
  industry_preferences TEXT[],
  company_size_preferences company_size[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 索引创建
-- ==============================================

-- 用户相关索引
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_work_experience_user_id ON work_experience(user_id);
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_name_trgm ON skills USING gin(name gin_trgm_ops);
CREATE INDEX idx_languages_user_id ON languages(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- 测评系统索引
CREATE INDEX idx_assessment_questions_template_id ON assessment_questions(template_id);
CREATE INDEX idx_assessment_questions_order ON assessment_questions(template_id, order_num);
CREATE INDEX idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX idx_assessment_sessions_template_id ON assessment_sessions(template_id);
CREATE INDEX idx_assessment_answers_session_id ON assessment_answers(session_id);
CREATE INDEX idx_assessment_results_user_id ON assessment_results(user_id);

-- 职业定位索引
CREATE INDEX idx_career_preferences_user_id ON career_preferences(user_id);
CREATE INDEX idx_career_matches_user_id ON career_matches(user_id);
CREATE INDEX idx_career_matches_career_id ON career_matches(career_id);
CREATE INDEX idx_career_recommendations_user_id ON career_recommendations(user_id);
CREATE INDEX idx_career_paths_user_id ON career_paths(user_id);
CREATE INDEX idx_skill_gap_analyses_user_id ON skill_gap_analyses(user_id);

-- 岗位信息索引
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date);
CREATE INDEX idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_matches_user_id ON job_matches(user_id);
CREATE INDEX idx_job_matches_job_id ON job_matches(job_id);
CREATE INDEX idx_job_filters_user_id ON job_filters(user_id);

-- ==============================================
-- 触发器函数：自动更新 updated_at
-- ==============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表添加更新时间触发器
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_education_updated_at BEFORE UPDATE ON education FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_experience_updated_at BEFORE UPDATE ON work_experience FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_updated_at BEFORE UPDATE ON skills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON languages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_templates_updated_at BEFORE UPDATE ON assessment_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_questions_updated_at BEFORE UPDATE ON assessment_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_sessions_updated_at BEFORE UPDATE ON assessment_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_answers_updated_at BEFORE UPDATE ON assessment_answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_results_updated_at BEFORE UPDATE ON assessment_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_dimensions_updated_at BEFORE UPDATE ON assessment_dimensions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON careers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_preferences_updated_at BEFORE UPDATE ON career_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_matches_updated_at BEFORE UPDATE ON career_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_recommendations_updated_at BEFORE UPDATE ON career_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_paths_updated_at BEFORE UPDATE ON career_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_gap_analyses_updated_at BEFORE UPDATE ON skill_gap_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_matches_updated_at BEFORE UPDATE ON job_matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_filters_updated_at BEFORE UPDATE ON job_filters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_recommendation_settings_updated_at BEFORE UPDATE ON job_recommendation_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- 行级安全策略 (RLS) 设置
-- ==============================================

-- 启用RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 用户档案RLS策略
CREATE POLICY "用户只能查看自己的档案" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户只能更新自己的档案" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户只能插入自己的档案" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "用户只能删除自己的档案" ON user_profiles
    FOR DELETE USING (auth.uid() = id);
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendation_settings ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own education" ON education FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own education" ON education FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own work experience" ON work_experience FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own work experience" ON work_experience FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own skills" ON skills FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own skills" ON skills FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own languages" ON languages FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own languages" ON languages FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (auth.uid()::text = user_id::text);

-- 公共只读表（不需要RLS策略）
-- assessment_templates, assessment_questions, assessment_dimensions, careers, companies, jobs

-- ==============================================
-- 示例数据插入
-- ==============================================

-- 插入测评模板示例
INSERT INTO assessment_templates (name, description, type, duration_minutes, questions_count) VALUES
('MBTI性格测评', '基于MBTI理论的性格类型测评', 'personality', 15, 20),
('职业兴趣测评', '霍兰德职业兴趣量表', 'career_interest', 10, 15),
('技能评估测试', '技术技能水平评估', 'skill_assessment', 20, 25);

-- 插入职业信息示例
INSERT INTO careers (name, description, category, industry, required_skills) VALUES
('软件开发工程师', '负责软件系统的设计、开发和维护', '技术开发', 
 ARRAY['互联网', '软件'], 
 '[{"skill": "JavaScript", "importance": "essential", "level": "advanced"}]'::jsonb),
('产品经理', '负责产品策划、设计和推广', '产品管理', 
 ARRAY['互联网', '科技'], 
 '[{"skill": "产品设计", "importance": "essential", "level": "advanced"}]'::jsonb);

-- 插入公司信息示例
INSERT INTO companies (name, description, industry, size) VALUES
('科技创新公司', '专注于人工智能技术的创新公司', ARRAY['人工智能', '软件'], 'medium'),
('互联网巨头', '全球领先的互联网服务提供商', ARRAY['互联网', '电子商务'], 'large');

-- ==============================================
-- 数据库函数
-- ==============================================

-- 计算职业匹配度评分
CREATE OR REPLACE FUNCTION calculate_career_match_score(
  p_user_id UUID,
  p_career_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  match_score DECIMAL(5,2) := 0;
BEGIN
  -- 这里是简化的匹配度计算逻辑
  -- 实际实现会更复杂，考虑技能匹配、经验匹配等多个维度
  match_score := 75.0 + (RANDOM() * 25.0);
  
  RETURN match_score;
END;
$$ LANGUAGE plpgsql;

-- 获取岗位推荐
CREATE OR REPLACE FUNCTION get_job_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  job_id UUID,
  job_title VARCHAR(200),
  company_name VARCHAR(200),
  match_score DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id as job_id,
    j.title as job_title,
    c.name as company_name,
    (75.0 + (RANDOM() * 25.0))::DECIMAL(5,2) as match_score
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  WHERE j.status = 'active'
  ORDER BY match_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- 结束
-- ==============================================

-- 添加注释
COMMENT ON DATABASE postgres IS 'EZWorking - AI求职助手数据库';
COMMENT ON TABLE user_profiles IS '用户档案表';
COMMENT ON TABLE assessment_templates IS '测评模板表';
COMMENT ON TABLE careers IS '职业信息表';
COMMENT ON TABLE jobs IS '岗位信息表';
COMMENT ON TABLE companies IS '公司信息表'; 
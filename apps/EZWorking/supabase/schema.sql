-- EZWorking Database Schema for Supabase
-- AI求职助手数据库结构设计
-- 遵循简洁优雅的设计原则，避免过度设计

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户基础信息表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户详细档案表
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    education_level TEXT CHECK (education_level IN ('high_school', 'bachelor', 'master', 'phd', 'other')),
    major TEXT,
    work_experience INTEGER DEFAULT 0, -- 工作经验年数
    skills TEXT[] DEFAULT '{}', -- 技能数组
    interests TEXT[] DEFAULT '{}', -- 兴趣爱好数组
    personality_traits JSONB, -- 性格特质（大五人格模型等）
    career_goals TEXT, -- 职业目标
    preferred_locations TEXT[] DEFAULT '{}', -- 期望工作地点
    salary_expectation DECIMAL(10,2), -- 期望薪资
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 测评系统表
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('personality', 'career_interest', 'skill_assessment', 'work_values', 'learning_style', 'leadership_style')),
    questions JSONB NOT NULL DEFAULT '[]', -- 问题列表
    answers JSONB DEFAULT '[]', -- 答案列表
    results JSONB, -- 测评结果
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 岗位推荐表
CREATE TABLE job_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT,
    job_description TEXT,
    required_skills TEXT[] DEFAULT '{}',
    salary_range TEXT,
    location TEXT,
    match_score DECIMAL(3,2) CHECK (match_score >= 0 AND match_score <= 1), -- 匹配度评分 0-1
    recommendation_reason TEXT,
    external_url TEXT, -- 外部岗位链接
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'saved', 'applied', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 面试记录表
CREATE TABLE interview_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
    interview_type TEXT NOT NULL CHECK (interview_type IN ('phone', 'video_call', 'in_person', 'hybrid')),
    questions JSONB DEFAULT '[]', -- 面试问题列表
    feedback TEXT, -- 面试反馈
    result TEXT CHECK (result IN ('pending', 'passed', 'rejected', 'on_hold')),
    follow_up_actions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 面试会话表（练习和模拟面试）
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('practice', 'mock_interview', 'quick_prep', 'targeted_prep')),
    job_title TEXT,
    company_name TEXT,
    questions JSONB DEFAULT '[]',
    responses JSONB DEFAULT '[]',
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    total_duration INTEGER, -- 总用时（秒）
    overall_score DECIMAL(3,2),
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 面试题库表
CREATE TABLE interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('behavioral', 'technical', 'situational', 'case_study', 'culture_fit', 'leadership', 'problem_solving', 'communication')),
    type TEXT NOT NULL CHECK (type IN ('open_ended', 'coding', 'design', 'presentation', 'role_play')),
    question TEXT NOT NULL,
    context TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    tags TEXT[] DEFAULT '{}',
    industry TEXT,
    job_level TEXT CHECK (job_level IN ('entry', 'junior', 'mid', 'senior', 'lead', 'executive')),
    sample_answers JSONB DEFAULT '[]',
    evaluation_criteria JSONB DEFAULT '[]',
    follow_up_questions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 职业路径规划表（预留）
CREATE TABLE career_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_position JSONB,
    target_position JSONB NOT NULL,
    milestones JSONB DEFAULT '[]',
    timeline INTEGER, -- 预计时间（月）
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1), -- 成功概率
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户行为分析表（预留）
CREATE TABLE user_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL CHECK (action_type IN ('profile_update', 'assessment_complete', 'job_view', 'interview_record', 'session_start', 'session_complete')),
    target_id UUID, -- 关联的资源ID
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引优化查询性能
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_type ON assessments(type);
CREATE INDEX idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX idx_job_recommendations_status ON job_recommendations(status);
CREATE INDEX idx_interview_records_user_id ON interview_records(user_id);
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_questions_category ON interview_questions(category);
CREATE INDEX idx_interview_questions_difficulty ON interview_questions(difficulty);
CREATE INDEX idx_interview_questions_is_active ON interview_questions(is_active);
CREATE INDEX idx_career_paths_user_id ON career_paths(user_id);
CREATE INDEX idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);

-- 创建updated_at自动更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_recommendations_updated_at BEFORE UPDATE ON job_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_records_updated_at BEFORE UPDATE ON interview_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_sessions_updated_at BEFORE UPDATE ON interview_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interview_questions_updated_at BEFORE UPDATE ON interview_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_career_paths_updated_at BEFORE UPDATE ON career_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS (Row Level Security) 策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的数据
CREATE POLICY "Users can only access their own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own assessments" ON assessments
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own job recommendations" ON job_recommendations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own interview records" ON interview_records
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own interview sessions" ON interview_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own career paths" ON career_paths
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own actions" ON user_actions
    FOR ALL USING (auth.uid() = user_id);

-- 面试题库对所有认证用户可见
CREATE POLICY "Authenticated users can read interview questions" ON interview_questions
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- 插入一些初始的面试题库数据
INSERT INTO interview_questions (category, type, question, difficulty, tags, job_level) VALUES
('behavioral', 'open_ended', '请介绍一下你自己', 'easy', ARRAY['自我介绍', '基础问题'], 'entry'),
('behavioral', 'open_ended', '为什么想要这份工作？', 'easy', ARRAY['动机', '基础问题'], 'entry'),
('behavioral', 'open_ended', '你的优点和缺点是什么？', 'medium', ARRAY['自我认知', '优缺点'], 'entry'),
('behavioral', 'open_ended', '请描述一次你解决困难问题的经历', 'medium', ARRAY['问题解决', '经历分享'], 'junior'),
('technical', 'open_ended', '请解释一下面向对象编程的基本概念', 'medium', ARRAY['编程基础', 'OOP'], 'junior'),
('situational', 'open_ended', '如果你和同事在工作方法上有分歧，你会如何处理？', 'medium', ARRAY['团队协作', '冲突处理'], 'junior'),
('culture_fit', 'open_ended', '你更喜欢独立工作还是团队合作？为什么？', 'easy', ARRAY['工作方式', '团队协作'], 'entry'),
('leadership', 'open_ended', '描述一次你领导团队完成项目的经历', 'hard', ARRAY['领导力', '项目管理'], 'senior');

-- 创建一些基础的测评模板数据（可选）
-- 这里可以预设一些常用的测评问题模板，便于快速开始测评 
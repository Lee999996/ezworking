import type { AssessmentTemplate, AssessmentQuestion } from '../types/assessment'

// Mock assessment templates
export const mockAssessmentTemplates: AssessmentTemplate[] = [
  {
    id: 'career-interest-template',
    name: '职业兴趣评估',
    description: '通过分析您的兴趣偏好，帮助您发现适合的职业方向',
    type: 'career_interest',
    version: '1.0',
    duration_minutes: 15,
    questions_count: 12,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'personality-template',
    name: '职业性格测试',
    description: '了解您的性格特点，匹配最适合的工作环境和职位类型',
    type: 'personality',
    version: '1.0',
    duration_minutes: 20,
    questions_count: 16,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Mock assessment questions
export const mockAssessmentQuestions: AssessmentQuestion[] = [
  // Career Interest Questions
  {
    id: 'q1',
    template_id: 'career-interest-template',
    order_num: 1,
    type: 'single_choice',
    title: '您更喜欢哪种类型的工作环境？',
    description: '请选择最符合您偏好的工作环境',
    options: {
      choices: [
        { value: 'team', label: '团队协作，与同事密切合作' },
        { value: 'independent', label: '独立工作，自主安排时间' },
        { value: 'mixed', label: '团队合作与独立工作相结合' },
        { value: 'leadership', label: '领导团队，指导他人工作' },
      ]
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'q2',
    template_id: 'career-interest-template',
    order_num: 2,
    type: 'rating_scale',
    title: '您对数据分析工作的兴趣程度？',
    description: '1表示完全不感兴趣，5表示非常感兴趣',
    options: {
      min: 1,
      max: 5,
      step: 1,
      minLabel: '完全不感兴趣',
      maxLabel: '非常感兴趣'
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'q3',
    template_id: 'career-interest-template',
    order_num: 3,
    type: 'multiple_choice',
    title: '以下哪些技能是您希望在工作中运用的？',
    description: '可以选择多个选项',
    options: {
      choices: [
        { value: 'programming', label: '编程开发' },
        { value: 'design', label: '设计创意' },
        { value: 'communication', label: '沟通协调' },
        { value: 'analysis', label: '数据分析' },
        { value: 'management', label: '项目管理' },
        { value: 'sales', label: '销售营销' },
      ]
    },
    required: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'q4',
    template_id: 'career-interest-template',
    order_num: 4,
    type: 'single_choice',
    title: '您更倾向于哪种工作节奏？',
    options: {
      choices: [
        { value: 'fast', label: '快节奏，充满挑战' },
        { value: 'steady', label: '稳定节奏，按部就班' },
        { value: 'flexible', label: '灵活节奏，根据项目调整' },
        { value: 'slow', label: '慢节奏，深度思考' },
      ]
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'q5',
    template_id: 'career-interest-template',
    order_num: 5,
    type: 'rating_scale',
    title: '您对创新和尝试新事物的兴趣程度？',
    options: {
      min: 1,
      max: 5,
      step: 1,
      minLabel: '喜欢稳定不变',
      maxLabel: '热爱创新变化'
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Personality Questions
  {
    id: 'p1',
    template_id: 'personality-template',
    order_num: 1,
    type: 'single_choice',
    title: '在团队会议中，您通常扮演什么角色？',
    options: {
      choices: [
        { value: 'leader', label: '主导讨论，提出方案' },
        { value: 'supporter', label: '支持他人，提供帮助' },
        { value: 'analyzer', label: '分析问题，提出见解' },
        { value: 'listener', label: '倾听观察，适时发言' },
      ]
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    template_id: 'personality-template',
    order_num: 2,
    type: 'rating_scale',
    title: '您在面对压力时的表现如何？',
    description: '1表示容易焦虑，5表示能够冷静应对',
    options: {
      min: 1,
      max: 5,
      step: 1,
      minLabel: '容易焦虑',
      maxLabel: '冷静应对'
    },
    required: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Helper function to get questions by template ID
export function getMockQuestionsByTemplateId(templateId: string): AssessmentQuestion[] {
  return mockAssessmentQuestions.filter(q => q.template_id === templateId)
}

// Helper function to get template by ID
export function getMockTemplateById(templateId: string): AssessmentTemplate | undefined {
  return mockAssessmentTemplates.find(t => t.id === templateId)
}
# Implementation Plan

- [ ] 1. 实现Manager Agent核心协调逻辑
  - 创建ManagerAgent类，继承CAMEL ChatAgent
  - 实现用户意图分析的AI Prompt和解析逻辑
  - 添加Agent选择和调用机制
  - 实现简单的重试和错误处理
  - _Requirements: 1.1, 1.4_

- [ ] 2. 创建专业Agent基类和具体实现
  - 实现BaseSpecializedAgent统一接口
  - 创建ConversationAgent、ProfileAgent、AssessmentAgent等具体Agent
  - 实现每个Agent的流式响应逻辑
  - 添加响应类型标识（normal/form/recommendation/evaluation）
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3. 集成流式响应和API接口
  - 实现Manager Agent的流式响应协调
  - 创建Next.js API端点集成Manager Agent
  - 实现第一条消息包含type字段的逻辑
  - 添加流式响应的错误处理和恢复
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. 测试和优化
  - 编写意图分析和Agent调用的单元测试
  - 实现端到端的流式响应测试
  - 测试错误处理和重试机制
  - 优化AI响应速度和准确性
  - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
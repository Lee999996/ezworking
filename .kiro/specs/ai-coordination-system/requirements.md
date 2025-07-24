# Requirements Document

## Introduction

简化的AI协调系统，模仿CAMEL Workforce的核心机制：一个Manager Agent智能协调几个专业Agent，支持AI驱动的任务分配和流式响应。

## Requirements

### Requirement 1

**User Story:** 作为开发者，我需要一个Manager Agent来分析用户意图并智能调度Agent或工作流。

#### Acceptance Criteria

1. WHEN 用户发送消息 THEN Manager Agent SHALL 用AI分析意图并决定调用单个Agent、多个Agent协作或固定工作流
2. WHEN 任务复杂 THEN Manager Agent SHALL 分解任务并协调多个Agent按序或并行执行
3. WHEN 需要职业定位 THEN Manager Agent SHALL 调用career-positioning固定工作流节点
4. WHEN 需要职位搜索整理 THEN Manager Agent SHALL 协调search agent和organize agent协作完成
5. WHEN Agent失败 THEN Manager Agent SHALL 重试或切换到备用策略

### Requirement 2

**User Story:** 作为用户，我需要专业的Agent和工作流节点来处理不同类型的任务。

#### Acceptance Criteria

1. WHEN 调用单个Agent THEN 它 SHALL 独立完成专业任务
2. WHEN 调用多Agent协作 THEN Manager Agent SHALL 协调它们的输入输出和执行顺序
3. WHEN 调用固定工作流节点 THEN 它 SHALL 按预定义流程执行并返回结果
4. WHEN Agent间需要数据传递 THEN Manager Agent SHALL 管理中间结果的传递
5. WHEN 并行执行多Agent THEN Manager Agent SHALL 等待所有结果后进行合并

### Requirement 3

**User Story:** 作为用户，我需要流式响应来获得实时反馈。

#### Acceptance Criteria

1. WHEN Agent生成响应 THEN 系统 SHALL 支持流式输出
2. WHEN 第一条消息 THEN 系统 SHALL 包含type字段控制前端渲染
3. WHEN 后续消息 THEN 系统 SHALL 只包含content内容
4. WHEN 响应完成 THEN 系统 SHALL 发送结束标识
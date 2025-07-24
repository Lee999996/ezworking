# Requirements Document

## Introduction

定义AI流式接口的消息格式，通过第一条消息的type字段控制前端渲染行为。

## Requirements

### Requirement 1

**User Story:** 作为开发者，我需要简单的流式消息格式来区分渲染模式。

#### Acceptance Criteria

1. WHEN AI开始流式响应 THEN 第一条消息 SHALL 包含type字段
2. WHEN type为"render" THEN 前端渲染到界面
3. WHEN type为"document"或无type THEN 前端输出到文档
4. WHEN 后续消息 THEN 不包含type字段，只有内容
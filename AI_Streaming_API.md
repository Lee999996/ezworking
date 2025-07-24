# AI流式接口文档

## 概述
AI流式接口用于实时获取AI响应，支持两种渲染模式：界面渲染和文档输出。

## HTTP流式接口

### 接口地址
```
POST /api/ai/stream
```

### 请求格式
```json
{
  "history": "{user:你好}{ai:你好}",
  "query": "请帮我分析一下数据科学家这个职业"
}
```

### 请求头
```
Content-Type: application/json
Accept: text/event-stream
```

### 响应格式 (Server-Sent Events)

#### 第一条消息（包含type字段）
```
data: {"type": "normal", "content": "开始分析数据科学家职业..."}

```

#### 后续消息（只有内容、流式）
```
data: {"content": "数据科学家需要具备..."}

```

#### 结束标识（可能有）
```
data: {"finished": true}

```

### Type类型说明

| Type | 说明 | 前端处理 |
|------|------|----------|
| `normal` | 通常模式 | 显示在普通对话区域 |
| `form` | 表单模式 | 渲染为表单组件 |
| `recommendation` | 推荐模式 | 渲染为推荐结果 |

### 状态码说明
- `200` - 成功，开始流式响应
- `400` - 请求参数错误
- `500` - 服务器内部错误
- `503` - AI服务不可用

## curl测试示例

```bash
# 测试流式接口
curl -X POST http://localhost:8000/api/ai/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"history":{},"query": "请帮我分析一下数据科学家这个职业"}' \
  --no-buffer
```

## 注意事项


3. **连接管理**：建议实现重连机制处理网络异常
4. **内容追加**：所有消息的content都需要追加到当前显示区域
5. **结束检测**：通过finished字段或WebSocket关闭事件检测流式响应结束
# AI流式接口设计文档

## Overview

简单的AI流式接口，第一条消息包含type字段控制前端渲染行为。

## 消息格式

### 后端发送格式
```python
# 第一条消息
{
    "type": "render",  # 或 "document"
    "content": "消息内容"
}

# 后续消息
{
    "content": "继续的内容"
}
```

### 前端接收处理
```typescript
interface StreamMessage {
  type?: 'render' | 'document';
  content: string;
}

// 处理逻辑
if (message.type === 'render') {
  // 渲染到界面
} else {
  // 输出到文档（默认行为）
}
```

## 接口定义

### WebSocket接口
```python
@app.websocket("/ai/stream")
async def ai_stream(websocket: WebSocket):
    # 接收查询
    query = await websocket.receive_text()
    
    # 调用AI agent流式响应
    first_chunk = True
    async for chunk in ai_agent.stream(query):
        if first_chunk:
            # 第一条消息包含type
            await websocket.send_json({
                "type": "render",  # 根据需要设置
                "content": chunk
            })
            first_chunk = False
        else:
            # 后续消息只有内容
            await websocket.send_json({
                "content": chunk
            })
```

### AI Agent修改
```python
# 在AI响应开头添加type标识
def format_response_with_type(content: str, response_type: str = "document"):
    if response_type == "render":
        return f"[TYPE:render]{content}"
    return content
```
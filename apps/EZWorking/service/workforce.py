from camel.agents.chat_agent import ChatAgent
from camel.messages.base import BaseMessage
from camel.models import ModelFactory
from camel.types import OpenAIBackendRole
import os
import asyncio
from dotenv import load_dotenv
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

# 设置一个推荐专家agent，启用流式响应
recommendation_agent = ChatAgent(
    system_message=BaseMessage.make_assistant_message(
        role_name="职业推荐专家",
        content="你是一个专业的职业推荐专家",
    ),
    model = ModelFactory.create(
        model_platform="openai",
        model_type="gpt-4o",
        model_config_dict={
            "stream": True,
        },
    ),
)

# 让我们也检查一下模型后端的实际配置
print(f"Agent 模型后端类型: {type(recommendation_agent.model_backend)}")
print(f"Agent 模型后端配置: {recommendation_agent.model_backend.model_config_dict}")

# 检查模型后端是否有流式方法
model_backend = recommendation_agent.model_backend
print(f"模型后端方法: {[method for method in dir(model_backend) if 'stream' in method.lower()]}")

# 检查是否有 _stream 或 _astream 方法
agent_methods = [method for method in dir(recommendation_agent) if 'stream' in method.lower()]
print(f"Agent 流式相关方法: {agent_methods}")

def camel_step_streaming_chat(query: str):
    """使用 CAMEL 框架的 step 方法测试流式响应"""
    print(f"用户问题: {query}")
    print("职业推荐专家回答 (step): ", end='', flush=True)
    
    try:
        # 检查模型后端配置
        print(f"\n模型后端配置: {recommendation_agent.model_backend.model_config_dict}")
        
        # 使用同步 step 方法，根据源码，当 stream=True 时应该返回 StreamingChatAgentResponse
        streaming_response = recommendation_agent.step(query)
        
        # 检查返回的响应类型
        response_type = type(streaming_response).__name__
        print(f"响应类型: {response_type}")
        
        # 根据源码，StreamingChatAgentResponse 应该是可迭代的
        if response_type == 'StreamingChatAgentResponse':
            print("检测到 StreamingChatAgentResponse，开始流式输出:")
            for chunk in streaming_response:
                if hasattr(chunk, 'msgs') and chunk.msgs and len(chunk.msgs) > 0:
                    content = chunk.msgs[0].content
                    print(content, end='', flush=True)
        else:
            # 如果不是流式响应，直接输出内容
            print("非流式响应，直接输出:")
            if hasattr(streaming_response, 'msgs') and streaming_response.msgs:
                print(streaming_response.msgs[0].content)
            
    except Exception as e:
        print(f"CAMEL step 流式调用出错: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)

async def camel_astep_streaming_chat(query: str):
    """使用 CAMEL 框架的 astep 方法测试流式响应"""
    print(f"用户问题: {query}")
    print("职业推荐专家回答 (astep): ", end='', flush=True)
    
    try:
        # 检查模型后端配置
        print(f"\n模型后端配置: {recommendation_agent.model_backend.model_config_dict}")
        
        # 使用异步 astep 方法，根据源码，当 stream=True 时应该返回 AsyncStreamingChatAgentResponse
        streaming_response = await recommendation_agent.astep(query)
        
        # 检查返回的响应类型
        response_type = type(streaming_response).__name__
        print(f"响应类型: {response_type}")
        
        # 根据源码，AsyncStreamingChatAgentResponse 应该是异步可迭代的
        if response_type == 'AsyncStreamingChatAgentResponse':
            print("检测到 AsyncStreamingChatAgentResponse，开始异步流式输出:")
            async for chunk in streaming_response:
                if hasattr(chunk, 'msgs') and chunk.msgs and len(chunk.msgs) > 0:
                    content = chunk.msgs[0].content
                    print(content, end='', flush=True)
        else:
            # 如果不是流式响应，直接输出内容
            print("非流式响应，直接输出:")
            if hasattr(streaming_response, 'msgs') and streaming_response.msgs:
                print(streaming_response.msgs[0].content)
            
    except Exception as e:
        print(f"CAMEL astep 流式调用出错: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)

def camel_streaming_chat(query: str):
    """使用 CAMEL 框架的流式响应函数（直接调用模型后端）"""
    print(f"用户问题: {query}")
    print("职业推荐专家回答 (直接后端): ", end='', flush=True)
    
    try:
        # 添加用户消息到内存
        user_message = BaseMessage.make_user_message(role_name="用户", content=query)
        recommendation_agent.update_memory(user_message, OpenAIBackendRole.USER)
        
        # 获取上下文消息
        openai_messages, _ = recommendation_agent.memory.get_context()
        
        # 直接调用模型后端的流式方法
        stream_response = recommendation_agent.model_backend.run(openai_messages)
        
        # 处理流式响应
        full_content = ""
        for chunk in stream_response:
            if hasattr(chunk, 'choices') and chunk.choices:
                delta = chunk.choices[0].delta
                if hasattr(delta, 'content') and delta.content:
                    print(delta.content, end='', flush=True)
                    full_content += delta.content
        
        # 将完整响应添加到内存
        if full_content:
            assistant_message = BaseMessage.make_assistant_message(
                role_name="职业推荐专家", 
                content=full_content
            )
            recommendation_agent.update_memory(assistant_message, OpenAIBackendRole.ASSISTANT)
            
    except Exception as e:
        print(f"\nCAMEL 流式调用出错: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 50)

async def run_tests():
    # 测试问题
    test_query = "请简单介绍一下数据科学家这个职业"
    
    print("=== CAMEL 框架流式响应对比测试 ===\n")
    
    # 测试同步 step 方法
    print("1. 测试 step 方法的流式响应:")
    camel_step_streaming_chat(test_query)
    
    # 测试异步 astep 方法
    print("\n2. 测试 astep 方法的流式响应:")
    await camel_astep_streaming_chat(test_query)
    
    print("\n3. 测试直接调用模型后端的流式响应:")
    camel_streaming_chat(test_query)

if __name__ == "__main__":
    asyncio.run(run_tests())
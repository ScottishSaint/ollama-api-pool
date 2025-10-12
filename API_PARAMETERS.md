# API 参数透传说明

## 概述

Ollama API Pool 作为代理服务，**完整透传**所有客户端发送的请求参数到上游服务（Ollama / OpenRouter），不做任何参数修改或过滤。这意味着你可以使用上游服务支持的所有参数。

## 支持的接口

### 1. Chat Completions（聊天补全）

**Ollama 接口**：`/v1/chat/completions`
**OpenRouter 接口**：`/openrouter/v1/chat/completions`

#### 基础参数（必需）

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `model` | string | 模型名称 | `"llama3.2:1b"`, `"gpt-4o-mini"` |
| `messages` | array | 消息数组 | `[{"role": "user", "content": "Hello"}]` |

#### 可选参数（完整透传）

| 参数 | 类型 | 说明 | 默认值 | 适用 Provider |
|------|------|------|--------|---------------|
| `stream` | boolean | 是否流式返回 | `false` | Ollama, OpenRouter |
| `temperature` | float | 温度（0-2），控制随机性 | `1.0` | Ollama, OpenRouter |
| `top_p` | float | 核采样（0-1） | `1.0` | Ollama, OpenRouter |
| `top_k` | integer | Top-K 采样 | `40` | Ollama, OpenRouter |
| `max_tokens` | integer | 最大生成 token 数 | - | Ollama, OpenRouter |
| `presence_penalty` | float | 存在惩罚（-2 到 2） | `0` | OpenRouter |
| `frequency_penalty` | float | 频率惩罚（-2 到 2） | `0` | OpenRouter |
| `stop` | string/array | 停止序列 | - | Ollama, OpenRouter |
| `seed` | integer | 随机种子，用于可复现输出 | - | Ollama, OpenRouter |
| `n` | integer | 生成多个响应 | `1` | OpenRouter |
| `logit_bias` | object | Token 偏置 | - | OpenRouter |
| `user` | string | 用户标识 | - | OpenRouter |

#### OpenRouter 专属参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `transforms` | array | 消息转换规则 |
| `models` | array | 模型回退列表 |
| `route` | string | 路由策略：`fallback` |
| `provider.order` | array | Provider 优先级 |
| `provider.require_parameters` | boolean | 是否需要参数 |

### 2. Models（模型列表）

**Ollama 接口**：`/v1/models`
**OpenRouter 接口**：`/openrouter/v1/models`

无需额外参数，直接 GET 请求即可。

## 完整示例

### 示例 1：基础对话

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'
```

### 示例 2：流式响应 + 温度控制

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Tell me a joke"}
    ],
    "stream": true,
    "temperature": 0.7,
    "max_tokens": 200
  }'
```

### 示例 3：可复现输出（固定种子）

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [
      {"role": "user", "content": "Generate a random number"}
    ],
    "seed": 42,
    "temperature": 1.0
  }'
```

### 示例 4：多参数组合

```bash
curl https://your-worker.workers.dev/openrouter/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Write a short story"}
    ],
    "temperature": 0.8,
    "top_p": 0.9,
    "max_tokens": 500,
    "presence_penalty": 0.6,
    "frequency_penalty": 0.3,
    "stop": ["\n\n", "The End"]
  }'
```

## 参数透传机制

### 请求流程

```
Client Request (所有参数 + 请求头)
    ↓
Ollama API Pool (鉴权 + 选择上游 API Key + 透传客户端特征)
    ↓
Upstream Service (完整透传所有参数和客户端请求头)
    ↓
Response (原样返回)
```

### 透传的内容

#### 1. 所有 JSON Body 参数
完整透传到上游，不做任何修改或过滤。

#### 2. 客户端请求头（自动透传，无需配置）
为了让请求看起来更像真实用户，避免被识别为代理流量，以下请求头会**自动透传**：

| 请求头 | 说明 | 示例 |
|--------|------|------|
| `User-Agent` | 客户端浏览器/工具标识 | `Mozilla/5.0 (Windows NT 10.0; Win64; x64)...` |
| `Accept-Language` | 客户端语言偏好 | `zh-CN,zh;q=0.9,en;q=0.8` |
| `Accept-Encoding` | 支持的内容编码 | `gzip, deflate, br` |
| `Referer` | 来源页面 URL | `https://your-app.com/chat` |
| `Origin` | 请求来源域 | `https://your-app.com` |
| `DNT` | Do Not Track | `1` |
| `Sec-CH-UA` | 客户端浏览器 UA 提示 | `"Chromium";v="120"` |
| `Sec-CH-UA-Mobile` | 是否移动设备 | `?0` |
| `Sec-CH-UA-Platform` | 操作系统平台 | `"Windows"` |

**优点**：
- ✅ 每个客户端请求都带有独特的浏览器指纹
- ✅ 避免被上游服务识别为自动化流量
- ✅ 降低账号被封禁的风险
- ✅ 无需客户端额外配置，自动生效

**示例**：

```bash
# 客户端发送请求时自动包含这些头
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  -H "Accept-Language: zh-CN,zh;q=0.9,en;q=0.8" \
  -H "Referer: https://your-app.com/chat" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# 代理会自动透传这些头到上游 Ollama/OpenRouter
```

#### 3. 自动 User-Agent 回退
如果客户端没有提供 User-Agent，代理会**自动使用随机浏览器 UA**，避免使用固定值：

```
客户端 UA 存在 → 透传客户端 UA
客户端 UA 不存在 → 使用随机浏览器 UA (Chrome/Firefox/Safari/Edge)
```

### 不透传的内容

为了安全考虑，以下内容**不会**透传：

- ❌ `Authorization` 头 - 替换为上游 API Key
- ❌ `X-Forwarded-*` 头 - 避免泄露代理信息
- ❌ `CF-*` Cloudflare 专用头 - 内部使用
- ❌ `Cookie` 头 - 安全考虑

## 参数校验

### 代理层不做校验

API Pool **不会**校验以下内容：
- 参数类型（由上游服务校验）
- 参数范围（由上游服务校验）
- 参数组合（由上游服务校验）

如果参数错误，上游服务会返回相应错误信息。

### 上游服务错误示例

```json
{
  "error": {
    "message": "Invalid value for 'temperature': must be between 0 and 2",
    "type": "invalid_request_error",
    "param": "temperature",
    "code": "invalid_parameter"
  }
}
```

## 缓存策略

**非流式请求**支持智能缓存：
- 缓存键：基于 `model` + `messages` + `temperature` + `top_p` 等参数生成
- 缓存时间：60 秒
- 响应头：`X-Cache: HIT` 或 `X-Cache: MISS`

**流式请求**不缓存（实时响应）。

## 性能优化建议

### 1. 使用固定种子提高缓存命中率

```json
{
  "model": "llama3.2:1b",
  "messages": [...],
  "seed": 42,
  "temperature": 0.7
}
```

相同输入 + 相同种子 = 缓存命中（仅限非流式）

### 2. 流式 vs 非流式

| 场景 | 推荐模式 | 原因 |
|------|----------|------|
| 聊天对话 | 流式 | 更快的首字响应 |
| 批量处理 | 非流式 | 可缓存，节省请求 |
| 实时展示 | 流式 | 用户体验更好 |

### 3. 温度设置

- `temperature=0`：确定性输出，适合缓存
- `temperature=0.7`：平衡创造性与一致性（推荐）
- `temperature=1.5`：高随机性，不适合缓存

## 常见问题

### Q1: 为什么我的参数不生效？

**A**: 检查以下几点：
1. 参数名拼写是否正确（区分大小写）
2. 上游模型是否支持该参数（如 `top_k` 仅部分模型支持）
3. 查看上游服务返回的错误信息

### Q2: 哪些参数会影响缓存？

**A**: 所有参数都会参与缓存键计算，包括：
- `model`, `messages`, `temperature`, `top_p`, `max_tokens` 等
- 任何参数改变都会导致缓存失效

### Q3: 如何查看支持的模型？

**A**: 调用 `/v1/models` 或 `/openrouter/v1/models` 接口：

```bash
curl https://your-worker.workers.dev/v1/models \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN"
```

### Q4: 能否自定义 User-Agent？

**A**: 可以，代理会优先使用客户端的 User-Agent：

```bash
curl https://your-worker.workers.dev/v1/chat/completions \
  -H "User-Agent: MyApp/1.0" \
  -H "Authorization: Bearer YOUR_CLIENT_TOKEN" \
  -d '...'
```

如果未提供，代理会自动使用随机的浏览器 User-Agent。

## 相关文档

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/chat/create)
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [项目配置指南](./CONFIGURATION.md)
- [项目概览](./README.md)

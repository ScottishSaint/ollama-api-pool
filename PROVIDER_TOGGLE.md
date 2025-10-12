# Provider 开关控制说明

## 概述

从 v3.1.0 开始，Ollama API Pool 支持独立控制每个 Provider（Ollama / OpenRouter）的启用/禁用状态。这允许管理员：

- 仅使用 Ollama
- 仅使用 OpenRouter
- 同时使用两者（默认）
- 临时禁用某个 Provider 进行维护

## 环境变量配置

在 `wrangler.toml` 的 `[vars]` 部分添加以下配置：

### 禁用 Ollama

```toml
[vars]
DISABLE_OLLAMA = "true"
```

### 禁用 OpenRouter

```toml
[vars]
DISABLE_OPENROUTER = "true"
```

### 默认状态（都启用）

```toml
[vars]
# 不设置或设置为 false 表示启用
# DISABLE_OLLAMA = "false"
# DISABLE_OPENROUTER = "false"
```

## 使用场景

### 场景 1：仅使用 Ollama（推荐新手）

```toml
[vars]
ADMIN_TOKEN = "your-admin-token"
DISABLE_OPENROUTER = "true"

# 其他配置...
```

**优点**：
- 配置简单，只需管理 Ollama API Keys
- 适合自建 Ollama 服务的用户
- 避免 OpenRouter 费用

**访问接口**：
- `/v1/chat/completions` ✅ 可用
- `/v1/models` ✅ 可用
- `/openrouter/v1/chat/completions` ❌ 503 错误
- `/openrouter/v1/models` ❌ 503 错误

### 场景 2：仅使用 OpenRouter（推荐高级用户）

```toml
[vars]
ADMIN_TOKEN = "your-admin-token"
DISABLE_OLLAMA = "true"

# 其他配置...
```

**优点**：
- 访问更多商业模型（GPT-4、Claude、Gemini 等）
- 稳定性更高
- 按需付费

**访问接口**：
- `/v1/chat/completions` ❌ 503 错误
- `/v1/models` ❌ 503 错误
- `/openrouter/v1/chat/completions` ✅ 可用
- `/openrouter/v1/models` ✅ 可用

### 场景 3：同时使用（默认，推荐）

```toml
[vars]
ADMIN_TOKEN = "your-admin-token"
# 不设置 DISABLE_* 变量，或设置为 false

# 其他配置...
```

**优点**：
- 最大灵活性
- Ollama 用于免费模型
- OpenRouter 用于高级模型
- 相互备份

**访问接口**：
- 所有接口 ✅ 都可用

### 场景 4：临时维护

```toml
[vars]
ADMIN_TOKEN = "your-admin-token"
# 临时禁用 Ollama 进行维护
DISABLE_OLLAMA = "true"

# 其他配置...
```

在维护完成后，改回：

```toml
[vars]
ADMIN_TOKEN = "your-admin-token"
# 恢复 Ollama
DISABLE_OLLAMA = "false"
# 或直接删除这行
```

## 错误响应

当 Provider 被禁用时，客户端会收到：

```json
{
  "error": "Ollama service is currently disabled by administrator"
}
```

HTTP 状态码：`503 Service Unavailable`

## 健康检查

`/health` 接口会返回所有 Provider 的状态：

```json
{
  "status": "ok",
  "service": "Ollama API Pool",
  "version": "1.0.0",
  "providers": {
    "ollama": {
      "enabled": true,
      "configured": true
    },
    "openrouter": {
      "enabled": false,
      "configured": false
    }
  },
  "timestamp": "2025-10-12T10:30:00.000Z"
}
```

## 管理后台显示

后台会根据 Provider 状态显示不同的 UI：

- **启用且已配置** - 显示绿色标记 ✅
- **启用但未配置** - 显示黄色警告 ⚠️
- **已禁用** - 显示灰色标记 🚫

## 最佳实践

### 1. 测试环境

```toml
[vars]
# 测试环境只使用 Ollama（免费）
DISABLE_OPENROUTER = "true"
```

### 2. 生产环境

```toml
[vars]
# 生产环境同时使用两者（高可用）
# DISABLE_OLLAMA = "false"
# DISABLE_OPENROUTER = "false"
```

### 3. 成本控制

```toml
[vars]
# 只使用 Ollama 降低成本
DISABLE_OPENROUTER = "true"
```

### 4. 按需启用

在 Cloudflare Dashboard 中动态修改环境变量，无需重新部署：

1. 访问 Workers & Pages → 你的 Worker
2. Settings → Variables
3. 添加/修改 `DISABLE_OLLAMA` 或 `DISABLE_OPENROUTER`
4. 保存后立即生效

## 常见问题

### Q1: 如何临时禁用 Ollama？

**A**: 在 `wrangler.toml` 或 Cloudflare Dashboard 中设置 `DISABLE_OLLAMA = "true"`，然后重新部署或等待变量生效。

### Q2: 禁用 Ollama 后，已有的 API Keys 会被删除吗？

**A**: 不会！所有 API Keys 仍然保留在数据库中，只是暂时不可用。重新启用后立即恢复。

### Q3: 如何查看当前 Provider 状态？

**A**: 访问 `/health` 接口，查看 `providers` 字段。

### Q4: 能否在运行时动态切换？

**A**: 可以！在 Cloudflare Dashboard 修改环境变量后，新的请求会立即使用新状态（无需重新部署）。

### Q5: 禁用后对统计数据有影响吗？

**A**: 没有影响。历史统计数据保持不变，禁用期间该 Provider 的请求会被拒绝，不会记录新统计。

## 示例配置

### 完整配置示例（仅 Ollama）

```toml
name = "ollama-api-pool"
main = "src/index.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "API_KEYS"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "ACCOUNTS"
id = "your-accounts-kv-id"

[vars]
ADMIN_TOKEN = "your-admin-secret-token"

# Provider 控制
DISABLE_OPENROUTER = "true"  # 禁用 OpenRouter

# 其他配置
ENABLE_ANALYTICS = "false"
ENABLE_RATE_LIMIT = "false"
ENABLE_BOT_DETECTION = "true"
```

### 完整配置示例（仅 OpenRouter）

```toml
name = "ollama-api-pool"
main = "src/index.js"
compatibility_date = "2025-01-01"

[[kv_namespaces]]
binding = "API_KEYS"
id = "your-kv-namespace-id"

[[kv_namespaces]]
binding = "ACCOUNTS"
id = "your-accounts-kv-id"

[vars]
ADMIN_TOKEN = "your-admin-secret-token"

# Provider 控制
DISABLE_OLLAMA = "true"  # 禁用 Ollama

# OpenRouter 专用配置
OPENROUTER_APP_URL = "https://your-app.com"
OPENROUTER_APP_TITLE = "Your App Name"

# 其他配置
ENABLE_ANALYTICS = "false"
ENABLE_RATE_LIMIT = "false"
ENABLE_BOT_DETECTION = "true"
```

## 相关文档

- [配置指南](./CONFIGURATION.md)
- [项目概览](./README.md)
- [API 参数说明](./API_PARAMETERS.md)

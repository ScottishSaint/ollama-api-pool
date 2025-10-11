# Ollama API Pool

<div align="center">

![Ollama API Pool](https://img.shields.io/badge/Ollama-API_Pool-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yIDEyTDEyIDE3TDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiLz4KPHBhdGggZD0iTTIgMTdMMTIgMjJMMjIgMTciIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=)

<!-- 许可证与平台 -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D8.0.0-yellow?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)

<!-- GitHub Actions 工作流状态 -->
[![Deploy Status](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml/badge.svg)](https://github.com/dext7r/ollama-api-pool/actions/workflows/deploy.yml)
[![API Test Status](https://github.com/dext7r/ollama-api-pool/actions/workflows/api-test.yml/badge.svg)](https://github.com/dext7r/ollama-api-pool/actions/workflows/api-test.yml)

<!-- 项目统计 -->
[![GitHub stars](https://img.shields.io/github/stars/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/dext7r/ollama-api-pool?style=flat-square&logo=github)](https://github.com/dext7r/ollama-api-pool/network)
[![GitHub issues](https://img.shields.io/github/issues/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/pulls)
[![GitHub last commit](https://img.shields.io/github/last-commit/dext7r/ollama-api-pool?style=flat-square)](https://github.com/dext7r/ollama-api-pool/commits)

<!-- 代码质量与贡献 -->
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code%20style-standard-brightgreen?style=flat-square)](https://standardjs.com)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/dext7r/ollama-api-pool/graphs/commit-activity)

<!-- 技术特性 -->
[![OpenAI Compatible](https://img.shields.io/badge/OpenAI-Compatible-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com/docs/api-reference)
[![Multi Provider](https://img.shields.io/badge/Multi-Provider-blue?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSI2IiBjeT0iMTIiIHI9IjMiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMTgiIGN5PSIxMiIgcj0iMyIgZmlsbD0id2hpdGUiLz4KICA8Y2lyY2xlIGN4PSIxMiIgY3k9IjYiIHI9IjMiIGZpbGw9IndoaXRlIi8+CiAgPGNpcmNsZSBjeD0iMTIiIGN5PSIxOCIgcj0iMyIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)](https://ollama-api-pool.h7ml.workers.dev/api-docs)
[![Serverless](https://img.shields.io/badge/Serverless-Edge_Computing-purple?style=flat-square&logo=serverless&logoColor=white)](https://workers.cloudflare.com/)
[![High Availability](https://img.shields.io/badge/High-Availability-success?style=flat-square&logo=statuspage&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/health)
[![Load Balancing](https://img.shields.io/badge/Load-Balancing-blue?style=flat-square&logo=nginx&logoColor=white)](https://ollama-api-pool.h7ml.workers.dev/api-docs)

<!-- 存储支持 -->
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-Supported-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![Cloudflare KV](https://img.shields.io/badge/Cloudflare-KV-orange?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/kv/)

基于 Cloudflare Workers 的智能 Ollama/OpenRouter API 代理池，支持多 Provider、多账号轮询、自动故障转移和统一鉴权。

[English](./README_EN.md) | 简体中文

**[🚀 在线演示](https://ollama-api-pool.h7ml.workers.dev)** | **[📚 API 文档](https://ollama-api-pool.h7ml.workers.dev/api-docs)** | **[📊 实时统计](https://ollama-api-pool.h7ml.workers.dev/stats)** | **[💬 讨论区](https://github.com/dext7r/ollama-api-pool/discussions)**

</div>

---

## ✨ 功能特性

### 🌐 多 Provider 支持
- 🦙 **Ollama** - 支持 Ollama 官方 API
- 🔀 **OpenRouter** - 支持 OpenRouter API，访问多种 LLM 模型
- 🔌 **统一接口** - 所有 Provider 使用相同的 OpenAI 兼容接口
- 🎯 **智能路由** - 根据路径自动识别 Provider（如 `/openrouter/v1/chat/completions`）

### 💡 核心功能
- 🔄 **API 轮询** - 自动轮换多个 API Key，均衡负载
- 🛡️ **故障转移** - 检测失效 Key 并自动切换
- 🤖 **智能管理** - 自动禁用连续失败的 Key，支持手动启用/禁用
- 📊 **使用统计** - 实时统计每个 Key 的请求、成功率、失败次数
- 🏥 **健康检查** - 批量验证 API Key 可用性
- 🔐 **统一鉴权** - 自定义客户端 Token，保护上游 API Key

### 📦 管理功能
- 🎯 **分类管理** - 导入时自动识别并分类 API Key（kimi/llama/qwen 等）
- 📥 **批量导入** - 支持从 ollama.txt 文件导入账号
- 🔍 **验证导入** - 逐行验证 API Key 有效性并自动分类
- 🎛️ **管理后台** - Web 界面管理 API Keys 和客户端 Tokens

### ⚡ 性能与存储
- 🚀 **高性能** - 基于 Cloudflare Workers，全球 CDN 加速
- 🗄️ **多层存储** - 支持 PostgreSQL + Redis + KV 混合架构
- 💾 **灵活配置** - 可选启用数据库与缓存承载大规模流量
- 📈 **可扩展** - 轻松承载十万级账号池或高频调用

## 🚀 快速开始

### 前置要求

- **Node.js**: >= 20.0.0
- **pnpm**: >= 8.0.0 (推荐) 或 npm

安装 pnpm:

```bash
npm install -g pnpm
```

如果您的 Node.js 版本低于 20，可以使用 nvm 升级:

```bash
# 安装 nvm (如果还没安装)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装 Node.js 20
nvm install 20
nvm use 20
```

### 1. 安装依赖

```bash
pnpm install
```

### 2. 登录 Cloudflare

```bash
pnpm wrangler login
```

### 3. 配置项目

复制配置模板并修改:

```bash
cp wrangler.toml.example wrangler.toml
```

**创建 KV 命名空间**:

```bash
pnpm wrangler kv:namespace create "API_KEYS"
pnpm wrangler kv:namespace create "ACCOUNTS"
```

将返回的 namespace ID 填入 `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "API_KEYS"
id = "your-api-keys-kv-id"  # 替换为实际 ID

[[kv_namespaces]]
binding = "ACCOUNTS"
id = "your-accounts-kv-id"  # 替换为实际 ID

[vars]
ADMIN_TOKEN = "your-secure-admin-token-here"  # 设置强密码
```

> ⚠️ **重要**: `wrangler.toml` 包含敏感信息，已添加到 `.gitignore`，不会被提交到仓库

### 4. 部署

```bash
pnpm deploy
```

部署成功后会显示访问地址，如: `https://ollama-api-pool.your-name.workers.dev`

## 🚀 GitHub Actions 自动部署

本项目配置了 GitHub Actions 自动部署到 Cloudflare Workers。

### 配置步骤

1. **在 GitHub 仓库设置中添加 Secrets** (Settings > Secrets and variables > Actions):

   必需的 Secrets:
   - `CLOUDFLARE_API_TOKEN`: Cloudflare API Token
   - `CLOUDFLARE_ACCOUNT_ID`: Cloudflare Account ID
   - `ADMIN_TOKEN`: 管理后台密钥
   - `API_KEYS_KV_ID`: API Keys KV 命名空间 ID
   - `ACCOUNTS_KV_ID`: Accounts KV 命名空间 ID

2. **获取 Cloudflare API Token**:
   - 访问 <https://dash.cloudflare.com/profile/api-tokens>
   - 点击 "Create Token"
   - 选择 "Edit Cloudflare Workers" 模板
   - 创建并复制 Token

3. **获取 Account ID**:
   - 访问 <https://dash.cloudflare.com/>
   - 选择你的域名，右侧可以看到 Account ID

4. **获取 KV 命名空间 ID**:

   ```bash
   pnpm wrangler kv:namespace list
   ```

5. **推送代码到 main 分支**即可自动部署,部署成功后会在 Actions 日志中显示访问地址

### 手动触发部署

在 GitHub Actions 页面，选择 "Deploy to Cloudflare Workers" 工作流，点击 "Run workflow"。

## 📖 使用说明

### 管理后台

访问部署后的 URL (如 `https://ollama-api-pool.your-name.workers.dev`)，输入管理员 Token 进入后台。

#### 导入 API Keys

##### 方式一: 单个添加

在 "API Keys" 标签页输入 Ollama API Key 点击添加。

##### 方式二: 批量导入

1. 切换到 "批量导入" 标签
2. 粘贴 `ollama.txt` 文件内容
3. 点击导入

格式示例:

```text
test@example.com----password123----session_token----ollama-abc123...
user@test.com----pass456----session_data----ollama-def456...
```

#### 创建客户端 Token

1. 切换到 "客户端 Tokens" 标签
2. 输入 Token 名称
3. 点击创建
4. 复制生成的 Token 提供给客户端使用

#### 查看 Key 使用统计

1. 切换到 "统计分析" 标签
2. 查看每个 Key 的详细统计：
   - 总请求数、成功/失败次数
   - 成功率百分比
   - 最后使用时间
   - 当前状态（active/disabled）
3. 可手动启用/禁用 Key
4. 运行批量健康检查

### API 调用

使用客户端 Token 调用 API:

```bash
curl https://ollama-api-pool.your-name.workers.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxx" \
  -d '{
    "model": "llama3.2:1b",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": false
  }'
```

### API 端点

#### Ollama API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/v1/chat/completions` | POST | Ollama Chat Completions (OpenAI 兼容) |
| `/v1/models` | GET | 获取 Ollama 模型列表 |

#### OpenRouter API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/openrouter/v1/chat/completions` | POST | OpenRouter Chat Completions (OpenAI 兼容) |
| `/openrouter/v1/models` | GET | 获取 OpenRouter 模型列表 |

#### 管理 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | 管理后台首页 |
| `/health` | GET | 健康检查 |
| `/stats` | GET | 公开统计页面 |
| `/api-docs` | GET | API 使用文档 |
| `/admin/public-stats` | GET | 公开统计数据 API |
| `/admin/api-keys` | GET/POST/DELETE | 管理 API Keys |
| `/admin/api-keys/import` | POST | 批量导入 API Keys |
| `/admin/api-keys/import-from-txt` | POST | 从 ollama.txt 格式导入 |
| `/admin/api-keys/import-with-validation` | POST | 验证导入 API Keys (逐行验证) |
| `/admin/keys/stats` | GET | 获取 Key 使用统计 |
| `/admin/keys/enable` | POST | 手动启用 API Key |
| `/admin/keys/disable` | POST | 手动禁用 API Key |
| `/admin/keys/health-check` | POST | 批量健康检查 |
| `/admin/tokens` | GET/POST/DELETE | 管理客户端 Tokens |
| `/admin/stats` | GET | 获取统计概览 |
| `/admin/cache/stats` | GET | 获取缓存统计 |
| `/admin/cache/clear` | POST | 清除缓存 |

> 💡 **提示**：管理 API 支持通过 `?provider=openrouter` 参数指定 Provider

## 🛠️ 配置选项

### wrangler.toml

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
ADMIN_TOKEN = "your-admin-secret-token"  # 管理后台密钥
ENABLE_ANALYTICS = "true"                # 启用统计
REDIS_URL = "rediss://default:***@tidy-caribou-11305.upstash.io:6379"  # 可选：Redis 缓存与限流
DATABASE_URL = "postgresql://postgres.inswmaagqjqgqxzxuxlp:***@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"  # 可选：Supabase PostgreSQL
SUPABASE_REST_URL = "https://inswmaagqjqgqxzxuxlp.supabase.co/rest/v1"  # 建议显式配置 REST 端点
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOi..."  # 必填：Supabase Service Role Key
```

> ✅ 推荐组合：**PostgreSQL（Supabase）+ Redis（Upstash）**。启用 `DATABASE_URL` 与 `REDIS_URL` 后，Worker 会优先使用数据库与缓存存储，Cloudflare KV 只作为回退通道，可稳定承载十万级账号池或高频调用。

### PostgreSQL（Supabase）集成

1. 在 Supabase 中创建数据库，并保证所有表名以 `ollama_api_` 开头；
2. 建议使用如下最小表结构：

```sql
create table if not exists ollama_api_keys (
  api_key text primary key,
  username text,
  status text default 'active',
  created_at timestamptz default now(),
  expires_at timestamptz,
  failed_until timestamptz,
  disabled_until timestamptz,
  consecutive_failures integer default 0
);

create table if not exists ollama_api_key_stats (
  api_key text primary key references ollama_api_keys(api_key) on delete cascade,
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  success_rate numeric default 0,
  last_used timestamptz,
  last_success timestamptz,
  last_failure timestamptz,
  consecutive_failures integer default 0,
  created_at timestamptz default now()
);

create table if not exists ollama_api_client_tokens (
  token text primary key,
  name text,
  created_at timestamptz default now(),
  expires_at timestamptz,
  request_count bigint default 0
);

create table if not exists ollama_api_global_stats (
  id text primary key default 'global',
  total_requests bigint default 0,
  success_count bigint default 0,
  failure_count bigint default 0,
  updated_at timestamptz default now()
);
```

3. 在 Supabase 项目设置中获取 `Service Role Key`，写入 `SUPABASE_SERVICE_ROLE_KEY`；
4. 如果未填写 `SUPABASE_REST_URL`，Worker 会尝试根据 `DATABASE_URL` 自动推断，但显式设置更可靠；
5. 部署后，API Key、客户端 Token 与统计将优先写入 PostgreSQL，KV 仅作为兜底。

## 📚 文档

- **[配置指南](./CONFIGURATION.md)** - 详细的环境变量配置说明
- **[优化措施](./OPTIMIZATION.md)** - KV 优化和性能调优
- **[贡献指南](./CONTRIBUTING.md)** - 如何参与项目开发
- **[API 文档](https://ollama-api-pool.h7ml.workers.dev/api-docs)** - 在线 API 文档
- **[实时统计](https://ollama-api-pool.h7ml.workers.dev/stats)** - 公开统计图表

---

## 📊 工作原理

### 请求流程

```
客户端请求
    ↓
验证客户端 Token
    ↓
从池中获取下一个可用 API Key
    ↓
转发请求到 Ollama API
    ↓
检查响应状态
    ↓ (成功)          ↓ (失败)
返回结果        标记失败 → 重试
```

### Key 轮询策略

- **轮询算法**: Round-robin 轮询
- **失败标记**: API Key 失效后标记 1 小时
- **自动恢复**: 1 小时后自动重新尝试
- **最大重试**: 单次请求最多重试 3 次

### 智能管理

- **自动禁用**: 连续失败 3 次自动禁用 1 小时
- **手动控制**: 支持手动启用/禁用任意 Key，可自定义禁用时长
- **健康检查**: 批量验证所有 Key 可用性，自动更新状态
- **统计分析**: 实时追踪每个 Key 的：
  - 总请求数、成功/失败次数
  - 成功率百分比
  - 最后使用时间
  - 连续失败次数
  - 禁用原因（自动/手动）

## 🔒 安全建议

1. **保护管理员 Token**: 使用强随机密码
2. **限制客户端 Token**: 为不同用户创建独立 Token
3. **定期轮换**: 定期更新 API Keys 和 Tokens
4. **监控日志**: 定期检查统计信息
5. **访问控制**: 限制管理后台访问 IP

## 📝 开发

### 本地测试

```bash
pnpm dev
```

### 查看日志

```bash
pnpm wrangler tail
```

### 更新部署

```bash
pnpm deploy
```

## 🐛 故障排除

### API Key 频繁失效

检查上游 Ollama API Key 是否有效:

```bash
curl https://ollama.com/v1/chat/completions \
  -H "Authorization: Bearer ollama-xxx..." \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3.2:1b","messages":[{"role":"user","content":"test"}]}'
```

### 客户端无法连接

- 检查客户端 Token 是否有效
- 查看 Worker 日志: `pnpm wrangler tail`
- 验证 CORS 配置

### 导入失败

确保 ollama.txt 格式正确:

```text
email----password----session----api_key
```

## 📦 项目结构

```text
ollama-api-pool/
├── src/
│   ├── index.js       # 主入口
│   ├── proxy.js       # API 代理
│   ├── auth.js        # 鉴权模块
│   ├── admin.js       # 管理 API
│   ├── keyManager.js  # Key 管理
│   ├── dashboard.js   # 管理后台
│   └── utils.js       # 工具函数
├── wrangler.toml      # Cloudflare 配置
├── package.json       # 依赖配置
└── README.md          # 说明文档
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=dext7r/ollama-api-pool&type=Date)](https://star-history.com/#dext7r/ollama-api-pool&Date)

## 🔗 相关链接

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Ollama 官网](https://ollama.com/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)

---

## 🌐 在线资源

- 🚀 **在线演示**: <https://ollama-api-pool.h7ml.workers.dev>
- 📚 **API 文档**: <https://ollama-api-pool.h7ml.workers.dev/api-docs>
- 💬 **问题反馈**: <https://github.com/dext7r/ollama-api-pool/issues>
- 📖 **贡献指南**: <https://github.com/dext7r/ollama-api-pool/blob/main/CONTRIBUTING.md>

如果这个项目对您有帮助，请给个 ⭐ Star 支持一下！

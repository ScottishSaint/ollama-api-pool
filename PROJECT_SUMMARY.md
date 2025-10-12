# Ollama API Pool - 项目摘要

## 📌 项目信息

- **项目名称**: Ollama API Pool
- **仓库地址**: https://github.com/dext7r/ollama-api-pool
- **许可证**: MIT License
- **技术栈**: Cloudflare Workers, JavaScript, PostgreSQL, Redis
- **版本**: 3.0.0

## ✨ 核心功能

### 1. API 池管理
- ✅ Round-robin 轮询算法
- ✅ 自动故障转移
- ✅ 智能禁用/启用机制
- ✅ 健康检查

### 2. 统计分析
- ✅ 实时请求统计
- ✅ 成功率追踪
- ✅ 连续失败检测
- ✅ 使用时间记录

### 3. 导入功能
- ✅ 批量导入 (ollama.txt)
- ✅ 验证导入 (逐行验证)
- ✅ 自动分类 (kimi/llama/qwen)

### 4. 管理后台
- ✅ Web 界面
- ✅ 统计面板
- ✅ Key 管理
- ✅ Token 管理
- ✅ 用户管理 <sup>v3.0.0</sup>

### 5. 用户系统 <sup>v3.0.0</sup>
- ✅ 邮箱注册/登录
- ✅ 验证码登录
- ✅ 密码登录
- ✅ 邮件验证
- ✅ Turnstile 人机验证
- ✅ 用户仪表盘
- ✅ 每日签到续期
- ✅ 签到历史查询

### 6. OpenAI 兼容
- ✅ /v1/chat/completions
- ✅ /v1/models
- ✅ 流式/非流式支持

## 📁 项目结构

```
ollama-api-pool/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # 自动部署配置
│       └── api-test.yml        # API 测试工作流
├── database/
│   ├── schema.sql              # PostgreSQL 数据库结构
│   ├── README.md               # 数据库说明
│   └── SQL_README.md           # SQL 脚本文档
├── scripts/
│   └── README.md               # 脚本说明
├── src/
│   ├── html/
│   │   ├── login.js            # 登录页面 HTML
│   │   ├── main-dashboard.js   # 管理后台 HTML
│   │   └── user-dashboard.js   # 用户仪表盘 HTML <sup>v3.0.0</sup>
│   ├── static/
│   │   ├── api-docs-html.js    # API 文档页面
│   │   ├── dashboard-js.js     # 管理后台 JS
│   │   ├── login-js.js         # 登录页面 JS
│   │   └── user-dashboard-js.js # 用户仪表盘 JS <sup>v3.0.0</sup>
│   ├── index.js                # 主入口
│   ├── proxy.js                # API 代理 + 统计
│   ├── auth.js                 # 鉴权模块 + 用户认证 <sup>v3.0.0</sup>
│   ├── admin.js                # 管理 API + 用户管理 <sup>v3.0.0</sup>
│   ├── dashboard.js            # 管理后台路由
│   ├── email.js                # 邮件服务 <sup>v3.0.0</sup>
│   ├── postgres.js             # PostgreSQL 数据库操作
│   ├── redis.js                # Redis 缓存操作
│   ├── providers.js            # Provider 管理
│   ├── buildInfo.js            # 构建信息
│   └── utils.js                # 工具函数
├── .gitignore                  # Git 忽略规则
├── CHANGELOG.md                # 变更日志
├── CONFIGURATION.md            # 配置指南
├── CONTRIBUTING.md             # 贡献指南
├── OPTIMIZATION.md             # 优化建议
├── PROJECT_SUMMARY.md          # 项目摘要
├── LICENSE                     # MIT 许可证
├── package.json                # 项目配置
├── README.md                   # 项目文档（中文）
├── README_EN.md                # 项目文档（英文）
└── wrangler.toml               # Cloudflare 配置
```

## 🔑 核心模块说明

### proxy.js
- API 请求代理
- 自动重试机制 (最多3次)
- 记录 Key 统计信息
- 智能禁用逻辑 (连续失败3次)

### keyManager.js
- Round-robin 轮询
- 健康检查
- 手动启用/禁用
- 统计信息管理

### admin.js
- 批量导入接口
- 验证导入接口 (调用 Ollama API 验证)
- 分类管理 (根据模型自动分类)
- 统计查询接口

### dashboard.js
- Web 管理界面
- 5个功能标签: API Keys / 客户端 Tokens / 用户管理 <sup>v3.0.0</sup> / 批量导入 / 统计分析
- 实时刷新 (10秒轮询)

### auth.js <sup>v3.0.0</sup>
- JWT Token 签名和验证
- 邮箱注册/登录
- 验证码发送与验证
- Turnstile 人机验证
- 用户会话管理

### email.js <sup>v3.0.0</sup>
- push-all-in-one 集成
- HTML 邮件模板
- 验证码邮件发送
- 频率限制（60s/次，10次/天）

### postgres.js
- 用户表 (users) <sup>v3.0.0</sup>
- 邮箱验证码表 (email_verification_codes) <sup>v3.0.0</sup>
- 签到记录表 (user_signins) <sup>v3.0.0</sup>
- API Keys 表
- 客户端 Tokens 表
- 统计数据表

## 📊 数据存储

### PostgreSQL (主存储)
- `users`: 用户信息表 <sup>v3.0.0</sup>
- `email_verification_codes`: 邮箱验证码 <sup>v3.0.0</sup>
- `user_signins`: 签到记录 <sup>v3.0.0</sup>
- `ollama_api_keys`: Ollama API Keys
- `openrouter_api_keys`: OpenRouter API Keys
- `ollama_client_tokens`: Ollama 客户端 Tokens
- `openrouter_client_tokens`: OpenRouter 客户端 Tokens
- `ollama_stats`: Ollama 统计数据
- `openrouter_stats`: OpenRouter 统计数据

### Redis (缓存层)
- 验证码缓存 <sup>v3.0.0</sup>
- 验证码发送频率限制 <sup>v3.0.0</sup>
- 每日发送次数限制 <sup>v3.0.0</sup>
- 会话缓存
- 统计数据缓存

### Cloudflare KV (可选备用)

### Key 前缀规则
- `api_keys_list`: 主 Key 列表
- `failed:{key}`: 失败标记 (1小时TTL)
- `key_stats:{key}`: Key 统计 (30天TTL)
- `key_category:{key}`: Key 分类信息
- `usage:{client}:{timestamp}`: 使用记录 (24小时TTL)
- `client_token:{token}`: 客户端 Token

## 🚀 部署方式

### 手动部署
```bash
wrangler deploy
```

### 自动部署 (GitHub Actions)
- 推送到 main 分支自动触发
- 需要配置 Secrets:
  - CLOUDFLARE_API_TOKEN
  - CLOUDFLARE_ACCOUNT_ID

## 🔒 安全特性

1. 管理员 Token 验证
2. 客户端 Token 鉴权
3. API Key 隐藏显示
4. CORS 跨域支持

## 📈 智能管理机制

### 自动禁用
- 触发条件: 连续失败 3 次
- 禁用时长: 1 小时
- 标记类型: auto-disabled

### 手动禁用
- 可自定义时长
- 标记类型: manual

### 健康检查
- 批量验证所有 Key
- 自动更新状态
- 失败 Key 自动标记

## 🎯 下一步计划

- [ ] 支持更多模型提供商
- [ ] 添加速率限制
- [ ] 详细的使用报告
- [ ] WebSocket 实时通知
- [ ] 多语言支持

## 📝 开发备注

### 验证导入逻辑
1. 逐行解析 API Key
2. 调用 Ollama API 验证
3. 获取模型列表分类
4. 保存到 KV 存储
5. 返回分类统计

### 统计追踪
- 每次请求记录统计
- 计算成功率
- 追踪连续失败
- 触发自动禁用

### 轮询策略
- Round-robin 算法
- 过滤失效 Key
- 无可用 Key 返回 503

## 📞 联系方式

- Issues: https://github.com/dext7r/ollama-api-pool/issues
- Discussions: https://github.com/dext7r/ollama-api-pool/discussions

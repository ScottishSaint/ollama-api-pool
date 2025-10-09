# Ollama API Pool - 项目摘要

## 📌 项目信息

- **项目名称**: Ollama API Pool
- **仓库地址**: https://github.com/dext7r/ollama-api-pool
- **许可证**: MIT License
- **技术栈**: Cloudflare Workers, JavaScript
- **版本**: 1.0.0

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

### 5. OpenAI 兼容
- ✅ /v1/chat/completions
- ✅ /v1/models
- ✅ 流式/非流式支持

## 📁 项目结构

```
ollama-api-pool/
├── .github/
│   └── workflows/
│       └── deploy.yml          # 自动部署配置
├── src/
│   ├── index.js                # 主入口
│   ├── proxy.js                # API 代理 + 统计
│   ├── auth.js                 # 鉴权模块
│   ├── admin.js                # 管理 API + 验证导入
│   ├── keyManager.js           # Key 管理 + 健康检查
│   ├── dashboard.js            # 管理后台 UI
│   └── utils.js                # 工具函数
├── .gitignore                  # Git 忽略规则
├── CONTRIBUTING.md             # 贡献指南
├── LICENSE                     # MIT 许可证
├── package.json                # 项目配置
├── README.md                   # 项目文档
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
- 4个功能标签: API Keys / 客户端 Tokens / 批量导入 / 统计分析
- 实时刷新 (30秒轮询)

## 📊 数据存储 (Cloudflare KV)

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

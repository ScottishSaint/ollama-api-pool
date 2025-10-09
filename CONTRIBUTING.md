# 贡献指南

感谢您对 Ollama API Pool 的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告问题

如果您发现了 bug 或有新功能建议：

1. 在 [Issues](https://github.com/dext7r/ollama-api-pool/issues) 中搜索是否已有相关问题
2. 如果没有，创建新 Issue，详细描述：
   - Bug: 复现步骤、预期行为、实际行为、环境信息
   - 功能请求: 使用场景、期望效果、可能的实现方式

### 提交代码

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### Commit 规范

请遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具链相关

### 代码风格

- 使用 ESLint 检查代码
- 保持代码简洁、可读
- 添加必要的注释（中文）
- 确保不破坏现有功能

### 测试

- 在提交 PR 前本地测试所有功能
- 使用 `pnpm dev` 本地开发测试
- 确保新增功能有相应说明

## 开发流程

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/dext7r/ollama-api-pool.git
cd ollama-api-pool

# 安装依赖
pnpm install

# 登录 Cloudflare
pnpm wrangler login

# 创建 KV 命名空间
pnpm wrangler kv:namespace create "API_KEYS"
pnpm wrangler kv:namespace create "ACCOUNTS"
```

### 本地开发

```bash
# 启动开发服务器
pnpm dev

# 查看日志
pnpm wrangler tail
```

### 部署测试

```bash
# 部署到 Cloudflare
pnpm deploy
```

## 行为准则

- 尊重所有贡献者
- 保持友好、专业的交流
- 接受建设性反馈
- 专注于对项目最有利的决策

## 许可证

提交代码即表示您同意将代码按 MIT 许可证开源。

## 联系方式

- Issues: <https://github.com/dext7r/ollama-api-pool/issues>
- Discussions: <https://github.com/dext7r/ollama-api-pool/discussions>

感谢您的贡献！ 🎉

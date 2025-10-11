# Changelog

## [2.0.0] - 2025-10-12

### Added
- **多 Provider 能力**：在后台、统计与文档页全面引入 OpenRouter，提供 Provider 切换 UI、专属统计面板与 API 入口说明。（参见 [bef1c40](https://github.com/dext7r/ollama-api-pool/commit/bef1c40)、[91ac7bb](https://github.com/dext7r/ollama-api-pool/commit/91ac7bb)）
- **多层存储与数据持久化**：实现 PostgreSQL + Redis 架构，支持模型统计、全局指标与会话缓存落盘，并保留可选的 KV 缓存策略。（参见 [433c13e](https://github.com/dext7r/ollama-api-pool/commit/433c13e)、[861efb9](https://github.com/dext7r/ollama-api-pool/commit/861efb9)、[71a79ac](https://github.com/dext7r/ollama-api-pool/commit/71a79ac)）
- **项目概览页面**：新增 `/project` 静态页与 `/project/meta` 接口，实时拉取 GitHub README、版本、标签；配套品牌 favicon/logo、51.la 统计脚本。（参见 [91ac7bb](https://github.com/dext7r/ollama-api-pool/commit/91ac7bb)）
- **CI / API 测试体系**：部署后自动执行 API 测试，生成模板化请求示例，并把执行结果反馈到 PR/Commit 评论中，完善工作流配置。（参见 [1b682ac](https://github.com/dext7r/ollama-api-pool/commit/1b682ac)、[77994a2](https://github.com/dext7r/ollama-api-pool/commit/77994a2)、[1869bfb](https://github.com/dext7r/ollama-api-pool/commit/1869bfb)、[a3cec21](https://github.com/dext7r/ollama-api-pool/commit/a3cec21)、[5ea145f](https://github.com/dext7r/ollama-api-pool/commit/5ea145f)、[0754b1f](https://github.com/dext7r/ollama-api-pool/commit/0754b1f)）

### Changed
- **前端体验重构**：统一登录、控制台、公开统计、API 文档导航与 Provider 文案；优化移动端布局、Mermaid 与 Markdown 样式、表格滚动体验。（参见 [37b54b3](https://github.com/dext7r/ollama-api-pool/commit/37b54b3)、[ef9d5f8](https://github.com/dext7r/ollama-api-pool/commit/ef9d5f8)、[e1808cd](https://github.com/dext7r/ollama-api-pool/commit/e1808cd)、[bef1c40](https://github.com/dext7r/ollama-api-pool/commit/bef1c40)、[91ac7bb](https://github.com/dext7r/ollama-api-pool/commit/91ac7bb))
- **文档与数据说明**：README/README_EN 引入徽章、OpenRouter 指南，多语言文档更新；新增公开统计数据校验与项目结构说明。（参见 [a9fc9a5](https://github.com/dext7r/ollama-api-pool/commit/a9fc9a5)、[99fec79](https://github.com/dext7r/ollama-api-pool/commit/99fec79)、[79fad53](https://github.com/dext7r/ollama-api-pool/commit/79fad53))
- **API 与监控**：提供 API 测试模板接口、改进统计列表与缓存策略，提升后台可观测性。（参见 [90c52c1](https://github.com/dext7r/ollama-api-pool/commit/90c52c1)、[e1808cd](https://github.com/dext7r/ollama-api-pool/commit/e1808cd)、[71a79ac](https://github.com/dext7r/ollama-api-pool/commit/71a79ac))

### Fixed
- 修复管理员登录与 KV 写入问题、模型统计筛选、CI 工作流权限/配置等历史缺陷，保障部署与数据稳定性。（参见 [91ee60e](https://github.com/dext7r/ollama-api-pool/commit/91ee60e)、[a81ca5f](https://github.com/dext7r/ollama-api-pool/commit/a81ca5f)、[82661be](https://github.com/dext7r/ollama-api-pool/commit/82661be)、[3fd630b](https://github.com/dext7r/ollama-api-pool/commit/3fd630b)、[2a9e9cf](https://github.com/dext7r/ollama-api-pool/commit/2a9e9cf))

## [1.0.0] - 2025-10-09
- 初始发布。

# Changelog

## [3.1.0] - 2025-10-12

### Added
- **Provider 独立控制**：新增 `DISABLE_OLLAMA` 和 `DISABLE_OPENROUTER` 环境变量，支持独立启用/禁用每个 Provider，灵活配置服务范围（仅 Ollama、仅 OpenRouter 或同时使用）。（参见 [8eefa44](https://github.com/dext7r/ollama-api-pool/commit/8eefa44)）
- **防封禁机制**：实现客户端请求头透传（12+ headers），包括 User-Agent、Referer、Accept-Language、Sec-CH-UA 等浏览器指纹信息，避免被上游服务识别为代理流量。（参见 [d82e7ee](https://github.com/dext7r/ollama-api-pool/commit/d82e7ee)、[2c89ad3](https://github.com/dext7r/ollama-api-pool/commit/2c89ad3)、[0913c24](https://github.com/dext7r/ollama-api-pool/commit/0913c24)）
- **随机 User-Agent 池**：添加 7 种不同浏览器 UA 随机轮换，用于所有上游 API 请求（包括 GitHub API、Ollama、OpenRouter），进一步降低检测风险。（参见 [8872077](https://github.com/dext7r/ollama-api-pool/commit/8872077)、[99b2b1b](https://github.com/dext7r/ollama-api-pool/commit/99b2b1b)）
- **项目文档增强**：项目页面支持切换查看多个 Markdown 文档（README、API_PARAMETERS、CONFIGURATION、PROVIDER_TOGGLE 等），文档实时同步 GitHub 仓库并缓存 10 分钟。（参见 [e383bcf](https://github.com/dext7r/ollama-api-pool/commit/e383bcf)）
- **API 参数文档**：新增 `API_PARAMETERS.md` 详细说明所有 OpenAI 兼容参数、透传机制和防封禁策略。（参见 [2c89ad3](https://github.com/dext7r/ollama-api-pool/commit/2c89ad3)）
- **Provider 控制文档**：新增 `PROVIDER_TOGGLE.md` 完整指南，包含 4 种使用场景、环境变量配置、健康检查说明和常见问题解答。（参见 [8eefa44](https://github.com/dext7r/ollama-api-pool/commit/8eefa44)）

### Changed
- **健康检查增强**：`/health` 接口新增 `providers` 字段，显示每个 Provider 的启用状态和配置情况。（参见 [8eefa44](https://github.com/dext7r/ollama-api-pool/commit/8eefa44)）
- **请求头兼容性**：支持非标准 `HTTP-Referer` 头（如 Cherry Studio 客户端），自动转换为标准 `Referer` 头转发至上游。（参见 [0913c24](https://github.com/dext7r/ollama-api-pool/commit/0913c24)）
- **GitHub Actions 优化**：API 测试失败改为非阻塞警告，不影响部署流程。（参见 [2c89ad3](https://github.com/dext7r/ollama-api-pool/commit/2c89ad3)）
- **文档全面更新**：README、README_EN、CONFIGURATION、PROJECT_SUMMARY 全面更新，添加 Provider 控制和防封禁机制说明。（参见 [b6950b2](https://github.com/dext7r/ollama-api-pool/commit/b6950b2)）

### Fixed
- **User-Agent 缺失**：修复上游 API 请求未转发客户端 User-Agent 导致账号频繁被封的问题。（参见 [d82e7ee](https://github.com/dext7r/ollama-api-pool/commit/d82e7ee)）
- **请求头遗漏**：补全 Accept、X-Title 等关键请求头的透传。（参见 [0913c24](https://github.com/dext7r/ollama-api-pool/commit/0913c24)）

## [3.0.0] - 2025-10-12

### Added
- **用户认证体系**：新增邮箱注册、验证码登录和密码登录功能，支持用户自助申请 API 访问凭证。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）
- **用户仪表盘**：新增独立用户控制台 (`/user`)，支持个人信息查看、每日签到续期、签到历史查询。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）
- **邮件验证系统**：集成 push-all-in-one 邮件推送服务，提供精美的 HTML 验证码邮件模板。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）
- **项目推荐卡片**：首页和登录页添加相关项目推荐（HiveChat AI、HTML2Web、Plan University Email Server、Plan University 公益站），所有外链包含 `?source=` 参数追踪来源。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）
- **系统公告板块**：首页新增系统公告展示区，支持功能更新和性能优化公告。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）
- **实时统计增强**：新增"今日请求"和"成功率"实时统计卡片，提升数据可见性。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）
- **管理员用户管理**：新增用户管理面板，支持批量启用/禁用、延长凭证有效期、重置密钥、查看签到记录等操作。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）

### Changed
- **登录页面重构**：优化登录表单布局，改进服务提供方选择器和"记住我"复选框的视觉协调性，提供验证码/密码双模式登录切换。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）
- **Turnstile 集成**：在注册、登录、发送验证码等敏感操作中集成 Cloudflare Turnstile 人机验证，增强安全防护。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）
- **数据库扩展**：PostgreSQL 新增用户表 (`users`)、邮箱验证码表 (`email_verification_codes`)、签到记录表 (`user_signins`)，完善用户体系存储。（参见 [6ea60a4](https://github.com/dext7r/ollama-api-pool/commit/6ea60a4)）
- **邮件模板优化**：修正验证邮件中的项目链接地址为正确域名 `https://ollama-api-pool.h7ml.workers.dev`，添加相关服务推荐板块。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）

### Fixed
- **注册验证码问题**：修复注册表单点击"获取验证码"时错误提示"该邮箱未注册，无法发送登录验证码"的 bug，改为动态识别 `purpose` 参数（`login` vs `register`）。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）
- **错误提示优化**：当用户在登录表单误填未注册邮箱时，增加友好提示引导切换到"快速注册"标签。（参见 [0e3dd6a](https://github.com/dext7r/ollama-api-pool/commit/0e3dd6a)）

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

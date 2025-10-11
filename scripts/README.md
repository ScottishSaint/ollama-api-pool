# API 接口测试

这个目录包含了 Ollama API Pool 的自动化接口测试脚本。

## 文件说明

- `api-test.js`: 主测试脚本，包含所有 API 接口测试用例
- `.github/workflows/api-test.yml`: GitHub Actions 工作流配置

## 本地运行测试

### 前提条件

- Node.js 18+
- 有效的 API Token（用于需要授权的测试）

### 运行命令

```bash
# 基础测试（不需要 Token）
node scripts/api-test.js

# 完整测试（需要 Token）
API_TOKEN=your-token-here node scripts/api-test.js

# 指定 API 地址
API_BASE_URL=https://your-api.example.com API_TOKEN=your-token node scripts/api-test.js
```

## 测试用例

| 测试名称 | 描述 | 需要授权 |
|---------|------|---------|
| 获取模型列表 | 测试 `GET /v1/models` 接口 | ❌ |
| 获取测试模板 | 测试 `GET /api/test-templates` 接口 | ❌ |
| 获取公开统计数据 | 测试 `GET /admin/public-stats` 接口，验证全局统计、热门模型、小时趋势等数据 | ❌ |
| Chat Completion (非流式) | 测试非流式聊天完成 | ✅ |
| Chat Completion (流式) | 测试流式聊天完成 | ✅ |
| 使用模板进行对话测试 | 使用预定义模板测试聊天场景 | ✅ |
| 错误处理 - 无效 Token | 测试错误处理机制 | ❌ |

## GitHub Actions

测试会在以下情况自动触发：

1. **Push 到主分支**：每次推送到 `main` 或 `openrouter` 分支时
2. **Pull Request**：创建或更新 PR 时
3. **定时任务**：每天北京时间 08:00 自动运行
4. **手动触发**：在 Actions 页面手动运行

### 环境变量配置

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中配置：

- `API_TOKEN`: API 访问令牌（必需）
- `API_BASE_URL`: API 基础地址（可选，默认为 https://ollama-api-pool.h7ml.workers.dev）

### 测试报告

测试完成后会：

1. **PR 评论**：在 Pull Request 中自动添加或更新测试报告评论
2. **Commit 评论**：在 Push 时将测试报告添加到 commit 评论
3. **Artifacts**：上传完整的测试报告文件，保留 30 天

## 测试报告格式

测试报告包含：

- 📊 **测试统计**：总数、通过数、失败数、通过率
- 📋 **测试详情**：每个测试的状态、耗时和错误信息
- ⚠️ **失败提醒**：测试失败时的注意事项

## 故障排查

### 常见问题

**Q: 测试失败，提示 "未设置 API_TOKEN"**
A: 需要在 GitHub Secrets 中配置 `API_TOKEN`，或在本地运行时通过环境变量传入。

**Q: 模型列表为空**
A: 检查 API 服务是否正常运行，是否有可用的模型。

**Q: 流式测试失败**
A: 确认 API 服务支持流式响应，检查网络连接是否稳定。

## 扩展测试

要添加新的测试用例：

1. 在 `scripts/api-test.js` 中添加测试函数
2. 在 `main()` 函数中调用新测试
3. 确保测试有适当的错误处理和结果验证

示例：

```javascript
async function testNewFeature() {
  const response = await fetch(`${API_BASE_URL}/new-endpoint`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  // 验证响应
  if (!data.someField) {
    throw new Error('缺少必需字段');
  }

  log(`  └─ 测试数据: ${data.someField}`, 'info');
}

// 在 main() 中添加
await runTest('新功能测试', testNewFeature);
```

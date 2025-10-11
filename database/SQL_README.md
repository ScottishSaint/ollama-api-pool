# 数据库 SQL 文件说明

本目录包含用于初始化和维护数据库的 SQL 文件。

## 📁 文件列表

### `schema.sql` - 完整数据库架构
包含 Ollama 和 OpenRouter 的所有表结构、索引和初始化数据。

**适用场景**：全新安装时使用

```bash
# 在 Supabase SQL Editor 中执行全部内容
```

### `ollama_model_tables.sql` - Ollama 模型统计表
仅包含 Ollama 的 `model_stats` 和 `model_hourly` 表。

**适用场景**：已有基础表，需要补充模型统计功能

```sql
-- 执行此文件
\i ollama_model_tables.sql
```

### `openrouter_model_tables.sql` - OpenRouter 模型统计表
仅包含 OpenRouter 的 `model_stats` 和 `model_hourly` 表。

**适用场景**：已有基础表，需要补充模型统计功能

```sql
-- 执行此文件
\i openrouter_model_tables.sql
```

## 🚀 使用指南

### 场景 1：全新安装

直接执行 `schema.sql`：

```sql
-- 在 Supabase SQL Editor 中执行
-- 复制 schema.sql 的全部内容并运行
```

### 场景 2：只添加 OpenRouter 支持

如果你已经有 Ollama 的表，只需添加 OpenRouter：

1. 执行基础表创建：
```sql
-- OpenRouter API Keys 主表
CREATE TABLE IF NOT EXISTS openrouter_api_keys (...);

-- OpenRouter API Keys 统计表
CREATE TABLE IF NOT EXISTS openrouter_api_key_stats (...);

-- OpenRouter 客户端 Tokens 表
CREATE TABLE IF NOT EXISTS openrouter_api_client_tokens (...);

-- OpenRouter 全局统计表
CREATE TABLE IF NOT EXISTS openrouter_api_global_stats (...);
```

2. 执行模型统计表：
```sql
-- 执行 openrouter_model_tables.sql
```

### 场景 3：补充模型统计表

如果你已经有基础表，但缺少模型统计表：

```sql
-- 对于 Ollama
\i ollama_model_tables.sql

-- 对于 OpenRouter
\i openrouter_model_tables.sql
```

## ❗ 常见错误

### Error: column "provider" does not exist

**原因**：表不存在，但尝试创建索引

**解决**：

1. 先创建表，再创建索引
2. 使用对应的补充 SQL 文件

### Error: relation does not exist

**原因**：引用的表尚未创建

**解决**：

1. 检查依赖关系（如外键约束）
2. 按顺序执行 SQL

## 🔍 验证安装

执行以下 SQL 检查表是否创建成功：

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%_api_%'
ORDER BY table_name;

-- 应该看到以下表：
-- ollama_api_keys
-- ollama_api_key_stats
-- ollama_api_client_tokens
-- ollama_api_global_stats
-- ollama_api_model_stats
-- ollama_api_model_hourly
-- openrouter_api_keys
-- openrouter_api_key_stats
-- openrouter_api_client_tokens
-- openrouter_api_global_stats
-- openrouter_api_model_stats
-- openrouter_api_model_hourly
```

## 🧹 清理数据

如需重置数据库：

```sql
-- ⚠️ 警告：将删除所有数据！

-- 删除 Ollama 表
DROP TABLE IF EXISTS ollama_api_model_hourly CASCADE;
DROP TABLE IF EXISTS ollama_api_model_stats CASCADE;
DROP TABLE IF EXISTS ollama_api_global_stats CASCADE;
DROP TABLE IF EXISTS ollama_api_client_tokens CASCADE;
DROP TABLE IF NOT EXISTS ollama_api_key_stats CASCADE;
DROP TABLE IF EXISTS ollama_api_keys CASCADE;

-- 删除 OpenRouter 表
DROP TABLE IF EXISTS openrouter_api_model_hourly CASCADE;
DROP TABLE IF EXISTS openrouter_api_model_stats CASCADE;
DROP TABLE IF EXISTS openrouter_api_global_stats CASCADE;
DROP TABLE IF EXISTS openrouter_api_client_tokens CASCADE;
DROP TABLE IF EXISTS openrouter_api_key_stats CASCADE;
DROP TABLE IF EXISTS openrouter_api_keys CASCADE;
```

然后重新执行 `schema.sql`。

## 📚 更多信息

- [数据库设置指南](./README.md)
- [项目文档](../README.md)
- [Supabase 文档](https://supabase.com/docs)

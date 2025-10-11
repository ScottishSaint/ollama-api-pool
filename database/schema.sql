-- Ollama API Pool - Database Schema
-- 支持 Ollama 和 OpenRouter 两个 Provider
-- 表前缀：ollama_api_* 和 openrouter_api_*

-- ==========================================
-- Ollama Provider Tables
-- ==========================================

-- Ollama API Keys 主表
CREATE TABLE IF NOT EXISTS ollama_api_keys (
  api_key TEXT PRIMARY KEY,
  username TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  failed_until TIMESTAMPTZ,
  disabled_until TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0
);

-- Ollama API Keys 统计表
CREATE TABLE IF NOT EXISTS ollama_api_key_stats (
  api_key TEXT PRIMARY KEY REFERENCES ollama_api_keys(api_key) ON DELETE CASCADE,
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  last_used TIMESTAMPTZ,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ollama 客户端 Tokens 表
CREATE TABLE IF NOT EXISTS ollama_api_client_tokens (
  token TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  request_count BIGINT DEFAULT 0
);

-- Ollama 全局统计表
CREATE TABLE IF NOT EXISTS ollama_api_global_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ollama 模型统计表
CREATE TABLE IF NOT EXISTS ollama_api_model_stats (
  id SERIAL PRIMARY KEY,
  provider TEXT DEFAULT 'ollama',
  model TEXT NOT NULL,
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, model)
);

-- Ollama 小时级模型统计（用于趋势图表）
CREATE TABLE IF NOT EXISTS ollama_api_model_hourly (
  id SERIAL PRIMARY KEY,
  provider TEXT DEFAULT 'ollama',
  model TEXT NOT NULL,
  hour TIMESTAMPTZ NOT NULL,
  requests BIGINT DEFAULT 0,
  success BIGINT DEFAULT 0,
  failure BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, model, hour)
);

-- ==========================================
-- OpenRouter Provider Tables
-- ==========================================

-- OpenRouter API Keys 主表
CREATE TABLE IF NOT EXISTS openrouter_api_keys (
  api_key TEXT PRIMARY KEY,
  username TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  failed_until TIMESTAMPTZ,
  disabled_until TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0
);

-- OpenRouter API Keys 统计表
CREATE TABLE IF NOT EXISTS openrouter_api_key_stats (
  api_key TEXT PRIMARY KEY REFERENCES openrouter_api_keys(api_key) ON DELETE CASCADE,
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  last_used TIMESTAMPTZ,
  last_success TIMESTAMPTZ,
  last_failure TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OpenRouter 客户端 Tokens 表
CREATE TABLE IF NOT EXISTS openrouter_api_client_tokens (
  token TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  request_count BIGINT DEFAULT 0
);

-- OpenRouter 全局统计表
CREATE TABLE IF NOT EXISTS openrouter_api_global_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OpenRouter 模型统计表
CREATE TABLE IF NOT EXISTS openrouter_api_model_stats (
  id SERIAL PRIMARY KEY,
  provider TEXT DEFAULT 'openrouter',
  model TEXT NOT NULL,
  total_requests BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, model)
);

-- OpenRouter 小时级模型统计（用于趋势图表）
CREATE TABLE IF NOT EXISTS openrouter_api_model_hourly (
  id SERIAL PRIMARY KEY,
  provider TEXT DEFAULT 'openrouter',
  model TEXT NOT NULL,
  hour TIMESTAMPTZ NOT NULL,
  requests BIGINT DEFAULT 0,
  success BIGINT DEFAULT 0,
  failure BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, model, hour)
);

-- ==========================================
-- 索引优化
-- ==========================================

-- Ollama 索引
CREATE INDEX IF NOT EXISTS idx_ollama_keys_status ON ollama_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_ollama_keys_created ON ollama_api_keys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ollama_key_stats_last_used ON ollama_api_key_stats(last_used DESC);
CREATE INDEX IF NOT EXISTS idx_ollama_model_stats_provider_model ON ollama_api_model_stats(provider, model);
CREATE INDEX IF NOT EXISTS idx_ollama_model_hourly_time ON ollama_api_model_hourly(hour DESC);
CREATE INDEX IF NOT EXISTS idx_ollama_model_hourly_provider ON ollama_api_model_hourly(provider, model, hour);

-- OpenRouter 索引
CREATE INDEX IF NOT EXISTS idx_openrouter_keys_status ON openrouter_api_keys(status);
CREATE INDEX IF NOT EXISTS idx_openrouter_keys_created ON openrouter_api_keys(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_openrouter_key_stats_last_used ON openrouter_api_key_stats(last_used DESC);
CREATE INDEX IF NOT EXISTS idx_openrouter_model_stats_provider_model ON openrouter_api_model_stats(provider, model);
CREATE INDEX IF NOT EXISTS idx_openrouter_model_hourly_time ON openrouter_api_model_hourly(hour DESC);
CREATE INDEX IF NOT EXISTS idx_openrouter_model_hourly_provider ON openrouter_api_model_hourly(provider, model, hour);

-- ==========================================
-- 初始化全局统计记录
-- ==========================================

-- 插入 Ollama 全局统计初始记录
INSERT INTO ollama_api_global_stats (id, total_requests, success_count, failure_count)
VALUES ('global', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 插入 OpenRouter 全局统计初始记录
INSERT INTO openrouter_api_global_stats (id, total_requests, success_count, failure_count)
VALUES ('global', 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

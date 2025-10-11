-- Ollama Model Statistics Tables
-- 补充 model_stats 和 model_hourly 表

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

-- Ollama 小时级模型统计表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ollama_model_stats_provider_model
  ON ollama_api_model_stats(provider, model);

CREATE INDEX IF NOT EXISTS idx_ollama_model_hourly_time
  ON ollama_api_model_hourly(hour DESC);

CREATE INDEX IF NOT EXISTS idx_ollama_model_hourly_provider
  ON ollama_api_model_hourly(provider, model, hour);

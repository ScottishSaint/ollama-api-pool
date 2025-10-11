-- OpenRouter Model Statistics Tables
-- 补充 model_stats 和 model_hourly 表

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

-- OpenRouter 小时级模型统计表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_openrouter_model_stats_provider_model
  ON openrouter_api_model_stats(provider, model);

CREATE INDEX IF NOT EXISTS idx_openrouter_model_hourly_time
  ON openrouter_api_model_hourly(hour DESC);

CREATE INDEX IF NOT EXISTS idx_openrouter_model_hourly_provider
  ON openrouter_api_model_hourly(provider, model, hour);

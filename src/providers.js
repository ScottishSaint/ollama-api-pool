/**
 * 提供方配置中心
 * 统一管理各上游服务的表前缀、默认模型与请求头。
 */

export const PROVIDERS = {
  ollama: {
    id: 'ollama',
    label: 'Ollama',
    tablePrefix: 'ollama_api',
    upstream: {
      chatCompletions: 'https://ollama.com/v1/chat/completions',
      models: 'https://ollama.com/api/tags'
    },
    defaultModel: 'kimi-k2:1t'
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    tablePrefix: 'openrouter_api',
    upstream: {
      chatCompletions: 'https://openrouter.ai/api/v1/chat/completions',
      models: 'https://openrouter.ai/api/v1/models'
    },
    defaultModel: 'gpt-4o-mini'
  }
};

export function normalizeProvider(provider) {
  if (!provider) return 'ollama';
  const key = String(provider).trim().toLowerCase();
  return PROVIDERS[key] ? key : 'ollama';
}

export function getProviderConfig(provider) {
  const normalized = normalizeProvider(provider);
  return PROVIDERS[normalized];
}

export function getTablePrefix(provider) {
  return getProviderConfig(provider).tablePrefix;
}

export function getDefaultProbeModel(provider) {
  return getProviderConfig(provider).defaultModel;
}

export function buildUpstreamHeaders(provider, apiKey, env, extraHeaders = {}) {
  const normalized = normalizeProvider(provider);
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...extraHeaders
  };

  if (normalized === 'openrouter') {
    const referer = env?.OPENROUTER_APP_URL || env?.PUBLIC_SITE_URL || 'https://openrouter.ai';
    const title = env?.OPENROUTER_APP_TITLE || 'OpenRouter API Pool';
    headers['HTTP-Referer'] = referer;
    headers['X-Title'] = title;
    if (!headers.Accept) {
      headers.Accept = 'application/json';
    }
  }

  return headers;
}

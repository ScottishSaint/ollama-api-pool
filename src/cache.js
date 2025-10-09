/**
 * 智能缓存模块
 * 提供多层缓存策略以提升性能
 */

// 缓存配置
const CACHE_CONFIG = {
  // 响应缓存（非流式请求）
  response: {
    enabled: true,
    ttl: 300, // 5分钟
    maxSize: 1000 // 最大缓存条目数
  },
  // 模型列表缓存
  models: {
    enabled: true,
    ttl: 3600 // 1小时
  },
  // API Key 列表缓存
  apiKeys: {
    enabled: true,
    ttl: 60 // 1分钟
  },
  // 统计数据缓存
  stats: {
    enabled: true,
    ttl: 60 // 60秒（KV 最小 TTL 要求）
  }
};

/**
 * 生成缓存键（使用 Web Crypto API）
 */
async function generateCacheKey(prefix, data) {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `cache:${prefix}:${hashHex.substring(0, 16)}`;
}

/**
 * 缓存聊天响应（仅非流式请求）
 */
export async function getCachedResponse(env, requestBody) {
  if (!CACHE_CONFIG.response.enabled || requestBody.stream === true) {
    return null;
  }

  const cacheKey = await generateCacheKey('response', {
    model: requestBody.model,
    messages: requestBody.messages,
    temperature: requestBody.temperature || 1.0,
    max_tokens: requestBody.max_tokens
  });

  const cached = await env.API_KEYS.get(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    // 检查是否过期
    if (Date.now() - data.timestamp < CACHE_CONFIG.response.ttl * 1000) {
      return data.response;
    }
  }

  return null;
}

/**
 * 设置响应缓存
 */
export async function setCachedResponse(env, requestBody, response) {
  if (!CACHE_CONFIG.response.enabled || requestBody.stream === true) {
    return;
  }

  const cacheKey = await generateCacheKey('response', {
    model: requestBody.model,
    messages: requestBody.messages,
    temperature: requestBody.temperature || 1.0,
    max_tokens: requestBody.max_tokens
  });

  const cacheData = {
    response,
    timestamp: Date.now()
  };

  await env.API_KEYS.put(cacheKey, JSON.stringify(cacheData), {
    expirationTtl: CACHE_CONFIG.response.ttl
  });
}

/**
 * 缓存模型列表
 */
export async function getCachedModels(env) {
  if (!CACHE_CONFIG.models.enabled) {
    return null;
  }

  const cached = await env.API_KEYS.get('cache:models:list');
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_CONFIG.models.ttl * 1000) {
      return data.models;
    }
  }

  return null;
}

/**
 * 设置模型列表缓存
 */
export async function setCachedModels(env, models) {
  if (!CACHE_CONFIG.models.enabled) {
    return;
  }

  const cacheData = {
    models,
    timestamp: Date.now()
  };

  await env.API_KEYS.put('cache:models:list', JSON.stringify(cacheData), {
    expirationTtl: CACHE_CONFIG.models.ttl
  });
}

/**
 * 缓存 API Keys 列表
 */
export async function getCachedApiKeys(env) {
  if (!CACHE_CONFIG.apiKeys.enabled) {
    return null;
  }

  const cached = await env.API_KEYS.get('cache:apikeys:list');
  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_CONFIG.apiKeys.ttl * 1000) {
      return data.keys;
    }
  }

  return null;
}

/**
 * 设置 API Keys 列表缓存
 */
export async function setCachedApiKeys(env, keys) {
  if (!CACHE_CONFIG.apiKeys.enabled) {
    return;
  }

  const cacheData = {
    keys,
    timestamp: Date.now()
  };

  await env.API_KEYS.put('cache:apikeys:list', JSON.stringify(cacheData), {
    expirationTtl: CACHE_CONFIG.apiKeys.ttl
  });
}

/**
 * 缓存统计数据
 */
export async function getCachedStats(env, statsType) {
  if (!CACHE_CONFIG.stats.enabled) {
    return null;
  }

  const cacheKey = `cache:stats:${statsType}`;
  const cached = await env.API_KEYS.get(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < CACHE_CONFIG.stats.ttl * 1000) {
      return data.stats;
    }
  }

  return null;
}

/**
 * 设置统计数据缓存
 */
export async function setCachedStats(env, statsType, stats) {
  if (!CACHE_CONFIG.stats.enabled) {
    return;
  }

  const cacheKey = `cache:stats:${statsType}`;
  const cacheData = {
    stats,
    timestamp: Date.now()
  };

  await env.API_KEYS.put(cacheKey, JSON.stringify(cacheData), {
    expirationTtl: CACHE_CONFIG.stats.ttl
  });
}

/**
 * 使缓存失效
 */
export async function invalidateCache(env, pattern) {
  const list = await env.API_KEYS.list({ prefix: `cache:${pattern}` });

  const deletePromises = list.keys.map(key =>
    env.API_KEYS.delete(key.name)
  );

  await Promise.all(deletePromises);
}

/**
 * 清除所有缓存
 */
export async function clearAllCache(env) {
  await invalidateCache(env, '');
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats(env) {
  const list = await env.API_KEYS.list({ prefix: 'cache:' });

  const stats = {
    totalEntries: list.keys.length,
    byType: {
      response: 0,
      models: 0,
      apiKeys: 0,
      stats: 0,
      other: 0
    }
  };

  for (const key of list.keys) {
    const name = key.name;
    if (name.startsWith('cache:response:')) stats.byType.response++;
    else if (name.startsWith('cache:models:')) stats.byType.models++;
    else if (name.startsWith('cache:apikeys:')) stats.byType.apiKeys++;
    else if (name.startsWith('cache:stats:')) stats.byType.stats++;
    else stats.byType.other++;
  }

  return stats;
}

/**
 * 使用缓存包装器
 */
export async function withCache(env, cacheKey, ttl, fetchFn) {
  // 尝试从缓存获取
  const cached = await env.API_KEYS.get(cacheKey);

  if (cached) {
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp < ttl * 1000) {
      return data.value;
    }
  }

  // 缓存未命中，执行获取函数
  const value = await fetchFn();

  // 存入缓存
  const cacheData = {
    value,
    timestamp: Date.now()
  };

  await env.API_KEYS.put(cacheKey, JSON.stringify(cacheData), {
    expirationTtl: ttl
  });

  return value;
}

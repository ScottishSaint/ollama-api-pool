/**
 * API Key 管理模块
 * 负责 API Key 的轮询、失败标记、健康检查
 */

import {
  isPostgresEnabled,
  pgAddApiKey,
  pgRemoveApiKey,
  pgImportApiKeys,
  pgListApiKeys,
  pgListActiveApiKeys,
  pgMarkApiKeyFailed,
  pgEnableApiKey,
  pgDisableApiKey,
  pgGetKeyStats,
  pgListKeyStats,
  pgCountApiKeys
} from './postgres';
import { normalizeProvider, getDefaultProbeModel, buildUpstreamHeaders, getProviderConfig } from './providers';

// 生成 API Key 的哈希值（用于 KV Key，避免超过 512 字节限制，KV 模式专用）
export async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getKvKey(provider, key) {
  const normalized = normalizeProvider(provider);
  return normalized === 'ollama' ? key : `${normalized}:${key}`;
}

/**
 * 获取下一个可用的 API Key（简化版：随机选择）
 * 直接从所有 Key 中随机选择一个，不检查状态（性能优先）
 */
export async function getNextApiKey(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);

  if (isPostgresEnabled(env)) {
    const keys = await pgListActiveApiKeys(env, normalized);
    if (!keys || keys.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  try {
    const listKey = getKvKey(normalized, 'api_keys_list');
    const keysData = await env.API_KEYS.get(listKey);
    if (!keysData) {
      return null;
    }

    const keys = JSON.parse(keysData);
    if (!keys || keys.length === 0) {
      return null;
    }

    // 随机选择一个 Key
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  } catch (error) {
    console.error('getNextApiKey error:', error);
    return null;
  }
}

// 标记 API Key 失效 (1小时)
export async function markApiKeyFailed(env, apiKey, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    await pgMarkApiKeyFailed(env, apiKey, 3, 3600, normalized);
    return;
  }

  try {
    const keyHash = await hashApiKey(apiKey);
    await env.API_KEYS.put(getKvKey(normalized, `failed:${keyHash}`), '1', {
      expirationTtl: 3600 // 1小时后自动恢复
    });
  } catch (error) {
    console.error('markApiKeyFailed error:', error);
  }
}

// 添加 API Key
export async function addApiKey(env, apiKey, username = null, ttl = null, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgAddApiKey(env, apiKey, username, ttl, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  const keys = keysData ? JSON.parse(keysData) : [];

  if (!keys.includes(apiKey)) {
    keys.push(apiKey);
    await env.API_KEYS.put(listKey, JSON.stringify(keys));

    // 存储用户名元数据（包含 TTL 和过期时间）
    const metadata = {
      username: username || 'N/A',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    if (ttl && ttl > 0) {
      metadata.ttl = ttl;
      metadata.expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    }

    const keyHash = await hashApiKey(apiKey);
    await env.API_KEYS.put(getKvKey(normalized, `key_metadata:${keyHash}`), JSON.stringify(metadata));

    return true;
  }
  return false;
}

//删除 API Key
export async function removeApiKey(env, apiKey, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgRemoveApiKey(env, apiKey, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  if (!keysData) return false;

  const keys = JSON.parse(keysData);
  const index = keys.indexOf(apiKey);

  if (index > -1) {
    keys.splice(index, 1);
    await env.API_KEYS.put(listKey, JSON.stringify(keys));

    // 删除相关元数据
    const keyHash = await hashApiKey(apiKey);
    await env.API_KEYS.delete(getKvKey(normalized, `key_metadata:${keyHash}`));
    await env.API_KEYS.delete(getKvKey(normalized, `failed:${keyHash}`));
    await env.API_KEYS.delete(getKvKey(normalized, `disabled:${keyHash}`));

    return true;
  }
  return false;
}

// 获取所有 API Key 列表（优化版：批量并行查询）
export async function listApiKeys(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgListApiKeys(env, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  if (!keysData) return [];

  const keys = JSON.parse(keysData);

  // 优化：使用 Promise.all 批量并行查询，减少等待时间
  const keyPromises = keys.map(async (key) => {
    const keyHash = await hashApiKey(key);

    // 并行获取所有相关数据
    const [failed, disabled, metadataStr] = await Promise.all([
      env.API_KEYS.get(getKvKey(normalized, `failed:${keyHash}`)),
      env.API_KEYS.get(getKvKey(normalized, `disabled:${keyHash}`)),
      env.API_KEYS.get(getKvKey(normalized, `key_metadata:${keyHash}`))
    ]);

    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    // 判断状态：disabled > failed > active
    let status = 'active';
    if (disabled) {
      status = 'disabled';
    } else if (failed) {
      status = 'failed';
    }

    // 检查是否过期
    if (metadata.expiresAt) {
      const now = new Date();
      const expiresAt = new Date(metadata.expiresAt);
      if (now > expiresAt) {
        status = 'expired';
      }
    }

    return {
      api_key: key,
      username: metadata.username || 'N/A',
      status,
      created_at: metadata.createdAt || null,
      expires_at: metadata.expiresAt || null
    };
  });

  return await Promise.all(keyPromises);
}

// 批量导入 API Keys
export async function importApiKeys(env, keys, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgImportApiKeys(env, keys, null, null, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  const existingKeys = keysData ? JSON.parse(keysData) : [];

  const newKeys = [...new Set([...existingKeys, ...keys])];
  await env.API_KEYS.put(listKey, JSON.stringify(newKeys));

  return {
    total: newKeys.length,
    added: newKeys.length - existingKeys.length,
    existing: existingKeys.length
  };
}

// 获取 API Key 统计信息
export async function getKeyStats(env, apiKey, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgGetKeyStats(env, apiKey, normalized);
  }

  const keyHash = await hashApiKey(apiKey);
  const statsKey = getKvKey(normalized, `key_stats:${keyHash}`);
  const statsData = await env.API_KEYS.get(statsKey);

  if (!statsData) {
    return {
      apiKey: apiKey.substring(0, 20) + '...',
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      lastUsed: null,
      status: 'unknown'
    };
  }

  const stats = JSON.parse(statsData);
  const failed = await env.API_KEYS.get(getKvKey(normalized, `failed:${keyHash}`));

  return {
    apiKey: apiKey.substring(0, 20) + '...',
    fullKey: apiKey,
    ...stats,
    status: failed ? 'disabled' : 'active',
    disabledReason: failed === 'auto-disabled' ? 'auto' : failed === 'manual' ? 'manual' : null
  };
}

// 获取所有 API Key 的统计信息
export async function getAllKeyStats(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgListKeyStats(env, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  if (!keysData) return [];

  const keys = JSON.parse(keysData);
  const statsPromises = keys.map(key => getKeyStats(env, key, normalized));

  return await Promise.all(statsPromises);
}

export async function countApiKeys(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    return await pgCountApiKeys(env, normalized);
  }

  const listKey = getKvKey(normalized, 'api_keys_list');
  const keysData = await env.API_KEYS.get(listKey);
  if (!keysData) return 0;

  const keys = JSON.parse(keysData);
  return Array.isArray(keys) ? keys.length : 0;
}

// 手动禁用 API Key
export async function disableApiKey(env, apiKey, duration = 3600, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    await pgDisableApiKey(env, apiKey, duration, normalized);
    return;
  }

  const keyHash = await hashApiKey(apiKey);
  await env.API_KEYS.put(getKvKey(normalized, `disabled:${keyHash}`), 'manual', {
    expirationTtl: duration
  });
}

// 手动启用 API Key
export async function enableApiKey(env, apiKey, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    await pgEnableApiKey(env, apiKey, normalized);
    return;
  }

  const keyHash = await hashApiKey(apiKey);
  await env.API_KEYS.delete(getKvKey(normalized, `disabled:${keyHash}`));
  await env.API_KEYS.delete(getKvKey(normalized, `failed:${keyHash}`));
}

// 健康检查 - 验证 API Key 是否可用
export async function healthCheck(env, apiKey, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  const config = getProviderConfig(normalized);
  const defaultModel = getDefaultProbeModel(normalized);
  const headers = buildUpstreamHeaders(normalized, apiKey, env, { Accept: '*/*' });

  try {
    const response = await fetch(config.upstream.chatCompletions, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: defaultModel,
        messages: [{ role: 'user', content: 'health check' }],
        stream: false
      })
    });

    return {
      healthy: response.ok,
      status: response.status,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// 批量健康检查（优化版：只标记失败的 Key）
export async function healthCheckAll(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  let keys = [];

  if (isPostgresEnabled(env)) {
    const rows = await pgListApiKeys(env, normalized);
    if (Array.isArray(rows)) {
      keys = rows.map(row => row.api_key || row.apiKey).filter(Boolean);
    }
  } else {
    const listKey = getKvKey(normalized, 'api_keys_list');
    const keysData = await env.API_KEYS.get(listKey);
    if (!keysData) return [];
    keys = JSON.parse(keysData);
  }

  const results = [];

  for (const key of keys) {
    const health = await healthCheck(env, key, normalized);
    results.push({
      apiKey: key.substring(0, 20) + '...',
      fullKey: key,
      ...health
    });

    if (!health.healthy) {
      await markApiKeyFailed(env, key, normalized);
    }
  }

  return results;
}

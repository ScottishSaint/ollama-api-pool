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

// 生成 API Key 的哈希值（用于 KV Key，避免超过 512 字节限制，KV 模式专用）
export async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 获取下一个可用的 API Key（简化版：随机选择）
 * 直接从所有 Key 中随机选择一个，不检查状态（性能优先）
 */
export async function getNextApiKey(env) {
  if (isPostgresEnabled(env)) {
    const keys = await pgListActiveApiKeys(env);
    if (!keys || keys.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * keys.length);
    return keys[randomIndex];
  }

  try {
    const keysData = await env.API_KEYS.get('api_keys_list');
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
export async function markApiKeyFailed(env, apiKey) {
  if (isPostgresEnabled(env)) {
    await pgMarkApiKeyFailed(env, apiKey);
    return;
  }

  try {
    const keyHash = await hashApiKey(apiKey);
    await env.API_KEYS.put(`failed:${keyHash}`, '1', {
      expirationTtl: 3600 // 1小时后自动恢复
    });
  } catch (error) {
    console.error('markApiKeyFailed error:', error);
  }
}

// 添加 API Key
export async function addApiKey(env, apiKey, username = null, ttl = null) {
  if (isPostgresEnabled(env)) {
    return await pgAddApiKey(env, apiKey, username, ttl);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  const keys = keysData ? JSON.parse(keysData) : [];

  if (!keys.includes(apiKey)) {
    keys.push(apiKey);
    await env.API_KEYS.put('api_keys_list', JSON.stringify(keys));

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
    await env.API_KEYS.put(`key_metadata:${keyHash}`, JSON.stringify(metadata));

    return true;
  }
  return false;
}

//删除 API Key
export async function removeApiKey(env, apiKey) {
  if (isPostgresEnabled(env)) {
    return await pgRemoveApiKey(env, apiKey);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return false;

  const keys = JSON.parse(keysData);
  const index = keys.indexOf(apiKey);

  if (index > -1) {
    keys.splice(index, 1);
    await env.API_KEYS.put('api_keys_list', JSON.stringify(keys));

    // 删除相关元数据
    const keyHash = await hashApiKey(apiKey);
    await env.API_KEYS.delete(`key_metadata:${keyHash}`);
    await env.API_KEYS.delete(`failed:${keyHash}`);
    await env.API_KEYS.delete(`disabled:${keyHash}`);

    return true;
  }
  return false;
}

// 获取所有 API Key 列表（优化版：批量并行查询）
export async function listApiKeys(env) {
  if (isPostgresEnabled(env)) {
    return await pgListApiKeys(env);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return [];

  const keys = JSON.parse(keysData);

  // 优化：使用 Promise.all 批量并行查询，减少等待时间
  const keyPromises = keys.map(async (key) => {
    const keyHash = await hashApiKey(key);

    // 并行获取所有相关数据
    const [failed, disabled, metadataStr] = await Promise.all([
      env.API_KEYS.get(`failed:${keyHash}`),
      env.API_KEYS.get(`disabled:${keyHash}`),
      env.API_KEYS.get(`key_metadata:${keyHash}`)
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
export async function importApiKeys(env, keys) {
  if (isPostgresEnabled(env)) {
    return await pgImportApiKeys(env, keys);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  const existingKeys = keysData ? JSON.parse(keysData) : [];

  const newKeys = [...new Set([...existingKeys, ...keys])];
  await env.API_KEYS.put('api_keys_list', JSON.stringify(newKeys));

  return {
    total: newKeys.length,
    added: newKeys.length - existingKeys.length,
    existing: existingKeys.length
  };
}

// 获取 API Key 统计信息
export async function getKeyStats(env, apiKey) {
  if (isPostgresEnabled(env)) {
    return await pgGetKeyStats(env, apiKey);
  }

  const keyHash = await hashApiKey(apiKey);
  const statsKey = `key_stats:${keyHash}`;
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
  const failed = await env.API_KEYS.get(`failed:${keyHash}`);

  return {
    apiKey: apiKey.substring(0, 20) + '...',
    fullKey: apiKey,
    ...stats,
    status: failed ? 'disabled' : 'active',
    disabledReason: failed === 'auto-disabled' ? 'auto' : failed === 'manual' ? 'manual' : null
  };
}

// 获取所有 API Key 的统计信息
export async function getAllKeyStats(env) {
  if (isPostgresEnabled(env)) {
    return await pgListKeyStats(env);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return [];

  const keys = JSON.parse(keysData);
  const statsPromises = keys.map(key => getKeyStats(env, key));

  return await Promise.all(statsPromises);
}

export async function countApiKeys(env) {
  if (isPostgresEnabled(env)) {
    return await pgCountApiKeys(env);
  }

  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return 0;

  const keys = JSON.parse(keysData);
  return Array.isArray(keys) ? keys.length : 0;
}

// 手动禁用 API Key
export async function disableApiKey(env, apiKey, duration = 3600) {
  if (isPostgresEnabled(env)) {
    await pgDisableApiKey(env, apiKey, duration);
    return;
  }

  const keyHash = await hashApiKey(apiKey);
  await env.API_KEYS.put(`disabled:${keyHash}`, 'manual', {
    expirationTtl: duration
  });
}

// 手动启用 API Key
export async function enableApiKey(env, apiKey) {
  if (isPostgresEnabled(env)) {
    await pgEnableApiKey(env, apiKey);
    return;
  }

  const keyHash = await hashApiKey(apiKey);
  await env.API_KEYS.delete(`disabled:${keyHash}`);
  await env.API_KEYS.delete(`failed:${keyHash}`);
}

// 健康检查 - 验证 API Key 是否可用
export async function healthCheck(env, apiKey) {
  try {
    const response = await fetch('https://ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kimi-k2:1t',
        messages: [{ role: 'user', content: 'test' }],
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
export async function healthCheckAll(env) {
  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return [];

  const keys = JSON.parse(keysData);
  const results = [];

  for (const key of keys) {
    const health = await healthCheck(env, key);
    results.push({
      apiKey: key.substring(0, 20) + '...',
      fullKey: key,
      ...health
    });

    // 只在失败时写入 KV，成功时不操作（节省 KV 写入）
    if (!health.healthy) {
      await markApiKeyFailed(env, key);
    }
    // 移除自动启用逻辑，减少 KV 写入
    // 如需启用，请手动调用 enableApiKey
  }

  return results;
}

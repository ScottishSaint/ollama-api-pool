/**
 * 管理后台 API 模块
 */

import { errorResponse, jsonResponse, isKvStorageEnabled } from './utils';
import {
  addApiKey, removeApiKey, listApiKeys, importApiKeys,
  getAllKeyStats, disableApiKey, enableApiKey, healthCheckAll,
  hashApiKey, countApiKeys
} from './keyManager';
import { createClientToken, listClientTokens, deleteClientToken } from './auth';
import {
  getCachedStats, setCachedStats, invalidateCache, clearAllCache, getCacheStats
} from './cache';
import { isRedisEnabled, redisGet, redisScanPattern } from './redis';
import { isPostgresEnabled, pgImportApiAccountEntries, pgGetGlobalStats, pgListModelStats, pgGetModelHourlyAggregated, pgGetRecentTopModels } from './postgres';

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // 公开统计 API（无需鉴权）
  if (path === '/admin/public-stats' && request.method === 'GET') {
    const stats = await getPublicStats(env);
    return jsonResponse(stats);
  }

  // 验证管理员权限
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || authHeader !== `Bearer ${env.ADMIN_TOKEN}`) {
    return errorResponse('Unauthorized', 401);
  }

  // 路由分发
  if (path === '/admin/api-keys' && request.method === 'GET') {
    // 获取 API Key 列表（优化版：支持分页，避免一次加载所有）
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const pageSize = parseInt(url.searchParams.get('pageSize')) || 50; // 默认每页50个

    const result = await listApiKeysPaginated(env, page, pageSize);
    return jsonResponse(result);

  } else if (path === '/admin/api-keys' && request.method === 'POST') {
    // 添加 API Key
    const { username, api_key, apiKey, ttl } = await request.json();
    const key = api_key || apiKey;

    if (!key) {
      return errorResponse('API Key is required', 400);
    }

    const added = await addApiKey(env, key, username, ttl);
    return jsonResponse({ success: added, message: added ? 'Added' : 'Already exists' });

  } else if (path === '/admin/api-keys' && request.method === 'DELETE') {
    // 删除单个或批量删除 API Keys
    const body = await request.json();

    if (body.apiKeys && Array.isArray(body.apiKeys)) {
      // 批量删除
      const result = await batchRemoveApiKeys(env, body.apiKeys);
      return jsonResponse(result);
    } else if (body.apiKey) {
      // 单个删除
      const removed = await removeApiKey(env, body.apiKey);
      return jsonResponse({ success: removed });
    } else {
      return errorResponse('Missing apiKey or apiKeys', 400);
    }

  } else if (path === '/admin/api-keys/import' && request.method === 'POST') {
    // 批量导入 API Keys
    const { keys } = await request.json();
    const result = await importApiKeys(env, keys);
    return jsonResponse(result);

  } else if (path === '/admin/api-keys/import-from-txt' && request.method === 'POST') {
    // 从 ollama.txt 格式导入
    const { content } = await request.json();
    const keys = parseOllamaTxt(content);
    const result = await importApiKeys(env, keys);
    return jsonResponse(result);

  } else if (path === '/admin/api-keys/import-with-validation' && request.method === 'POST') {
    // 逐行导入并验证 API Keys
    const { content } = await request.json();
    const result = await importAndValidateKeys(env, content);
    return jsonResponse(result);

  } else if (path === '/admin/tokens' && request.method === 'GET') {
    // 获取客户端 Token 列表
    const tokens = await listClientTokens(env);
    return jsonResponse({ tokens });

  } else if (path === '/admin/tokens' && request.method === 'POST') {
    // 创建客户端 Token
    const { name, expiresIn } = await request.json();
    const token = await createClientToken(env, name, expiresIn);
    return jsonResponse(token);

  } else if (path === '/admin/tokens' && request.method === 'DELETE') {
    // 删除客户端 Token
    const { token } = await request.json();
    await deleteClientToken(env, token);
    return jsonResponse({ success: true });

  } else if (path === '/admin/stats' && request.method === 'GET') {
    // 获取统计信息
    const stats = await getStats(env);
    return jsonResponse(stats);

  } else if (path === '/admin/keys/stats' && request.method === 'GET') {
    // 获取所有 API Key 的详细统计
    const keyStats = await getAllKeyStats(env);
    return jsonResponse({ stats: keyStats });

  } else if (path === '/admin/keys/enable' && request.method === 'POST') {
    // 手动启用 API Key
    const { apiKey } = await request.json();
    await enableApiKey(env, apiKey);
    return jsonResponse({ success: true, message: 'API Key enabled' });

  } else if (path === '/admin/keys/disable' && request.method === 'POST') {
    // 手动禁用 API Key
    const { apiKey, duration } = await request.json();
    await disableApiKey(env, apiKey, duration || 3600);
    return jsonResponse({ success: true, message: 'API Key disabled' });

  } else if (path === '/admin/keys/health-check' && request.method === 'POST') {
    // 批量健康检查
    const results = await healthCheckAll(env);
    return jsonResponse({ results });

  } else if (path === '/admin/cache/stats' && request.method === 'GET') {
    // 获取缓存统计
    const stats = await getCacheStats(env);
    return jsonResponse(stats);

  } else if (path === '/admin/cache/clear' && request.method === 'POST') {
    // 清除所有缓存
    const { pattern } = await request.json();
    if (pattern) {
      await invalidateCache(env, pattern);
      return jsonResponse({ success: true, message: `清除缓存: ${pattern}*` });
    } else {
      await clearAllCache(env);
      return jsonResponse({ success: true, message: '已清除所有缓存' });
    }

  } else if (path === '/admin/import' && request.method === 'POST') {
    // 批量导入账号（支持多种格式）
    const { accounts } = await request.json();
    const result = await importAccountsFlexible(env, accounts);
    return jsonResponse(result);

  } else if (path === '/admin/verify-key' && request.method === 'POST') {
    // 验证单个 API Key
    const { apiKey } = await request.json();
    const result = await verifyApiKey(env, apiKey);
    return jsonResponse(result);

  } else if (path.startsWith('/admin/api-keys/')) {
    // 删除单个 API Key (DELETE /admin/api-keys/{key})
    const apiKey = decodeURIComponent(path.substring('/admin/api-keys/'.length));
    if (request.method === 'DELETE') {
      await removeApiKey(env, apiKey);
      return jsonResponse({ success: true });
    }

  } else if (path.startsWith('/admin/client-tokens/')) {
    // 删除单个客户端 Token (DELETE /admin/client-tokens/{token})
    const token = decodeURIComponent(path.substring('/admin/client-tokens/'.length));
    if (request.method === 'DELETE') {
      await deleteClientToken(env, token);
      return jsonResponse({ success: true });
    }

  } else if (path === '/admin/client-tokens' && request.method === 'GET') {
    // 获取客户端 Token 列表
    const tokens = await listClientTokens(env);
    return jsonResponse({ client_tokens: tokens });

  } else if (path === '/admin/client-tokens' && request.method === 'POST') {
    // 生成新的客户端 Token
    const { name, ttl } = await request.json();
    const token = await createClientToken(env, name || '未命名', ttl);
    return jsonResponse({ token: token.token, name: token.name });

  } else {
    return errorResponse('Not Found', 404);
  }
}

// 解析 ollama.txt 格式
function parseOllamaTxt(content) {
  const lines = content.split('\n');
  const keys = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    // 格式: email----password----session----api_key 或 email----password----session;aid=xxx----api_key
    const parts = line.split('----');
    if (parts.length >= 4) {
      const apiKey = parts[3].trim();
      if (apiKey) {
        keys.push(apiKey);
      }
    }
  }

  return keys;
}

// 获取统计信息（含全局请求统计，带缓存）
async function getStats(env) {
  // 尝试从缓存获取
  const cached = await getCachedStats(env, 'global');
  if (cached) {
    return cached;
  }

  const usePostgres = isPostgresEnabled(env);

  // 获取 API Keys 与客户端 Token 信息
  const clientTokens = await listClientTokens(env);
  const totalApiKeys = await countApiKeys(env);

  const apiKeys = await listApiKeys(env);

  const totalClientTokens = Array.isArray(clientTokens) ? clientTokens.length : 0;
  const failedKeys = Array.isArray(apiKeys)
    ? apiKeys.filter(item => item.status && item.status !== 'active').length
    : 0;

  // 获取全局统计数据
  const globalStatsData = await env.API_KEYS.get('global_stats');
  const globalStats = globalStatsData ? JSON.parse(globalStatsData) : {
    totalRequests: 0,
    successCount: 0,
    failureCount: 0
  };

  // 计算成功率
  const successRate = globalStats.totalRequests > 0
    ? ((globalStats.successCount / globalStats.totalRequests) * 100).toFixed(2)
    : '0.00';

  const normalizedFailed = Math.min(failedKeys, totalApiKeys);
  const activeKeys = Math.max(totalApiKeys - normalizedFailed, 0);

  const stats = {
    total_api_keys: totalApiKeys,
    active_keys: activeKeys,
    failed_keys: normalizedFailed,
    total_client_tokens: totalClientTokens,
    total_requests: globalStats.totalRequests,
    success_count: globalStats.successCount,
    failure_count: globalStats.failureCount,
    success_rate: successRate,
    storage: usePostgres ? 'postgres+kv' : 'kv',
    timestamp: new Date().toISOString()
  };

  // 缓存结果
  await setCachedStats(env, 'global', stats);

  return stats;
}

// 分页获取 API Keys（优化版 - 快速版本，不查询每个key的详细状态）
async function listApiKeysPaginated(env, page = 1, pageSize = 50) {
  const total = await countApiKeys(env);
  const allKeys = await listApiKeys(env);
  const totalPages = Math.ceil(total / pageSize);

  // 分页切片
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageKeys = Array.isArray(allKeys) ? allKeys.slice(startIndex, endIndex) : [];

  return {
    api_keys: pageKeys,
    total,
    page,
    pageSize,
    totalPages
  };
}

// 验证单个 API Key
async function validateApiKey(apiKey) {
  try {
    const response = await fetch('https://ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        model: 'kimi-k2:1t',
        messages: [
          { role: 'system', content: 'test' },
          { role: 'user', content: 'hi' }
        ],
        stream: true,
        stream_options: { include_usage: true }
      })
    });

    // 验证成功条件: 200-299 状态码
    if (response.ok) {
      // 尝试获取模型信息以进一步分类
      const modelInfo = await getModelInfo(apiKey);
      return {
        valid: true,
        status: response.status,
        category: modelInfo.category || 'general',
        model: modelInfo.model || 'kimi-k2:1t'
      };
    } else {
      return {
        valid: false,
        status: response.status,
        error: await response.text()
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

// 获取模型信息用于分类
async function getModelInfo(apiKey) {
  try {
    const response = await fetch('https://ollama.com/api/tags', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      // 根据可用模型进行分类
      const models = data.models || [];
      if (models.length > 0) {
        // 简单分类逻辑
        const firstModel = models[0].name || models[0].model;
        let category = 'general';

        if (firstModel.includes('kimi')) {
          category = 'kimi';
        } else if (firstModel.includes('llama')) {
          category = 'llama';
        } else if (firstModel.includes('qwen')) {
          category = 'qwen';
        }

        return { category, model: firstModel };
      }
    }
  } catch (error) {
    // 获取失败,使用默认分类
  }

  return { category: 'general', model: 'unknown' };
}

// 导入并验证 API Keys
async function importAndValidateKeys(env, content) {
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  const results = {
    total: lines.length,
    valid: [],
    invalid: [],
    categories: {}
  };

  // 验证每个 key
  for (const apiKey of lines) {
    const validation = await validateApiKey(apiKey);

    if (validation.valid) {
      // 添加到 KV
      await addApiKey(env, apiKey);

      // 保存分类信息
      const category = validation.category || 'general';
      const keyInfo = {
        key: apiKey.substring(0, 20) + '...',
        fullKey: apiKey,
        category,
        model: validation.model,
        addedAt: new Date().toISOString()
      };

      results.valid.push(keyInfo);

      // 统计分类
      if (!results.categories[category]) {
        results.categories[category] = [];
      }
      results.categories[category].push(keyInfo);

      // 保存分类到 KV
      await env.API_KEYS.put(`key_category:${apiKey}`, JSON.stringify({
        category,
        model: validation.model,
        verifiedAt: new Date().toISOString()
      }));

    } else {
      results.invalid.push({
        key: apiKey.substring(0, 20) + '...',
        error: validation.error || `HTTP ${validation.status}`
      });
    }
  }

  return results;
}

/**
 * 验证单个 API Key 并更新状态
 */
async function verifyApiKey(env, apiKey) {
  try {
    // 计算 API Key 的哈希值
    const keyHash = await hashApiKey(apiKey);

    // 使用 Ollama API 进行验证
    const response = await fetch('https://ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Accept': '*/*',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        model: 'kimi-k2:1t',
        messages: [
          { role: 'system', content: 'test' },
          { role: 'user', content: 'hi' }
        ],
        stream: true,
        stream_options: { include_usage: true }
      })
    });

    const isValid = response.ok;

    // 更新 API Key 状态
    const metadata = await env.API_KEYS.get(`key_metadata:${keyHash}`);
    if (metadata) {
      const meta = JSON.parse(metadata);
      meta.status = isValid ? 'active' : 'failed';
      meta.lastVerified = new Date().toISOString();
      if (!isValid) {
        meta.failureReason = `HTTP ${response.status}`;
      }
      await env.API_KEYS.put(`key_metadata:${keyHash}`, JSON.stringify(meta));
    }

    return {
      valid: isValid,
      status: response.status,
      apiKey: apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 8),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // 计算哈希值用于更新失败状态
    const keyHash = await hashApiKey(apiKey);

    // 更新为失败状态
    const metadata = await env.API_KEYS.get(`key_metadata:${keyHash}`);
    if (metadata) {
      const meta = JSON.parse(metadata);
      meta.status = 'failed';
      meta.lastVerified = new Date().toISOString();
      meta.failureReason = error.message;
      await env.API_KEYS.put(`key_metadata:${keyHash}`, JSON.stringify(meta));
    }

    return {
      valid: false,
      error: error.message,
      apiKey: apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 8),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 灵活导入账号 - 支持多种格式
 * 格式1: 每行一个完整的 session cookie (自动生成用户名)
 * 格式2: email----password----session----aid----apikey (解析完整信息)
 */
async function importAccountsFlexible(env, accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    return { success: false, error: '没有提供有效的账号数据', imported: 0 };
  }

  const MAX_DETAILS = 50;
  const details = [];
  const parseErrors = [];
  const parsedEntries = [];

  const pushDetail = (detail) => {
    if (details.length < MAX_DETAILS) {
      details.push(detail);
    }
  };

  for (const account of accounts) {
    try {
      let username;
      let apiKey;

      if (typeof account === 'string') {
        const trimmed = account.trim();

        if (trimmed.includes('----')) {
          const parts = trimmed.split('----').map(part => part.trim());
          if (parts.length >= 4) {
            username = parts[0] || `user_${Math.random().toString(36).slice(2, 7)}`;
            apiKey = parts[parts.length - 1];
          } else {
            parseErrors.push({ error: '格式错误，分段不足', line: trimmed.substring(0, 80) });
            pushDetail({ error: '格式错误，分段不足', line: trimmed.substring(0, 80) });
            continue;
          }
        } else {
          username = `user_${Math.random().toString(36).slice(2, 8)}`;
          apiKey = trimmed;
        }
      } else if (typeof account === 'object' && account !== null) {
        if (account.api_key) {
          apiKey = account.api_key;
          username = account.username || account.email || `user_${Math.random().toString(36).slice(2, 8)}`;
        } else {
          parseErrors.push({ error: '缺少 api_key 字段', data: JSON.stringify(account).substring(0, 80) });
          pushDetail({ error: '缺少 api_key 字段', data: JSON.stringify(account).substring(0, 80) });
          continue;
        }
      } else {
        parseErrors.push({ error: '不支持的格式', data: String(account).substring(0, 80) });
        pushDetail({ error: '不支持的格式', data: String(account).substring(0, 80) });
        continue;
      }

      if (!apiKey) {
        parseErrors.push({ error: '缺少 API Key', data: String(account).substring(0, 80) });
        pushDetail({ error: '缺少 API Key', data: String(account).substring(0, 80) });
        continue;
      }

      parsedEntries.push({ apiKey: apiKey.trim(), username: username || 'N/A' });
    } catch (error) {
      parseErrors.push({ error: error.message, data: JSON.stringify(account).substring(0, 80) });
      pushDetail({ error: error.message, data: JSON.stringify(account).substring(0, 80) });
    }
  }

  if (parsedEntries.length === 0) {
    return {
      success: false,
      imported: 0,
      failed: accounts.length,
      total: accounts.length,
      details
    };
  }

  if (isPostgresEnabled(env)) {
    const pgResult = await pgImportApiAccountEntries(env, parsedEntries);

    if (pgResult.duplicates > 0) {
      pushDetail({ info: `跳过重复 ${pgResult.duplicates} 条` });
    }

    return {
      success: true,
      imported: pgResult.added,
      failed: parseErrors.length + (pgResult.skipped || 0),
      total: accounts.length,
      duplicates: pgResult.duplicates,
      skipped: pgResult.skipped,
      details
    };
  }

  const uniqueMap = new Map();
  let duplicates = 0;

  for (const entry of parsedEntries) {
    if (uniqueMap.has(entry.apiKey)) {
      duplicates++;
      pushDetail({ info: `重复跳过: ${entry.apiKey.substring(0, 20)}...` });
      continue;
    }
    uniqueMap.set(entry.apiKey, entry.username);
  }

  let imported = 0;
  let failed = parseErrors.length + duplicates;

  for (const [apiKey, username] of uniqueMap.entries()) {
    try {
      const success = await addApiKey(env, apiKey, username);
      if (success) {
        imported++;
        pushDetail({ success: true, username, apiKey: `${apiKey.substring(0, 20)}...` });
      } else {
        failed++;
        pushDetail({ success: false, username, apiKey: `${apiKey.substring(0, 20)}...`, error: '添加失败（已存在或写入失败）' });
      }
    } catch (error) {
      failed++;
      pushDetail({ error: error.message, apiKey: `${apiKey.substring(0, 20)}...` });
    }
  }

  return {
    success: true,
    imported,
    failed,
    total: accounts.length,
    duplicates,
    details
  };
}

/**
 * 批量删除 API Keys
 */
async function batchRemoveApiKeys(env, apiKeys) {
  if (!Array.isArray(apiKeys) || apiKeys.length === 0) {
    return { success: false, error: '没有提供有效的 API Keys', deleted: 0 };
  }

  let deleted = 0;
  let failed = 0;

  for (const apiKey of apiKeys) {
    try {
      const removed = await removeApiKey(env, apiKey);
      if (removed) {
        deleted++;
      } else {
        failed++;
      }
    } catch (error) {
      failed++;
    }
  }

  return {
    success: true,
    deleted,
    failed,
    total: apiKeys.length
  };
}

/**
 * 获取公开统计数据（供前端图表使用，带缓存）
 */
async function getPublicStats(env) {
  try {
    // 尝试从缓存获取
    const cached = await getCachedStats(env, 'public');
    if (cached) {
      return cached;
    }

    const usePostgres = isPostgresEnabled(env);
    const useRedis = isRedisEnabled(env);

    let globalStats = {
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      lastUpdated: null
    };

    if (usePostgres) {
      const pgStats = await pgGetGlobalStats(env);
      if (pgStats) {
        globalStats = {
          totalRequests: pgStats.totalRequests,
          successCount: pgStats.successCount,
          failureCount: pgStats.failureCount,
          lastUpdated: pgStats.updatedAt
        };
      } else {
        console.warn('Supabase global stats unavailable, falling back to KV');
      }
    }

    if (!usePostgres || (globalStats.totalRequests === 0 && globalStats.successCount === 0 && globalStats.failureCount === 0 && !globalStats.lastUpdated)) {
      const globalStatsData = await env.API_KEYS.get('global_stats');
      if (globalStatsData) {
        const kvStats = JSON.parse(globalStatsData);
        globalStats = {
          totalRequests: kvStats.totalRequests || 0,
          successCount: kvStats.successCount || 0,
          failureCount: kvStats.failureCount || 0,
          lastUpdated: kvStats.lastUpdated || null
        };
      }
    }

    const totalApiKeys = await countApiKeys(env);
    const apiKeyList = await listApiKeys(env);
    const failedKeys = Array.isArray(apiKeyList)
      ? apiKeyList.filter(item => item.status && item.status !== 'active').length
      : 0;
    const activeKeys = Math.max(totalApiKeys - failedKeys, 0);

    // 获取所有模型统计
    const modelAccumulator = new Map();

    const addModelStats = (item) => {
      if (!item || !item.model) {
        return;
      }

      const key = item.model;
      const record = modelAccumulator.get(key) || {
        model: key,
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        lastUsed: null
      };

      if (typeof item.totalRequests === 'number') {
        record.totalRequests += item.totalRequests;
      } else if (typeof item.requests === 'number') {
        record.totalRequests += item.requests;
      }

      if (typeof item.successCount === 'number') {
        record.successCount += item.successCount;
      } else if (typeof item.success === 'number') {
        record.successCount += item.success;
      }

      if (typeof item.failureCount === 'number') {
        record.failureCount += item.failureCount;
      } else if (typeof item.failure === 'number') {
        record.failureCount += item.failure;
      }

      if (item.lastUsed) {
        record.lastUsed = item.lastUsed;
      }

      modelAccumulator.set(key, record);
    };

    if (useRedis) {
      try {
        const redisKeys = await redisScanPattern(env, 'model_stats:*');
        for (const key of redisKeys) {
          const raw = await redisGet(env, key);
          if (raw) {
            try {
              addModelStats(JSON.parse(raw));
            } catch (error) {
              console.error('解析 Redis 模型统计失败:', error);
            }
          }
        }
      } catch (error) {
        console.warn('Redis 模型统计读取失败:', error);
      }
    }

    if (usePostgres) {
      try {
        const pgModels = await pgListModelStats(env, 10);
        pgModels.forEach(row => addModelStats({
          model: row.model,
          totalRequests: row.total_requests || 0,
          successCount: row.success_count || 0,
          failureCount: row.failure_count || 0,
          lastUsed: row.last_used || null
        }));
      } catch (error) {
        console.warn('Postgres 模型统计读取失败:', error);
      }
    }

    if (modelAccumulator.size === 0 && isKvStorageEnabled(env)) {
      const modelStatsList = await env.API_KEYS.list({ prefix: 'model_stats:' });

      for (const item of modelStatsList.keys) {
        const data = await env.API_KEYS.get(item.name);
        if (data) {
          try {
            addModelStats(JSON.parse(data));
          } catch (e) {
            console.error('Failed to parse model stats:', e);
          }
        }
      }
    }

    const models = Array.from(modelAccumulator.values());

    // 按请求数排序，取前10
    const topModels = models
      .sort((a, b) => b.totalRequests - a.totalRequests)
      .slice(0, 10)
      .map(m => ({
        model: m.model,
        requests: m.totalRequests,
        success: m.successCount,
        failure: m.failureCount,
        successRate: m.totalRequests > 0 ? ((m.successCount / m.totalRequests) * 100).toFixed(2) : '0.00'
      }));

    // 获取最近24小时每小时的统计
    let hourlyStats = [];
    if (usePostgres) {
      hourlyStats = await getHourlyStatsFromPostgres(env, 24);
    }
    if (!hourlyStats.length) {
      hourlyStats = await getHourlyStats(env, 24);
    }

    // 获取最近24小时的Top3模型
    let recentTopModels = [];
    if (usePostgres) {
      recentTopModels = await getRecentTopModelsFromPostgres(env, 24, 3);
    }
    if (!recentTopModels.length) {
      recentTopModels = await getRecentTopModels(env, 24, 3);
    }

    const generatedAt = new Date().toISOString();
    const storageParts = [];
    if (usePostgres) storageParts.push('postgres');
    if (useRedis) storageParts.push('redis');
    if (isKvStorageEnabled(env)) storageParts.push('kv');
    const storage = storageParts.join('+') || 'memory';
    const successRateValue = globalStats.totalRequests > 0
      ? (globalStats.successCount / globalStats.totalRequests * 100)
      : 0;

    const result = {
      global: {
        totalRequests: globalStats.totalRequests,
        successCount: globalStats.successCount,
        failureCount: globalStats.failureCount,
        successRate: successRateValue.toFixed(2),
        lastUpdated: globalStats.lastUpdated || generatedAt,
        totalApiKeys,
        activeKeys,
        failedKeys,
        storage
      },
      topModels: topModels || [],
      recentTopModels: recentTopModels || [],
      hourlyTrend: hourlyStats || [],
      storage,
      meta: {
        totalApiKeys,
        activeKeys,
        failedKeys,
        storage,
        generatedAt,
        successRate: successRateValue
      },
      timestamp: generatedAt
    };

    // 缓存结果
    await setCachedStats(env, 'public', result);

    return result;
  } catch (error) {
    console.error('getPublicStats error:', error);
    // 返回默认数据，避免前端报错
    const generatedAt = new Date().toISOString();
    return {
      global: {
        totalRequests: 0,
        successCount: 0,
        failureCount: 0,
        successRate: '0.00',
        lastUpdated: generatedAt,
        totalApiKeys: 0,
        activeKeys: 0,
        failedKeys: 0,
        storage: 'kv'
      },
      topModels: [],
      recentTopModels: [],
      hourlyTrend: Array.from({ length: 24 }, (_, i) => {
        const time = new Date(Date.now() - (23 - i) * 3600000);
        return {
          hour: time.toISOString().slice(11, 16),
          requests: 0,
          success: 0,
          failure: 0
        };
      }),
      meta: {
        totalApiKeys: 0,
        activeKeys: 0,
        failedKeys: 0,
        storage: 'kv',
        generatedAt,
        successRate: 0
      },
      storage: 'kv',
      timestamp: generatedAt
    };
  }
}

/**
 * 获取最近N小时的每小时统计
 */
async function getHourlyStats(env, hours) {
  try {
    const now = new Date();
    const stats = [];

    const hourDataMap = new Map();
    let dataLoaded = false;

    if (isRedisEnabled(env)) {
      try {
        const redisKeys = await redisScanPattern(env, 'model_hourly:*');
        if (redisKeys.length > 0) {
          for (const key of redisKeys) {
            try {
              const raw = await redisGet(env, key);
              if (!raw) continue;
              const hourData = JSON.parse(raw);
              const hour = hourData.hour;
              if (!hourDataMap.has(hour)) {
                hourDataMap.set(hour, { requests: 0, success: 0, failure: 0 });
              }
              const existing = hourDataMap.get(hour);
              existing.requests += hourData.requests || 0;
              existing.success += hourData.success || 0;
              existing.failure += hourData.failure || 0;
            } catch (error) {
              console.error('解析 Redis 小时统计失败:', key, error);
            }
          }
          dataLoaded = hourDataMap.size > 0;
        }
      } catch (error) {
        console.warn('Redis 小时统计读取失败:', error);
      }
    }

    if (!dataLoaded && isKvStorageEnabled(env)) {
      const hourlyList = await env.API_KEYS.list({ prefix: `model_hourly:`, limit: 1000 });

      for (const item of hourlyList.keys) {
        try {
          const data = await env.API_KEYS.get(item.name);
          if (data) {
            const hourData = JSON.parse(data);
            const hour = hourData.hour;

            if (!hourDataMap.has(hour)) {
              hourDataMap.set(hour, { requests: 0, success: 0, failure: 0 });
            }

            const existing = hourDataMap.get(hour);
            existing.requests += hourData.requests || 0;
            existing.success += hourData.success || 0;
            existing.failure += hourData.failure || 0;
          }
        } catch (e) {
          console.error('Failed to parse hourly data:', item.name, e);
        }
      }
      dataLoaded = hourDataMap.size > 0;
    }

    // 生成最近 N 小时的统计
    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      const hour = time.toISOString().slice(0, 13);
      const hourData = hourDataMap.get(hour) || { requests: 0, success: 0, failure: 0 };

      stats.push({
        hour: time.toISOString().slice(11, 16), // HH:mm
        requests: hourData.requests,
        success: hourData.success,
        failure: hourData.failure
      });
    }

    return stats;
  } catch (error) {
    console.error('getHourlyStats error:', error);
    // 返回空数据占位
    return Array.from({ length: hours }, (_, i) => {
      const time = new Date(Date.now() - (hours - 1 - i) * 3600000);
      return {
        hour: time.toISOString().slice(11, 16),
        requests: 0,
        success: 0,
        failure: 0
      };
    });
  }
}

/**
 * 获取最近N小时的Top N模型
 */
async function getRecentTopModels(env, hours, topN = 3) {
  try {
    const now = new Date();
    const modelMap = new Map();

    const targetHours = new Set();
    for (let i = 0; i < hours; i++) {
      const time = new Date(now.getTime() - i * 3600000);
      targetHours.add(time.toISOString().slice(0, 13));
    }

    let dataLoaded = false;

    if (isRedisEnabled(env)) {
      try {
        const redisKeys = await redisScanPattern(env, 'model_hourly:*');
        if (redisKeys.length > 0) {
          for (const key of redisKeys) {
            try {
              const raw = await redisGet(env, key);
              if (!raw) continue;
              const hourData = JSON.parse(raw);
              const hour = hourData.hour;
              if (!targetHours.has(hour)) continue;

              const modelName = hourData.model;
              if (!modelMap.has(modelName)) {
                modelMap.set(modelName, { requests: 0, success: 0, failure: 0 });
              }
              const stats = modelMap.get(modelName);
              stats.requests += hourData.requests || 0;
              stats.success += hourData.success || 0;
              stats.failure += hourData.failure || 0;
            } catch (error) {
              console.error('解析 Redis 热门模型数据失败:', key, error);
            }
          }
          dataLoaded = modelMap.size > 0;
        }
      } catch (error) {
        console.warn('Redis 热门模型数据读取失败:', error);
      }
    }

    if (!dataLoaded && isKvStorageEnabled(env)) {
      const hourlyList = await env.API_KEYS.list({ prefix: `model_hourly:`, limit: 1000 });

      for (const item of hourlyList.keys) {
        try {
          const data = await env.API_KEYS.get(item.name);
          if (data) {
            const hourData = JSON.parse(data);
            const hour = hourData.hour;

            if (!targetHours.has(hour)) continue;

            const modelName = hourData.model;

            if (!modelMap.has(modelName)) {
              modelMap.set(modelName, { requests: 0, success: 0, failure: 0 });
            }

            const stats = modelMap.get(modelName);
            stats.requests += hourData.requests || 0;
            stats.success += hourData.success || 0;
            stats.failure += hourData.failure || 0;
          }
        } catch (e) {
          console.error('Failed to parse recent model data:', item.name, e);
        }
      }
    }

    // 转换为数组并排序
    const modelsArray = Array.from(modelMap.entries()).map(([model, stats]) => ({
      model,
      requests: stats.requests,
      success: stats.success,
      failure: stats.failure,
      successRate: stats.requests > 0 ? ((stats.success / stats.requests) * 100).toFixed(2) : '0.00'
    }));

    return modelsArray
      .sort((a, b) => b.requests - a.requests)
      .slice(0, topN);
  } catch (error) {
    console.error('getRecentTopModels error:', error);
    return [];
  }
}

async function getHourlyStatsFromPostgres(env, hours) {
  try {
    const rows = await pgGetModelHourlyAggregated(env, { hours });
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const now = new Date();
    const stats = [];
    const map = new Map();

    for (const row of rows) {
      const hourKey = row.hour;
      if (!hourKey) continue;
      map.set(hourKey, {
        requests: Number(row.sum_requests || 0),
        success: Number(row.sum_success || 0),
        failure: Number(row.sum_failure || 0)
      });
    }

    for (let i = hours - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3600000);
      const hourKey = time.toISOString().slice(0, 13);
      const data = map.get(hourKey) || { requests: 0, success: 0, failure: 0 };
      stats.push({
        hour: time.toISOString().slice(11, 16),
        requests: data.requests,
        success: data.success,
        failure: data.failure
      });
    }

    return stats;
  } catch (error) {
    console.error('getHourlyStatsFromPostgres error:', error);
    return [];
  }
}

async function getRecentTopModelsFromPostgres(env, hours, topN) {
  try {
    const rows = await pgGetRecentTopModels(env, { hours, limit: topN });
    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    return rows.map(row => ({
      model: row.model,
      requests: Number(row.sum_requests || 0),
      success: Number(row.sum_success || 0),
      failure: Number(row.sum_failure || 0),
      successRate: Number(row.sum_requests || 0) > 0
        ? ((Number(row.sum_success || 0) / Number(row.sum_requests || 0)) * 100).toFixed(2)
        : '0.00'
    }));
  } catch (error) {
    console.error('getRecentTopModelsFromPostgres error:', error);
    return [];
  }
}

/**
 * 管理后台 API 模块
 */

import { errorResponse, jsonResponse } from './utils';
import {
  addApiKey, removeApiKey, listApiKeys, importApiKeys,
  getAllKeyStats, disableApiKey, enableApiKey, healthCheckAll,
  hashApiKey
} from './keyManager';
import { createClientToken, listClientTokens, deleteClientToken } from './auth';

export async function handleAdmin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

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

// 获取统计信息（优化版：避免遍历所有 keys）
async function getStats(env) {
  // 只获取 API Keys 列表长度，不获取详细信息
  const keysListData = await env.API_KEYS.get('api_keys_list');
  const apiKeys = keysListData ? JSON.parse(keysListData) : [];

  // 获取 client tokens 数量（只统计数量）
  const clientTokensList = await env.API_KEYS.list({ prefix: 'client_token:' });

  return {
    total_api_keys: apiKeys.length,
    active_keys: apiKeys.length, // 简化统计，不逐个检查状态
    failed_keys: 0, // 简化统计
    total_client_tokens: clientTokensList.keys.length,
    total_requests: 0, // TODO: 实现请求计数
    success_rate: 0, // TODO: 实现成功率统计
    timestamp: new Date().toISOString()
  };
}

// 分页获取 API Keys（优化版 - 快速版本，不查询每个key的详细状态）
async function listApiKeysPaginated(env, page = 1, pageSize = 50) {
  const keysListData = await env.API_KEYS.get('api_keys_list');
  if (!keysListData) {
    return {
      api_keys: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }

  const allKeys = JSON.parse(keysListData);
  const total = allKeys.length;
  const totalPages = Math.ceil(total / pageSize);

  // 分页切片
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageKeys = allKeys.slice(startIndex, endIndex);

  // 只返回基本信息，不查询详细状态（极速版）
  const result = pageKeys.map(key => ({
    api_key: key,
    username: null,
    status: 'active', // 默认状态，不实时查询
    addedAt: null,
    expiresAt: null,
    lastUsed: null,
    requestCount: 0
  }));

  return {
    api_keys: result,
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

  const results = {
    imported: 0,
    failed: 0,
    details: []
  };

  for (const account of accounts) {
    try {
      let username, apiKey;

      if (typeof account === 'string') {
        // 纯字符串格式 - 可能是完整 session 或带 ---- 分隔的格式
        const trimmed = account.trim();

        if (trimmed.includes('----')) {
          // 支持两种格式:
          // 格式1 (5段): email----password----session----aid----apikey
          // 格式2 (4段): email----password----session;aid=xxx----apikey
          const parts = trimmed.split('----').map(p => p.trim());

          if (parts.length >= 4) {
            username = parts[0]; // email
            // 直接取最后一段作为 API Key（57位token）
            apiKey = parts[parts.length - 1];
          } else {
            results.failed++;
            results.details.push({ error: '格式错误，分段不足', line: trimmed.substring(0, 50) });
            continue;
          }
        } else {
          // 单行完整的 API Key（可能已经是完整格式）
          username = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          apiKey = trimmed;
        }
      } else if (typeof account === 'object' && account.username && account.api_key) {
        // 对象格式 { username: '...', api_key: '...' }
        username = account.username;
        apiKey = account.api_key;
      } else {
        results.failed++;
        results.details.push({ error: '不支持的格式', data: JSON.stringify(account).substring(0, 50) });
        continue;
      }

      // 添加到 KV
      const success = await addApiKey(env, apiKey, username);

      if (success) {
        results.imported++;
        results.details.push({ success: true, username, apiKey: apiKey.substring(0, 20) + '...' });
      } else {
        results.failed++;
        results.details.push({ success: false, username, error: '添加失败（可能已存在）' });
      }

    } catch (error) {
      results.failed++;
      results.details.push({ error: error.message, data: JSON.stringify(account).substring(0, 50) });
    }
  }

  return {
    success: true,
    imported: results.imported,
    failed: results.failed,
    total: accounts.length,
    details: results.details
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

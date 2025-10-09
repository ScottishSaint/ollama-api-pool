/**
 * API 代理模块
 * 负责转发请求到 Ollama API,实现负载均衡和失败重试
 * 支持流式 (SSE) 和非流式请求
 */

import { getNextApiKey, markApiKeyFailed } from './keyManager';
import { verifyClientToken } from './auth';
import { errorResponse, jsonResponse, corsHeaders } from './utils';

const OLLAMA_API_URL = 'https://ollama.com/v1/chat/completions';
const MAX_RETRIES = 3;

export async function handleProxyRequest(request, env) {
  try {
    // 验证客户端 Token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse('Missing or invalid Authorization header', 401);
    }

    const clientToken = authHeader.substring(7);
    const isValid = await verifyClientToken(clientToken, env);
    if (!isValid) {
      return errorResponse('Invalid API token', 401);
    }

    // 解析请求体
    const requestBody = await request.json();
    const isStreaming = requestBody.stream === true;

    // 尝试多个 API Key
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const apiKey = await getNextApiKey(env);

      if (!apiKey) {
        return errorResponse('No available API keys', 503);
      }

      try {
        // 转发请求到 Ollama API
        const response = await fetch(OLLAMA_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        // 记录使用
        await recordUsage(env, clientToken, apiKey, response.status);

        if (response.ok) {
          // 成功,根据是否流式返回不同格式
          if (isStreaming) {
            // 流式响应 - 直接转发 SSE 流
            return new Response(response.body, {
              headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                ...corsHeaders
              }
            });
          } else {
            // 非流式响应 - 返回 JSON
            const data = await response.json();
            return jsonResponse(data);
          }
        } else if (response.status === 401 || response.status === 403) {
          // API Key 失效,标记并重试
          await markApiKeyFailed(env, apiKey);
          lastError = `API key failed with status ${response.status}`;
          continue;
        } else {
          // 其他错误
          const errorData = await response.text();
          return errorResponse(errorData, response.status);
        }
      } catch (error) {
        lastError = error.message;
        // 网络错误,尝试下一个 key
        continue;
      }
    }

    // 所有重试都失败
    return errorResponse(`All retries failed: ${lastError}`, 503);

  } catch (error) {
    console.error('Proxy error:', error);
    return errorResponse(error.message, 500);
  }
}

// 记录使用情况
async function recordUsage(env, clientToken, apiKey, statusCode) {
  const timestamp = Date.now();
  const key = `usage:${clientToken}:${timestamp}`;

  const usage = {
    apiKey: apiKey.substring(0, 20) + '...',
    statusCode,
    timestamp,
    date: new Date().toISOString()
  };

  // 存储到 KV (24小时过期)
  await env.API_KEYS.put(key, JSON.stringify(usage), {
    expirationTtl: 86400
  });

  // 记录 API Key 统计信息
  await recordKeyStats(env, apiKey, statusCode);
}

// 记录 API Key 统计信息
async function recordKeyStats(env, apiKey, statusCode) {
  const statsKey = `key_stats:${apiKey}`;

  // 获取现有统计
  const existing = await env.API_KEYS.get(statsKey);
  let stats = existing ? JSON.parse(existing) : {
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    lastUsed: null,
    lastSuccess: null,
    lastFailure: null,
    consecutiveFailures: 0,
    createdAt: new Date().toISOString()
  };

  // 更新统计
  stats.totalRequests++;
  stats.lastUsed = new Date().toISOString();

  if (statusCode >= 200 && statusCode < 300) {
    stats.successCount++;
    stats.lastSuccess = new Date().toISOString();
    stats.consecutiveFailures = 0; // 重置连续失败计数
  } else {
    stats.failureCount++;
    stats.lastFailure = new Date().toISOString();
    stats.consecutiveFailures++;
  }

  // 计算成功率
  stats.successRate = stats.totalRequests > 0
    ? (stats.successCount / stats.totalRequests * 100).toFixed(2)
    : 0;

  // 保存统计 (30天过期)
  await env.API_KEYS.put(statsKey, JSON.stringify(stats), {
    expirationTtl: 2592000
  });

  // 智能禁用逻辑: 连续失败 3 次自动禁用 1 小时
  if (stats.consecutiveFailures >= 3) {
    await env.API_KEYS.put(`failed:${apiKey}`, 'auto-disabled', {
      expirationTtl: 3600
    });
  }
}

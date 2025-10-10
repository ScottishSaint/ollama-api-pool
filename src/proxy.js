/**
 * API 代理模块
 * 负责转发请求到 Ollama API,实现负载均衡和失败重试
 * 支持流式 (SSE) 和非流式请求
 * 集成智能缓存提升性能
 */

import { getNextApiKey, markApiKeyFailed } from './keyManager';
import { verifyClientToken } from './auth';
import { errorResponse, jsonResponse, corsHeaders } from './utils';
import { getCachedResponse, setCachedResponse } from './cache';
import { isRedisEnabled, redisIncr, redisExpire } from './redis';
import { isPostgresEnabled, pgRecordKeyStats, pgIncrementGlobalStats } from './postgres';

const OLLAMA_API_URL = 'https://ollama.com/v1/chat/completions';
const MAX_RETRIES = 3;

export async function handleProxyRequest(request, env) {
  try {
    // 读取环境变量配置
    const enableBotDetection = env.ENABLE_BOT_DETECTION !== 'false';
    const enableRateLimit = env.ENABLE_RATE_LIMIT === 'true';
    const rateLimitRequests = parseInt(env.RATE_LIMIT_REQUESTS || '60');
    const rateLimitWindow = parseInt(env.RATE_LIMIT_WINDOW || '60');

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || '';

    // 1. User-Agent 检测（基本bot过滤，仅日志，不消耗 KV）
    if (enableBotDetection) {
      const suspiciousBots = ['python-requests', 'curl/', 'wget/', 'scrapy', 'bot', 'spider', 'crawler'];
      const isSuspicious = suspiciousBots.some(bot => userAgent.toLowerCase().includes(bot));

      if (isSuspicious && !userAgent.includes('Googlebot') && !userAgent.includes('Bingbot')) {
        console.warn(`Suspicious bot detected: ${userAgent} from ${clientIP}`);
        // 可选：直接拒绝可疑流量
        // return errorResponse('Bot detected', 403);
      }
    }

    // 2. 速率限制（可选，会消耗 KV 读取）
    if (enableRateLimit) {
      const rateLimitKey = `ratelimit:${clientIP}:${Math.floor(Date.now() / (rateLimitWindow * 1000))}`;
      if (isRedisEnabled(env)) {
        const count = await applyRedisRateLimit(env, rateLimitKey, rateLimitWindow);
        if (count !== null && count > rateLimitRequests) {
          return errorResponse(`Rate limit exceeded. Max ${rateLimitRequests} requests per ${rateLimitWindow}s.`, 429);
        }
      } else {
        const currentCount = await env.API_KEYS.get(rateLimitKey);
        if (currentCount && parseInt(currentCount, 10) > rateLimitRequests) {
          return errorResponse(`Rate limit exceeded. Max ${rateLimitRequests} requests per ${rateLimitWindow}s.`, 429);
        }
      }
    }

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
    const modelName = requestBody.model || 'unknown';

    // 尝试从缓存获取响应（仅非流式请求）
    if (!isStreaming) {
      const cachedResponse = await getCachedResponse(env, requestBody);
      if (cachedResponse) {
        // 返回缓存的响应，添加缓存标识
        const response = {
          ...cachedResponse,
          cached: true,
          cache_timestamp: new Date().toISOString()
        };
        return new Response(JSON.stringify(response), {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=60',
            ...corsHeaders
          }
        });
      }
    }

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
        await recordUsage(env, clientToken, apiKey, response.status, modelName);

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

            // 缓存成功的响应
            await setCachedResponse(env, requestBody, data);

            // 添加缓存标识
            return new Response(JSON.stringify(data), {
              headers: {
                'Content-Type': 'application/json',
                'X-Cache': 'MISS',
                ...corsHeaders
              }
            });
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

async function applyRedisRateLimit(env, key, windowSeconds) {
  const count = await redisIncr(env, key);
  if (count === null || Number.isNaN(count)) {
    return null;
  }

  if (count === 1 && windowSeconds > 0) {
    await redisExpire(env, key, windowSeconds);
  }

  return count;
}

// 记录使用情况（可配置版本：通过环境变量控制采样率）
async function recordUsage(env, clientToken, apiKey, statusCode, modelName) {
  const isSuccess = statusCode >= 200 && statusCode < 300;
  const enableAnalytics = env.ENABLE_ANALYTICS === 'true';

  await updateGlobalStatsAccurate(env, isSuccess);

  // 仅在失败时记录，用于自动禁用 API Key
  if (!isSuccess) {
    await recordKeyStats(env, apiKey, statusCode);
  }

  // 如果启用统计分析，使用采样记录
  if (enableAnalytics) {
    const statsSampleRate = parseFloat(env.STATS_SAMPLE_RATE || '0.1');
    const modelStatsSampleRate = parseFloat(env.MODEL_STATS_SAMPLE_RATE || '0.2');

    // 模型统计采样
    if (Math.random() < modelStatsSampleRate) {
      await recordModelStats(env, modelName, statusCode);
    }
  }
  // 否则完全不记录统计，节省 KV 写入
}

// 记录 API Key 统计信息
async function recordKeyStats(env, apiKey, statusCode) {
  if (isPostgresEnabled(env)) {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    await pgRecordKeyStats(env, apiKey, { isSuccess });
    return;
  }

  const statsKey = `key_stats:${apiKey}`;
  const isSuccess = statusCode >= 200 && statusCode < 300;

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

  if (isSuccess) {
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

// 更新全局统计信息（KV 版本）
async function updateGlobalStatsKV(env, isSuccess) {
  const globalStatsData = await env.API_KEYS.get('global_stats');
  let globalStats = globalStatsData ? JSON.parse(globalStatsData) : {
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    lastUpdated: null
  };

  globalStats.totalRequests++;
  if (isSuccess) {
    globalStats.successCount++;
  } else {
    globalStats.failureCount++;
  }
  globalStats.lastUpdated = new Date().toISOString();

  // 保存全局统计（永久保存）
  await env.API_KEYS.put('global_stats', JSON.stringify(globalStats));
}

async function updateGlobalStatsAccurate(env, isSuccess) {
  if (isPostgresEnabled(env)) {
    const ok = await pgIncrementGlobalStats(env, { isSuccess });
    if (ok) {
      return;
    }
  }

  await updateGlobalStatsKV(env, isSuccess);
}

// 记录模型统计信息（支持24小时和1小时时间窗口）
async function recordModelStats(env, modelName, statusCode) {
  const now = Date.now();
  const hour = new Date(now).toISOString().slice(0, 13); // 精确到小时，如 "2025-01-15T08"
  const isSuccess = statusCode >= 200 && statusCode < 300;

  // 24小时统计（总计）
  const statsKey = `model_stats:${modelName}`;
  const statsData = await env.API_KEYS.get(statsKey);
  let stats = statsData ? JSON.parse(statsData) : {
    model: modelName,
    totalRequests: 0,
    successCount: 0,
    failureCount: 0,
    lastUsed: null,
    firstUsed: new Date().toISOString()
  };

  stats.totalRequests++;
  stats.lastUsed = new Date().toISOString();
  if (isSuccess) {
    stats.successCount++;
  } else {
    stats.failureCount++;
  }

  // 保存总计统计（7天过期）
  await env.API_KEYS.put(statsKey, JSON.stringify(stats), {
    expirationTtl: 604800
  });

  // 每小时统计（用于趋势图）
  const hourlyKey = `model_hourly:${modelName}:${hour}`;
  const hourlyData = await env.API_KEYS.get(hourlyKey);
  let hourlyStats = hourlyData ? JSON.parse(hourlyData) : {
    model: modelName,
    hour,
    requests: 0,
    success: 0,
    failure: 0
  };

  hourlyStats.requests++;
  if (isSuccess) {
    hourlyStats.success++;
  } else {
    hourlyStats.failure++;
  }

  // 保存小时统计（48小时过期）
  await env.API_KEYS.put(hourlyKey, JSON.stringify(hourlyStats), {
    expirationTtl: 172800
  });
}

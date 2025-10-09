/**
 * Ollama API Pool - Cloudflare Worker
 *
 * 功能:
 * 1. API 代理池 - 轮询使用多个 Ollama API Key
 * 2. 鉴权系统 - 自定义 API Key 验证
 * 3. 管理后台 - 导入/管理账号
 * 4. 统计分析 - 请求统计和监控
 * 5. OpenAI 兼容 - 支持流式和非流式请求
 */

import { handleProxyRequest } from './proxy';
import { handleAuth } from './auth';
import { handleAdmin } from './admin';
import { handleDashboard } from './dashboard';
import { corsHeaders, jsonResponse, errorResponse } from './utils';
import { getCachedModels, setCachedModels } from './cache';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 检查 ADMIN_TOKEN 是否已配置
    if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN === 'your-admin-secret-token') {
      if (path !== '/') {
        return errorResponse('Service not configured. Please set ADMIN_TOKEN in wrangler.toml', 503);
      }
      // 首页显示配置引导
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head><title>Setup Required</title></head>
        <body style="font-family: sans-serif; padding: 50px; text-align: center;">
          <h1>⚙️ 初始化配置</h1>
          <p>请先配置 ADMIN_TOKEN</p>
          <ol style="text-align: left; max-width: 600px; margin: 20px auto;">
            <li>编辑 <code>wrangler.toml</code></li>
            <li>设置 <code>ADMIN_TOKEN = "your-secure-token"</code></li>
            <li>运行 <code>wrangler deploy</code> 重新部署</li>
          </ol>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 处理 CORS 预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 路由分发
      if (path === '/' || path === '/dashboard') {
        // 管理后台首页
        return handleDashboard(request, env);
      } else if (path === '/stats') {
        // 公开统计页面
        return handleStaticHtml('/stats.html');
      } else if (path === '/api-docs') {
        // API 使用文档
        return handleStaticHtml('/api-docs.html');
      } else if (path.startsWith('/js/')) {
        // 静态 JS 文件
        return handleStaticJs(path);
      } else if (path.startsWith('/admin/')) {
        // 管理 API
        return handleAdmin(request, env);
      } else if (path === '/v1/chat/completions') {
        // Ollama API 代理 (OpenAI 兼容)
        // 检查是否有可用的 API Keys
        const hasKeys = await checkHasApiKeys(env);
        if (!hasKeys) {
          return errorResponse('No API keys configured. Please add keys via admin dashboard', 503);
        }
        return handleProxyRequest(request, env);
      } else if (path === '/v1/models') {
        // 模型列表 (OpenAI 兼容接口)
        return handleModels(request, env);
      } else if (path === '/health') {
        // 健康检查
        const hasKeys = await checkHasApiKeys(env);

        return jsonResponse({
          status: 'ok',
          service: 'Ollama API Pool',
          version: '1.0.0',
          configured: hasKeys,
          project: {
            name: 'Ollama API Pool',
            description: 'Intelligent Ollama API proxy pool with load balancing and fault tolerance',
            homepage: 'https://ollama-api-pool.h7ml.workers.dev',
            repository: 'https://github.com/dext7r/ollama-api-pool',
            documentation: 'https://ollama-api-pool.h7ml.workers.dev/api-docs',
            statistics: 'https://ollama-api-pool.h7ml.workers.dev/stats',
            license: 'MIT'
          },
          author: {
            name: 'dext7r',
            email: 'h7ml@qq.com',
            github: 'https://github.com/dext7r'
          },
          timestamp: new Date().toISOString(),
          uptime: Date.now()
        });
      } else {
        return errorResponse('Not Found', 404);
      }
    } catch (error) {
      console.error('Worker Error:', error);
      return errorResponse(error.message, 500);
    }
  }
};

// 检查是否有可用的 API Keys
async function checkHasApiKeys(env) {
  const keysData = await env.API_KEYS.get('api_keys_list');
  if (!keysData) return false;

  const keys = JSON.parse(keysData);
  return keys && keys.length > 0;
}

// 模型列表处理 - 代理到 ollama.com/api/tags 并转换为 OpenAI 格式
async function handleModels(request, env) {
  try {
    // 验证客户端 Token（可选，如果提供了 Authorization 头）
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const { verifyClientToken } = await import('./auth');
      const clientToken = authHeader.substring(7);
      const isValid = await verifyClientToken(clientToken, env);
      if (!isValid) {
        return errorResponse('Invalid API token', 401);
      }
    }

    // 尝试从缓存获取
    const cachedModels = await getCachedModels(env);
    if (cachedModels) {
      return new Response(JSON.stringify(cachedModels), {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300',
          ...corsHeaders
        }
      });
    }

    // 获取一个可用的 API Key 用于获取模型列表
    const { getNextApiKey } = await import('./keyManager');
    const apiKey = await getNextApiKey(env);

    if (!apiKey) {
      return errorResponse('No available API keys', 503);
    }

    // 请求 Ollama API Tags
    const response = await fetch('https://ollama.com/api/tags', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      return errorResponse('Failed to fetch models', response.status);
    }

    const data = await response.json();

    // 转换为 OpenAI 格式
    const models = (data.models || []).map(model => ({
      id: model.name || model.model,
      object: 'model',
      created: Math.floor(Date.now() / 1000),
      owned_by: 'ollama',
      permission: [],
      root: model.name || model.model,
      parent: null
    }));

    const result = {
      object: 'list',
      data: models
    };

    // 缓存结果
    await setCachedModels(env, result);

    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300',
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error('Models error:', error);
    return errorResponse(error.message, 500);
  }
}

// 处理静态 JS 文件
async function handleStaticJs(path) {
  // 移除查询参数（如 ?v=2）
  const cleanPath = path.split('?')[0];

  if (cleanPath === '/js/login.js') {
    const { loginJs } = await import('./static/login-js');
    return new Response(loginJs, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } else if (cleanPath === '/js/dashboard.js') {
    const { dashboardJs } = await import('./static/dashboard-js');
    return new Response(dashboardJs, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  return errorResponse('Not Found', 404);
}

// 处理静态 HTML 文件
async function handleStaticHtml(path) {
  if (path === '/api-docs.html') {
    const { apiDocsHtml } = await import('./static/api-docs-html');
    const { getBuildTime } = await import('./buildInfo');

    // 注入构建时间
    const buildTime = getBuildTime();
    const html = apiDocsHtml.replace('{{BUILD_TIME}}', buildTime);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } else if (path === '/stats.html') {
    const { statsHtml } = await import('./static/stats-html');

    return new Response(statsHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  return errorResponse('Not Found', 404);
}

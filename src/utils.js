/**
 * 工具函数模块
 */

// CORS 头
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// JSON 响应
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// 错误响应
export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// HTML 响应
export function htmlResponse(html) {
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      ...corsHeaders
    }
  });
}

// 判断是否启用 KV 存储（默认启用，设置 DISABLE_KV_STORAGE=true 关闭）
export function isKvStorageEnabled(env) {
  const raw = env?.DISABLE_KV_STORAGE;
  if (raw === undefined || raw === null) {
    return true;
  }

  const value = String(raw).trim().toLowerCase();
  return !(value === 'true' || value === '1' || value === 'yes' || value === 'on');
}

// 生成随机 User-Agent
export function getRandomUserAgent() {
  // 定义一个包含多个用户代理字符串的数组
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// 检查 Provider 是否启用
export function isProviderEnabled(env, provider) {
  if (provider === 'ollama') {
    return env.DISABLE_OLLAMA !== 'true';
  }
  if (provider === 'openrouter') {
    return env.DISABLE_OPENROUTER !== 'true';
  }
  return true;
}

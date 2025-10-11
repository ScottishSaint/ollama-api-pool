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

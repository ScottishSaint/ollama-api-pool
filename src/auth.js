/**
 * 鉴权模块
 * 负责客户端 Token 的验证和管理
 */

import { errorResponse, jsonResponse } from './utils';

// 验证客户端 Token
export async function verifyClientToken(token, env) {
  const tokenData = await env.API_KEYS.get(`client_token:${token}`);
  if (!tokenData) {
    return false;
  }

  const data = JSON.parse(tokenData);
  // 检查是否过期
  if (data.expiresAt && Date.now() > data.expiresAt) {
    return false;
  }

  return true;
}

// 创建客户端 Token
export async function createClientToken(env, name, ttl = null) {
  const token = generateToken();
  const expiresAt = ttl ? Date.now() + (ttl * 1000) : null;

  const tokenData = {
    token,
    name,
    createdAt: Date.now(),
    expiresAt,
    requestCount: 0
  };

  await env.API_KEYS.put(`client_token:${token}`, JSON.stringify(tokenData));

  return {
    token,
    name,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
  };
}

// 列出所有客户端 Token
export async function listClientTokens(env) {
  const list = await env.API_KEYS.list({ prefix: 'client_token:' });
  const tokens = [];

  for (const key of list.keys) {
    const data = await env.API_KEYS.get(key.name);
    if (data) {
      const tokenData = JSON.parse(data);
      tokens.push({
        token: tokenData.token,
        name: tokenData.name,
        createdAt: new Date(tokenData.createdAt).toISOString(),
        expires_at: tokenData.expiresAt ? new Date(tokenData.expiresAt).toISOString() : null,
        requestCount: tokenData.requestCount || 0
      });
    }
  }

  return tokens;
}

// 删除客户端 Token
export async function deleteClientToken(env, token) {
  await env.API_KEYS.delete(`client_token:${token}`);
  return true;
}

// 生成随机 Token
function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'sk-';
  for (let i = 0; i < 48; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// 处理鉴权相关请求
export async function handleAuth(request, env) {
  // 实现鉴权逻辑
  return jsonResponse({ message: 'Auth endpoint' });
}

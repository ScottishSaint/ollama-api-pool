/**
 * 鉴权模块
 * 负责客户端 Token 的验证和管理
 */

import { errorResponse, jsonResponse } from './utils';
import {
  isPostgresEnabled,
  pgCreateClientToken,
  pgGetClientToken,
  pgListClientTokens,
  pgDeleteClientToken,
  pgIncrementClientTokenUsage
} from './postgres';
import { normalizeProvider } from './providers';

function getTokenPrefix(provider) {
  const normalized = normalizeProvider(provider);
  return normalized === 'ollama' ? 'client_token:' : `${normalized}:client_token:`;
}

function getTokenKvKey(provider, token) {
  return `${getTokenPrefix(provider)}${token}`;
}

// 验证客户端 Token
export async function verifyClientToken(token, env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    const data = await pgGetClientToken(env, token, normalized);
    if (!data) {
      return false;
    }

    if (data.expires_at && Date.now() > new Date(data.expires_at).getTime()) {
      return false;
    }

    await pgIncrementClientTokenUsage(env, token, normalized);
    return true;
  }

  const tokenData = await env.API_KEYS.get(getTokenKvKey(normalized, token));
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
export async function createClientToken(env, name, ttl = null, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    const token = generateToken();
    const now = new Date();
    const expiresAt = ttl ? new Date(now.getTime() + ttl * 1000) : null;

    await pgCreateClientToken(env, {
      token,
      name,
      createdAt: now.toISOString(),
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      requestCount: 0
    }, normalized);

    return {
      token,
      name,
      expiresAt: expiresAt ? expiresAt.toISOString() : null
    };
  }

  const token = generateToken();
  const expiresAt = ttl ? Date.now() + (ttl * 1000) : null;

  const tokenData = {
    token,
    name,
    createdAt: Date.now(),
    expiresAt,
    requestCount: 0
  };

  await env.API_KEYS.put(getTokenKvKey(normalized, token), JSON.stringify(tokenData));

  return {
    token,
    name,
    expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null
  };
}

// 列出所有客户端 Token
export async function listClientTokens(env, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    const rows = await pgListClientTokens(env, normalized);
    return rows.map(row => ({
      token: row.token,
      name: row.name,
      createdAt: row.createdAt,
      expires_at: row.expires_at,
      requestCount: row.requestCount || 0
    }));
  }

  const list = await env.API_KEYS.list({ prefix: getTokenPrefix(normalized) });
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
export async function deleteClientToken(env, token, provider = 'ollama') {
  const normalized = normalizeProvider(provider);
  if (isPostgresEnabled(env)) {
    await pgDeleteClientToken(env, token, normalized);
    return true;
  }

  await env.API_KEYS.delete(getTokenKvKey(normalized, token));
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

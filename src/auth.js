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
  pgIncrementClientTokenUsage,
  pgCreateEmailVerificationCode,
  pgGetUserByEmail,
  pgGetLatestEmailVerificationCode,
  pgMarkEmailCodeUsed,
  pgCreateUser,
  pgUpdateUserMeta,
  pgUpdateClientTokenExpiry,
  pgCreateUserSignin,
  pgHasUserSignedOnDay,
  pgGetUserById,
  pgListUserSignins,
  pgCountUserSignins,
  pgGetUserByKeyToken
} from './postgres';
import { normalizeProvider } from './providers';
import { redisGet, redisSet, redisIncr, redisExpire, redisDelete, isRedisEnabled } from './redis';
import { sendVerificationEmail } from './email';

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
  const disabledMessage = '账号已被禁用，如需解封请联系管理员';

  if (isPostgresEnabled(env)) {
    if (!token) {
      return { valid: false, status: 401, message: '缺少访问凭证' };
    }

    const data = await pgGetClientToken(env, token, normalized);
    if (!data) {
      return { valid: false, status: 401, message: 'API 凭证无效，请检查后重试' };
    }

    if (data.expires_at && Date.now() > new Date(data.expires_at).getTime()) {
      return { valid: false, status: 401, message: 'API 凭证已过期，请联系管理员续期' };
    }

    let linkedUser = null;
    try {
      linkedUser = await pgGetUserByKeyToken(env, token);
    } catch (error) {
      console.warn('pgGetUserByKeyToken error:', error);
    }

    if (linkedUser && linkedUser.is_active === false) {
      return { valid: false, status: 403, message: disabledMessage };
    }

    await pgIncrementClientTokenUsage(env, token, normalized);
    return { valid: true, user: linkedUser };
  }

  const tokenData = await env.API_KEYS.get(getTokenKvKey(normalized, token));
  if (!tokenData) {
    return { valid: false, status: 401, message: 'API 凭证无效，请检查后重试' };
  }

  const data = JSON.parse(tokenData);
  // 检查是否过期
  if (data.expiresAt && Date.now() > data.expiresAt) {
    return { valid: false, status: 401, message: 'API 凭证已过期，请联系管理员续期' };
  }

  return { valid: true, user: null };
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
const EMAIL_CODE_LENGTH = 6;
const EMAIL_CODE_TTL_SECONDS = 10 * 60;
const EMAIL_SEND_INTERVAL_SECONDS = 60;
const EMAIL_DAILY_LIMIT = 10;
const MAX_CODE_ATTEMPTS = 5;
const DEFAULT_KEY_TTL_SECONDS = 3 * 24 * 60 * 60;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function normalizeEmail(email) {
  return email ? String(email).trim().toLowerCase() : '';
}

function validateEmail(email) {
  const value = normalizeEmail(email);
  const regex = /^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
  return regex.test(value);
}

function generateVerificationCode() {
  let code = '';
  for (let i = 0; i < EMAIL_CODE_LENGTH; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

function getRedisKeys(email, purpose) {
  const safeEmail = encodeURIComponent(email);
  const safePurpose = encodeURIComponent(purpose);
  return {
    throttleKey: `verify:throttle:${safeEmail}`,
    dailyKey: `verify:daily:${safeEmail}:${new Date().toISOString().slice(0, 10)}`,
    codeKey: `verify:code:${safePurpose}:${safeEmail}`
  };
}

async function checkAndSetRateLimit(env, email, purpose) {
  if (!isRedisEnabled(env)) {
    return;
  }

  const keys = getRedisKeys(email, purpose);

  const throttle = await redisGet(env, keys.throttleKey);
  if (throttle) {
    throw errorResponse('验证码发送过于频繁，请稍后再试。', 429);
  }

  await redisSet(env, keys.throttleKey, '1', EMAIL_SEND_INTERVAL_SECONDS);

  const dailyCount = await redisIncr(env, keys.dailyKey);
  if (dailyCount === 1) {
    await redisExpire(env, keys.dailyKey, 24 * 60 * 60);
  }
  if (dailyCount > EMAIL_DAILY_LIMIT) {
    await redisSet(env, keys.throttleKey, '1', EMAIL_SEND_INTERVAL_SECONDS);
    throw errorResponse('验证码发送次数已达上限，请24小时后再试。', 429);
  }
}

async function storeCodeInRedis(env, email, purpose, payload) {
  if (!isRedisEnabled(env)) {
    return;
  }
  const { codeKey } = getRedisKeys(email, purpose);
  let ttl = EMAIL_CODE_TTL_SECONDS;
  if (payload?.expiresAt) {
    const diff = Math.floor((new Date(payload.expiresAt).getTime() - Date.now()) / 1000);
    if (diff > 0) {
      ttl = diff;
    }
  }
  await redisSet(env, codeKey, JSON.stringify(payload), ttl);
}

async function clearCodeInRedis(env, email, purpose) {
  if (!isRedisEnabled(env)) {
    return;
  }
  const { codeKey } = getRedisKeys(email, purpose);
  await redisDelete(env, codeKey);
}

function base64UrlEncodeString(str) {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function base64UrlEncodeBytes(bytes) {
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return base64UrlEncodeString(binary);
}

function base64UrlDecodeToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(value.length + (4 - (value.length % 4)) % 4, '=');
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeToString(value) {
  const bytes = base64UrlDecodeToBytes(value);
  return decoder.decode(bytes);
}

async function hmacSign(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

async function hashPassword(env, password) {
  if (!password) return null;
  const secret = env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }

  const data = encoder.encode(`${secret}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncodeBytes(new Uint8Array(hashBuffer));
}

async function verifyPassword(env, password, hash) {
  if (!password || !hash) return false;
  const computed = await hashPassword(env, password);
  return computed === hash;
}

async function verifyTurnstile(env, token, remoteIp) {
  if (env.ENABLE_TURNSTILE !== 'true') {
    return true;
  }
  if (!env.TURNSTILE_SECRET_KEY) {
    console.warn('TURNSTILE_SECRET_KEY 未配置，跳过 Turnstile 校验');
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.set('secret', env.TURNSTILE_SECRET_KEY);
    formData.set('response', token);
    if (remoteIp) {
      formData.set('remoteip', remoteIp);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    });

    if (!response.ok) {
      console.warn('Turnstile verify request failed:', response.status, await response.text());
      return false;
    }

    const result = await response.json();
    if (!result.success) {
      console.warn('Turnstile verify result:', result);
    }
    return Boolean(result.success);
  } catch (error) {
    console.warn('Turnstile verify error:', error);
    return false;
  }
}

async function createSessionToken(env, userId, extra = {}) {
  const secret = env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured');
  }

  const header = base64UrlEncodeString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payloadObj = { sub: userId, exp, ...extra };
  const payloadBytes = encoder.encode(JSON.stringify(payloadObj));
  const payload = base64UrlEncodeBytes(payloadBytes);
  const unsigned = `${header}.${payload}`;
  const signature = await hmacSign(secret, unsigned);
  return {
    token: `${unsigned}.${signature}`,
    expiresAt: new Date(exp * 1000).toISOString(),
    payload: payloadObj
  };
}

async function verifySessionToken(env, token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, signaturePart] = parts;
  const secret = env.AUTH_SECRET;
  if (!secret) return null;

  const expectedSignature = await hmacSign(secret, `${headerPart}.${payloadPart}`);
  if (signaturePart !== expectedSignature) {
    return null;
  }

  try {
    const payloadJson = base64UrlDecodeToString(payloadPart);
    const payload = JSON.parse(payloadJson);
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch (error) {
    console.warn('Failed to parse session token payload', error);
    return null;
  }
}

async function getAuthenticatedUser(env, request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice(7).trim();
  const payload = await verifySessionToken(env, token);
  if (!payload || !payload.sub) {
    return null;
  }
  const user = await pgGetUserById(env, payload.sub);
  if (!user) {
    return null;
  }
  const disabled = user.is_active === false;
  return { user, tokenPayload: payload, disabled };
}

function sanitizeUser(user, extras = {}) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    defaultProvider: user.default_provider,
    keyToken: user.key_token,
    keyProvider: user.key_provider,
    keyExpiresAt: user.key_expires_at,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at,
    lastSignInAt: user.last_sign_in_at,
    ...extras
  };
}

function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

async function ensureUserActiveKey(env, user, provider = 'ollama') {
  const normalizedProvider = normalizeProvider(user.key_provider || user.default_provider || provider);
  const now = Date.now();
  let needsNewKey = !user.key_token;
  if (!needsNewKey && user.key_expires_at) {
    const expiry = new Date(user.key_expires_at).getTime();
    if (expiry <= now) {
      needsNewKey = true;
    }
  }

  if (!needsNewKey) {
    return user;
  }

  const rawEmail = user.email || 'user';
  const safeEmail = rawEmail.toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
  const tokenName = `${safeEmail}_${user.id}_key`;
  const tokenInfo = await createClientToken(env, tokenName, DEFAULT_KEY_TTL_SECONDS, normalizedProvider);
  await pgUpdateUserMeta(env, user.id, {
    key_token: tokenInfo.token,
    key_provider: normalizedProvider,
    key_expires_at: tokenInfo.expiresAt,
    updated_at: new Date().toISOString()
  });
  const refreshed = await pgGetUserById(env, user.id);
  return refreshed || user;
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

async function consumeVerificationCode(env, email, purpose, inputCode) {
  const normalizedEmail = normalizeEmail(email);
  if (!inputCode) {
    throw errorResponse('请输入验证码', 400);
  }

  let codeId = null;

  if (isRedisEnabled(env)) {
    const { codeKey } = getRedisKeys(normalizedEmail, purpose);
    const raw = await redisGet(env, codeKey);
    if (raw) {
      try {
        const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
          await clearCodeInRedis(env, normalizedEmail, purpose);
          throw errorResponse('验证码已过期，请重新获取', 400);
        }
        if (data.code !== inputCode) {
          const attempts = (data.attempts || 0) + 1;
          data.attempts = attempts;
          await storeCodeInRedis(env, normalizedEmail, purpose, data);
          if (attempts >= MAX_CODE_ATTEMPTS) {
            await clearCodeInRedis(env, normalizedEmail, purpose);
          }
          throw errorResponse('验证码错误，请重新输入', 400);
        }
        codeId = data.codeId || null;
        await clearCodeInRedis(env, normalizedEmail, purpose);
      } catch (err) {
        if (err instanceof Response) {
          throw err;
        }
        console.warn('解析 Redis 验证码数据失败:', err);
      }
    }
  }

  if (!codeId) {
    const record = await pgGetLatestEmailVerificationCode(env, normalizedEmail, purpose);
    if (!record) {
      throw errorResponse('验证码无效，请重新获取', 400);
    }
    if (record.status !== 'pending') {
      throw errorResponse('验证码已使用或失效，请重新获取', 400);
    }
    if (record.expires_at && new Date(record.expires_at).getTime() < Date.now()) {
      throw errorResponse('验证码已过期，请重新获取', 400);
    }
    if (record.code !== inputCode) {
      throw errorResponse('验证码错误，请重新输入', 400);
    }
    codeId = record.id;
  }

  if (codeId) {
    await pgMarkEmailCodeUsed(env, codeId, 'used');
  }
}

async function handleRegister(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return errorResponse('Invalid JSON body', 400);
  }

  const email = normalizeEmail(body?.email);
  const code = body?.code;
  const password = body?.password;
  const provider = normalizeProvider(body?.provider || 'ollama');
  const turnstileToken = body?.turnstileToken || body?.cfTurnstileToken;
  const remoteIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || undefined;

  if (!validateEmail(email)) {
    return errorResponse('请输入有效的邮箱地址', 400);
  }

  const turnstileOk = await verifyTurnstile(env, turnstileToken, remoteIp);
  if (!turnstileOk) {
    return errorResponse('Turnstile 验证失败，请刷新页面重试', 400);
  }

  if (!validatePasswordStrength(password)) {
    return errorResponse('密码至少需要 6 位字符', 400);
  }

  const exist = await pgGetUserByEmail(env, email);
  if (exist) {
    return errorResponse('该邮箱已注册，请直接登录', 400);
  }

  try {
    await consumeVerificationCode(env, email, 'register', code);
  } catch (response) {
    if (response instanceof Response) {
      return response;
    }
    throw response;
  }

  const passwordHash = await hashPassword(env, password);

  const userRecord = await pgCreateUser(env, {
    email,
    passwordHash,
    defaultProvider: provider
  });

  if (!userRecord) {
    return errorResponse('注册失败，请稍后重试', 500);
  }

  let finalUser = userRecord;
  try {
    finalUser = await ensureUserActiveKey(env, userRecord, provider);
  } catch (error) {
    console.warn('创建默认访问凭证失败:', error);
  }

  const session = await createSessionToken(env, finalUser.id, { email });

  await pgUpdateUserMeta(env, finalUser.id, {
    last_login_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const refreshed = await pgGetUserById(env, finalUser.id);

  return jsonResponse({
    token: session.token,
    expiresAt: session.expiresAt,
    user: sanitizeUser(refreshed || finalUser)
  });
}

async function handleLogin(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return errorResponse('Invalid JSON body', 400);
  }

  const email = normalizeEmail(body?.email);
  const password = body?.password;
  const code = body?.code;
  const provider = normalizeProvider(body?.provider || 'ollama');

  if (!validateEmail(email)) {
    return errorResponse('请输入有效的邮箱地址', 400);
  }

  const user = await pgGetUserByEmail(env, email);
  if (!user) {
    return errorResponse('邮箱未注册，请先注册账号', 400);
  }
  if (user.is_active === false) {
    return errorResponse('账号已被禁用，如需解封请联系管理员', 403);
  }

  if (password) {
    const ok = await verifyPassword(env, password, user.password_hash);
    if (!ok) {
      return errorResponse('邮箱或密码错误', 400);
    }
  } else if (code) {
    try {
      await consumeVerificationCode(env, email, 'login', code);
    } catch (response) {
      if (response instanceof Response) {
        return response;
      }
      throw response;
    }
  } else {
    if (user.password_hash) {
      return errorResponse('请输入密码或验证码', 400);
    }
    return errorResponse('无法验证身份，请提供验证码', 400);
  }

  let finalUser = user;
  try {
    finalUser = await ensureUserActiveKey(env, user, provider);
  } catch (error) {
    console.warn('确保用户访问凭证失败:', error);
  }

  await pgUpdateUserMeta(env, finalUser.id, {
    last_login_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const refreshed = await pgGetUserById(env, finalUser.id);
  const session = await createSessionToken(env, finalUser.id, { email });

  return jsonResponse({
    token: session.token,
    expiresAt: session.expiresAt,
    user: sanitizeUser(refreshed || finalUser)
  });
}

async function handleDailySign(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  const auth = await getAuthenticatedUser(env, request);
  if (!auth) {
    return errorResponse('未登录或凭证失效', 401);
  }
  if (auth.disabled) {
    return errorResponse('账号已被禁用，如需解封请联系管理员', 403);
  }

  const user = await ensureUserActiveKey(env, auth.user, auth.user.default_provider);
  const today = getTodayDateString();
  const already = await pgHasUserSignedOnDay(env, user.id, today);
  if (already) {
    return errorResponse('今天已经签到过了，明天再来吧', 400);
  }

  await pgCreateUserSignin(env, user.id, today);

  let baseTime = user.key_expires_at ? new Date(user.key_expires_at).getTime() : Date.now();
  if (baseTime < Date.now()) {
    baseTime = Date.now();
  }
  const newExpiresAt = new Date(baseTime + 24 * 60 * 60 * 1000).toISOString();

  if (user.key_token) {
    await pgUpdateClientTokenExpiry(env, user.key_token, user.key_provider || user.default_provider || 'ollama', newExpiresAt);
  }

  await pgUpdateUserMeta(env, user.id, {
    key_expires_at: newExpiresAt,
    last_sign_in_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const refreshed = await pgGetUserById(env, user.id);

  return jsonResponse({
    success: true,
    keyExpiresAt: refreshed?.key_expires_at || newExpiresAt
  });
}

async function handleProfile(request, env) {
  if (request.method !== 'GET') {
    return errorResponse('Method Not Allowed', 405);
  }

  const auth = await getAuthenticatedUser(env, request);
  if (!auth) {
    return errorResponse('未登录或凭证失效', 401);
  }
  if (auth.disabled) {
    return errorResponse('账号已被禁用，如需解封请联系管理员', 403);
  }

  const refreshed = await pgGetUserById(env, auth.user.id);
  const base = refreshed || auth.user;
  let keyRequestCount = 0;

  if (base?.key_token) {
    const provider = normalizeProvider(base.key_provider || base.default_provider || 'ollama');
    const tokenRow = await pgGetClientToken(env, base.key_token, provider);
    if (tokenRow && typeof tokenRow.request_count === 'number') {
      keyRequestCount = tokenRow.request_count;
    }
  }

  return jsonResponse({ user: sanitizeUser(base, { keyRequestCount: keyRequestCount }) });
}

async function handleUserSignins(request, env) {
  if (request.method !== 'GET') {
    return errorResponse('Method Not Allowed', 405);
  }

  const auth = await getAuthenticatedUser(env, request);
  if (!auth) {
    return errorResponse('未登录或凭证失效', 401);
  }
  if (auth.disabled) {
    return errorResponse('账号已被禁用，如需解封请联系管理员', 403);
  }

  const url = new URL(request.url);
  const rawLimit = parseInt(url.searchParams.get('limit'), 10);
  const rawPage = parseInt(url.searchParams.get('page'), 10);
  const limit = Math.max(1, Math.min(50, Number.isFinite(rawLimit) ? rawLimit : 10));
  const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
  const offset = (page - 1) * limit;

  const [signins, total] = await Promise.all([
    pgListUserSignins(env, auth.user.id, limit, offset),
    pgCountUserSignins(env, auth.user.id)
  ]);

  const items = signins.map(item => ({
    id: item.id,
    signDay: item.sign_day,
    createdAt: item.created_at
  }));

  const pageCount = Math.max(1, Math.ceil((total || 0) / limit) || 1);

  return jsonResponse({
    items,
    total,
    page,
    limit,
    pageCount,
    hasNext: page < pageCount,
    hasPrev: page > 1
  });
}

async function handleSendVerificationCode(request, env) {
  if (request.method !== 'POST') {
    return errorResponse('Method Not Allowed', 405);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return errorResponse('Invalid JSON body', 400);
  }

  const rawEmail = body?.email;
  const purpose = body?.purpose || 'register';
  const email = normalizeEmail(rawEmail);
  const turnstileToken = body?.turnstileToken || body?.cfTurnstileToken;
  const remoteIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || undefined;

  if (!validateEmail(email)) {
    return errorResponse('请输入有效的邮箱地址', 400);
  }

  const turnstileOk = await verifyTurnstile(env, turnstileToken, remoteIp);
  if (!turnstileOk) {
    return errorResponse('Turnstile 验证失败，请刷新页面重试', 400);
  }

  if (!['register', 'login'].includes(purpose)) {
    return errorResponse('purpose 参数无效', 400);
  }

  const existingUser = await pgGetUserByEmail(env, email);
  if (purpose === 'login' && !existingUser) {
    return errorResponse('该邮箱未注册，无法发送登录验证码', 400);
  }
  if (purpose === 'register' && existingUser) {
    return errorResponse('该邮箱已注册，如需登录请直接获取验证码', 400);
  }
  if (purpose === 'login' && existingUser && existingUser.is_active === false) {
    return errorResponse('账号已被禁用，如需解封请联系管理员', 403);
  }

  try {
    await checkAndSetRateLimit(env, email, purpose);
  } catch (response) {
    if (response instanceof Response) {
      return response;
    }
    throw response;
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + EMAIL_CODE_TTL_SECONDS * 1000).toISOString();
  const requestId = crypto.randomUUID();

  try {
    const record = await pgCreateEmailVerificationCode(env, {
      email,
      code,
      purpose,
      expiresAt,
      requestId
    });

    await storeCodeInRedis(env, email, purpose, {
      code,
      purpose,
      expiresAt,
      attempts: 0,
      codeId: record?.id || null,
      requestId
    });

    await sendVerificationEmail(env, {
      to: email,
      code,
      ttlMinutes: Math.ceil(EMAIL_CODE_TTL_SECONDS / 60)
    });
  } catch (error) {
    await clearCodeInRedis(env, email, purpose);
    console.error('发送验证码失败:', error);
    return errorResponse('发送验证码失败，请稍后重试', 500);
  }

  return jsonResponse({ success: true });
}

export async function handleAuth(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/auth/send-code') {
    return await handleSendVerificationCode(request, env);
  }

  if (path === '/api/auth/register') {
    return await handleRegister(request, env);
  }

  if (path === '/api/auth/login') {
    return await handleLogin(request, env);
  }

  if (path === '/api/auth/sign') {
    return await handleDailySign(request, env);
  }

  if (path === '/api/auth/profile') {
    return await handleProfile(request, env);
  }

  if (path === '/api/auth/signins') {
    return await handleUserSignins(request, env);
  }

  return errorResponse('Not Found', 404);
}

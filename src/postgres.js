/**
 * PostgreSQL 数据访问模块
 * 基于 Supabase PostgREST API，通过 HTTP 完成增删改查。
 * 当未配置相关环境变量时，所有函数返回 null/false，调用方将回退到 KV 模式。
 */

const ACTIVE_KEYS_CACHE = {
  data: [],
  expires: 0
};

function parseProjectRef(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    const username = url.username || '';
    const parts = username.split('.');
    if (parts.length >= 2) {
      return parts[1];
    }
    return null;
  } catch (error) {
    console.warn('解析 DATABASE_URL 失败:', error);
    return null;
  }
}

function getRestBase(env) {
  if (!env) return null;
  if (env.SUPABASE_REST_URL) {
    return env.SUPABASE_REST_URL.replace(/\/$/, '');
  }
  if (env.DATABASE_URL) {
    const projectRef = parseProjectRef(env.DATABASE_URL);
    if (projectRef) {
      return `https://${projectRef}.supabase.co/rest/v1`;
    }
  }
  return null;
}

export function isPostgresEnabled(env) {
  return Boolean(env && env.DATABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY && getRestBase(env));
}

function buildHeaders(env, { hasBody = false, prefer, single, extraHeaders } = {}) {
  const headers = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`
  };

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (prefer) {
    headers['Prefer'] = prefer;
  }

  if (single) {
    headers['Accept'] = 'application/vnd.pgrst.object+json';
  }

  if (extraHeaders) {
    Object.assign(headers, extraHeaders);
  }

  return headers;
}

async function pgRequest(env, {
  method = 'GET',
  table,
  query,
  body,
  prefer,
  single = false,
  extraHeaders
}) {
  const base = getRestBase(env);
  if (!base) {
    return null;
  }

  const url = new URL(`${base}/${table}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value);
      }
    });
  }

  const headers = buildHeaders(env, {
    hasBody: body !== undefined,
    prefer,
    single,
    extraHeaders
  });

  try {
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    if (response.status === 204) {
      return null;
    }

    if (response.status === 406) {
      // Supabase 对 single 请求找不到数据时返回 406
      return null;
    }

    if (!response.ok) {
      const text = await response.text();
      console.warn('Postgres 请求失败:', method, url.toString(), response.status, text);
      return null;
    }

    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.warn('Postgres 请求异常:', error);
    return null;
  }
}

function clearActiveKeysCache() {
  ACTIVE_KEYS_CACHE.data = [];
  ACTIVE_KEYS_CACHE.expires = 0;
}

function normalizeKeyStatus(row) {
  const now = Date.now();
  const disabledUntil = row.disabled_until ? new Date(row.disabled_until).getTime() : null;
  const failedUntil = row.failed_until ? new Date(row.failed_until).getTime() : null;
  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : null;

  if (disabledUntil && disabledUntil > now) {
    return 'disabled';
  }
  if (failedUntil && failedUntil > now) {
    return 'failed';
  }
  if (expiresAt && expiresAt < now) {
    return 'expired';
  }
  return row.status || 'active';
}

function mapKeyRow(row) {
  return {
    api_key: row.api_key,
    username: row.username || 'N/A',
    status: normalizeKeyStatus(row),
    created_at: row.created_at || null,
    expires_at: row.expires_at || null
  };
}

export async function pgListApiKeys(env) {
  const rows = await pgRequest(env, {
    table: 'ollama_api_keys',
    query: {
      select: 'api_key,username,status,created_at,expires_at,failed_until,disabled_until'
    }
  });

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(mapKeyRow);
}

async function pgListApiKeysRaw(env) {
  const rows = await pgRequest(env, {
    table: 'ollama_api_keys',
    query: {
      select: 'api_key,username,status,created_at,expires_at,failed_until,disabled_until'
    }
  });
  return Array.isArray(rows) ? rows : [];
}

export async function pgListActiveApiKeys(env) {
  const now = Date.now();
  if (ACTIVE_KEYS_CACHE.expires > now) {
    return ACTIVE_KEYS_CACHE.data;
  }

  const rows = await pgListApiKeysRaw(env);
  const active = rows
    .filter(row => normalizeKeyStatus(row) === 'active')
    .map(row => row.api_key);

  ACTIVE_KEYS_CACHE.data = active;
  ACTIVE_KEYS_CACHE.expires = now + 10000; // 缓存 10 秒
  return active;
}

async function pgGetKey(env, apiKey) {
  return await pgRequest(env, {
    table: 'ollama_api_keys',
    query: {
      select: 'api_key,username,status,created_at,expires_at,failed_until,disabled_until,consecutive_failures',
      api_key: `eq.${apiKey}`
    },
    single: true
  });
}

export async function pgAddApiKey(env, apiKey, username = null, ttl = null) {
  const existing = await pgGetKey(env, apiKey);
  if (existing) {
    return false;
  }

  const now = new Date();
  const expiresAt = ttl ? new Date(now.getTime() + ttl * 1000).toISOString() : null;

  const body = [{
    api_key: apiKey,
    username: username || 'N/A',
    status: 'active',
    created_at: now.toISOString(),
    expires_at: expiresAt,
    consecutive_failures: 0
  }];

  const result = await pgRequest(env, {
    method: 'POST',
    table: 'ollama_api_keys',
    body,
    prefer: 'resolution=ignore-duplicates,return=minimal'
  });

  clearActiveKeysCache();
  return result !== null;
}

export async function pgRemoveApiKey(env, apiKey) {
  const result = await pgRequest(env, {
    method: 'DELETE',
    table: 'ollama_api_keys',
    query: {
      api_key: `eq.${apiKey}`
    },
    prefer: 'return=representation'
  });

  clearActiveKeysCache();
  return Array.isArray(result) ? result.length > 0 : Boolean(result);
}

export async function pgImportApiKeys(env, keys, username = null, ttl = null) {
  if (!Array.isArray(keys) || keys.length === 0) {
    return {
      total: 0,
      added: 0,
      existing: 0
    };
  }

  const { uniqueEntries, duplicateCount, beforeCount } = await prepareSupabaseImport(env, keys.map(key => ({
    apiKey: key,
    username: username || 'N/A',
    ttl
  })));

  if (uniqueEntries.length === 0) {
    return {
      total: keys.length,
      added: 0,
      existing: keys.length,
      duplicates: duplicateCount
    };
  }

  const now = new Date();

  const configuredChunkSize = parseInt(env.POSTGRES_IMPORT_CHUNK_SIZE || '200', 10);
  const chunkSize = Number.isFinite(configuredChunkSize) && configuredChunkSize > 0
    ? Math.min(configuredChunkSize, 500)
    : 200;

  for (let i = 0; i < uniqueEntries.length; i += chunkSize) {
    const chunk = uniqueEntries.slice(i, i + chunkSize).map(entry => ({
      api_key: entry.apiKey,
      username: entry.username,
      status: 'active',
      created_at: now.toISOString(),
      expires_at: entry.expiresAt,
      consecutive_failures: 0
    }));

    await pgRequest(env, {
      method: 'POST',
      table: 'ollama_api_keys',
      body: chunk,
      prefer: 'resolution=ignore-duplicates,return=minimal'
    });
  }

  clearActiveKeysCache();

  const added = await countInsertedRows(env, beforeCount);

  return {
    total: keys.length,
    added,
    existing: keys.length - added,
    duplicates: duplicateCount
  };
}

export async function pgImportApiAccountEntries(env, entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      total: 0,
      added: 0,
      duplicates: 0,
      skipped: entries ? entries.length : 0
    };
  }

  const { uniqueEntries, duplicateCount, beforeCount } = await prepareSupabaseImport(env, entries);

  if (uniqueEntries.length === 0) {
    return {
      total: entries.length,
      added: 0,
      duplicates: duplicateCount,
      skipped: entries.length
    };
  }

  const now = new Date();

  const configuredChunkSize = parseInt(env.POSTGRES_IMPORT_CHUNK_SIZE || '200', 10);
  const chunkSize = Number.isFinite(configuredChunkSize) && configuredChunkSize > 0
    ? Math.min(configuredChunkSize, 500)
    : 200;

  for (let i = 0; i < uniqueEntries.length; i += chunkSize) {
    const chunk = uniqueEntries.slice(i, i + chunkSize).map(entry => ({
      api_key: entry.apiKey,
      username: entry.username,
      status: 'active',
      created_at: now.toISOString(),
      expires_at: entry.expiresAt,
      consecutive_failures: 0
    }));

    await pgRequest(env, {
      method: 'POST',
      table: 'ollama_api_keys',
      body: chunk,
      prefer: 'resolution=ignore-duplicates,return=minimal'
    });
  }

  clearActiveKeysCache();

  const added = await countInsertedRows(env, beforeCount);

  return {
    total: entries.length,
    added,
    duplicates: duplicateCount,
    skipped: entries.length - added
  };
}

export async function pgCountApiKeys(env) {
  const base = getRestBase(env);
  if (!base) {
    return 0;
  }

  try {
    const url = `${base}/ollama_api_keys?select=api_key`;
    const headers = buildHeaders(env, {
      prefer: 'count=exact',
      extraHeaders: {
        'Range-Unit': 'items',
        Range: '0-0'
      }
    });

    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    if (!(response.status === 200 || response.status === 206)) {
      const text = await response.text();
      console.warn('Postgres count request failed:', response.status, text);
      return 0;
    }

    const contentRange = response.headers.get('content-range');
    if (contentRange) {
      const parts = contentRange.split('/');
      if (parts.length === 2) {
        const total = parseInt(parts[1], 10);
        if (!Number.isNaN(total)) {
          return total;
        }
      }
    }

    const data = await response.json();
    return Array.isArray(data) ? data.length : 0;
  } catch (error) {
    console.warn('Postgres count request error:', error);
    return 0;
  }
}

export async function pgMarkApiKeyFailed(env, apiKey, disableAfterConsecutive = 3, ttlSeconds = 3600) {
  const row = await pgGetKey(env, apiKey);
  if (!row) {
    return;
  }

  const now = Date.now();
  const failedUntil = new Date(now + ttlSeconds * 1000).toISOString();
  const consecutive = (row.consecutive_failures || 0) + 1;

  const update = {
    status: consecutive >= disableAfterConsecutive ? 'disabled' : 'failed',
    failed_until: failedUntil,
    consecutive_failures: consecutive
  };

  if (consecutive >= disableAfterConsecutive) {
    update.disabled_until = new Date(now + ttlSeconds * 1000).toISOString();
  }

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_keys',
    query: {
      api_key: `eq.${apiKey}`
    },
    body: update,
    prefer: 'return=minimal'
  });

  clearActiveKeysCache();
}

export async function pgEnableApiKey(env, apiKey) {
  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_keys',
    query: {
      api_key: `eq.${apiKey}`
    },
    body: {
      status: 'active',
      failed_until: null,
      disabled_until: null,
      consecutive_failures: 0
    },
    prefer: 'return=minimal'
  });

  clearActiveKeysCache();
}

export async function pgDisableApiKey(env, apiKey, duration = 3600) {
  const disabledUntil = duration > 0
    ? new Date(Date.now() + duration * 1000).toISOString()
    : null;

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_keys',
    query: {
      api_key: `eq.${apiKey}`
    },
    body: {
      status: 'disabled',
      disabled_until: disabledUntil
    },
    prefer: 'return=minimal'
  });

  clearActiveKeysCache();
}

export async function pgGetGlobalStats(env) {
  try {
    const row = await pgRequest(env, {
      table: 'ollama_api_global_stats',
      query: {
        select: 'id,total_requests,success_count,failure_count,updated_at',
        id: 'eq.global'
      },
      single: true
    });

    if (!row) {
      return null;
    }

    const totalRequests = row.total_requests || 0;
    const successCount = row.success_count || 0;
    const failureCount = row.failure_count || 0;

    return {
      totalRequests,
      successCount,
      failureCount,
      successRate: totalRequests > 0 ? (successCount / totalRequests * 100) : 0,
      updatedAt: row.updated_at || new Date().toISOString()
    };
  } catch (error) {
    console.warn('pgGetGlobalStats error:', error);
    return null;
  }
}

export async function pgIncrementGlobalStats(env, { isSuccess }) {
  try {
    const existing = await pgRequest(env, {
      table: 'ollama_api_global_stats',
      query: {
        select: 'id,total_requests,success_count,failure_count',
        id: 'eq.global'
      },
      single: true
    });

    const now = new Date().toISOString();
    const totalRequests = (existing?.total_requests || 0) + 1;
    const successCount = (existing?.success_count || 0) + (isSuccess ? 1 : 0);
    const failureCount = (existing?.failure_count || 0) + (isSuccess ? 0 : 1);

    if (!existing) {
      await pgRequest(env, {
        method: 'POST',
        table: 'ollama_api_global_stats',
        body: [{
          id: 'global',
          total_requests: totalRequests,
          success_count: successCount,
          failure_count: failureCount,
          updated_at: now
        }],
        prefer: 'return=minimal'
      });
    } else {
      await pgRequest(env, {
        method: 'PATCH',
        table: 'ollama_api_global_stats',
        query: {
          id: 'eq.global'
        },
        body: {
          total_requests: totalRequests,
          success_count: successCount,
          failure_count: failureCount,
          updated_at: now
        },
        prefer: 'return=minimal'
      });
    }

    const verify = await pgRequest(env, {
      table: 'ollama_api_global_stats',
      query: {
        select: 'id',
        id: 'eq.global'
      },
      single: true
    });

    return Boolean(verify);
  } catch (error) {
    console.warn('pgIncrementGlobalStats error:', error);
    return false;
  }
}

async function pgGetKeyStatsRow(env, apiKey) {
  return await pgRequest(env, {
    table: 'ollama_api_key_stats',
    query: {
      select: 'api_key,total_requests,success_count,failure_count,last_used,last_success,last_failure,success_rate,consecutive_failures,created_at',
      api_key: `eq.${apiKey}`
    },
    single: true
  });
}

export async function pgRecordKeyStats(env, apiKey, { isSuccess }) {
  const existing = await pgGetKeyStatsRow(env, apiKey);
  const now = new Date().toISOString();

  if (!existing) {
    const body = [{
      api_key: apiKey,
      total_requests: 1,
      success_count: isSuccess ? 1 : 0,
      failure_count: isSuccess ? 0 : 1,
      last_used: now,
      last_success: isSuccess ? now : null,
      last_failure: isSuccess ? null : now,
      success_rate: isSuccess ? 100 : 0,
      consecutive_failures: isSuccess ? 0 : 1,
      created_at: now
    }];

    await pgRequest(env, {
      method: 'POST',
      table: 'ollama_api_key_stats',
      body,
      prefer: 'resolution=ignore-duplicates,return=minimal'
    });
    return;
  }

  const totalRequests = (existing.total_requests || 0) + 1;
  const successCount = (existing.success_count || 0) + (isSuccess ? 1 : 0);
  const failureCount = (existing.failure_count || 0) + (isSuccess ? 0 : 1);
  const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(2) : 0;
  const consecutiveFailures = isSuccess ? 0 : (existing.consecutive_failures || 0) + 1;

  const update = {
    total_requests: totalRequests,
    success_count: successCount,
    failure_count: failureCount,
    success_rate: Number(successRate),
    last_used: now,
    last_success: isSuccess ? now : existing.last_success,
    last_failure: isSuccess ? existing.last_failure : now,
    consecutive_failures: consecutiveFailures
  };

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_key_stats',
    query: {
      api_key: `eq.${apiKey}`
    },
    body: update,
    prefer: 'return=minimal'
  });
}

export async function pgGetKeyStats(env, apiKey) {
  const row = await pgGetKey(env, apiKey);
  if (!row) {
    return {
      apiKey: apiKey.substring(0, 20) + '...',
      fullKey: apiKey,
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      lastUsed: null,
      status: 'unknown'
    };
  }

  const stats = await pgGetKeyStatsRow(env, apiKey);

  const status = normalizeKeyStatus(row);

  if (!stats) {
    return {
      apiKey: apiKey.substring(0, 20) + '...',
      fullKey: apiKey,
      totalRequests: 0,
      successCount: 0,
      failureCount: 0,
      successRate: 0,
      lastUsed: null,
      status
    };
  }

  return {
    apiKey: apiKey.substring(0, 20) + '...',
    fullKey: apiKey,
    totalRequests: stats.total_requests || 0,
    successCount: stats.success_count || 0,
    failureCount: stats.failure_count || 0,
    successRate: stats.success_rate || 0,
    lastUsed: stats.last_used || null,
    status,
    disabledReason: status === 'disabled' ? 'auto' : null
  };
}

export async function pgListKeyStats(env) {
  const keys = await pgListApiKeysRaw(env);
  const statsRows = await pgRequest(env, {
    table: 'ollama_api_key_stats',
    query: {
      select: 'api_key,total_requests,success_count,failure_count,last_used,success_rate'
    }
  }) || [];

  const statsMap = new Map(statsRows.map(row => [row.api_key, row]));

  return keys.map(row => {
    const stats = statsMap.get(row.api_key) || {};
    return {
      apiKey: row.api_key.substring(0, 20) + '...',
      fullKey: row.api_key,
      totalRequests: stats.total_requests || 0,
      successCount: stats.success_count || 0,
      failureCount: stats.failure_count || 0,
      successRate: stats.success_rate || 0,
      lastUsed: stats.last_used || null,
      status: normalizeKeyStatus(row),
      disabledReason: normalizeKeyStatus(row) === 'disabled' ? 'auto' : null
    };
  });
}

export async function pgCreateClientToken(env, tokenData) {
  const body = [{
    token: tokenData.token,
    name: tokenData.name,
    created_at: tokenData.createdAt || new Date().toISOString(),
    expires_at: tokenData.expiresAt || null,
    request_count: tokenData.requestCount || 0
  }];

  await pgRequest(env, {
    method: 'POST',
    table: 'ollama_api_client_tokens',
    body,
    prefer: 'resolution=ignore-duplicates,return=minimal'
  });
}

export async function pgGetClientToken(env, token) {
  return await pgRequest(env, {
    table: 'ollama_api_client_tokens',
    query: {
      select: 'token,name,created_at,expires_at,request_count',
      token: `eq.${token}`
    },
    single: true
  });
}

export async function pgIncrementClientTokenUsage(env, token) {
  const row = await pgGetClientToken(env, token);
  if (!row) return;

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_client_tokens',
    query: {
      token: `eq.${token}`
    },
    body: {
      request_count: (row.request_count || 0) + 1
    },
    prefer: 'return=minimal'
  });
}

export async function pgListClientTokens(env) {
  const rows = await pgRequest(env, {
    table: 'ollama_api_client_tokens',
    query: {
      select: 'token,name,created_at,expires_at,request_count'
    }
  });

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map(row => ({
    token: row.token,
    name: row.name,
    createdAt: row.created_at,
    expires_at: row.expires_at,
    requestCount: row.request_count || 0
  }));
}

export async function pgDeleteClientToken(env, token) {
  await pgRequest(env, {
    method: 'DELETE',
    table: 'ollama_api_client_tokens',
    query: {
      token: `eq.${token}`
    },
    prefer: 'return=minimal'
  });
}

export async function pgUpsertModelStats(env, modelName, { isSuccess, timestamp }) {
  const existing = await pgRequest(env, {
    table: 'ollama_api_model_stats',
    query: {
      select: 'model,total_requests,success_count,failure_count,first_used',
      model: `eq.${modelName}`
    },
    single: true
  });

  const now = timestamp || new Date().toISOString();

  if (!existing) {
    const body = [{
      model: modelName,
      total_requests: 1,
      success_count: isSuccess ? 1 : 0,
      failure_count: isSuccess ? 0 : 1,
      first_used: now,
      last_used: now
    }];

    await pgRequest(env, {
      method: 'POST',
      table: 'ollama_api_model_stats',
      body,
      prefer: 'resolution=ignore-duplicates,return=minimal'
    });
    return;
  }

  const updated = {
    total_requests: (existing.total_requests || 0) + 1,
    success_count: (existing.success_count || 0) + (isSuccess ? 1 : 0),
    failure_count: (existing.failure_count || 0) + (isSuccess ? 0 : 1),
    last_used: now
  };

  if (!existing.first_used) {
    updated.first_used = now;
  }

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_model_stats',
    query: { model: `eq.${modelName}` },
    body: updated,
    prefer: 'return=minimal'
  });
}

export async function pgUpsertModelHourly(env, modelName, hour, { isSuccess }) {
  const existing = await pgRequest(env, {
    table: 'ollama_api_model_hourly',
    query: {
      select: 'model,hour,requests,success,failure',
      model: `eq.${modelName}`,
      hour: `eq.${hour}`
    },
    single: true
  });

  if (!existing) {
    const body = [{
      model: modelName,
      hour,
      requests: 1,
      success: isSuccess ? 1 : 0,
      failure: isSuccess ? 0 : 1
    }];

    await pgRequest(env, {
      method: 'POST',
      table: 'ollama_api_model_hourly',
      body,
      prefer: 'resolution=ignore-duplicates,return=minimal'
    });
    return;
  }

  const updated = {
    requests: (existing.requests || 0) + 1,
    success: (existing.success || 0) + (isSuccess ? 1 : 0),
    failure: (existing.failure || 0) + (isSuccess ? 0 : 1)
  };

  await pgRequest(env, {
    method: 'PATCH',
    table: 'ollama_api_model_hourly',
    query: {
      model: `eq.${modelName}`,
      hour: `eq.${hour}`
    },
    body: updated,
    prefer: 'return=minimal'
  });
}

export async function pgListModelStats(env, limit = 10) {
  const rows = await pgRequest(env, {
    table: 'ollama_api_model_stats',
    query: {
      select: 'model,total_requests,success_count,failure_count,last_used',
      order: 'total_requests.desc',
      limit: String(limit)
    }
  });

  return Array.isArray(rows) ? rows : [];
}

export async function pgGetModelHourlyAggregated(env, { hours = 24 } = {}) {
  const now = Date.now();
  const start = new Date(now - (hours - 1) * 3600000);
  const startHour = start.toISOString().slice(0, 13);

  const rows = await pgRequest(env, {
    table: 'ollama_api_model_hourly',
    query: {
      select: 'hour,sum_requests:sum(requests),sum_success:sum(success),sum_failure:sum(failure)',
      and: `(gte.hour.${startHour})`,
      group: 'hour',
      order: 'hour.asc'
    }
  });

  return Array.isArray(rows) ? rows : [];
}

export async function pgGetRecentTopModels(env, { hours = 1, limit = 3 } = {}) {
  const now = Date.now();
  const start = new Date(now - (hours - 1) * 3600000);
  const startHour = start.toISOString().slice(0, 13);

  const rows = await pgRequest(env, {
    table: 'ollama_api_model_hourly',
    query: {
      select: 'model,sum_requests:sum(requests),sum_success:sum(success),sum_failure:sum(failure)',
      and: `(gte.hour.${startHour})`,
      group: 'model',
      order: 'sum_requests.desc',
      limit: String(limit)
    }
  });

  return Array.isArray(rows) ? rows : [];
}

async function prepareSupabaseImport(env, entries) {
  const normalized = [];
  for (const entry of entries) {
    if (!entry || !entry.apiKey) continue;
    normalized.push({
      apiKey: entry.apiKey,
      username: entry.username || 'N/A',
      expiresAt: entry.ttl
        ? new Date(Date.now() + entry.ttl * 1000).toISOString()
        : entry.expiresAt || null
    });
  }

  if (normalized.length === 0) {
    return {
      uniqueEntries: [],
      duplicateCount: 0,
      beforeCount: 0
    };
  }

  const existingRows = await pgRequest(env, {
    table: 'ollama_api_keys',
    query: {
      select: 'api_key'
    }
  }) || [];

  const existingSet = new Set(existingRows.map(row => row.api_key));

  const uniqueEntries = [];
  let duplicateCount = 0;

  for (const entry of normalized) {
    if (existingSet.has(entry.apiKey)) {
      duplicateCount++;
    } else {
      existingSet.add(entry.apiKey);
      uniqueEntries.push(entry);
    }
  }

  return {
    uniqueEntries,
    duplicateCount,
    beforeCount: existingRows.length
  };
}

async function countInsertedRows(env, beforeCount) {
  const afterRows = await pgRequest(env, {
    table: 'ollama_api_keys',
    query: {
      select: 'api_key'
    }
  }) || [];

  return Math.max(0, afterRows.length - beforeCount);
}

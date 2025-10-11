/**
 * Dashboard.js 静态文件内容
 */

export const dashboardJs = `/**
 * Dashboard JavaScript - 仪表盘逻辑
 */

// 常量定义
const STORAGE_KEY = 'adminToken';
const PROJECT_START_DISPLAY = '2025-10-09';
const PROJECT_START_DATE = new Date('2025-10-09T00:00:00+08:00');
const PROVIDER_COPY = {
    ollama: {
        label: 'Ollama',
        badge: 'Ollama API Pool',
        heroTitle: '构建稳定的 Ollama API 代理池',
        heroDesc: '通过统一入口调度 Ollama 多账号，自动完成负载均衡、故障转移与实时统计，确保应用稳定可用。'
    },
    openrouter: {
        label: 'OpenRouter',
        badge: 'OpenRouter API Pool',
        heroTitle: '构建统一的 OpenRouter 代理池',
        heroDesc: '集中管理 OpenRouter 上游 Key，落实 Referer 约束、模型分发与调用统计，让多供应商场景更清晰易控。'
    }
};

let currentTab = 'api-keys';
let currentProvider = localStorage.getItem('provider') || 'ollama';

// 获取 Token
function getToken() {
    return localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
}

// Toast 通知
function showToast(message, type = 'info') {
    const colors = {
        success: 'from-green-500 to-emerald-600',
        error: 'from-red-500 to-rose-600',
        info: 'from-blue-500 to-indigo-600',
        warning: 'from-yellow-500 to-orange-600'
    };

    const id = \`toast-\${Date.now()}\`;
    const toast = $(\`
        <div id="\${id}" class="fixed top-4 right-4 z-50 min-w-[300px] transform transition-all duration-300 translate-x-full opacity-0">
            <div class="bg-gradient-to-r \${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                <div class="flex-1">\${message}</div>
                <button class="text-white hover:text-gray-200 transition-colors" onclick="$('#\${id}').remove()">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>
    \`);

    $('body').append(toast);
    setTimeout(() => toast.removeClass('translate-x-full opacity-0'), 50);
    setTimeout(() => {
        toast.addClass('translate-x-full opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = year + '年' + month + '月' + day + '日 ' + hours + ':' + minutes + ':' + seconds;
    $('#current-time').text(timeStr);
}

function updateProjectRuntime() {
    if (!PROJECT_START_DATE || Number.isNaN(PROJECT_START_DATE.getTime())) {
        return;
    }

    const now = new Date();
    let diffMs = now.getTime() - PROJECT_START_DATE.getTime();
    if (diffMs < 0) diffMs = 0;

    const totalMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    $('#project-launch-date').text(PROJECT_START_DISPLAY);
    $('#project-runtime').text(days + ' 天 ' + hours + ' 小时 ' + minutes + ' 分钟');
}

// 切换标签页
function switchTab(tabName, element) {
    currentTab = tabName;

    // 更新按钮状态
    $('.tab-btn').removeClass('bg-gradient-to-r from-indigo-500 to-purple-600 text-white')
                 .addClass('text-gray-600 hover:text-indigo-600');
    $(element).addClass('bg-gradient-to-r from-indigo-500 to-purple-600 text-white')
              .removeClass('text-gray-600 hover:text-indigo-600');

    // 切换内容区
    $('.tab-content').addClass('hidden');
    $(\`#\${tabName}-content\`).removeClass('hidden');

    // 加载对应数据
    if (tabName === 'api-keys') loadApiKeys();
    else if (tabName === 'tokens') loadClientTokens();
    else if (tabName === 'stats') loadStats();
}

// 退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.href = '/';
    }
}

function refreshCurrentView() {
    if (currentTab === 'api-keys') {
        loadApiKeys(apiKeysPage);
    } else if (currentTab === 'tokens') {
        loadClientTokens();
    } else if (currentTab === 'stats') {
        loadStats();
    }
}

// 更新提供方切换按钮的状态样式
function updateProviderSelection() {
    $('[data-provider-option]').removeClass('bg-primary text-white').addClass('bg-white text-slate-600');
    $('[data-provider-option="' + currentProvider + '"]').addClass('bg-primary text-white').removeClass('bg-white text-slate-600');
}

// 根据提供方更新页面文案
function applyProviderTexts() {
    const copy = PROVIDER_COPY[currentProvider] || PROVIDER_COPY.ollama;
    document.title = copy.label + ' API Pool 管理中心';

    $('[data-provider-text="badge"]').text(copy.badge);
    $('[data-provider-text="hero-title"]').text(copy.heroTitle);
    $('[data-provider-text="hero-desc"]').text(copy.heroDesc);
}

function switchProvider(provider) {
    if (!provider) {
        return;
    }

    if (provider === currentProvider) {
        updateProviderSelection();
        return;
    }

    currentProvider = provider;
    localStorage.setItem('provider', provider);

    updateProviderSelection();
    applyProviderTexts();

    refreshCurrentView();
}

function withProviderQuery(url) {
    if (!url) return url;
    return url.includes('?') ? url + '&provider=' + currentProvider : url + '?provider=' + currentProvider;
}

function withProviderBody(body = {}) {
    return { ...body, provider: currentProvider };
}

// ==================== API Keys 管理 ====================

// 分页状态
let apiKeysData = [];
let apiKeysPage = 1;
let apiKeysPageSize = 10;
let apiKeysTotalPages = 0;
let apiKeysTotalCount = 0;

async function loadApiKeys(page = 1) {
    try {
        // 使用分页参数请求后端
        const response = await fetch(withProviderQuery('/admin/api-keys?page=' + page + '&pageSize=' + apiKeysPageSize), {
            headers: { 'Authorization': \`Bearer \${getToken()}\` }
        });

        if (!response.ok) throw new Error('加载失败');

        const data = await response.json();
        apiKeysData = data.api_keys || [];
        apiKeysPage = page;
        apiKeysTotalPages = data.totalPages || 0;
        apiKeysTotalCount = data.total || 0;

        renderApiKeysTable();
    } catch (error) {
        showToast('加载 API Keys 失败: ' + error.message, 'error');
    }
}

function renderApiKeysTable() {
    // 后端已经做了分页，直接渲染
    $('#api-keys-table').html(apiKeysData.length === 0
        ? '<tr><td colspan="7" class="text-center py-8 text-gray-500">暂无 API Keys</td></tr>'
        : apiKeysData.map((key, index) => {
            const keyId = \`key-row-\${index}\`;
            return \`
                <tr class="border-b hover:bg-gray-50 transition-colors" id="\${keyId}" data-api-key="\${escapeHtml(key.api_key)}">
                    <td class="px-6 py-4">
                        <input type="checkbox" class="key-checkbox rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" data-index="\${index}">
                    </td>
                    <td class="px-6 py-4 text-sm">\${((apiKeysPage - 1) * apiKeysPageSize) + index + 1}</td>
                    <td class="px-6 py-4 font-mono text-sm">\${key.username || 'N/A'}</td>
                    <td class="px-6 py-4 font-mono text-sm">
                        <span id="key-\${index}" class="select-all">\${maskApiKey(key.api_key)}</span>
                    </td>
                    <td class="px-6 py-4">
                        <span id="status-\${index}" class="px-3 py-1 text-xs rounded-full \${key.status === 'active' ? 'bg-green-100 text-green-700' : key.status === 'disabled' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}">
                            \${key.status === 'active' ? '正常' : key.status === 'disabled' ? '已禁用' : '失败'}
                        </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                        \${formatTTL(key.expires_at)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button onclick="verifySingleKeyByRow('\${keyId}', \${index})" class="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors" title="验证">
                                🔍
                            </button>
                            <button onclick="copyApiKeyByRow('\${keyId}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors" title="复制">
                                📋
                            </button>
                            \${key.status === 'active' ?
                                \`<button onclick="toggleApiKeyStatusByRow('\${keyId}', 'disable')" class="text-yellow-600 hover:text-yellow-800 text-sm font-medium transition-colors" title="禁用">⏸</button>\` :
                                \`<button onclick="toggleApiKeyStatusByRow('\${keyId}', 'enable')" class="text-green-600 hover:text-green-800 text-sm font-medium transition-colors" title="启用">▶</button>\`
                            }
                            <button onclick="deleteApiKeyByRow('\${keyId}')" class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors" title="删除">
                                🗑
                            </button>
                        </div>
                    </td>
                </tr>
            \`;
        }).join('')
    );

    // 渲染分页控件（使用后端返回的总数）
    renderPagination('api-keys', apiKeysTotalCount, apiKeysPage, apiKeysPageSize, (page) => {
        loadApiKeys(page);
    });
}

// 通用分页控件渲染
function renderPagination(containerId, totalItems, currentPage, pageSize, onPageChange) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const container = $(\`#\${containerId}-pagination\`);

    if (totalPages <= 1) {
        container.html('');
        return;
    }

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    let html = \`
        <div class="flex items-center justify-between mt-4 px-6 py-3 bg-gray-50 rounded-xl">
            <div class="text-sm text-gray-600">
                显示 <span class="font-medium">\${startItem}</span> - <span class="font-medium">\${endItem}</span>
                共 <span class="font-medium">\${totalItems}</span> 条
            </div>
            <div class="flex gap-2">
                <button onclick="window.paginationCallbacks['\${containerId}'](1)"
                    \${currentPage === 1 ? 'disabled' : ''}
                    class="px-3 py-1 text-sm rounded-lg \${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}">
                    首页
                </button>
                <button onclick="window.paginationCallbacks['\${containerId}'](\${currentPage - 1})"
                    \${currentPage === 1 ? 'disabled' : ''}
                    class="px-3 py-1 text-sm rounded-lg \${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}">
                    上一页
                </button>
    \`;

    // 页码按钮
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        html += \`<span class="px-2 text-gray-400">...</span>\`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += \`
            <button onclick="window.paginationCallbacks['\${containerId}'](\${i})"
                class="px-3 py-1 text-sm rounded-lg \${i === currentPage ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}">
                \${i}
            </button>
        \`;
    }

    if (endPage < totalPages) {
        html += \`<span class="px-2 text-gray-400">...</span>\`;
    }

    html += \`
                <button onclick="window.paginationCallbacks['\${containerId}'](\${currentPage + 1})"
                    \${currentPage === totalPages ? 'disabled' : ''}
                    class="px-3 py-1 text-sm rounded-lg \${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}">
                    下一页
                </button>
                <button onclick="window.paginationCallbacks['\${containerId}'](\${totalPages})"
                    \${currentPage === totalPages ? 'disabled' : ''}
                    class="px-3 py-1 text-sm rounded-lg \${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}">
                    末页
                </button>
            </div>
        </div>
    \`;

    container.html(html);

    // 存储回调
    if (!window.paginationCallbacks) {
        window.paginationCallbacks = {};
    }
    window.paginationCallbacks[containerId] = onPageChange;
}

// 格式化 TTL 显示
function formatTTL(expiresAt) {
    if (!expiresAt) return '永久';
    const expireTime = new Date(expiresAt);
    const now = new Date();
    const diff = expireTime - now;

    if (diff <= 0) return '<span class="text-red-600">已过期</span>';

    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (days > 0) return \`\${days}天\${hours % 24}小时\`;
    if (hours > 0) return \`\${hours}小时\`;
    return \`\${Math.floor(diff / 60000)}分钟\`;
}

// HTML 转义
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// 从行元素获取 API Key
function getApiKeyFromRow(rowId) {
    const row = document.getElementById(rowId);
    if (!row) {
        console.error('找不到行:', rowId);
        return null;
    }
    // 从 data-api-key 属性获取（HTML 转义后的）
    const escapedKey = row.getAttribute('data-api-key');
    // 反转义 HTML 实体
    const textarea = document.createElement('textarea');
    textarea.innerHTML = escapedKey;
    return textarea.value;
}

// 验证单个 API Key（通过行 ID）
function verifySingleKeyByRow(rowId, index) {
    const apiKey = getApiKeyFromRow(rowId);
    if (!apiKey) {
        showToast('无法获取 API Key', 'error');
        return;
    }
    verifySingleKey(apiKey, index);
}

// 复制 API Key（通过行 ID）
function copyApiKeyByRow(rowId) {
    const apiKey = getApiKeyFromRow(rowId);
    if (!apiKey) {
        showToast('无法获取 API Key', 'error');
        return;
    }
    copyApiKey(apiKey);
}

// 切换 API Key 状态（通过行 ID）
function toggleApiKeyStatusByRow(rowId, action) {
    const apiKey = getApiKeyFromRow(rowId);
    if (!apiKey) {
        showToast('无法获取 API Key', 'error');
        return;
    }
    toggleApiKeyStatus(apiKey, action);
}

// 删除 API Key（通过行 ID）
function deleteApiKeyByRow(rowId) {
    const apiKey = getApiKeyFromRow(rowId);
    if (!apiKey) {
        showToast('无法获取 API Key', 'error');
        return;
    }
    deleteApiKey(apiKey);
}

function maskApiKey(key) {
    if (!key || key.length < 8) return key;
    return key.substring(0, 4) + '****' + key.substring(key.length - 4);
}

// 复制 API Key
async function copyApiKey(apiKey) {
    try {
        await navigator.clipboard.writeText(apiKey);
        showToast('API Key 已复制到剪贴板', 'success');
    } catch (error) {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = apiKey;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('API Key 已复制到剪贴板', 'success');
    }
}

// 切换 API Key 状态 (启用/禁用)
async function toggleApiKeyStatus(apiKey, action) {
    const actionText = action === 'disable' ? '禁用' : '启用';

    try {
        const endpoint = action === 'disable' ? '/admin/keys/disable' : '/admin/keys/enable';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ apiKey, duration: action === 'disable' ? 3600 : undefined }))
        });

        if (!response.ok) throw new Error(\`\${actionText}失败\`);

        showToast(\`API Key \${actionText}成功\`, 'success');
        loadApiKeys();
        loadStats();
    } catch (error) {
        showToast(\`\${actionText}失败: \` + error.message, 'error');
    }
}

async function addApiKey() {
    const username = $('#new-username').val().trim();
    const apiKey = $('#new-api-key').val().trim();
    const ttl = parseInt($('#new-api-key-ttl').val()) || 0;

    if (!username || !apiKey) {
        showToast('请填写用户名和 API Key', 'warning');
        return;
    }

    try {
        const response = await fetch(withProviderQuery('/admin/api-keys'), {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ username, api_key: apiKey, ttl: ttl > 0 ? ttl : null }))
        });

        if (!response.ok) throw new Error('添加失败');

        showToast('API Key 添加成功', 'success');
        $('#new-username').val('');
        $('#new-api-key').val('');
        $('#new-api-key-ttl').val('0');
        loadApiKeys();
        loadStats();
    } catch (error) {
        showToast('添加失败: ' + error.message, 'error');
    }
}

async function deleteApiKey(apiKey) {
    if (!confirm('确定要删除这个 API Key 吗？')) return;

    try {
        const response = await fetch(\`/admin/api-keys/\${encodeURIComponent(apiKey)}\`, {
            method: 'DELETE',
            headers: { 'Authorization': \`Bearer \${getToken()}\` }
        });

        if (!response.ok) throw new Error('删除失败');

        showToast('API Key 删除成功', 'success');
        loadApiKeys();
        loadStats();
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
}

// 批量删除选中的 API Keys
async function deleteSelectedKeys() {
    const selectedCheckboxes = $('.key-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        showToast('请先选择要删除的 API Keys', 'warning');
        return;
    }

    if (!confirm(\`确定要删除选中的 \${selectedCheckboxes.length} 个 API Keys 吗？此操作不可恢复！\`)) {
        return;
    }

    const apiKeys = [];
    selectedCheckboxes.each(function() {
        const index = $(this).data('index');
        const rowId = \`key-row-\${index}\`;
        const apiKey = getApiKeyFromRow(rowId);
        if (apiKey) {
            apiKeys.push(apiKey);
        }
    });

    if (apiKeys.length === 0) {
        showToast('无法获取选中的 API Keys', 'error');
        return;
    }

    await batchDeleteKeys(apiKeys);
}

// 删除全部 API Keys
async function deleteAllKeys() {
    if (apiKeysData.length === 0) {
        showToast('没有可删除的 API Keys', 'warning');
        return;
    }

    const totalCount = apiKeysData.length;

    // 三次确认，防止误删
    if (!confirm(\`⚠️ 警告：即将删除全部 \${totalCount} 个 API Keys！\n\n此操作不可恢复，请确认是否继续？\`)) {
        return;
    }

    if (!confirm(\`⚠️ 再次确认：真的要删除全部 \${totalCount} 个 API Keys 吗？\n\n请输入"删除全部"后点击确定（只是示意，直接点确定即可）\`)) {
        return;
    }

    const apiKeys = apiKeysData.map(key => key.api_key);
    await batchDeleteKeys(apiKeys);
}

// 批量删除核心逻辑
async function batchDeleteKeys(apiKeys) {
    // 显示进度
    showToast(\`正在删除 \${apiKeys.length} 个 API Keys...\`, 'info');

    try {
        // 一次性发送批量删除请求
        const response = await fetch(withProviderQuery('/admin/api-keys'), {
            method: 'DELETE',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ apiKeys }))
        });

        if (!response.ok) {
            throw new Error(\`批量删除请求失败: \${response.status}\`);
        }

        const result = await response.json();

        // 显示结果
        if (result.failed === 0) {
            showToast(\`✓ 成功删除 \${result.deleted} 个 API Keys\`, 'success');
        } else {
            showToast(\`删除完成：成功 \${result.deleted} 个，失败 \${result.failed} 个\`, 'warning');
        }

        // 刷新列表
        loadApiKeys();
        loadStats();
    } catch (error) {
        console.error('批量删除失败:', error);
        showToast('批量删除失败: ' + error.message, 'error');
    }
}

// ==================== Client Tokens 管理 ====================

// 分页状态
let clientTokensData = [];
let clientTokensPage = 1;
let clientTokensPageSize = 10;

async function loadClientTokens(page = 1) {
    try {
        const response = await fetch(withProviderQuery('/admin/client-tokens'), {
            headers: { 'Authorization': \`Bearer \${getToken()}\` }
        });

        if (!response.ok) throw new Error('加载失败');

        const data = await response.json();
        console.log('Client Tokens 数据:', data); // 调试日志
        clientTokensData = data.client_tokens || [];
        console.log('解析后的 tokens:', clientTokensData); // 调试日志
        clientTokensPage = page;

        renderClientTokensTable();
    } catch (error) {
        console.error('加载客户端 Token 错误:', error); // 调试日志
        showToast('加载客户端 Token 失败: ' + error.message, 'error');
    }
}

function renderClientTokensTable() {
    console.log('渲染 Client Tokens 表格, 数据量:', clientTokensData.length); // 调试日志
    const totalPages = Math.ceil(clientTokensData.length / clientTokensPageSize);
    const startIndex = (clientTokensPage - 1) * clientTokensPageSize;
    const endIndex = startIndex + clientTokensPageSize;
    const pageData = clientTokensData.slice(startIndex, endIndex);
    console.log('当前页数据:', pageData); // 调试日志

    $('#client-tokens-table').html(pageData.length === 0
        ? '<tr><td colspan="5" class="text-center py-8 text-gray-500">暂无客户端 Token</td></tr>'
        : pageData.map((token, index) => {
            const globalIndex = startIndex + index;
            return \`
                <tr class="border-b hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4 text-sm">\${globalIndex + 1}</td>
                    <td class="px-6 py-4 font-mono text-sm">\${maskApiKey(token.token)}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">\${token.name || '未命名'}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">
                        \${formatTTL(token.expires_at)}
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex gap-2">
                            <button onclick="copyApiKey('\${escapeHtml(token.token)}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors" title="复制">
                                📋
                            </button>
                            <button onclick="deleteClientToken('\${escapeHtml(token.token)}')" class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors" title="删除">
                                🗑
                            </button>
                        </div>
                    </td>
                </tr>
            \`;
        }).join('')
    );

    // 渲染分页控件
    renderPagination('client-tokens', clientTokensData.length, clientTokensPage, clientTokensPageSize, (page) => {
        loadClientTokens(page);
    });
}

async function generateClientToken() {
    const tokenName = $('#client-token-name').val().trim();
    const ttl = parseInt($('#client-token-ttl').val()) || 0;

    if (!tokenName) {
        showToast('请输入 Token 名称', 'warning');
        return;
    }

    try {
        const response = await fetch('/admin/client-tokens', {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ name: tokenName, ttl: ttl > 0 ? ttl : null }))
        });

        if (!response.ok) throw new Error('生成失败');

        const data = await response.json();

        // 自动复制到剪贴板
        try {
            await navigator.clipboard.writeText(data.token);
            showToast(\`Token 生成成功并已复制: \${data.token}\`, 'success');
        } catch (e) {
            showToast(\`Token 生成成功: \${data.token}\`, 'success');
        }

        $('#client-token-name').val('');
        $('#client-token-ttl').val('0');
        loadClientTokens();
        loadStats();
    } catch (error) {
        showToast('生成失败: ' + error.message, 'error');
    }
}

async function deleteClientToken(token) {
    if (!confirm('确定要删除这个客户端 Token 吗？')) return;

    try {
        const response = await fetch(\`/admin/client-tokens/\${encodeURIComponent(token)}\`, {
            method: 'DELETE',
            headers: { 'Authorization': \`Bearer \${getToken()}\` }
        });

        if (!response.ok) throw new Error('删除失败');

        showToast('客户端 Token 删除成功', 'success');
        loadClientTokens();
        loadStats();
    } catch (error) {
        showToast('删除失败: ' + error.message, 'error');
    }
}

// ==================== API Key 验证 ====================

// 全选/取消全选
function selectAllKeys() {
    const selectAllCheckbox = $('#select-all-checkbox');
    const isChecked = selectAllCheckbox.prop('checked');
    $('.key-checkbox').prop('checked', !isChecked);
    selectAllCheckbox.prop('checked', !isChecked);
}

// 验证单个 API Key
async function verifySingleKey(apiKey, index) {
    const statusSpan = $(\`#status-\${index}\`);
    const originalHTML = statusSpan.html();

    console.log('开始验证 API Key:', { apiKey: apiKey.substring(0, 20) + '...', index });

    // 显示验证中状态
    statusSpan.html('<span class="px-3 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">验证中...</span>');

    try {
        const response = await fetch(withProviderQuery('/admin/verify-key'), {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ apiKey }))
        });

        console.log('验证响应状态:', response.status, response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('验证请求失败:', errorText);
            throw new Error(\`验证请求失败: \${response.status} \${errorText}\`);
        }

        const result = await response.json();
        console.log('验证结果:', result);

        if (result.valid) {
            statusSpan.html('<span class="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">✓ 有效</span>');
            showToast('API Key 验证通过', 'success');
        } else {
            statusSpan.html('<span class="px-3 py-1 text-xs rounded-full bg-red-100 text-red-700">✗ 无效</span>');
            showToast(\`API Key 验证失败: \${result.error || result.status || '未知原因'}\`, 'error');
        }

        // 刷新列表以更新状态
        setTimeout(() => loadApiKeys(apiKeysPage), 1000);
    } catch (error) {
        console.error('验证异常:', error);
        statusSpan.html(originalHTML);
        showToast('验证失败: ' + error.message, 'error');
    }
}

// 验证选中的 API Keys
async function verifySelectedKeys() {
    const selectedCheckboxes = $('.key-checkbox:checked');

    if (selectedCheckboxes.length === 0) {
        showToast('请先选择要验证的 API Keys', 'warning');
        return;
    }

    const apiKeys = [];
    selectedCheckboxes.each(function() {
        const index = $(this).data('index');
        const rowId = \`key-row-\${index}\`;
        const apiKey = getApiKeyFromRow(rowId);
        if (apiKey) {
            apiKeys.push(apiKey);
        }
    });

    if (apiKeys.length === 0) {
        showToast('无法获取选中的 API Keys', 'error');
        return;
    }

    await batchVerifyKeys(apiKeys);
}

// 验证全部 API Keys
async function verifyAllKeys() {
    if (apiKeysData.length === 0) {
        showToast('没有可验证的 API Keys', 'warning');
        return;
    }

    const apiKeys = apiKeysData.map(key => key.api_key);
    await batchVerifyKeys(apiKeys);
}

// 批量验证核心逻辑
async function batchVerifyKeys(apiKeys) {
    const total = apiKeys.length;
    let completed = 0;
    let valid = 0;
    let invalid = 0;

    // 显示进度条
    $('#verify-progress').removeClass('hidden');
    $('#verify-progress-text').text(\`0 / \${total}\`);
    $('#verify-progress-bar').css('width', '0%');

    for (const apiKey of apiKeys) {
        try {
            const response = await fetch('/admin/verify-key', {
                method: 'POST',
                headers: {
                    'Authorization': \`Bearer \${getToken()}\`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ apiKey })
            });

            const result = await response.json();

            if (result.valid) {
                valid++;
            } else {
                invalid++;
            }
        } catch (error) {
            console.error('验证失败:', apiKey, error);
            invalid++;
        }

        // 更新进度
        completed++;
        const progress = Math.round((completed / total) * 100);
        $('#verify-progress-text').text(\`\${completed} / \${total}\`);
        $('#verify-progress-bar').css('width', \`\${progress}%\`);
    }

    // 隐藏进度条
    setTimeout(() => {
        $('#verify-progress').addClass('hidden');
    }, 2000);

    // 显示结果
    showToast(\`验证完成：\${valid} 个有效，\${invalid} 个无效\`, invalid === 0 ? 'success' : 'warning');

    // 刷新列表
    loadApiKeys(apiKeysPage);
    loadStats();
}

// ==================== 批量导入 ====================

// 清空导入文本框
function clearImportText() {
    $('#import-textarea').val('');
    $('#import-status').text('');
    $('#file-input').val('');
    $('#file-info').addClass('hidden');
    $('#upload-btn-text').text('选择文件上传');
    $('#upload-btn').removeClass('bg-green-500').addClass('bg-gradient-to-r from-blue-500 to-indigo-600');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// 处理文件上传
function handleFileUpload(event) {
    console.log('handleFileUpload 被调用', event);
    const file = event.target.files[0];
    console.log('选择的文件:', file);

    if (!file) {
        console.log('没有选择文件');
        return;
    }

    // 显示加载状态
    $('#upload-btn').removeClass('bg-gradient-to-r from-blue-500 to-indigo-600').addClass('bg-yellow-500');
    $('#upload-btn-text').text('读取中...');
    $('#import-status').text(\`正在读取文件: \${file.name}...\`).css('color', '#f59e0b');
    console.log('开始读取文件:', file.name);

    const reader = new FileReader();

    reader.onload = function(e) {
        console.log('文件读取完成');
        const content = e.target.result;
        $('#import-textarea').val(content);

        const lines = content.split('\\n').filter(l => l.trim()).length;
        console.log('读取到', lines, '行数据');

        // 更新按钮状态
        $('#upload-btn').removeClass('bg-yellow-500').addClass('bg-green-500');
        $('#upload-btn-text').text('✓ 文件已加载');

        // 显示文件信息
        $('#file-name').text(file.name);
        $('#file-size').text(\`(\${formatFileSize(file.size)})\`);
        $('#file-lines').text(\`✓ \${lines} 行数据\`);
        $('#file-info').removeClass('hidden');

        // 更新状态
        $('#import-status').text(\`已加载 \${lines} 行数据，点击"开始导入"继续\`).css('color', '#10b981');

        // 显示成功提示
        showToast(\`成功加载 \${file.name}，共 \${lines} 行\`, 'success');
    };

    reader.onerror = function() {
        console.error('文件读取失败');
        $('#upload-btn').removeClass('bg-yellow-500').addClass('bg-gradient-to-r from-blue-500 to-indigo-600');
        $('#upload-btn-text').text('选择文件上传');
        showToast('文件读取失败，请重试', 'error');
        $('#import-status').text('文件读取失败').css('color', '#ef4444');
    };

    reader.readAsText(file, 'UTF-8');
    console.log('FileReader.readAsText 已调用');
}

async function importAccounts() {
    const textarea = $('#import-textarea');
    const text = textarea.val().trim();

    if (!text) {
        showToast('请粘贴账号数据或上传文件', 'warning');
        return;
    }

    const lines = text.split('\\n').filter(line => line.trim());

    if (lines.length === 0) {
        showToast('未找到有效的账号数据', 'error');
        return;
    }

    // 直接发送所有行，由后端智能解析
    const accounts = lines;

    $('#import-status').text(\`正在导入 \${accounts.length} 个账号...\`).css('color', '#3b82f6');

    try {
        const response = await fetch(withProviderQuery('/admin/import'), {
            method: 'POST',
            headers: {
                'Authorization': \`Bearer \${getToken()}\`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(withProviderBody({ accounts }))
        });

        if (!response.ok) throw new Error('导入失败');

        const result = await response.json();

        if (result.success) {
            showToast(\`成功导入 \${result.imported} 个账号，失败 \${result.failed} 个\`, result.failed > 0 ? 'warning' : 'success');
            $('#import-status').text(\`导入完成：成功 \${result.imported}，失败 \${result.failed}\`).css('color', result.failed > 0 ? '#f59e0b' : '#10b981');

            // 如果有详细信息，显示在控制台
            if (result.details && result.details.length > 0) {
                console.log('导入详情:', result.details);
            }

            textarea.val('');
            loadApiKeys();
            loadStats();
        } else {
            showToast(\`导入失败: \${result.error || '未知错误'}\`, 'error');
            $('#import-status').text('导入失败').css('color', '#ef4444');
        }
    } catch (error) {
        showToast('导入失败: ' + error.message, 'error');
        $('#import-status').text('导入失败').css('color', '#ef4444');
    }
}

// ==================== 统计数据 ====================

async function loadStats() {
    try {
        const response = await fetch(withProviderQuery('/admin/stats'), {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });

        if (!response.ok) throw new Error('加载失败');

        const data = await response.json();

        // 更新统计卡片
        $('#total-api-keys').text(data.total_api_keys || 0);
        $('#active-keys').text(data.active_keys || 0);
        $('#failed-keys').text(data.failed_keys || 0);
        $('#total-client-tokens').text(data.total_client_tokens || 0);

        // 更新统计表格
        if (currentTab === 'stats') {
            $('#stats-total-keys').text(data.total_api_keys || 0);
            $('#stats-active-keys').text(data.active_keys || 0);
            $('#stats-failed-keys').text(data.failed_keys || 0);
            $('#stats-client-tokens').text(data.total_client_tokens || 0);
            $('#stats-total-requests').text(data.total_requests || 0);

            // 显示成功/失败次数和百分比
            const successCount = data.success_count || 0;
            const failureCount = data.failure_count || 0;
            const successRate = data.success_rate || '0.00';

            $('#stats-success-rate').html(\`
                <span class="text-3xl font-bold text-gray-900">\${successRate}%</span>
                <div class="mt-2 text-sm text-gray-500">
                    <span class="text-green-600">✓ 成功: \${successCount.toLocaleString()}</span>
                    <span class="mx-2">·</span>
                    <span class="text-red-600">✗ 失败: \${failureCount.toLocaleString()}</span>
                </div>
            \`);
        }
    } catch (error) {
        console.error('加载统计数据失败:', error);
    }
}

// ==================== 初始化 ====================

$(document).ready(function() {
    // 验证登录状态
    const token = getToken();
    const urlParams = new URLSearchParams(window.location.search);

    if (!token || !urlParams.get('verify')) {
        window.location.href = '/';
        return;
    }

    // 验证 token 有效性
    fetch(withProviderQuery('/admin/stats'), {
        headers: { 'Authorization': \`Bearer \${token}\` }
    }).then(response => {
        if (!response.ok) {
            showToast('登录已过期，请重新登录', 'warning');
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
            setTimeout(() => window.location.href = '/', 1500);
        }
    }).catch(() => {
        showToast('网络错误', 'error');
    });

    // 绑定提供方切换按钮，支持在 UI 中切换不同池子
    $('[data-provider-option]').on('click', function() {
        const provider = $(this).data('provider-option');
        switchProvider(provider);
    });

    // 恢复上次选中的提供方按钮样式
    updateProviderSelection();
    applyProviderTexts();

    // 初始加载
    loadApiKeys();
    loadStats();

    // 绑定标签页点击事件
    $('.tab-btn').on('click', function() {
        const tabName = $(this).data('tab');
        switchTab(tabName, this);
    });

    // 绑定文件上传事件（使用事件委托）
    console.log('绑定文件上传事件到 #file-input');
    $(document).on('change', '#file-input', function(e) {
        console.log('文件输入框 change 事件触发', e);
        handleFileUpload(e);
    });
    console.log('事件绑定完成，检查 #file-input 是否存在:', $('#file-input').length);

    // 定时更新统计数据
    setInterval(loadStats, 10000);

    updateTime();
    setInterval(updateTime, 1000);
    updateProjectRuntime();
    setInterval(updateProjectRuntime, 60000);
});
`;

/**
 * 主仪表盘页面 - 已登录状态显示
 */
import { htmlResponse } from './utils';

export function getMainDashboard() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama API Pool - 管理后台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#8b5cf6',
                        success: '#10b981',
                        danger: '#ef4444',
                        warning: '#f59e0b',
                        info: '#06b6d4',
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .tab-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="gradient-bg shadow-lg">
        <div class="container mx-auto px-4 py-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-white mb-2">🔑 Ollama API Pool</h1>
                    <p class="text-blue-100">智能 API 代理池管理系统</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="text-white text-sm bg-white/20 px-4 py-2 rounded-lg backdrop-blur">
                        <span id="current-time"></span>
                    </div>
                    <button onclick="logout()" class="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur transition-all">
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="stat-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">API Keys</p>
                        <p class="text-3xl font-bold text-gray-800 mt-2" id="total-keys">-</p>
                    </div>
                    <div class="bg-blue-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">活跃</p>
                        <p class="text-3xl font-bold text-green-600 mt-2" id="active-keys">-</p>
                    </div>
                    <div class="bg-green-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">失效</p>
                        <p class="text-3xl font-bold text-red-600 mt-2" id="failed-keys">-</p>
                    </div>
                    <div class="bg-red-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="stat-card bg-white rounded-xl shadow-sm p-6 transition-all duration-300">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-500 text-sm font-medium">客户端 Tokens</p>
                        <p class="text-3xl font-bold text-purple-600 mt-2" id="total-tokens">-</p>
                    </div>
                    <div class="bg-purple-100 rounded-full p-3">
                        <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- 标签导航 -->
        <div class="bg-white rounded-xl shadow-sm p-2 mb-6 flex flex-wrap gap-2">
            <button class="tab-btn active flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all duration-300" data-tab="api-keys">
                API Keys
            </button>
            <button class="tab-btn flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all duration-300" data-tab="tokens">
                客户端 Tokens
            </button>
            <button class="tab-btn flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all duration-300" data-tab="import">
                批量导入
            </button>
            <button class="tab-btn flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all duration-300" data-tab="stats">
                统计分析
            </button>
        </div>

        <!-- API Keys Tab -->
        <div id="tab-api-keys" class="tab-content">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span class="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">🔑</span>
                    API Keys 管理
                </h2>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">添加新的 API Key</label>
                    <div class="flex gap-3">
                        <input type="text" id="new-api-key"
                            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="输入 Ollama API Key (ollama-xxx...)">
                        <button onclick="addApiKey()"
                            class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                            ➕ 添加
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody id="api-keys-tbody" class="divide-y divide-gray-200"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Tokens Tab -->
        <div id="tab-tokens" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <span class="bg-purple-100 text-purple-600 rounded-lg p-2 mr-3">🎫</span>
                    客户端 Tokens
                </h2>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">创建新的 Token</label>
                    <div class="flex gap-3">
                        <input type="text" id="token-name"
                            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Token 名称">
                        <button onclick="createToken()"
                            class="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                            ➕ 创建
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名称</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody id="tokens-tbody" class="divide-y divide-gray-200"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Import Tab -->
        <div id="tab-import" class="tab-content hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-green-100 text-green-600 rounded-lg p-2 mr-3">📥</span>
                        批量导入
                    </h2>
                    <p class="text-sm text-gray-500 mb-4">
                        从 ollama.txt 文件导入账号<br>
                        格式: <code class="bg-gray-100 px-2 py-1 rounded">email----password----session----api_key</code>
                    </p>
                    <textarea id="import-content" rows="10"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-sm"
                        placeholder="粘贴 ollama.txt 内容..."></textarea>
                    <button onclick="importFromTxt()"
                        class="mt-4 w-full px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                        📥 导入
                    </button>
                    <div id="import-report" class="mt-4 hidden bg-green-50 border border-green-200 text-green-700 text-xs whitespace-pre-wrap px-4 py-3 rounded-lg"></div>
                </div>

                <div class="bg-white rounded-xl shadow-sm p-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">🔍</span>
                        API Key 验证导入
                    </h2>
                    <p class="text-sm text-gray-500 mb-4">
                        逐行导入 API Key,每行一个 Key<br>
                        系统会自动验证并分类
                    </p>
                    <textarea id="validate-import-content" rows="10"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        placeholder="每行一个 API Key..."></textarea>
                    <button onclick="importWithValidation()"
                        class="mt-4 w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300">
                        🔍 验证导入
                    </button>
                    <div id="validate-report" class="mt-4 hidden bg-blue-50 border border-blue-200 text-blue-700 text-xs whitespace-pre-wrap px-4 py-3 rounded-lg"></div>
                </div>
            </div>
        </div>

        <!-- Stats Tab -->
        <div id="tab-stats" class="tab-content hidden">
            <div class="bg-white rounded-xl shadow-sm p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center">
                        <span class="bg-indigo-100 text-indigo-600 rounded-lg p-2 mr-3">📊</span>
                        Key 使用统计
                    </h2>
                    <div class="flex gap-3">
                        <button onclick="loadKeyStats()"
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                            🔄 刷新
                        </button>
                        <button onclick="healthCheckKeys(this)"
                            class="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors">
                            🏥 健康检查
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总请求</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成功</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">失败</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成功率</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后使用</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                            </tr>
                        </thead>
                        <tbody id="stats-tbody" class="divide-y divide-gray-200"></tbody>
                    </table>
                </div>
                <div id="health-report" class="mt-6 hidden bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm whitespace-pre-wrap px-4 py-3 rounded-lg"></div>
            </div>
        </div>
    </div>

    <div id="toast-container" class="fixed top-6 right-6 space-y-4 z-50"></div>

    <script>
        const STORAGE_KEY = 'adminToken';
        const ADMIN_TOKEN = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        if (!ADMIN_TOKEN) {
            window.location.href = '/';
        }

        const headers = {
            'Authorization': \`Bearer \${ADMIN_TOKEN}\`,
            'Content-Type': 'application/json'
        };

        let statsTimer = null;

        function clearToken() {
            localStorage.removeItem(STORAGE_KEY);
            sessionStorage.removeItem(STORAGE_KEY);
        }

        function showToast(message, type = 'info') {
            const colors = {
                success: 'from-emerald-500 to-green-600',
                error: 'from-rose-500 to-red-600',
                warning: 'from-amber-500 to-orange-500',
                info: 'from-blue-500 to-indigo-500'
            };
            const icons = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            const id = \`toast-\${Date.now()}\`;
            const toast = \`
                <div id="\${id}" class="transform transition-all duration-300 translate-x-full opacity-0">
                    <div class="flex items-center gap-3 text-white px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-r \${colors[type] || colors.info}">
                        <span class="text-lg">\${icons[type] || icons.info}</span>
                        <span class="text-sm leading-relaxed">\${message}</span>
                    </div>
                </div>
            \`;
            const $toast = $(toast);
            $('#toast-container').append($toast);
            requestAnimationFrame(() => {
                $toast.removeClass('translate-x-full opacity-0').addClass('translate-x-0 opacity-100');
            });
            setTimeout(() => {
                $toast.addClass('translate-x-full opacity-0');
                setTimeout(() => $toast.remove(), 300);
            }, 4000);
        }

        function updateTime() {
            const now = new Date();
            $('#current-time').text(now.toLocaleString('zh-CN'));
        }
        updateTime();
        setInterval(updateTime, 1000);

        function switchTab(tabName, button) {
            $('.tab-btn').removeClass('active');
            $('.tab-content').addClass('hidden');
            $(\`#tab-\${tabName}\`).removeClass('hidden');
            if (button) {
                $(button).addClass('active');
            }
        }

        function handleUnauthorized() {
            clearToken();
            showToast('登录状态已过期，请重新登录', 'warning');
            setTimeout(() => window.location.href = '/', 400);
        }

        async function secureJson(response, fallbackMessage = '请求失败') {
            if (response.status === 401 || response.status === 403) {
                handleUnauthorized();
                throw new Error('未授权');
            }
            let data = null;
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
            if (!response.ok) {
                const message = data && data.message ? data.message : fallbackMessage;
                showToast(message, 'error');
                throw new Error(message);
            }
            return data;
        }

        function logout() {
            if (!confirm('确认退出登录？')) return;
            clearToken();
            showToast('已退出登录', 'info');
            setTimeout(() => window.location.href = '/', 300);
        }

        async function loadStats() {
            const res = await fetch('/admin/stats', { headers });
            const data = await secureJson(res, '加载统计数据失败');
            if (!data || !data.apiKeys || !data.clientTokens) return;
            $('#total-keys').text(data.apiKeys.total);
            $('#active-keys').text(data.apiKeys.active);
            $('#failed-keys').text(data.apiKeys.failed);
            $('#total-tokens').text(data.clientTokens.total);
        }

        async function loadApiKeys() {
            const res = await fetch('/admin/api-keys', { headers });
            const data = await secureJson(res, '获取 API Keys 失败');
            const keys = data && data.keys ? data.keys : [];
            const tbody = $('#api-keys-tbody');
            tbody.html(keys.map(k => \`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-mono text-sm">\${k.key}</td>
                    <td class="px-6 py-4">
                        <span class="px-3 py-1 rounded-full text-xs font-medium \${k.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            \${k.status}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <button onclick="deleteApiKey('\${k.fullKey}')"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                            删除
                        </button>
                    </td>
                </tr>
            \`).join(''));
        }

        async function addApiKey() {
            const apiKey = $('#new-api-key').val().trim();
            if (!apiKey) {
                showToast('请输入要添加的 API Key', 'warning');
                return;
            }
            const res = await fetch('/admin/api-keys', {
                method: 'POST',
                headers,
                body: JSON.stringify({ apiKey })
            });
            const data = await secureJson(res, '添加 API Key 失败');
            $('#new-api-key').val('');
            await loadApiKeys();
            await loadStats();
            showToast((data && data.message) || 'API Key 已添加', 'success');
        }

        async function deleteApiKey(apiKey) {
            if (!confirm('确认删除?')) return;
            const res = await fetch('/admin/api-keys', {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ apiKey })
            });
            await secureJson(res, '删除 API Key 失败');
            await loadApiKeys();
            await loadStats();
            showToast('API Key 已删除', 'success');
        }

        async function loadTokens() {
            const res = await fetch('/admin/tokens', { headers });
            const data = await secureJson(res, '获取 Token 列表失败');
            const tokens = data && data.tokens ? data.tokens : [];
            const tbody = $('#tokens-tbody');
            tbody.html(tokens.map(t => \`
                <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 font-mono text-sm">\${t.token}</td>
                    <td class="px-6 py-4">\${t.name}</td>
                    <td class="px-6 py-4 text-sm text-gray-500">\${t.createdAt}</td>
                    <td class="px-6 py-4">
                        <button onclick="copyToken('\${t.fullToken}')"
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors mr-2">
                            复制
                        </button>
                        <button onclick="deleteToken('\${t.fullToken}')"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                            删除
                        </button>
                    </td>
                </tr>
            \`).join(''));
        }

        async function createToken() {
            const name = $('#token-name').val().trim();
            if (!name) {
                showToast('请输入 Token 名称', 'warning');
                return;
            }
            const res = await fetch('/admin/tokens', {
                method: 'POST',
                headers,
                body: JSON.stringify({ name })
            });
            const data = await secureJson(res, '创建 Token 失败');
            $('#token-name').val('');
            await loadTokens();
            await loadStats();
            if (data && data.token) {
                showToast(\`Token 已创建: \${data.token}\`, 'success');
            } else {
                showToast('Token 已创建', 'success');
            }
        }

        async function copyToken(token) {
            try {
                await navigator.clipboard.writeText(token);
                showToast('已复制到剪贴板', 'success');
            } catch (error) {
                showToast('复制失败，请手动复制', 'error');
            }
        }

        async function deleteToken(token) {
            if (!confirm('确认删除?')) return;
            const res = await fetch('/admin/tokens', {
                method: 'DELETE',
                headers,
                body: JSON.stringify({ token })
            });
            await secureJson(res, '删除 Token 失败');
            await loadTokens();
            await loadStats();
            showToast('Token 已删除', 'success');
        }

        async function importFromTxt() {
            const content = $('#import-content').val().trim();
            if (!content) {
                showToast('请粘贴导入内容', 'warning');
                return;
            }
            const res = await fetch('/admin/api-keys/import-from-txt', {
                method: 'POST',
                headers,
                body: JSON.stringify({ content })
            });
            const data = await secureJson(res, '批量导入失败');
            $('#import-content').val('');
            const summary = [
                '导入完成',
                \`总计: \${data && data.total != null ? data.total : '-'}\`,
                \`新增: \${data && data.added != null ? data.added : '-'}\`
            ].join('\n');
            $('#import-report').removeClass('hidden').text(summary);
            await loadApiKeys();
            await loadStats();
            showToast('批量导入完成', 'success');
        }

        async function importWithValidation() {
            const content = $('#validate-import-content').val().trim();
            if (!content) {
                showToast('请粘贴待验证的 API Keys', 'warning');
                return;
            }
            const res = await fetch('/admin/api-keys/import-with-validation', {
                method: 'POST',
                headers,
                body: JSON.stringify({ content })
            });
            const data = await secureJson(res, '验证导入失败');
            $('#validate-import-content').val('');
            const lines = [];
            lines.push('验证导入完成');
            lines.push(\`总计: \${data && data.total != null ? data.total : '-'}\`);
            const validCount = data && Array.isArray(data.valid) ? data.valid.length : 0;
            const invalidCount = data && Array.isArray(data.invalid) ? data.invalid.length : 0;
            lines.push(\`有效: \${validCount}\`);
            lines.push(\`无效: \${invalidCount}\`);
            if (data && data.categories && Object.keys(data.categories).length > 0) {
                lines.push('');
                lines.push('分类统计:');
                Object.entries(data.categories).forEach(([category, keys]) => {
                    lines.push(\`  \${category}: \${Array.isArray(keys) ? keys.length : 0}\`);
                });
            }
            if (invalidCount > 0) {
                lines.push('');
                lines.push('无效示例:');
                (data.invalid || []).slice(0, 5).forEach(item => {
                    lines.push(\`  \${item.key || '-'}: \${item.error || '未知原因'}\`);
                });
                if (invalidCount > 5) {
                    lines.push(\`  ... 还有 \${invalidCount - 5} 个\`);
                }
            }
            $('#validate-report').removeClass('hidden').text(lines.join('\n'));
            await loadApiKeys();
            await loadStats();
            showToast('验证导入完成', 'success');
        }

        async function loadKeyStats() {
            const res = await fetch('/admin/keys/stats', { headers });
            const data = await secureJson(res, '加载 Key 统计失败');
            const stats = data && data.stats ? data.stats : [];
            const tbody = $('#stats-tbody');
            tbody.html(stats.map(s => {
                const statusClass = s.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                const disabledInfo = s.disabledReason === 'auto' ? '(自动)' : s.disabledReason === 'manual' ? '(手动)' : '';
                return \`
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-4 font-mono text-sm">\${s.apiKey}</td>
                        <td class="px-4 py-4 font-semibold">\${s.totalRequests || 0}</td>
                        <td class="px-4 py-4 text-green-600 font-semibold">\${s.successCount || 0}</td>
                        <td class="px-4 py-4 text-red-600 font-semibold">\${s.failureCount || 0}</td>
                        <td class="px-4 py-4">
                            <div class="flex items-center">
                                <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                    <div class="bg-green-500 h-2 rounded-full" style="width: \${s.successRate || 0}%"></div>
                                </div>
                                <span class="text-sm font-medium">\${s.successRate || 0}%</span>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-sm text-gray-500">\${s.lastUsed ? new Date(s.lastUsed).toLocaleString() : '-'}</td>
                        <td class="px-4 py-4">
                            <span class="px-3 py-1 rounded-full text-xs font-medium \${statusClass}">
                                \${s.status} \${disabledInfo}
                            </span>
                        </td>
                        <td class="px-4 py-4">
                            \${s.status === 'active'
                                ? \`<button onclick="disableKey('\${s.fullKey}')" class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">禁用</button>\`
                                : \`<button onclick="enableKey('\${s.fullKey}')" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">启用</button>\`}
                        </td>
                    </tr>
                \`;
            }).join(''));
        }

        async function disableKey(apiKey) {
            const duration = prompt('禁用时长(秒, 默认3600):', '3600');
            if (!duration) return;
            const res = await fetch('/admin/keys/disable', {
                method: 'POST',
                headers,
                body: JSON.stringify({ apiKey, duration: parseInt(duration, 10) })
            });
            await secureJson(res, '禁用 Key 失败');
            await loadKeyStats();
            await loadStats();
            showToast('Key 已禁用', 'success');
        }

        async function enableKey(apiKey) {
            const res = await fetch('/admin/keys/enable', {
                method: 'POST',
                headers,
                body: JSON.stringify({ apiKey })
            });
            await secureJson(res, '启用 Key 失败');
            await loadKeyStats();
            await loadStats();
            showToast('Key 已启用', 'success');
        }

        async function healthCheckKeys(button) {
            if (!confirm('开始批量健康检查? 这可能需要一些时间。')) return;
            if (button) {
                button.disabled = true;
                button.classList.add('opacity-70');
            }
            try {
                const res = await fetch('/admin/keys/health-check', {
                    method: 'POST',
                    headers
                });
                const data = await secureJson(res, '健康检查失败');
                const results = data && data.results ? data.results : [];
                const healthy = results.filter(r => r.healthy).length;
                const summary = \`健康检查完成\n\n健康: \${healthy}\n异常: \${results.length - healthy}\`;
                $('#health-report').removeClass('hidden').text(summary);
                await loadKeyStats();
                await loadStats();
                showToast('健康检查完成', 'info');
            } finally {
                if (button) {
                    button.disabled = false;
                    button.classList.remove('opacity-70');
                }
            }
        }

        // 绑定标签切换事件
        $('.tab-btn').on('click', function() {
            const tabName = $(this).data('tab');
            switchTab(tabName, this);
        });

        loadStats();
        loadApiKeys();
        loadTokens();
        statsTimer = setInterval(loadStats, 30000);
    </script>
</body>
</html>
  `;

  return htmlResponse(html);
}

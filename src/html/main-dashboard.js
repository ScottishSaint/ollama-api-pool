/**
 * 主仪表盘 HTML - 静态内容
 */

export const dashboardHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>管理控制台 - Ollama API Pool</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3b82f6',
                        secondary: '#8b5cf6',
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1); }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <!-- 顶部导航 -->
    <nav class="bg-white shadow-sm border-b border-gray-200">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-2 rounded-xl">
                        <span class="text-2xl">🔐</span>
                    </div>
                    <div>
                        <h1 class="text-xl font-bold text-gray-900">Ollama API Pool</h1>
                        <p class="text-xs text-gray-500">管理控制台</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <a href="/api-docs" target="_blank" class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        API 文档
                    </a>
                    <button onclick="logout()" class="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-6 py-8">
        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="card-hover bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm text-gray-500 font-medium">API Keys 总数</p>
                    <div class="bg-blue-100 text-blue-600 p-2 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                        </svg>
                    </div>
                </div>
                <p id="total-api-keys" class="text-3xl font-bold text-gray-900">0</p>
            </div>

            <div class="card-hover bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm text-gray-500 font-medium">正常账号</p>
                    <div class="bg-green-100 text-green-600 p-2 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
                <p id="active-keys" class="text-3xl font-bold text-green-600">0</p>
            </div>

            <div class="card-hover bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm text-gray-500 font-medium">失败账号</p>
                    <div class="bg-red-100 text-red-600 p-2 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                </div>
                <p id="failed-keys" class="text-3xl font-bold text-red-600">0</p>
            </div>

            <div class="card-hover bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <p class="text-sm text-gray-500 font-medium">客户端 Token</p>
                    <div class="bg-purple-100 text-purple-600 p-2 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                        </svg>
                    </div>
                </div>
                <p id="total-client-tokens" class="text-3xl font-bold text-purple-600">0</p>
            </div>
        </div>

        <!-- 标签页导航 -->
        <div class="bg-white rounded-2xl shadow-sm mb-6 p-2">
            <div class="flex flex-wrap gap-2">
                <button data-tab="api-keys" class="tab-btn px-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    API Keys
                </button>
                <button data-tab="tokens" class="tab-btn px-6 py-3 rounded-xl font-medium transition-all text-gray-600 hover:text-indigo-600">
                    客户端 Token
                </button>
                <button data-tab="import" class="tab-btn px-6 py-3 rounded-xl font-medium transition-all text-gray-600 hover:text-indigo-600">
                    批量导入
                </button>
                <button data-tab="stats" class="tab-btn px-6 py-3 rounded-xl font-medium transition-all text-gray-600 hover:text-indigo-600">
                    统计信息
                </button>
            </div>
        </div>

        <!-- API Keys 内容 -->
        <div id="api-keys-content" class="tab-content bg-white rounded-2xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-gray-900">API Keys 管理</h2>
                <div class="flex gap-2">
                    <button onclick="selectAllKeys()" class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                        全选
                    </button>
                    <button onclick="verifySelectedKeys()" class="px-4 py-2 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all">
                        验证选中
                    </button>
                    <button onclick="verifyAllKeys()" class="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all">
                        验证全部
                    </button>
                    <button onclick="deleteSelectedKeys()" class="px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg transition-all">
                        删除选中
                    </button>
                    <button onclick="deleteAllKeys()" class="px-4 py-2 text-sm bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg hover:shadow-lg transition-all">
                        删除全部
                    </button>
                </div>
            </div>

            <div class="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <h3 class="font-semibold text-blue-900 mb-3">添加新 API Key</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" id="new-username" placeholder="用户名" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <input type="text" id="new-api-key" placeholder="API Key" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <input type="number" id="new-api-key-ttl" placeholder="有效期(秒，0=永久)" value="0" min="0" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                </div>
                <button onclick="addApiKey()" class="mt-3 px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
                    添加
                </button>
            </div>

            <!-- 验证进度 -->
            <div id="verify-progress" class="hidden mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-yellow-800">验证进度</span>
                    <span id="verify-progress-text" class="text-sm text-yellow-700">0 / 0</span>
                </div>
                <div class="w-full bg-yellow-200 rounded-full h-2">
                    <div id="verify-progress-bar" class="bg-yellow-600 h-2 rounded-full transition-all" style="width: 0%"></div>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                <input type="checkbox" id="select-all-checkbox" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500">
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">用户名</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">API Key</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">状态</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">有效期</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody id="api-keys-table">
                        <tr><td colspan="7" class="text-center py-8 text-gray-500">加载中...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- 分页控件 -->
            <div id="api-keys-pagination"></div>
        </div>

        <!-- 客户端 Token 内容 -->
        <div id="tokens-content" class="tab-content hidden bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">客户端 Token 管理</h2>

            <div class="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <h3 class="font-semibold text-purple-900 mb-3">生成新 Token</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" id="client-token-name" placeholder="Token 名称" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <input type="number" id="client-token-ttl" placeholder="有效期(秒，0=永久)" value="0" min="0" class="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                </div>
                <button onclick="generateClientToken()" class="mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all">
                    生成
                </button>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Token</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">名称</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">有效期</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">操作</th>
                        </tr>
                    </thead>
                    <tbody id="client-tokens-table">
                        <tr><td colspan="5" class="text-center py-8 text-gray-500">加载中...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- 分页控件 -->
            <div id="client-tokens-pagination"></div>
        </div>

        <!-- 批量导入内容 -->
        <div id="import-content" class="tab-content hidden bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">批量导入账号</h2>

            <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p class="text-sm text-yellow-800 mb-2">
                    <strong>支持格式：</strong>
                </p>
                <ul class="text-sm text-yellow-800 space-y-1 ml-4">
                    <li>• 每行一个完整的 session cookie</li>
                    <li>• <code class="bg-yellow-100 px-2 py-0.5 rounded">email----password----session----aid----apikey</code></li>
                    <li>• <code class="bg-yellow-100 px-2 py-0.5 rounded">用户名----API_KEY</code></li>
                </ul>
            </div>

            <div class="mb-4">
                <div class="flex gap-3 mb-2">
                    <input type="file" id="file-input" accept=".txt,.text" class="hidden">
                    <button id="upload-btn" onclick="document.getElementById('file-input').click()"
                        class="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                        </svg>
                        <span id="upload-btn-text">选择文件上传</span>
                    </button>
                    <button onclick="clearImportText()"
                        class="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all">
                        清空
                    </button>
                </div>
                <div id="file-info" class="hidden bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm">
                    <span class="text-blue-600">📄</span>
                    <span id="file-name" class="text-blue-800 font-medium ml-2"></span>
                    <span id="file-size" class="text-blue-600 ml-2"></span>
                    <span id="file-lines" class="text-green-600 ml-2"></span>
                </div>
            </div>

            <textarea id="import-textarea" rows="12"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="粘贴账号数据或点击上传文件...&#10;&#10;格式示例：&#10;email@example.com----password----__Secure-session=xxx----aid=yyy----apikey&#10;或&#10;user1----sk-xxx"></textarea>

            <div class="mt-4 flex items-center gap-3">
                <button onclick="importAccounts()"
                    class="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
                    开始导入
                </button>
                <span id="import-status" class="text-sm text-gray-500"></span>
            </div>
        </div>

        <!-- 统计信息内容 -->
        <div id="stats-content" class="tab-content hidden bg-white rounded-2xl shadow-sm p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-6">统计信息</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <p class="text-sm text-blue-600 font-medium mb-2">API Keys 总数</p>
                    <p id="stats-total-keys" class="text-3xl font-bold text-blue-900">0</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <p class="text-sm text-green-600 font-medium mb-2">正常账号</p>
                    <p id="stats-active-keys" class="text-3xl font-bold text-green-900">0</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
                    <p class="text-sm text-red-600 font-medium mb-2">失败账号</p>
                    <p id="stats-failed-keys" class="text-3xl font-bold text-red-900">0</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <p class="text-sm text-purple-600 font-medium mb-2">客户端 Token 数</p>
                    <p id="stats-client-tokens" class="text-3xl font-bold text-purple-900">0</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <p class="text-sm text-yellow-600 font-medium mb-2">总请求次数</p>
                    <p id="stats-total-requests" class="text-3xl font-bold text-yellow-900">0</p>
                </div>
                <div class="p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                    <p class="text-sm text-gray-600 font-medium mb-2">成功率</p>
                    <p id="stats-success-rate" class="text-3xl font-bold text-gray-900">0%</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast 容器 -->
    <div id="toast-container" class="fixed top-6 right-6 space-y-3 z-50"></div>

    <!-- 底部 -->
    <footer class="bg-white border-t border-gray-200 py-4 mt-12">
        <div class="container mx-auto px-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
                <div class="flex items-center gap-2 text-xs text-gray-500">
                    <span>当前时间: <span id="current-time" class="font-medium"></span></span>
                    <span class="text-gray-400">·</span>
                    <span>运营时间: <span id="build-time" class="font-medium">2025-10-09</span></span>
                </div>
                <div class="flex items-center gap-2">
                    <a href="https://github.com/dext7r/ollama-api-pool" target="_blank" rel="noopener" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                    </a>
                </div>
                <div class="text-gray-500 italic tracking-wide text-xs">
                    欲买桂花同载酒，终不似，少年游
                </div>
            </div>
        </div>
    </footer>

    <script src="/js/dashboard.js?v=10"></script>
</body>
</html>`;

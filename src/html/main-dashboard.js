/**
 * 主仪表盘 HTML - 静态内容
 */

export const dashboardHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama API Pool 管理中心</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4f46e5',
                        accent: '#0ea5e9',
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .card-shadow { box-shadow: 0 20px 40px -24px rgba(15, 23, 42, 0.35); }
        .soft-border { border: 1px solid rgba(148, 163, 184, 0.2); }
    </style>
</head>
<body class="bg-slate-50 min-h-screen">
    <nav class="bg-white/90 backdrop-blur border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
            <div class="flex items-center gap-3">
                <div class="bg-gradient-to-br from-primary to-accent text-white rounded-xl p-2.5">
                    <span class="text-2xl">🧭</span>
                </div>
                <div>
                    <p class="text-sm font-medium text-primary uppercase tracking-widest">Ollama API Pool</p>
                    <h1 class="text-lg font-semibold text-slate-900">统一代理池 · 管理控制台</h1>
                </div>
            </div>
            <div class="flex items-center gap-3 text-sm">
                <a href="/api-docs" target="_blank" class="px-4 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors flex items-center gap-2">
                    📖 <span>API 文档</span>
                </a>
                <a href="/stats" target="_blank" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors">
                    📊 公开统计
                </a>
                <button onclick="logout()" class="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                    退出登录
                </button>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto px-6 py-10 space-y-12">
        <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
            <article class="bg-white rounded-3xl soft-border card-shadow p-8">
                <span class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    实时运维总览
                </span>
                <h2 class="mt-4 text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">构建稳定的 Ollama API 代理池</h2>
                <p class="mt-4 text-base text-slate-600 leading-relaxed">
                    通过统一入口管理多账户，自动完成负载均衡、故障转移与请求统计，确保业务持续可用。下方指标实时反映池子健康度，可直接跳转到关键操作面板。
                </p>
                <ul class="mt-6 space-y-3 text-sm text-slate-600">
                    <li class="flex items-start gap-2"><span class="mt-0.5 text-primary">✔</span><span>自动轮询可用 API Key，失效即刻切换，最大化在线率。</span></li>
                    <li class="flex items-start gap-2"><span class="mt-0.5 text-primary">✔</span><span>统一客户端 Token 鉴权，隔离上游密钥，避免泄露风险。</span></li>
                    <li class="flex items-start gap-2"><span class="mt-0.5 text-primary">✔</span><span>PostgreSQL + Redis 支撑高并发写入，KV 可按需关闭不再受限。</span></li>
                </ul>
                <div class="mt-8 flex flex-wrap gap-3 text-sm">
                    <a href="#quick-actions" class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
                        快捷操作导航
                    </a>
                    <a href="#management-panels" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors">
                        管理面板</a>
                </div>
            </article>

            <aside class="grid gap-4">
                <div class="bg-white rounded-2xl soft-border p-5">
                    <p class="text-sm text-slate-500">API Keys 总数</p>
                    <p id="total-api-keys" class="mt-2 text-3xl font-semibold text-slate-900">0</p>
                    <p class="mt-1 text-xs text-slate-400">含全部状态的账号总量</p>
                </div>
                <div class="bg-white rounded-2xl soft-border p-5">
                    <p class="text-sm text-slate-500">正常账号</p>
                    <p id="active-keys" class="mt-2 text-3xl font-semibold text-emerald-600">0</p>
                    <p class="mt-1 text-xs text-slate-400">当前可用于调度的 Key 数</p>
                </div>
                <div class="bg-white rounded-2xl soft-border p-5">
                    <p class="text-sm text-slate-500">失败账号</p>
                    <p id="failed-keys" class="mt-2 text-3xl font-semibold text-rose-600">0</p>
                    <p class="mt-1 text-xs text-slate-400">连续失败或校验不通过的 Key</p>
                </div>
                <div class="bg-white rounded-2xl soft-border p-5">
                    <p class="text-sm text-slate-500">客户端 Token 数</p>
                    <p id="total-client-tokens" class="mt-2 text-3xl font-semibold text-sky-600">0</p>
                    <p class="mt-1 text-xs text-slate-400">已签发的下游授权凭证</p>
                </div>
            </aside>
        </section>

        <section id="quick-actions" class="space-y-6">
            <div class="flex items-center justify-between gap-4">
                <h2 class="text-2xl font-semibold text-slate-900">核心能力速览</h2>
                <p class="text-sm text-slate-500">下列三个板块覆盖日常管理、导入与监控需求</p>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
                <div class="bg-white rounded-2xl soft-border p-6 flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">🧰</span>
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900">API Key 池</h3>
                            <p class="text-xs text-slate-500">批量维护、快速验证、自动禁用</p>
                        </div>
                    </div>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li>• 一键验证选中或全部 Key</li>
                        <li>• 支持有效期与状态管理</li>
                        <li>• 多维度筛选定位风险账号</li>
                    </ul>
                    <button type="button" onclick="document.querySelector('[data-tab=\\'api-keys\\']').click()" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
                        打开管理面板 →
                    </button>
                </div>
                <div class="bg-white rounded-2xl soft-border p-6 flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">🔑</span>
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900">客户端 Token</h3>
                            <p class="text-xs text-slate-500">隔离上游密钥，控制调用权限</p>
                        </div>
                    </div>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li>• 快速生成带有效期的 Token</li>
                        <li>• 实时记录请求计数</li>
                        <li>• 复制即用，配合 API 文档调试</li>
                    </ul>
                    <button type="button" onclick="document.querySelector('[data-tab=\\'tokens\\']').click()" class="mt-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                        管理客户端 Token →
                    </button>
                </div>
                <div class="bg-white rounded-2xl soft-border p-6 flex flex-col gap-4">
                    <div class="flex items-center gap-3">
                        <span class="text-xl">📦</span>
                        <div>
                            <h3 class="text-lg font-semibold text-slate-900">批量导入与监控</h3>
                            <p class="text-xs text-slate-500">一站式导入、统计与健康度追踪</p>
                        </div>
                    </div>
                    <ul class="space-y-2 text-sm text-slate-600">
                        <li>• 支持文件上传与粘贴导入</li>
                        <li>• 自动分类识别账号类型</li>
                        <li>• 配合统计面板洞察成功率</li>
                    </ul>
                    <div class="mt-auto flex flex-col gap-2">
                        <button type="button" onclick="document.querySelector('[data-tab=\\'import\\']').click()" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors">
                            批量导入入口 →
                        </button>
                        <button type="button" onclick="document.querySelector('[data-tab=\\'stats\\']').click()" class="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                            查看实时统计 →
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <section id="management-panels" class="space-y-6">
            <div class="bg-white rounded-3xl soft-border card-shadow">
                <header class="px-6 md:px-8 pt-6 pb-4 border-b border-slate-200 flex flex-wrap items-center gap-3">
                    <span class="text-sm font-medium text-slate-500">数据与管理面板</span>
                    <div class="flex flex-wrap gap-2 ml-auto">
                        <button data-tab="api-keys" class="tab-btn px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm" type="button">API Keys</button>
                        <button data-tab="tokens" class="tab-btn px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600" type="button">客户端 Token</button>
                        <button data-tab="import" class="tab-btn px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600" type="button">批量导入</button>
                        <button data-tab="stats" class="tab-btn px-4 py-2 rounded-lg text-slate-600 hover:text-indigo-600" type="button">统计分析</button>
                    </div>
                </header>

                <div class="px-6 md:px-8 py-6 space-y-10">
                    <div id="api-keys-content" class="tab-content space-y-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-semibold text-slate-900">API Key 池管理</h3>
                                <p class="mt-1 text-sm text-slate-500">维护所有上游账号，支持快速校验、复制与状态切换。</p>
                            </div>
                            <div class="flex flex-wrap gap-2 text-sm">
                                <button onclick="selectAllKeys()" class="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-100">全选</button>
                                <button onclick="verifySelectedKeys()" class="px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600">验证选中</button>
                                <button onclick="verifyAllKeys()" class="px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600">验证全部</button>
                                <button onclick="deleteSelectedKeys()" class="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600">删除选中</button>
                                <button onclick="deleteAllKeys()" class="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100">清空全部</button>
                            </div>
                        </div>

                        <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                            <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5">
                                <h4 class="text-sm font-semibold text-slate-700 mb-3">添加新 API Key</h4>
                                <div class="grid gap-3 md:grid-cols-3">
                                    <input type="text" id="new-username" placeholder="用户名" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                    <input type="text" id="new-api-key" placeholder="API Key" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                    <input type="number" id="new-api-key-ttl" placeholder="有效期(秒，0=永久)" value="0" min="0" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                </div>
                                <button onclick="addApiKey()" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
                                    添加到池子
                                </button>
                            </div>
                            <div class="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                                <h4 class="text-sm font-semibold text-slate-700">实时提示</h4>
                                <p class="text-xs text-slate-500">• 建议优先启用 PostgreSQL 与 Redis，确保导入量大时不触发 KV 写入限制。</p>
                                <p class="text-xs text-slate-500">• 验证失败的 Key 会被自动标记为失败，可在列表中手动启用。</p>
                            </div>
                        </div>

                        <div id="verify-progress" class="hidden rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                            <div class="flex items-center justify-between text-sm text-amber-700">
                                <span class="font-medium">验证进度</span>
                                <span id="verify-progress-text">0 / 0</span>
                            </div>
                            <div class="mt-3 h-2 w-full rounded-full bg-amber-200">
                                <div id="verify-progress-bar" class="h-2 rounded-full bg-amber-500 transition-all" style="width: 0%"></div>
                            </div>
                        </div>

                        <div class="overflow-x-auto rounded-2xl border border-slate-200">
                            <table class="w-full text-sm">
                                <thead class="bg-slate-100 text-slate-600 uppercase text-xs">
                                    <tr>
                                        <th class="px-5 py-3 text-left">
                                            <input type="checkbox" id="select-all-checkbox" class="rounded border-slate-300 text-primary focus:ring-primary">
                                        </th>
                                        <th class="px-5 py-3 text-left">#</th>
                                        <th class="px-5 py-3 text-left">用户名</th>
                                        <th class="px-5 py-3 text-left">API Key</th>
                                        <th class="px-5 py-3 text-left">状态</th>
                                        <th class="px-5 py-3 text-left">有效期</th>
                                        <th class="px-5 py-3 text-left">操作</th>
                                    </tr>
                                </thead>
                                <tbody id="api-keys-table" class="bg-white divide-y divide-slate-100">
                                    <tr><td colspan="7" class="text-center py-10 text-slate-400 text-sm">加载中...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="api-keys-pagination"></div>
                    </div>

                    <div id="tokens-content" class="tab-content hidden space-y-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-semibold text-slate-900">客户端 Token 管理</h3>
                                <p class="mt-1 text-sm text-slate-500">发放下游调用凭证，支持自定义名称与有效期。</p>
                            </div>
                        </div>

                        <div class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5">
                            <h4 class="text-sm font-semibold text-slate-700 mb-3">生成新 Token</h4>
                            <div class="grid gap-3 md:grid-cols-2">
                                <input type="text" id="client-token-name" placeholder="Token 名称" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                                <input type="number" id="client-token-ttl" placeholder="有效期(秒，0=永久)" value="0" min="0" class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/50 focus:border-transparent">
                            </div>
                            <button onclick="generateClientToken()" class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">
                                生成并保存
                            </button>
                        </div>

                        <div class="overflow-x-auto rounded-2xl border border-slate-200">
                            <table class="w-full text-sm">
                                <thead class="bg-slate-100 text-slate-600 uppercase text-xs">
                                    <tr>
                                        <th class="px-5 py-3 text-left">#</th>
                                        <th class="px-5 py-3 text-left">Token</th>
                                        <th class="px-5 py-3 text-left">名称</th>
                                        <th class="px-5 py-3 text-left">有效期</th>
                                        <th class="px-5 py-3 text-left">操作</th>
                                    </tr>
                                </thead>
                                <tbody id="client-tokens-table" class="bg-white divide-y divide-slate-100">
                                    <tr><td colspan="5" class="text-center py-10 text-slate-400 text-sm">加载中...</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="client-tokens-pagination"></div>
                    </div>

                    <div id="import-content" class="tab-content hidden space-y-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-semibold text-slate-900">批量导入账号</h3>
                                <p class="mt-1 text-sm text-slate-500">支持多种文本格式，一键上传并自动分类。</p>
                            </div>
                        </div>

                        <div class="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
                            <p class="text-sm font-medium text-amber-800 mb-2">支持的输入格式</p>
                            <ul class="text-xs text-amber-700 space-y-1 ml-4 list-disc">
                                <li>每行一个完整 session cookie</li>
                                <li><code class="bg-white/80 px-2 py-0.5 rounded">email----password----session----aid----apikey</code></li>
                                <li><code class="bg-white/80 px-2 py-0.5 rounded">用户名----API_KEY</code></li>
                            </ul>
                        </div>

                        <div class="space-y-4">
                            <div class="flex flex-wrap gap-3">
                                <input type="file" id="file-input" accept=".txt,.text" class="hidden">
                                <button id="upload-btn" onclick="document.getElementById('file-input').click()" class="px-5 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                    📂 <span id="upload-btn-text">选择文件上传</span>
                                </button>
                                <button onclick="clearImportText()" class="px-5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors">清空内容</button>
                            </div>
                            <div id="file-info" class="hidden bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-600 flex flex-wrap gap-2">
                                <span class="font-medium" id="file-name"></span>
                                <span id="file-size"></span>
                                <span id="file-lines" class="text-emerald-600"></span>
                            </div>
                            <textarea id="import-textarea" rows="12" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-primary/50 focus:border-transparent" placeholder="粘贴账号数据或选择文件导入..."></textarea>
                            <div class="flex items-center gap-3">
                                <button onclick="importAccounts()" class="px-6 py-2 rounded-lg bg-primary text-white hover:bg-indigo-600 transition-colors">开始导入</button>
                                <span id="import-status" class="text-sm text-slate-500"></span>
                            </div>
                        </div>
                    </div>

                    <div id="stats-content" class="tab-content hidden space-y-6">
                        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h3 class="text-xl font-semibold text-slate-900">运行统计</h3>
                                <p class="mt-1 text-sm text-slate-500">数据来自 PostgreSQL 与 Redis，10 秒自动刷新。</p>
                            </div>
                            <a href="/stats" target="_blank" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors">查看公开统计页面 →</a>
                        </div>

                        <div class="grid gap-4 md:grid-cols-2">
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                                <p class="text-sm text-blue-600">API Keys 总数</p>
                                <p id="stats-total-keys" class="mt-2 text-3xl font-semibold text-blue-900">0</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-green-50 p-5">
                                <p class="text-sm text-emerald-600">正常账号</p>
                                <p id="stats-active-keys" class="mt-2 text-3xl font-semibold text-emerald-900">0</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-rose-50 to-red-50 p-5">
                                <p class="text-sm text-rose-600">失败账号</p>
                                <p id="stats-failed-keys" class="mt-2 text-3xl font-semibold text-rose-900">0</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5">
                                <p class="text-sm text-purple-600">客户端 Token 数</p>
                                <p id="stats-client-tokens" class="mt-2 text-3xl font-semibold text-purple-900">0</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-5">
                                <p class="text-sm text-amber-600">总请求次数</p>
                                <p id="stats-total-requests" class="mt-2 text-3xl font-semibold text-amber-900">0</p>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-5">
                                <p class="text-sm text-slate-600">成功率</p>
                                <p id="stats-success-rate" class="mt-2 text-3xl font-semibold text-slate-900">0%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <div id="toast-container" class="fixed top-6 right-6 space-y-3 z-50"></div>

    <footer class="bg-white border-t border-slate-200 mt-16">
        <div class="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div class="flex items-center gap-2">
                <span>当前时间: <span id="current-time" class="font-medium text-slate-700"></span></span>
                <span class="text-slate-300">·</span>
                <span>构建时间: <span id="build-time" class="font-medium text-slate-700">{{BUILD_TIME}}</span></span>
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-slate-500">
                <span>首次运行: <span id="project-launch-date" class="font-medium text-slate-700">2025-10-09</span></span>
                <span class="hidden sm:inline text-slate-300">·</span>
                <span>已稳定运行 <span id="project-runtime" class="font-medium text-slate-700">--</span></span>
            </div>
            <div class="flex items-center gap-2">
                <a href="https://github.com/dext7r/ollama-api-pool" target="_blank" rel="noopener" class="flex items-center gap-1 hover:text-primary transition-colors">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                </a>
            </div>
            <div class="italic text-slate-400 tracking-wide">欲买桂花同载酒，终不似，少年游</div>
        </div>
    </footer>

    <script src="/js/dashboard.js?v=12"></script>
</body>
</html>`;

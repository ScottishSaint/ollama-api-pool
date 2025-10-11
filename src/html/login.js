/**
 * 登录页面 HTML - 静态内容
 */

export const loginHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama API Pool 管理登录</title>
    <meta name="description" content="Ollama API Pool 管理控制台登录入口，集中管理多账户代理池，实现负载均衡、故障转移与统一鉴权。">
    <meta name="keywords" content="Ollama API Pool, API 代理池, 多账号管理, 负载均衡, Cloudflare Workers, 鉴权, 统计分析">
    <meta name="robots" content="index,follow">
    <script src="https://proxy.jhun.edu.kg/proxy/cdn.tailwindcss.com/"></script>
    <script src="https://proxy.jhun.edu.kg/proxy/code.jquery.com/jquery-3.7.1.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#4f46e5',
                        accent: '#0ea5e9'
                    },
                    boxShadow: {
                        soft: '0 18px 40px -24px rgba(30, 41, 59, 0.35)'
                    }
                }
            }
        }
    </script>
    <style>
        @import url('https://proxy.jhun.edu.kg/proxy/fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col text-slate-800">
    <header class="bg-white border-b border-slate-200/80">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div class="flex items-center gap-3">
                <div class="rounded-xl bg-gradient-to-br from-primary to-accent text-white p-2.5">
                    <span class="text-2xl">🔐</span>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Ollama API Pool</p>
                    <h1 class="text-base sm:text-lg font-semibold text-slate-900">管理控制台登录</h1>
                </div>
            </div>
            <div class="flex w-full sm:w-auto flex-wrap items-center justify-start sm:justify-end gap-2 sm:gap-3 text-xs sm:text-sm">
                <a href="/api-docs" class="px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                    API 文档
                </a>
                <a href="/stats" class="px-3 py-1 sm:px-4 sm:py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                    公开统计
                </a>
            </div>
        </div>
    </header>

    <main class="flex-1">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
            <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] items-start">
                <section class="space-y-8">
                    <div class="space-y-5">
                        <span class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">统一代理池 · 运维总览</span>
                        <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">进入后台，维护高可用的 Ollama API 代理服务</h2>
                        <p class="text-sm sm:text-base leading-relaxed text-slate-600 max-w-3xl">
                            从这里登录即可集中管理所有 Ollama 账号：批量导入与验证 API Key、签发客户端 Token、实时掌握请求统计与成功率，并支持 PostgreSQL + Redis 作为主存储，避免 KV 写入瓶颈。
                        </p>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-4 lg:gap-5">
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">🔄 负载均衡调度</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">多 Key 轮询调度，故障即刻切换，持续保证接口可用。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">🛡️ 鉴权隔离</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">客户端仅持 Token，真实上游密钥留存在池内，降低泄露风险。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">📊 秒级统计</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">成功率、请求量与 Key 健康度 10 秒刷新一次，快速洞察异常。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">🧩 自持部署</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">Cloudflare Workers 托管，配合 PostgreSQL 与 Redis，按需扩展。</p>
                        </article>
                    </div>
                </section>

                <section class="w-full">
                    <div class="rounded-3xl border border-slate-200 bg-white shadow-soft p-7 sm:p-8 space-y-6">
                        <header class="space-y-2">
                            <h3 class="text-xl font-semibold text-slate-900">管理员认证</h3>
                            <p class="text-sm text-slate-600">使用部署时配置的管理员 Token 完成登录，系统仅在浏览器本地缓存凭证。</p>
                        </header>

                        <div id="intro-section" class="space-y-4">
                            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p class="text-sm font-medium text-slate-800">安全提示</p>
                                <p class="mt-2 text-xs text-slate-500 leading-relaxed">Token 永不上传到服务端，可随时在控制台退出并清除本地缓存。</p>
                            </div>
                            <button id="start-login" class="w-full rounded-2xl bg-gradient-to-r from-primary via-indigo-500 to-accent py-3 text-white font-semibold shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-0.5">
                                开始登录
                            </button>
                            <p class="text-xs text-slate-400 text-center">点击后输入 <code class="bg-slate-100 px-2 py-0.5 rounded">ADMIN_TOKEN</code> 完成认证。</p>
                        </div>

                        <form id="login-form" class="hidden space-y-5">
                            <div>
                                <label for="admin-token" class="block text-sm font-medium text-slate-700 mb-2">管理员 Token</label>
                                <div class="relative">
                                    <input type="password" id="admin-token" class="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-all text-slate-900" placeholder="请输入管理员 Token" autocomplete="off" required>
                                    <button type="button" id="toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" title="切换密码显示">
                                        <svg id="eye-icon" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                        <svg id="eye-off-icon" class="w-5 h-5 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs sm:text-sm text-slate-600">
                                <label class="inline-flex items-center">
                                    <input type="checkbox" id="remember-me" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary">
                                    <span class="ml-2">记住登录状态</span>
                                </label>
                                <span class="text-slate-400">若使用公共设备，建议关闭此选项</span>
                            </div>

                            <div id="error-message" class="hidden rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"></div>

                            <button type="submit" class="w-full rounded-xl bg-slate-900 py-3 text-white font-semibold shadow-md hover:bg-slate-700 transition-colors">
                                进入控制台
                            </button>
                        </form>

                        <div class="space-y-2 text-xs text-slate-500">
                            <p>• 在 <code class="bg-slate-100 px-2 py-0.5 rounded">wrangler.toml</code> 中配置 <code>ADMIN_TOKEN</code> 后重新部署即可更新登录凭证。</p>
                            <p>• 若启用 GitHub Actions 自动部署，同步更新 Cloudflare 环境变量保持一致。</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <div id="toast-container" class="fixed top-6 right-6 space-y-3 z-50"></div>

    <footer class="mt-auto bg-white border-t border-slate-200">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-slate-500">
                <div class="flex items-center gap-1 sm:gap-2">
                    <span>当前时间: <span id="footer-time" class="font-medium text-slate-700"></span></span>
                    <span class="hidden sm:inline text-slate-300">·</span>
                    <span>构建时间: <span id="build-time" class="font-medium text-slate-700">{{BUILD_TIME}}</span></span>
                </div>
                <div class="flex items-center gap-1 sm:gap-2">
                    <span>首次运行: <span id="project-launch-date" class="font-medium text-slate-700">2025-10-09</span></span>
                    <span class="hidden sm:inline text-slate-300">·</span>
                    <span>已稳定运行 <span id="project-runtime" class="font-medium text-slate-700">--</span></span>
                </div>
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

    <script src="/js/login.js?v=5"></script>
</body>
</html>`;

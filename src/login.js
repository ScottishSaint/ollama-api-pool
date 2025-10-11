/**
 * 登录页面组件
 */
import { htmlResponse } from './utils';

export function getLoginPage() {
  const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>登录 - Ollama API Pool</title>
    <script src="https://proxy.jhun.edu.kg/proxy/cdn.tailwindcss.com/"></script>
    <script src="https://proxy.jhun.edu.kg/proxy/code.jquery.com/jquery-3.7.1.min.js"></script>
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
        @import url('https://proxy.jhun.edu.kg/proxy/fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Inter', sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
        }
        .glass-effect {
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(18px);
            border: 1px solid rgba(255, 255, 255, 0.35);
        }
        .login-card {
            animation: fadeUp 0.6s ease-out;
        }
        @keyframes fadeUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .shake {
            animation: shake 0.45s;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
    </style>
</head>
<body class="gradient-bg min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
    <div class="absolute inset-0 opacity-40">
        <div class="absolute -top-24 -left-16 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-32 -right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute top-1/2 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>

    <div class="login-card glass-effect rounded-3xl shadow-2xl p-10 w-full max-w-xl relative z-10">
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-primary uppercase tracking-[0.4em]">Ollama API Pool</p>
                    <h1 class="mt-2 text-3xl font-bold text-gray-900">欢迎来到管理控制台</h1>
                    <p class="mt-2 text-gray-500">集中管理账号、监控使用情况，打造高效的多 Key 调度平台。</p>
                </div>
                <div class="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg">
                    <span class="text-4xl">🔐</span>
                </div>
            </div>

            <div id="intro-section" class="space-y-5 text-gray-600">
                <div class="flex items-start gap-3">
                    <div class="mt-1 text-primary">✨</div>
                    <div>
                        <h2 class="font-semibold text-gray-800">一步即可进入仪表盘</h2>
                        <p class="text-sm leading-relaxed">使用部署时配置的管理员 Token 完成认证，立即管理 API Keys 与客户端 Token。</p>
                    </div>
                </div>
                <button id="start-login"
                    class="w-full py-3.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    开始登录
                </button>
                <p class="text-xs text-gray-400 text-center">Token 仅用于本地身份验证，系统不会存储在服务端。</p>
            </div>

            <form id="login-form" class="hidden space-y-6">
                <div>
                    <label for="admin-token" class="block text-sm font-medium text-gray-700 mb-2">
                        管理员 Token
                    </label>
                    <input
                        type="password"
                        id="admin-token"
                        class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="请输入管理员 Token"
                        autocomplete="off"
                        required
                    >
                </div>

                <div class="flex items-center justify-between text-sm text-gray-600">
                    <label class="flex items-center">
                        <input
                            type="checkbox"
                            id="remember-me"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        >
                        <span class="ml-2">记住我的登录状态</span>
                    </label>
                    <span class="text-xs text-gray-400">支持本地缓存，可随时登出清除</span>
                </div>

                <div id="error-message" class="hidden bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm"></div>

                <button
                    type="submit"
                    class="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                    进入控制台
                </button>
            </form>

            <div class="pt-4 border-t border-gray-200 text-sm text-gray-500 space-y-2">
                <p class="flex items-start">
                    <svg class="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    管理员 Token 在 <code class="bg-gray-100 px-2 py-0.5 rounded">wrangler.toml</code> 中配置。
                </p>
                <p class="flex items-start">
                    <svg class="w-5 h-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    认证信息仅存储在浏览器本地，保障服务端无状态。
                </p>
            </div>
        </div>
    </div>

    <div id="toast-container" class="fixed top-6 right-6 space-y-3 z-50"></div>

    <!-- Footer -->
    <footer class="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-md border-t border-gray-200/50 py-3 z-30">
        <div class="container mx-auto px-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
                <div class="flex items-center gap-2">
                    <span id="footer-time" class="font-medium"></span>
                    <span class="hidden sm:inline text-gray-400">·</span>
                    <a href="https://github.com/dext7r/ollama-api-pool" target="_blank" rel="noopener" class="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span>GitHub</span>
                    </a>
                </div>
                <div class="text-gray-500 italic tracking-wide">
                    欲买桂花同载酒，终不似，少年游
                </div>
            </div>
        </div>
    </footer>

    <script>
        const STORAGE_KEY = 'adminToken';
        const loginForm = $('#login-form');
        const tokenInput = $('#admin-token');
        const rememberMe = $('#remember-me');
        const errorMessage = $('#error-message');
        const startLogin = $('#start-login');
        const introSection = $('#intro-section');

        // 更新页脚时间
        function updateFooterTime() {
            const now = new Date();
            $('#footer-time').text(now.toLocaleString('zh-CN'));
        }
        updateFooterTime();
        setInterval(updateFooterTime, 1000);

        // Toast 提示
        function showToast(message, type = 'info') {
            const colors = {
                success: 'from-emerald-500 to-green-500',
                error: 'from-rose-500 to-red-500',
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
            const toast = $(\`
                <div id="\${id}" class="transform transition-all duration-300 translate-x-full opacity-0">
                    <div class="flex items-center gap-3 text-white px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-r \${colors[type] || colors.info}">
                        <span class="text-lg">\${icons[type] || icons.info}</span>
                        <span class="text-sm leading-relaxed">\${message}</span>
                    </div>
                </div>
            \`);
            $('#toast-container').append(toast);
            requestAnimationFrame(() => {
                toast.removeClass('translate-x-full opacity-0').addClass('translate-x-0 opacity-100');
            });
            setTimeout(() => {
                toast.addClass('translate-x-full opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3600);
        }

        function redirectToDashboard() {
            window.location.href = '/dashboard?verify=true';
        }

        // 自动跳转已登录用户
        const savedToken = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        if (savedToken) {
            redirectToDashboard();
        }

        startLogin.on('click', () => {
            introSection.addClass('hidden');
            loginForm.removeClass('hidden');
            tokenInput.trigger('focus');
        });

        loginForm.on('submit', async (event) => {
            event.preventDefault();
            const token = tokenInput.val().trim();
            if (!token) {
                showError('请输入管理员 Token');
                return;
            }

            const submitButton = loginForm.find('button[type="submit"]');
            submitButton.prop('disabled', true).addClass('opacity-70').text('登录中...');

            try {
                const response = await fetch('/admin/stats', {
                    headers: {
                        'Authorization': \`Bearer \${token}\`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        showError('Token 无效，请检查后重试');
                    } else {
                        showError('登录失败，请稍后再试');
                    }
                    return;
                }

                if (rememberMe.is(':checked')) {
                    localStorage.setItem(STORAGE_KEY, token);
                    sessionStorage.removeItem(STORAGE_KEY);
                } else {
                    sessionStorage.setItem(STORAGE_KEY, token);
                    localStorage.removeItem(STORAGE_KEY);
                }

                showToast('登录成功，正在跳转', 'success');
                setTimeout(() => redirectToDashboard(), 400);
            } catch (error) {
                console.error('Login error:', error);
                showError('网络异常，请检查连接');
            } finally {
                submitButton.prop('disabled', false).removeClass('opacity-70').text('进入控制台');
            }
        });

        function showError(message) {
            errorMessage.text(message).removeClass('hidden');
            loginForm.addClass('shake');
            setTimeout(() => loginForm.removeClass('shake'), 450);
            showToast(message, 'error');
        }

        tokenInput.on('input', () => {
            errorMessage.addClass('hidden');
        });
    </script>
</body>
</html>
  `;
  return htmlResponse(html);
}

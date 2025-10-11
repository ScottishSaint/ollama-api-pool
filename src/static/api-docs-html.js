export const apiDocsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama API Pool - API 文档与调试中心</title>
    <meta name="description" content="Ollama API Pool 公开 API 文档、请求示例与在线调试工具，帮助团队快速集成代理服务。">
    <meta name="keywords" content="Ollama API Pool, API 文档, 公开统计, Cloudflare Workers, 代理池, 统一鉴权">
    <meta name="robots" content="index,follow">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .code-block {
            position: relative;
            background: #0f172a;
            color: #e2e8f0;
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            overflow-x: auto;
            font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
            font-size: 0.85rem;
            box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
        }
        .code-block pre { margin: 0; white-space: pre; }
        .copy-btn {
            position: absolute;
            top: 0.75rem;
            right: 0.75rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            color: #f8fafc;
            background: rgba(15, 23, 42, 0.55);
            border: 1px solid rgba(148, 163, 184, 0.35);
            border-radius: 9999px;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .group:hover .copy-btn,
        .copy-btn:focus {
            opacity: 1;
            transform: translateY(-1px);
        }
        .response-box {
            max-height: 420px;
            overflow-y: auto;
        }
        .subtle-card {
            background: linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(14, 165, 233, 0.08));
            border: 1px solid rgba(79, 70, 229, 0.1);
        }
    </style>
</head>
<body class="bg-slate-50 min-h-screen flex flex-col text-slate-800">
    <header class="bg-white border-b border-slate-200/80">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <div class="rounded-xl bg-gradient-to-br from-primary to-accent text-white p-2.5">
                    <span class="text-2xl">📚</span>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Ollama API Pool</p>
                    <h1 class="text-base sm:text-lg font-semibold text-slate-900">API 文档与调试中心</h1>
                </div>
            </div>
            <div class="hidden sm:flex items-center gap-3 text-sm">
                <a href="/" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">登录后台</a>
                <a href="/stats" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">公开统计</a>
            </div>
        </div>
    </header>

    <main class="flex-1">
        <div class="max-w-7xl mx-auto px-5 sm:px-8 py-4 lg:py-6 space-y-8">
            <section class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
                <div class="space-y-6">
                    <span class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">开放 API · 无缝接入</span>
                    <h2 class="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">统一代理入口，提供对 Ollama 模型池的稳健访问</h2>
                    <p class="text-sm sm:text-base leading-relaxed text-slate-600 max-w-3xl">
                        借助 Cloudflare Workers、Redis 与 PostgreSQL 的调度链路，Ollama API Pool 输出符合 OpenAI 规范的接口形态，支持多账户轮询、故障熔断与实时统计。该页面保持与登录入口一致的浅色布局，方便公开访客与内部成员共享一致体验。
                    </p>
                    <div class="grid sm:grid-cols-2 gap-4">
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">⚡ 智能调度</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">轮询分配与故障即刻切换，确保多模型池持续稳定对外提供服务。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">🛡️ 按需鉴权</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">客户端仅持有 Token，真实上游密钥全程保存在代理池内，降低泄露风险。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">📊 全链可视</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">结合公开统计页可视化监控请求量、成功率与热门模型，秒级刷新。</p>
                        </article>
                        <article class="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
                            <h3 class="text-sm font-semibold text-slate-900">🔁 快速调试</h3>
                            <p class="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">在线测试台支持同步/流式两种响应，提供模板与复制能力帮助集成。</p>
                        </article>
                    </div>
                </div>
                <aside class="space-y-4 rounded-2xl border border-primary/20 bg-white p-6 shadow-soft">
                    <h3 class="text-lg font-semibold text-slate-900">页面导航</h3>
                    <ul class="space-y-3 text-sm text-slate-600">
                        <li><a href="#quick-start" class="flex items-center gap-2 hover:text-primary transition-colors"><span>🚀</span><span>快速开始</span></a></li>
                        <li><a href="#api-reference" class="flex items-center gap-2 hover:text-primary transition-colors"><span>📖</span><span>API 参考</span></a></li>
                        <li><a href="#api-test" class="flex items-center gap-2 hover:text-primary transition-colors"><span>🧪</span><span>在线测试</span></a></li>
                        <li><a href="#sdk-example" class="flex items-center gap-2 hover:text-primary transition-colors"><span>🧰</span><span>SDK 示例</span></a></li>
                        <li><a href="#error-codes" class="flex items-center gap-2 hover:text-primary transition-colors"><span>⚠️</span><span>错误码</span></a></li>
                    </ul>
                    <div class="subtle-card rounded-2xl px-4 py-3 text-xs text-slate-600 leading-relaxed">
                        API 文档、公开统计与登录页共享顶部导航、信息色与排版节奏，访客可以在不同入口间快速切换并保持认知一致。
                    </div>
                </aside>
            </section>

            <section id="quick-start" class="space-y-6">
                <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h3 class="text-2xl font-semibold text-slate-900">🚀 快速开始</h3>
                    <p class="text-sm text-slate-500">完成以下步骤即可在几分钟内调用 Ollama 模型。</p>
                </header>
                <div class="grid gap-4 lg:gap-6 md:grid-cols-3">
                    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft h-full">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step 01</div>
                        <h4 class="mt-3 text-lg font-semibold text-slate-900">获取 API Token</h4>
                        <p class="mt-2 text-sm text-slate-600 leading-relaxed">联系管理员或登陆控制台生成专属 Token，可设置过期时间与并发配额，全部 Token 会在后台可视化管理。</p>
                    </article>
                    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft h-full">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step 02</div>
                        <h4 class="mt-3 text-lg font-semibold text-slate-900">确认请求端点</h4>
                        <p class="mt-2 text-sm text-slate-600 leading-relaxed">OpenAI 兼容接口：<code class="bg-slate-100 px-2 py-0.5 rounded text-xs">/v1/chat/completions</code> 与 <code class="bg-slate-100 px-2 py-0.5 rounded text-xs">/v1/models</code>。直接替换原有 Base URL 即可完成迁移。</p>
                    </article>
                    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft h-full">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Step 03</div>
                        <h4 class="mt-3 text-lg font-semibold text-slate-900">添加 Authorization</h4>
                        <p class="mt-2 text-sm text-slate-600 leading-relaxed">在请求头写入 <code class="bg-slate-100 px-2 py-0.5 rounded text-xs">Authorization: Bearer YOUR_API_TOKEN</code>。后续可进入 <a href="/stats" class="text-primary hover:underline">公开统计</a> 监控请求表现。</p>
                    </article>
                </div>
            </section>

            <section id="api-reference" class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-soft">
                <header class="space-y-2">
                    <h3 class="text-2xl font-semibold text-slate-900">📖 API 参考</h3>
                    <p class="text-sm text-slate-500">所有接口遵循 OpenAI 官方协议，支持 JSON 与 SSE 流式输出。</p>
                </header>

                <div class="space-y-5">
                    <div>
                        <h4 class="text-lg font-semibold text-slate-900 mb-3">请求参数</h4>
                        <div class="overflow-x-auto rounded-2xl border border-slate-200">
                            <table class="w-full text-sm text-left text-slate-600">
                                <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                                    <tr>
                                        <th class="px-4 py-2">参数</th>
                                        <th class="px-4 py-2">类型</th>
                                        <th class="px-4 py-2">必填</th>
                                        <th class="px-4 py-2">说明</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-200">
                                    <tr>
                                        <td class="px-4 py-2 font-mono text-primary">model</td>
                                        <td class="px-4 py-2">string</td>
                                        <td class="px-4 py-2">✓</td>
                                        <td class="px-4 py-2">模型名称，如 "llama2"、"llama3.2"、"mistral" 等。</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 font-mono text-primary">messages</td>
                                        <td class="px-4 py-2">array</td>
                                        <td class="px-4 py-2">✓</td>
                                        <td class="px-4 py-2">对话消息数组，元素包含 role 与 content 字段。</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 font-mono text-primary">stream</td>
                                        <td class="px-4 py-2">boolean</td>
                                        <td class="px-4 py-2">-</td>
                                        <td class="px-4 py-2">是否启用流式响应，默认 false。</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 font-mono text-primary">temperature</td>
                                        <td class="px-4 py-2">number</td>
                                        <td class="px-4 py-2">-</td>
                                        <td class="px-4 py-2">温度系数 (0-2)，默认 0.7。</td>
                                    </tr>
                                    <tr>
                                        <td class="px-4 py-2 font-mono text-primary">max_tokens</td>
                                        <td class="px-4 py-2">number</td>
                                        <td class="px-4 py-2">-</td>
                                        <td class="px-4 py-2">最大生成 Token 数量，默认跟随模型配置。</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="grid gap-5 lg:grid-cols-2">
                        <div>
                            <h4 class="text-lg font-semibold text-slate-900 mb-3">请求示例</h4>
                            <div class="code-block"><pre>{
  "model": "llama2",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "stream": false,
  "temperature": 0.7
}</pre></div>
                        </div>
                        <div>
                            <h4 class="text-lg font-semibold text-slate-900 mb-3">响应示例</h4>
                            <div class="code-block"><pre>{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "llama2",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  }
}</pre></div>
                        </div>
                    </div>

                    <div class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <h4 class="text-lg font-semibold text-slate-900 mb-3">获取模型列表 (GET /v1/models)</h4>
                        <p class="text-sm text-slate-600 mb-3">返回当前可用模型集合，配合公开统计页面掌握池内状态。</p>
                        <div class="code-block"><pre>{
  "object": "list",
  "data": [
    {
      "id": "llama2",
      "object": "model",
      "created": 1234567890,
      "owned_by": "ollama"
    },
    {
      "id": "mistral",
      "object": "model",
      "created": 1234567890,
      "owned_by": "ollama"
    }
  ]
}</pre></div>
                    </div>
                </div>
            </section>

            <section id="api-test" class="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-soft">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h3 class="text-2xl font-semibold text-slate-900">🧪 在线测试</h3>
                        <p class="mt-2 text-sm text-slate-500">无需离开页面即可调试聊天补全接口，支持同步与流式两种模式。</p>
                    </div>
                    <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">实时调用生产环境</span>
                </div>

                <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div class="space-y-5">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">API Token</label>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                                <input type="text" id="apiToken" placeholder="请输入您的 API Token"
                                    class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40">
                                <div class="flex items-center gap-2">
                                    <button id="saveTokenBtn" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40">保存</button>
                                    <button id="clearTokenBtn" class="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300">清空</button>
                                </div>
                            </div>
                            <p id="tokenSavedHint" class="mt-2 text-xs text-slate-500 hidden">Token 已保存，本地仅用于 API 调试。</p>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">模型</label>
                            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                                <select id="model" class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40">
                                    <option value="">加载中...</option>
                                </select>
                                <button id="copyModelBtn" class="px-3 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300">
                                    复制模型名
                                </button>
                            </div>
                            <p class="text-xs text-slate-500 mt-1">模型列表会从 /v1/models 接口动态加载。</p>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">系统提示词 (可选)</label>
                            <textarea id="systemPrompt" rows="2" placeholder="You are a helpful assistant."
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40">You are a helpful assistant.</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">用户消息</label>
                            <textarea id="userMessage" rows="3" placeholder="请输入您的问题..."
                                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40">Hello, how are you?</textarea>
                        </div>

                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">Temperature: <span id="tempValue">0.7</span></label>
                            <input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7"
                                class="w-full accent-primary" oninput="document.getElementById('tempValue').textContent = this.value">
                        </div>

                        <div class="flex items-center">
                            <input type="checkbox" id="stream" class="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary/60">
                            <label for="stream" class="ml-2 text-sm font-semibold text-slate-700">启用流式响应</label>
                        </div>

                        <div id="template-buttons" class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div class="col-span-full text-xs text-slate-500">模板加载中...</div>
                        </div>

                        <button onclick="testAPI()" class="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                            发送测试请求
                        </button>

                        <div id="loading" class="hidden text-center">
                            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p class="text-slate-600 mt-2">请求中...</p>
                        </div>

                        <div id="responseContainer" class="hidden space-y-3">
                            <label class="block text-sm font-semibold text-slate-700">响应结果</label>
                            <div id="response" class="code-block response-box"></div>
                        </div>

                        <div id="streamContainer" class="hidden space-y-3">
                            <label class="block text-sm font-semibold text-slate-700">流式输出</label>
                            <div id="streamResponse" class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"></div>
                        </div>

                        <div id="errorContainer" class="hidden">
                            <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                <span id="errorMessage"></span>
                            </div>
                        </div>
                    </div>

                    <aside class="space-y-4 rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
                        <div>
                            <h4 class="text-base font-semibold text-slate-900">调用技巧</h4>
                            <ul class="mt-3 space-y-2 list-disc list-inside">
                                <li>流式响应会逐行输出 <code class="bg-slate-100 px-1 rounded text-[11px]">data:</code> 包裹的 JSON 片段，结尾以 <code class="bg-slate-100 px-1 rounded text-[11px]">[DONE]</code> 收束。</li>
                                <li>若请求失败，可在公开统计页确认 Key 状态或联系管理员补充配额。</li>
                                <li>调试完成后可点击「清空」移除本地存储的 Token。</li>
                            </ul>
                        </div>
                        <div class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
                            提示：为了对齐登录页面布局，本测试台同样使用浅色卡片、圆角与阴影体系，避免跨页面切换造成落差。
                        </div>
                    </aside>
                </div>
            </section>

            <section id="sdk-example" class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-soft">
                <header>
                    <h3 class="text-2xl font-semibold text-slate-900">🧰 SDK 调用示例</h3>
                    <p class="mt-2 text-sm text-slate-500">参考以下代码片段快速接入常见语言环境。</p>
                </header>

                <div class="grid gap-6 lg:grid-cols-2">
                    <div class="space-y-3">
                        <h4 class="text-lg font-semibold text-slate-900">Python (requests)</h4>
                        <div class="relative group">
                            <button class="copy-btn" data-copy-target="#code-python">复制</button>
                            <div class="code-block" id="code-python"><pre>import requests

url = 'https://ollama-api-pool.h7ml.workers.dev/v1/chat/completions'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
}
payload = {
    'model': 'llama2',
    'messages': [
        {'role': 'user', 'content': 'Hello!'}
    ]
}

response = requests.post(url, headers=headers, json=payload)
print(response.json())</pre></div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <h4 class="text-lg font-semibold text-slate-900">JavaScript (Fetch)</h4>
                        <div class="relative group">
                            <button class="copy-btn" data-copy-target="#code-js">复制</button>
                            <div class="code-block" id="code-js"><pre>const response = await fetch('https://ollama-api-pool.h7ml.workers.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_TOKEN'
  },
  body: JSON.stringify({
    model: 'llama2',
    messages: [
      { role: 'user', content: 'Hello!' }
    ]
  })
});

const data = await response.json();
console.log(data);</pre></div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="error-codes" class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-soft">
                <header>
                    <h3 class="text-2xl font-semibold text-slate-900">⚠️ 常见错误码</h3>
                    <p class="mt-2 text-sm text-slate-500">出现错误时建议同步查看公开统计以确认资源状态。</p>
                </header>
                <div class="overflow-x-auto rounded-2xl border border-slate-200">
                    <table class="w-full text-sm text-left text-slate-600">
                        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                            <tr>
                                <th class="px-4 py-2">状态码</th>
                                <th class="px-4 py-2">说明</th>
                                <th class="px-4 py-2">排查建议</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            <tr>
                                <td class="px-4 py-2 font-mono">401</td>
                                <td class="px-4 py-2">Token 无效或过期</td>
                                <td class="px-4 py-2">确认 Token 是否正确，必要时重新生成。</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono">429</td>
                                <td class="px-4 py-2">请求频率超限</td>
                                <td class="px-4 py-2">降低调用频率或联系管理员提升额度。</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono">503</td>
                                <td class="px-4 py-2">暂无可用 API Key</td>
                                <td class="px-4 py-2">等待调度恢复或补充新的上游密钥。</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    </main>

    <div id="toast-container" class="fixed top-6 left-1/2 -translate-x-1/2 space-y-2 z-50 pointer-events-none"></div>

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

    <script>
        const PROJECT_START_DISPLAY = '2025-10-09';
        const PROJECT_START_DATE = new Date('2025-10-09T00:00:00+08:00');
        const TOKEN_STORAGE_KEY = 'ollama_api_docs_token';

        function updateFooterTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timeStr = year + '年' + month + '月' + day + '日 ' + hours + ':' + minutes + ':' + seconds;
            const footerTime = document.getElementById('footer-time');
            if (footerTime) footerTime.textContent = timeStr;

            if (!Number.isNaN(PROJECT_START_DATE.getTime())) {
                let diffMs = now.getTime() - PROJECT_START_DATE.getTime();
                if (diffMs < 0) diffMs = 0;

                const totalMinutes = Math.floor(diffMs / 60000);
                const days = Math.floor(totalMinutes / 1440);
                const hoursDiff = Math.floor((totalMinutes % 1440) / 60);
                const minutesDiff = totalMinutes % 60;

                const launchEl = document.getElementById('project-launch-date');
                if (launchEl) launchEl.textContent = PROJECT_START_DISPLAY;
                const runtimeEl = document.getElementById('project-runtime');
                if (runtimeEl) runtimeEl.textContent = days + ' 天 ' + hoursDiff + ' 小时 ' + minutesDiff + ' 分钟';
            }
        }
        updateFooterTime();
        setInterval(updateFooterTime, 1000);

        async function loadModels() {
            try {
                const response = await fetch('/v1/models');
                if (!response.ok) {
                    throw new Error('加载模型列表失败');
                }
                const data = await response.json();
                const modelSelect = document.getElementById('model');

                if (data.data && data.data.length > 0) {
                    modelSelect.innerHTML = data.data.map(model =>
                        '<option value="' + model.id + '">' + model.id + '</option>'
                    ).join('');
                } else {
                    modelSelect.innerHTML = '<option value="llama2">llama2 (默认)</option>';
                }
            } catch (error) {
                console.error('加载模型失败:', error);
                document.getElementById('model').innerHTML = '<option value="llama2">llama2 (默认)</option><option value="llama3.2">llama3.2 (默认)</option><option value="mistral">mistral (默认)</option>';
            }
        }
        loadModels();

        async function testAPI() {
            const token = document.getElementById('apiToken').value.trim();
            const model = document.getElementById('model').value;
            const systemPrompt = document.getElementById('systemPrompt').value.trim();
            const userMessage = document.getElementById('userMessage').value.trim();
            const temperature = parseFloat(document.getElementById('temperature').value);
            const stream = document.getElementById('stream').checked;

            document.getElementById('responseContainer').classList.add('hidden');
            document.getElementById('streamContainer').classList.add('hidden');
            document.getElementById('errorContainer').classList.add('hidden');

            if (!token) {
                showError('请输入 API Token');
                return;
            }
            if (!userMessage) {
                showError('请输入用户消息');
                return;
            }

            const messages = [];
            if (systemPrompt) {
                messages.push({ role: 'system', content: systemPrompt });
            }
            messages.push({ role: 'user', content: userMessage });

            document.getElementById('loading').classList.remove('hidden');

            try {
                const requestBody = { model, messages, temperature, stream };

                if (stream) {
                    await handleStreamResponse(token, requestBody);
                } else {
                    await handleNormalResponse(token, requestBody);
                }
            } catch (error) {
                showError(error.message);
            } finally {
                document.getElementById('loading').classList.add('hidden');
            }
        }
        window.testAPI = testAPI;

        async function handleNormalResponse(token, requestBody) {
            const response = await fetch('/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'HTTP ' + response.status);
            }

            const data = await response.json();
            document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            document.getElementById('responseContainer').classList.remove('hidden');
        }

        async function handleStreamResponse(token, requestBody) {
            const response = await fetch('/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || 'HTTP ' + response.status);
            }

            const streamDiv = document.getElementById('streamResponse');
            streamDiv.textContent = '';
            document.getElementById('streamContainer').classList.remove('hidden');

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('当前浏览器不支持流式读取，请使用最新版本。');
            }
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\\n').filter(line => line.trim());

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const json = JSON.parse(data);
                            const content = json.choices?.[0]?.delta?.content || '';
                            streamDiv.textContent += content;
                        } catch (e) {
                            console.error('解析流式片段失败:', e);
                        }
                    }
                }
            }
        }

        function showError(message) {
            document.getElementById('errorMessage').textContent = message;
            document.getElementById('errorContainer').classList.remove('hidden');
        }

        function copyText(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('已复制到剪贴板', 'success');
            }).catch(err => {
                console.warn('复制失败:', err);
                showToast('复制失败，请手动选择文本', 'error');
            });
        }

        function showToast(message, type) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.className = 'px-4 py-2 rounded-full text-sm shadow-lg pointer-events-auto';
            toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';

            if (type === 'success') {
                toast.classList.add('bg-emerald-500', 'text-white');
            } else if (type === 'error') {
                toast.classList.add('bg-rose-500', 'text-white');
            } else {
                toast.classList.add('bg-slate-900', 'text-white');
            }

            const container = document.getElementById('toast-container');
            if (container) {
                container.classList.remove('pointer-events-none');
                container.appendChild(toast);
                requestAnimationFrame(() => {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateY(0)';
                });
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(-8px)';
                    setTimeout(() => {
                        toast.remove();
                        if (!container.hasChildNodes()) {
                            container.classList.add('pointer-events-none');
                        }
                    }, 300);
                }, 2400);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            const tokenInput = document.getElementById('apiToken');
            const saveBtn = document.getElementById('saveTokenBtn');
            const clearBtn = document.getElementById('clearTokenBtn');
            const hint = document.getElementById('tokenSavedHint');
            const systemPromptInput = document.getElementById('systemPrompt');
            const userMessageInput = document.getElementById('userMessage');
            const temperatureInput = document.getElementById('temperature');
            const streamCheckbox = document.getElementById('stream');
            const modelSelect = document.getElementById('model');
            const copyModelBtn = document.getElementById('copyModelBtn');

            try {
                const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
                if (savedToken) {
                    tokenInput.value = savedToken;
                    hint.classList.remove('hidden');
                    hint.textContent = '已从本地加载 Token，仅用于本页面调试。';
                }
            } catch (error) {
                console.warn('读取本地 Token 失败:', error);
            }

            saveBtn.addEventListener('click', () => {
                try {
                    const value = tokenInput.value.trim();
                    if (!value) {
                        hint.textContent = '请输入有效的 Token 后再保存。';
                        hint.classList.remove('hidden');
                        return;
                    }
                    localStorage.setItem(TOKEN_STORAGE_KEY, value);
                    hint.textContent = 'Token 已保存，仅存储在本地浏览器。刷新后将自动填充。';
                    hint.classList.remove('hidden');
                } catch (error) {
                    console.error('保存 Token 失败:', error);
                    hint.textContent = '保存失败，请检查浏览器隐私设置。';
                    hint.classList.remove('hidden');
                }
            });

            clearBtn.addEventListener('click', () => {
                tokenInput.value = '';
                try {
                    localStorage.removeItem(TOKEN_STORAGE_KEY);
                } catch (error) {
                    console.warn('清除 Token 失败:', error);
                }
                hint.textContent = 'Token 已清除。';
                hint.classList.remove('hidden');
            });

            const templatesContainer = document.getElementById('template-buttons');
            const tempValueLabel = document.getElementById('tempValue');
            let templatesMap = {};

            function renderTemplates(list) {
                if (!templatesContainer) return;
                templatesMap = {};
                templatesContainer.innerHTML = '';

                if (!Array.isArray(list) || !list.length) {
                    templatesContainer.innerHTML = '<div class="col-span-full text-xs text-slate-500">暂无可用模板</div>';
                    return;
                }

                list.forEach((template, index) => {
                    const templateId = template.id || ('template-' + index);
                    const normalized = {
                        id: templateId,
                        label: template.label || template.name || ('模板 ' + (index + 1)),
                        description: template.description || '',
                        systemPrompt: template.systemPrompt || '',
                        userMessage: template.userMessage || '',
                        temperature: typeof template.temperature === 'number' ? template.temperature : 0.7,
                        stream: Boolean(template.stream)
                    };

                    templatesMap[templateId] = normalized;

                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'template-btn px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-left';
                    btn.dataset.template = templateId;
                    btn.title = normalized.description || normalized.label;
                    const descriptionHtml = normalized.description
                        ? '<span class="block text-xs text-slate-400 mt-1">' + normalized.description + '</span>'
                        : '';
                    btn.innerHTML = '<span class="block font-medium text-slate-700">' + normalized.label + '</span>' + descriptionHtml;
                    templatesContainer.appendChild(btn);
                });
            }

            async function loadTemplatesFromApi() {
                if (!templatesContainer) return;
                templatesContainer.innerHTML = '<div class="col-span-full text-xs text-slate-500">模板加载中...</div>';
                try {
                    const response = await fetch('/api/test-templates', { headers: { 'Cache-Control': 'no-store' } });
                    if (!response.ok) {
                        throw new Error('HTTP ' + response.status);
                    }
                    const data = await response.json();
                    const list = Array.isArray(data.templates) ? data.templates : [];
                    if (!list.length) {
                        throw new Error('Template list empty');
                    }
                    renderTemplates(list);
                } catch (error) {
                    console.warn('加载模板失败:', error);
                    showToast('模板加载失败，已回退到本地示例', 'error');
                    renderTemplates([
                        {
                            id: 'chat-basic',
                            label: '基础问候',
                            description: '演示常规对话流程。',
                            systemPrompt: '你是一位友好的中文助理，回答要简洁、积极并使用自然语言。',
                            userMessage: '你好，可以简单自我介绍一下吗？',
                            temperature: 0.7,
                            stream: false
                        },
                        {
                            id: 'translate',
                            label: '翻译助手',
                            description: '提供中英文互译与语境说明。',
                            systemPrompt: '你是一名专业的中英双语翻译，需要保留原文语气并补充必要的语境说明。',
                            userMessage: '请把 “云端服务” 翻译成英文并解释含义。',
                            temperature: 0.3,
                            stream: false
                        }
                    ]);
                }
            }

            templatesContainer?.addEventListener('click', (event) => {
                const btn = event.target.closest('.template-btn');
                if (!btn) return;
                const key = btn.getAttribute('data-template');
                const template = templatesMap[key];
                if (!template) return;

                systemPromptInput.value = template.systemPrompt;
                userMessageInput.value = template.userMessage;
                const numericTemp = typeof template.temperature === 'number'
                    ? template.temperature
                    : Number.parseFloat(template.temperature) || 0.7;
                const clampedTemp = Math.max(0, Math.min(2, Number(numericTemp.toFixed(1))));
                temperatureInput.value = clampedTemp;
                if (tempValueLabel) {
                    tempValueLabel.textContent = clampedTemp;
                }
                streamCheckbox.checked = Boolean(template.stream);
                const label = template.label || btn.textContent.trim();
                showToast('已填充模板：' + label, 'success');
            });

            loadTemplatesFromApi();

            copyModelBtn.addEventListener('click', () => {
                const value = modelSelect.value;
                if (!value) {
                    showToast('请先选择模型', 'error');
                    return;
                }
                copyText(value);
            });

            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetSelector = btn.getAttribute('data-copy-target');
                    const pre = document.querySelector(targetSelector + ' pre');
                    const text = pre ? pre.innerText : '';
                    if (!text) {
                        showToast('未找到可复制内容', 'error');
                        return;
                    }
                    copyText(text);
                });
            });
        });
    </script>
</body>
</html>`;

export const apiDocsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ollama API Pool - API 文档</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .code-block {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
        }
        .response-box {
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Ollama API Pool 使用文档</h1>
            <p class="text-gray-600">统一的 Ollama API 代理服务，自动负载均衡和失败重试</p>
        </div>

        <!-- Quick Start -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🚀 快速开始</h2>
            <div class="space-y-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">1. 获取 API Token</h3>
                    <p class="text-gray-600 mb-2">联系管理员获取您的专属 API Token</p>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">2. API 端点</h3>
                    <div class="space-y-2">
                        <div class="code-block">POST /v1/chat/completions</div>
                        <div class="code-block">GET  /v1/models</div>
                    </div>
                </div>
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">3. 认证方式</h3>
                    <p class="text-gray-600 mb-2">在请求头中添加 Authorization 字段：</p>
                    <div class="code-block">Authorization: Bearer YOUR_API_TOKEN</div>
                </div>
            </div>
        </div>

        <!-- API Reference -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📖 API 参考</h2>

            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">请求参数</h3>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-2 text-left">参数</th>
                                <th class="px-4 py-2 text-left">类型</th>
                                <th class="px-4 py-2 text-left">必填</th>
                                <th class="px-4 py-2 text-left">说明</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr>
                                <td class="px-4 py-2 font-mono text-blue-600">model</td>
                                <td class="px-4 py-2">string</td>
                                <td class="px-4 py-2">✓</td>
                                <td class="px-4 py-2">模型名称，如 "llama2", "mistral" 等</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono text-blue-600">messages</td>
                                <td class="px-4 py-2">array</td>
                                <td class="px-4 py-2">✓</td>
                                <td class="px-4 py-2">对话消息数组，每个消息包含 role 和 content</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono text-blue-600">stream</td>
                                <td class="px-4 py-2">boolean</td>
                                <td class="px-4 py-2">-</td>
                                <td class="px-4 py-2">是否使用流式响应，默认 false</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono text-blue-600">temperature</td>
                                <td class="px-4 py-2">number</td>
                                <td class="px-4 py-2">-</td>
                                <td class="px-4 py-2">温度参数 (0-2)，默认 0.7</td>
                            </tr>
                            <tr>
                                <td class="px-4 py-2 font-mono text-blue-600">max_tokens</td>
                                <td class="px-4 py-2">number</td>
                                <td class="px-4 py-2">-</td>
                                <td class="px-4 py-2">最大生成 token 数</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="mb-6">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">请求示例</h3>
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
                <h3 class="text-lg font-semibold text-gray-700 mb-3">响应示例</h3>
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

        <!-- Models API Reference -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🤖 获取模型列表 (OpenAI 兼容)</h2>

            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">端点</h3>
                <div class="code-block">GET /v1/models</div>
            </div>

            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">认证</h3>
                <p class="text-gray-600 mb-2">可选。如果提供 Authorization 头，将验证 Token。</p>
                <div class="code-block">Authorization: Bearer YOUR_API_TOKEN</div>
            </div>

            <div class="mb-4">
                <h3 class="text-lg font-semibold text-gray-700 mb-3">响应示例</h3>
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

        <!-- Online Test -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">🧪 在线测试</h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">API Token</label>
                    <input type="text" id="apiToken" placeholder="请输入您的 API Token"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">模型</label>
                    <select id="model" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">加载中...</option>
                    </select>
                    <p class="text-xs text-gray-500 mt-1">模型列表从 /v1/models 接口动态加载</p>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">系统提示词 (可选)</label>
                    <textarea id="systemPrompt" rows="2" placeholder="You are a helpful assistant."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">You are a helpful assistant.</textarea>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">用户消息</label>
                    <textarea id="userMessage" rows="3" placeholder="请输入您的问题..."
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">Hello, how are you?</textarea>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Temperature: <span id="tempValue">0.7</span></label>
                    <input type="range" id="temperature" min="0" max="2" step="0.1" value="0.7"
                        class="w-full" oninput="document.getElementById('tempValue').textContent = this.value">
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="stream" class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                    <label for="stream" class="ml-2 text-sm font-semibold text-gray-700">启用流式响应</label>
                </div>

                <button onclick="testAPI()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200">
                    发送测试请求
                </button>

                <div id="loading" class="hidden text-center">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p class="text-gray-600 mt-2">请求中...</p>
                </div>

                <div id="responseContainer" class="hidden">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">响应结果</label>
                    <div id="response" class="code-block response-box"></div>
                </div>

                <div id="streamContainer" class="hidden">
                    <label class="block text-sm font-semibold text-gray-700 mb-2">流式响应</label>
                    <div id="streamResponse" class="p-4 bg-gray-50 rounded-lg response-box whitespace-pre-wrap"></div>
                </div>

                <div id="errorContainer" class="hidden">
                    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        <p class="font-semibold">错误</p>
                        <p id="errorMessage"></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Code Examples -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">💻 代码示例</h2>

            <div class="space-y-6">
                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">cURL</h3>
                    <div class="code-block"><pre>curl -X POST https://ollama-api-pool.h7ml.workers.dev/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_TOKEN" \\
  -d '{
    "model": "llama2",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'</pre></div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">Python</h3>
                    <div class="code-block"><pre>import requests

url = "https://ollama-api-pool.h7ml.workers.dev/v1/chat/completions"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_API_TOKEN"
}
data = {
    "model": "llama2",
    "messages": [
        {"role": "user", "content": "Hello!"}
    ]
}

response = requests.post(url, headers=headers, json=data)
print(response.json())</pre></div>
                </div>

                <div>
                    <h3 class="text-lg font-semibold text-gray-700 mb-2">JavaScript (Fetch)</h3>
                    <div class="code-block"><pre>const response = await fetch('https://ollama-api-pool.h7ml.workers.dev/v1/chat/completions', {
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

        <!-- Error Codes -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">⚠️ 错误码</h2>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-2 text-left">状态码</th>
                            <th class="px-4 py-2 text-left">说明</th>
                            <th class="px-4 py-2 text-left">解决方案</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr>
                            <td class="px-4 py-2 font-mono">401</td>
                            <td class="px-4 py-2">Token 无效或过期</td>
                            <td class="px-4 py-2">检查 Token 是否正确，联系管理员获取新 Token</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-mono">429</td>
                            <td class="px-4 py-2">请求频率超限</td>
                            <td class="px-4 py-2">降低请求频率，稍后重试</td>
                        </tr>
                        <tr>
                            <td class="px-4 py-2 font-mono">503</td>
                            <td class="px-4 py-2">暂无可用 API Key</td>
                            <td class="px-4 py-2">联系管理员添加更多 API Key</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-gray-600 text-sm space-y-2">
            <div class="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>当前时间: <span id="current-time" class="font-medium"></span></span>
                <span class="text-gray-400">·</span>
                <span>运营时间: <span id="build-time" class="font-medium">2025-10-09</span></span>
            </div>
            <p>Ollama API Pool © 2025 | <a href="/dashboard" class="text-blue-600 hover:underline">返回管理后台</a></p>
        </div>
    </div>

    <script>
        // 更新当前时间
        function updateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timeStr = \`\${year}年\${month}月\${day}日 \${hours}:\${minutes}:\${seconds}\`;
            document.getElementById('current-time').textContent = timeStr;
        }
        updateTime();
        setInterval(updateTime, 1000);

        // 加载模型列表
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
                        \`<option value="\${model.id}">\${model.id}</option>\`
                    ).join('');
                } else {
                    modelSelect.innerHTML = '<option value="llama2">llama2 (默认)</option>';
                }
            } catch (error) {
                console.error('加载模型失败:', error);
                // 使用默认模型列表
                document.getElementById('model').innerHTML = \`
                    <option value="llama2">llama2 (默认)</option>
                    <option value="llama3.2">llama3.2 (默认)</option>
                    <option value="mistral">mistral (默认)</option>
                \`;
            }
        }

        // 页面加载时加载模型列表
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

        async function handleNormalResponse(token, requestBody) {
            const response = await fetch('/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': \`Bearer \${token}\`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || \`HTTP \${response.status}\`);
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
                    'Authorization': \`Bearer \${token}\`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || \`HTTP \${response.status}\`);
            }

            const streamDiv = document.getElementById('streamResponse');
            streamDiv.textContent = '';
            document.getElementById('streamContainer').classList.remove('hidden');

            const reader = response.body.getReader();
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
                            const content = json.choices[0]?.delta?.content || '';
                            streamDiv.textContent += content;
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        }

        function showError(message) {
            document.getElementById('errorMessage').textContent = message;
            document.getElementById('errorContainer').classList.remove('hidden');
        }
    </script>
</body>
</html>
`;

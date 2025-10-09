/**
 * 公开统计页面 HTML
 */

export const statsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>实时统计 - Ollama API Pool</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
        }
        .card {
            animation: fadeUp 0.6s ease-out;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .stat-card {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
        }
        .pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
        .chart-container {
            position: relative;
            height: 280px;
            width: 100%;
        }
        table {
            border-collapse: separate;
            border-spacing: 0;
        }
        tbody tr {
            transition: all 0.2s ease;
        }
        tbody tr:hover {
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
            transform: scale(1.01);
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="gradient-bg text-white sticky top-0 z-50">
        <div class="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="text-center md:text-left">
                    <h1 class="text-3xl sm:text-4xl font-bold mb-2">📊 实时统计仪表盘</h1>
                    <p class="text-base sm:text-lg text-white/80">Ollama API Pool - 模型使用分析与趋势</p>
                </div>
                <div class="flex gap-2 sm:gap-3 flex-wrap justify-center">
                    <a href="/" class="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm text-sm sm:text-base">
                        🏠 管理后台
                    </a>
                    <a href="/api-docs" class="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm text-sm sm:text-base">
                        📚 API 文档
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <!-- 全局统计卡片 -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div class="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs sm:text-sm font-medium opacity-80">总请求数</span>
                    <span class="text-xl sm:text-2xl">📈</span>
                </div>
                <p id="total-requests" class="text-2xl sm:text-4xl font-bold">-</p>
                <p class="text-xs sm:text-sm opacity-70 mt-1 sm:mt-2">Total Requests</p>
            </div>
            <div class="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs sm:text-sm font-medium opacity-80">成功率</span>
                    <span class="text-xl sm:text-2xl">✅</span>
                </div>
                <p id="success-rate" class="text-2xl sm:text-4xl font-bold">-</p>
                <p class="text-xs sm:text-sm opacity-70 mt-1 sm:mt-2">Success Rate</p>
            </div>
            <div class="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs sm:text-sm font-medium opacity-80">成功次数</span>
                    <span class="text-xl sm:text-2xl">🎯</span>
                </div>
                <p id="success-count" class="text-2xl sm:text-4xl font-bold">-</p>
                <p class="text-xs sm:text-sm opacity-70 mt-1 sm:mt-2">Success Count</p>
            </div>
            <div class="stat-card rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs sm:text-sm font-medium opacity-80">失败次数</span>
                    <span class="text-xl sm:text-2xl">⚠️</span>
                </div>
                <p id="failure-count" class="text-2xl sm:text-4xl font-bold">-</p>
                <p class="text-xs sm:text-sm opacity-70 mt-1 sm:mt-2">Failure Count</p>
            </div>
        </div>

        <!-- 图表区域 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <!-- 24小时趋势图 -->
            <div class="card bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>24小时请求趋势</span>
                </h2>
                <div class="chart-container">
                    <canvas id="hourly-trend-chart"></canvas>
                </div>
            </div>

            <!-- Top 10 模型饼图 -->
            <div class="card bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🏆</span>
                    <span>Top 10 热门模型</span>
                </h2>
                <div class="chart-container">
                    <canvas id="top-models-chart"></canvas>
                </div>
            </div>
        </div>

        <!-- 最近1小时 Top 3 -->
        <div class="card bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 flex-wrap">
                <span>🔥</span>
                <span>最近1小时热门模型 TOP 3</span>
                <span class="pulse ml-2 px-2 sm:px-3 py-1 bg-red-500 text-white text-xs rounded-full">LIVE</span>
            </h2>
            <div id="recent-top-models" class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
                <!-- 动态加载 -->
            </div>
        </div>

        <!-- Top 10 模型列表 -->
        <div class="card bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
            <h2 class="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
                <span>📋</span>
                <span>Top 10 模型详细统计</span>
            </h2>
            <div class="overflow-x-auto -mx-4 sm:mx-0">
                <table class="w-full min-w-[600px]">
                    <thead class="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                        <tr>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">排名</th>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-700">模型名称</th>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">总请求</th>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">成功</th>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">失败</th>
                            <th class="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm font-semibold text-gray-700">成功率</th>
                        </tr>
                    </thead>
                    <tbody id="top-models-table" class="divide-y divide-gray-200">
                        <!-- 动态加载 -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 自动刷新提示 -->
        <div class="text-center text-xs sm:text-sm text-gray-500 py-4">
            <p class="flex items-center justify-center gap-2">
                <span>📡</span>
                <span>数据每 30 秒自动刷新</span>
                <span>·</span>
                <span>最后更新: <span id="last-update" class="font-medium text-indigo-600">-</span></span>
            </p>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 py-6 mt-8">
        <div class="container mx-auto px-4 sm:px-6">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-600">
                <div class="flex items-center gap-2">
                    <span>Ollama API Pool</span>
                    <span class="text-gray-400">·</span>
                    <a href="https://github.com/dext7r/ollama-api-pool" target="_blank" class="hover:text-indigo-600 transition-colors">
                        GitHub
                    </a>
                </div>
                <div class="text-gray-500">
                    Made with ❤️ by dext7r
                </div>
            </div>
        </div>
    </footer>

    <script>
        let hourlyChart = null;
        let topModelsChart = null;

        // 加载统计数据
        async function loadStats() {
            try {
                const response = await fetch('/admin/public-stats');

                if (!response.ok) {
                    throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    throw new Error('响应不是 JSON 格式: ' + text.substring(0, 100));
                }

                const data = await response.json();

                // 更新全局统计卡片
                document.getElementById('total-requests').textContent = data.global.totalRequests.toLocaleString();
                document.getElementById('success-rate').textContent = data.global.successRate + '%';
                document.getElementById('success-count').textContent = data.global.successCount.toLocaleString();
                document.getElementById('failure-count').textContent = data.global.failureCount.toLocaleString();
                document.getElementById('last-update').textContent = new Date(data.timestamp).toLocaleString('zh-CN');

                // 更新24小时趋势图
                updateHourlyTrendChart(data.hourlyTrend);

                // 更新Top 10模型饼图
                updateTopModelsChart(data.topModels);

                // 更新最近1小时Top 3
                updateRecentTopModels(data.recentTopModels);

                // 更新Top 10模型表格
                updateTopModelsTable(data.topModels);

            } catch (error) {
                console.error('加载统计数据失败:', error);
                // 显示错误信息给用户
                const errorMsg = document.createElement('div');
                errorMsg.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
                errorMsg.textContent = '加载统计数据失败: ' + error.message;
                document.body.appendChild(errorMsg);
                setTimeout(() => errorMsg.remove(), 5000);
            }
        }

        // 更新24小时趋势图
        function updateHourlyTrendChart(data) {
            const ctx = document.getElementById('hourly-trend-chart');

            if (hourlyChart) {
                hourlyChart.destroy();
            }

            hourlyChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.hour),
                    datasets: [
                        {
                            label: '总请求',
                            data: data.map(d => d.requests),
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5
                        },
                        {
                            label: '成功',
                            data: data.map(d => d.success),
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5
                        },
                        {
                            label: '失败',
                            data: data.map(d => d.failure),
                            borderColor: 'rgb(239, 68, 68)',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                padding: 15,
                                usePointStyle: true,
                                font: {
                                    size: 12,
                                    weight: 500
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                font: { size: 11 }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        },
                        x: {
                            ticks: {
                                font: { size: 11 }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }

        // 更新Top 10模型饼图
        function updateTopModelsChart(data) {
            const ctx = document.getElementById('top-models-chart');

            if (topModelsChart) {
                topModelsChart.destroy();
            }

            const colors = [
                'rgb(99, 102, 241)', 'rgb(139, 92, 246)', 'rgb(236, 72, 153)',
                'rgb(249, 115, 22)', 'rgb(34, 197, 94)', 'rgb(59, 130, 246)',
                'rgb(168, 85, 247)', 'rgb(251, 146, 60)', 'rgb(14, 165, 233)',
                'rgb(132, 204, 22)'
            ];

            topModelsChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.map(m => m.model),
                    datasets: [{
                        data: data.map(m => m.requests),
                        backgroundColor: colors,
                        borderWidth: 3,
                        borderColor: '#fff',
                        hoverBorderWidth: 4,
                        hoverBorderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                boxWidth: 15,
                                padding: 10,
                                font: {
                                    size: 11,
                                    weight: 500
                                },
                                generateLabels: function(chart) {
                                    const data = chart.data;
                                    if (data.labels.length && data.datasets.length) {
                                        return data.labels.map((label, i) => {
                                            const value = data.datasets[0].data[i];
                                            const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = ((value / total) * 100).toFixed(1);
                                            return {
                                                text: \`\${label} (\${percentage}%)\`,
                                                fillStyle: data.datasets[0].backgroundColor[i],
                                                hidden: false,
                                                index: i
                                            };
                                        });
                                    }
                                    return [];
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 },
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return \`\${label}: \${value.toLocaleString()} 次 (\${percentage}%)\`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // 更新最近1小时Top 3
        function updateRecentTopModels(data) {
            const container = document.getElementById('recent-top-models');
            const medals = ['🥇', '🥈', '🥉'];
            const gradients = [
                'from-yellow-400 via-yellow-500 to-orange-500',
                'from-gray-300 via-gray-400 to-gray-500',
                'from-orange-400 via-orange-500 to-red-500'
            ];

            if (data.length === 0) {
                container.innerHTML = '<div class="col-span-3 text-center py-12 text-gray-400"><p>暂无数据</p></div>';
                return;
            }

            container.innerHTML = data.slice(0, 3).map((model, index) => \`
                <div class="bg-gradient-to-br \${gradients[index]} text-white rounded-xl shadow-lg p-5 transform transition-all hover:scale-105 hover:shadow-xl">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-3xl sm:text-4xl">\${medals[index]}</span>
                        <span class="text-xs sm:text-sm font-bold opacity-90 bg-white/20 px-2 py-1 rounded-full">No.\${index + 1}</span>
                    </div>
                    <h3 class="text-base sm:text-lg font-bold mb-3 truncate" title="\${model.model}">\${model.model}</h3>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="opacity-90">请求数</span>
                            <span class="font-bold text-xl">\${model.requests.toLocaleString()}</span>
                        </div>
                        <div class="pt-2 border-t border-white/30 grid grid-cols-3 gap-2 text-xs">
                            <div class="text-center">
                                <div class="opacity-75">✓ 成功</div>
                                <div class="font-bold">\${model.success}</div>
                            </div>
                            <div class="text-center">
                                <div class="opacity-75">✗ 失败</div>
                                <div class="font-bold">\${model.failure}</div>
                            </div>
                            <div class="text-center">
                                <div class="opacity-75">成功率</div>
                                <div class="font-bold">\${model.successRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // 更新Top 10模型表格
        function updateTopModelsTable(data) {
            const tbody = document.getElementById('top-models-table');

            if (data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-12 text-center text-gray-400">暂无数据</td></tr>';
                return;
            }

            tbody.innerHTML = data.map((model, index) => {
                const successRate = parseFloat(model.successRate);
                const rateColor = successRate >= 95 ? 'text-green-600 bg-green-50' : successRate >= 80 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50';
                const rankBg = index < 3 ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-indigo-100 text-indigo-700';

                return \`
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-3 sm:px-6 py-3 sm:py-4">
                            <span class="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full \${rankBg} font-bold text-xs sm:text-sm shadow-sm">
                                \${index + 1}
                            </span>
                        </td>
                        <td class="px-3 sm:px-6 py-3 sm:py-4">
                            <div class="font-medium text-gray-900 text-sm sm:text-base truncate max-w-xs" title="\${model.model}">
                                \${model.model}
                            </div>
                        </td>
                        <td class="px-3 sm:px-6 py-3 sm:py-4 text-center font-semibold text-gray-700 text-sm sm:text-base">
                            \${model.requests.toLocaleString()}
                        </td>
                        <td class="px-3 sm:px-6 py-3 sm:py-4 text-center text-green-600 font-medium text-sm sm:text-base">
                            \${model.success.toLocaleString()}
                        </td>
                        <td class="px-3 sm:px-6 py-3 sm:py-4 text-center text-red-600 font-medium text-sm sm:text-base">
                            \${model.failure.toLocaleString()}
                        </td>
                        <td class="px-3 sm:px-6 py-3 sm:py-4 text-center">
                            <span class="inline-block px-2 sm:px-3 py-1 rounded-full \${rateColor} font-bold text-xs sm:text-sm">
                                \${model.successRate}%
                            </span>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        // 初始加载
        loadStats();

        // 每30秒自动刷新
        setInterval(loadStats, 30000);
    </script>
</body>
</html>`;

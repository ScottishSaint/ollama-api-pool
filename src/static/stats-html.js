/**
 * 公开统计页面 HTML（极简版）
 */

export const statsHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>实时统计 - Ollama API Pool</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <style>
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f7fb;
      color: #1f2937;
    }
    .card {
      background: #ffffff;
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 12px 20px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }
    .metric-card {
      border: 1px solid rgba(15, 23, 42, 0.08);
      border-radius: 12px;
      background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), #ffffff);
      padding: 18px 20px;
    }
    .skeleton {
      border-radius: 12px;
      background: linear-gradient(90deg, rgba(226, 232, 240, 0.2) 25%, rgba(226, 232, 240, 0.4) 37%, rgba(226, 232, 240, 0.2) 63%);
      background-size: 400% 100%;
      animation: shimmer 1.4s ease infinite;
    }
    @keyframes shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    .empty-state {
      border: 1px dashed rgba(148, 163, 184, 0.5);
      border-radius: 10px;
      padding: 32px 16px;
      text-align: center;
      background: rgba(248, 250, 252, 0.8);
      color: #64748b;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 class="flex items-center gap-3 text-3xl font-semibold text-slate-900">
            <span>实时监控中心</span>
            <span id="storage-pill" class="hidden px-3 py-1 text-xs font-semibold rounded-full bg-slate-900 text-white"></span>
          </h1>
          <p class="mt-2 text-sm text-slate-500">
            追踪 Ollama API Pool 的请求趋势、模型使用表现与关键资源状态。
          </p>
        </div>
        <div class="flex flex-wrap gap-3">
          <button id="refresh-btn" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
            🔄 手动刷新
          </button>
          <a href="/" class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50">管理后台</a>
          <a href="/api-docs" class="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-full hover:bg-slate-50">API 文档</a>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <!-- Skeleton -->
        <div id="skeleton-loader" class="space-y-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="h-28 skeleton"></div>
            <div class="h-28 skeleton"></div>
            <div class="h-28 skeleton"></div>
            <div class="h-28 skeleton"></div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="h-72 skeleton"></div>
            <div class="h-72 skeleton"></div>
          </div>
          <div class="h-52 skeleton"></div>
        </div>

        <!-- Dashboard -->
        <div id="dashboard-content" class="hidden space-y-8">
          <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <article class="metric-card">
              <p class="text-xs uppercase tracking-wide text-slate-400">总请求数</p>
              <p id="metric-total-requests" class="mt-3 text-3xl font-semibold text-slate-900">--</p>
            </article>
            <article class="metric-card">
              <p class="text-xs uppercase tracking-wide text-slate-400">成功率</p>
              <p id="metric-success-rate" class="mt-3 text-3xl font-semibold text-slate-900">--</p>
            </article>
            <article class="metric-card">
              <p class="text-xs uppercase tracking-wide text-slate-400">成功次数</p>
              <p id="metric-success-count" class="mt-3 text-3xl font-semibold text-slate-900">--</p>
            </article>
            <article class="metric-card">
              <p class="text-xs uppercase tracking-wide text-slate-400">失败次数</p>
              <p id="metric-failure-count" class="mt-3 text-3xl font-semibold text-slate-900">--</p>
            </article>
          </section>

          <div id="no-data-banner" class="card p-4 text-sm text-slate-500 flex items-center gap-3 hidden">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500">ℹ️</span>
            <span>尚未采集到新的统计数据。发起一次 API 请求后，点击「手动刷新」即可查看最新指标。</span>
          </div>

          <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article class="card p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-slate-500">API Key 总数</p>
                  <p class="mt-2 text-2xl font-semibold text-slate-900">
                    <span id="metric-total-keys">--</span>
                  </p>
                  <p class="mt-1 text-xs text-slate-400">活跃率：<span id="metric-active-percentage" class="text-slate-600 font-medium">--</span></p>
                </div>
                <div class="text-right text-xs text-slate-400">
                  <p>活跃：<span id="metric-active-keys" class="text-slate-600 font-medium">--</span></p>
                  <p class="mt-1">禁用/失败：<span id="metric-failed-keys" class="text-slate-600 font-medium">--</span></p>
                </div>
              </div>
              <div class="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div id="active-progress-bar" class="h-2 bg-slate-900 transition-all duration-500" style="width:0%;"></div>
              </div>
              <div class="mt-4 flex items-center gap-3 text-xs text-slate-400">
                <span id="metric-storage" class="px-3 py-1 rounded-full border border-slate-200 text-slate-500">--</span>
                <span>最近同步：<span id="metric-sync-time" class="text-slate-600 font-medium">--</span></span>
              </div>
            </article>

            <article class="card p-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">最近 1 小时热门模型</h2>
                <span class="text-xs text-slate-400 border border-slate-200 rounded-full px-3 py-1">Top 3</span>
              </div>
              <div id="recent-top-models" class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm"></div>
              <div id="recent-top-models-empty" class="mt-6 empty-state hidden">
                暂无近一小时数据
              </div>
            </article>
          </section>

          <section class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <article class="card p-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">请求趋势（24 小时）</h2>
                <span id="trend-empty-badge" class="hidden text-xs text-slate-400">暂无数据</span>
              </div>
              <div class="mt-4" style="height:300px">
                <canvas id="hourly-trend-chart"></canvas>
              </div>
            </article>

            <article class="card p-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">热门模型占比</h2>
                <span id="top-models-empty" class="hidden text-xs text-slate-400">暂无数据</span>
              </div>
              <div class="mt-4" style="height:300px" id="top-models-echart"></div>
            </article>
          </section>

          <section class="card p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-slate-900">Top 10 模型详细数据</h2>
              <span class="text-xs text-slate-400">采样统计</span>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm text-slate-600">
                <thead class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th class="py-3 pr-4 text-left">排名</th>
                    <th class="py-3 pr-4 text-left">模型名称</th>
                    <th class="py-3 pr-4 text-center">总请求</th>
                    <th class="py-3 pr-4 text-center">成功</th>
                    <th class="py-3 pr-4 text-center">失败</th>
                    <th class="py-3 pr-4 text-center">成功率</th>
                  </tr>
                </thead>
                <tbody id="top-models-table">
                  <tr><td colspan="6" class="py-6 text-center text-slate-400">加载中...</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <p class="text-xs text-slate-400 text-center">
            自动刷新频率：30 秒 · 最后更新：<span id="footer-last-update" class="text-slate-600 font-medium">--</span>
          </p>
        </div>
      </div>
    </main>

    <footer class="bg-white border-t border-slate-200">
      <div class="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
        <span>© ${new Date().getFullYear()} Ollama API Pool</span>
        <span>Made with ❤️ by dext7r</span>
      </div>
    </footer>
  </div>

  <div id="toast-container" class="fixed top-5 left-1/2 -translate-x-1/2 space-y-2 z-50"></div>

  <script>
    const REFRESH_INTERVAL = 30000;
    const state = {
      trendChart: null,
      modelsChart: null,
      timer: null,
      loaded: false
    };

    const numberFormatter = new Intl.NumberFormat('zh-CN');
    const percentFormatter = new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    function toggleSkeleton(show) {
      if (show) {
        $('#skeleton-loader').removeClass('hidden');
        $('#dashboard-content').addClass('hidden');
      } else {
        $('#skeleton-loader').addClass('hidden');
        $('#dashboard-content').removeClass('hidden');
      }
    }

    function showToast(message, type = 'info') {
      const id = 'toast-' + Date.now();
      const baseClass = type === 'success'
        ? 'bg-emerald-500 text-white'
        : type === 'error'
          ? 'bg-red-500 text-white'
          : 'bg-slate-900 text-white';
      const toast = $(\`
        <div id="\${id}" class="\${baseClass} px-4 py-2 text-sm font-medium rounded-full shadow-lg">
          \${message}
        </div>
      \`);
      $('#toast-container').append(toast);
      setTimeout(() => toast.fadeOut(300, () => toast.remove()), 2200);
    }

    function formatNumber(value) {
      if (value === undefined || value === null) return '--';
      return numberFormatter.format(value);
    }

    function formatPercentValue(value) {
      if (value === undefined || value === null || Number.isNaN(value)) return '--';
      return percentFormatter.format(value) + '%';
    }

    async function fetchStats(forceSkeleton = false) {
      try {
        if (!state.loaded || forceSkeleton) {
          toggleSkeleton(true);
        }

        const response = await fetch('/admin/public-stats', { headers: { 'Cache-Control': 'no-store' } });
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }

        const data = await response.json();
        renderDashboard(data);
        state.loaded = true;
      } catch (error) {
        console.error('统计数据加载失败:', error);
        showToast('统计数据加载失败', 'error');
      } finally {
        toggleSkeleton(false);
      }
    }

    function renderDashboard(data) {
      if (!data || !data.global) return;

      const global = data.global;
      const meta = data.meta || {};
      const storage = meta.storage || global.storage || 'kv';
      const successRateValue = parseFloat(meta.successRate ?? global.successRate ?? 0);

      $('#metric-total-requests').text(formatNumber(global.totalRequests || 0));
      $('#metric-success-rate').text(formatPercentValue(successRateValue));
      $('#metric-success-count').text(formatNumber(global.successCount || 0));
      $('#metric-failure-count').text(formatNumber(global.failureCount || 0));

      const totalKeys = meta.totalApiKeys ?? global.totalApiKeys ?? 0;
      const activeKeys = meta.activeKeys ?? global.activeKeys ?? 0;
      const failedKeys = meta.failedKeys ?? global.failedKeys ?? 0;
      const activePercent = totalKeys > 0 ? Math.min(activeKeys / totalKeys * 100, 100) : 0;

      $('#metric-total-keys').text(formatNumber(totalKeys));
      $('#metric-active-keys').text(formatNumber(activeKeys));
      $('#metric-failed-keys').text(formatNumber(failedKeys));
      $('#metric-active-percentage').text(formatPercentValue(activePercent));
      $('#active-progress-bar').css('width', \`\${activePercent.toFixed(1)}%\`);
      $('#metric-storage').text('存储后端：' + storage.toUpperCase());
      $('#storage-pill').removeClass('hidden').text(storage.toUpperCase());

      const timestamp = meta.generatedAt || data.timestamp;
      const formattedTime = timestamp ? new Date(timestamp).toLocaleString('zh-CN') : '--';
      $('#metric-sync-time').text(formattedTime);
      $('#footer-last-update').text(formattedTime);

      const hasData = (global.totalRequests || 0) > 0 || (global.successCount || 0) > 0 || (global.failureCount || 0) > 0;
      $('#no-data-banner').toggleClass('hidden', hasData);

      updateTrendChart(data.hourlyTrend || []);
      updateModelsChart(data.topModels || []);
      updateRecentModels(data.recentTopModels || []);
      updateModelsTable(data.topModels || []);
    }

    function updateTrendChart(trend) {
      const ctx = document.getElementById('hourly-trend-chart');

      if (state.trendChart) {
        state.trendChart.destroy();
        state.trendChart = null;
      }

      if (!trend.length) {
        $('#trend-empty-badge').removeClass('hidden');
        return;
      }
      $('#trend-empty-badge').addClass('hidden');

      state.trendChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: trend.map(item => item.hour),
          datasets: [
            {
              label: '总请求',
              data: trend.map(item => item.requests),
              borderColor: '#1f2937',
              backgroundColor: 'rgba(31, 41, 55, 0.08)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4
            },
            {
              label: '成功',
              data: trend.map(item => item.success),
              borderColor: '#15803d',
              backgroundColor: 'rgba(21, 128, 61, 0.12)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4
            },
            {
              label: '失败',
              data: trend.map(item => item.failure),
              borderColor: '#dc2626',
              backgroundColor: 'rgba(220, 38, 38, 0.12)',
              fill: true,
              tension: 0.3,
              borderWidth: 2,
              pointRadius: 0,
              pointHoverRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { usePointStyle: true, padding: 16 }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              cornerRadius: 6,
              padding: 10,
              titleFont: { size: 13, family: 'Inter' },
              bodyFont: { size: 12, family: 'Inter' }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(148, 163, 184, 0.2)' }
            },
            x: {
              grid: { display: false }
            }
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    function updateModelsChart(models) {
      if (state.modelsChart) {
        state.modelsChart.dispose();
        state.modelsChart = null;
      }

      if (!models.length) {
        $('#top-models-empty').removeClass('hidden');
        $('#top-models-echart').addClass('hidden');
        return;
      }
      $('#top-models-empty').addClass('hidden');
      $('#top-models-echart').removeClass('hidden');

      const chartDom = document.getElementById('top-models-echart');
      state.modelsChart = echarts.init(chartDom, null, { renderer: 'svg' });

      state.modelsChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: params => \`\${params.marker} \${params.name}<br/>请求数：\${numberFormatter.format(params.value)}<br/>占比：\${params.percent}%\`
        },
        legend: {
          orient: 'vertical',
          right: 0,
          top: 'middle',
          itemWidth: 10,
          itemHeight: 10,
          textStyle: { color: '#475569', fontSize: 12 }
        },
        series: [{
          type: 'pie',
          radius: ['35%', '65%'],
          center: ['35%', '50%'],
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            color: '#1f2937',
            formatter: '{b|{b}}\\n{c|{c}}',
            rich: {
              b: { fontWeight: 600, fontSize: 12 },
              c: { color: '#6b7280', fontSize: 11 }
            }
          },
          data: models.slice(0, 8).map(item => ({ name: item.model, value: item.requests }))
        }]
      });
    }

    function updateRecentModels(list) {
      const container = $('#recent-top-models');
      container.empty();

      if (!list.length) {
        $('#recent-top-models-empty').removeClass('hidden');
        return;
      }
      $('#recent-top-models-empty').addClass('hidden');

      list.forEach((item, index) => {
        const successRate = item.requests > 0 ? formatPercentValue((item.success || 0) / item.requests * 100) : '--';
        container.append(\`
          <div class="rounded-lg border border-slate-200 bg-white px-4 py-4">
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span class="px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">#\${index + 1}</span>
              <span>\${formatNumber(item.requests || 0)} 次</span>
            </div>
            <p class="mt-3 text-base font-semibold text-slate-800 break-words">\${item.model || '未知模型'}</p>
            <dl class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>
                <dt>成功</dt>
                <dd class="text-slate-700 font-medium mt-1">\${formatNumber(item.success || 0)}</dd>
              </div>
              <div>
                <dt>失败</dt>
                <dd class="text-slate-700 font-medium mt-1">\${formatNumber(item.failure || 0)}</dd>
              </div>
              <div class="col-span-2">
                <dt>成功率</dt>
                <dd class="text-emerald-600 font-semibold mt-1">\${successRate}</dd>
              </div>
            </dl>
          </div>
        \`);
      });
    }

    function updateModelsTable(models) {
      const tbody = $('#top-models-table');
      tbody.empty();

      if (!models.length) {
        tbody.append('<tr><td colspan="6" class="py-6 text-center text-slate-400 text-sm">暂无模型统计数据</td></tr>');
        return;
      }

      models.forEach((item, index) => {
        const successRate = item.requests > 0 ? formatPercentValue((item.success || 0) / item.requests * 100) : '--';
        let rankClass = 'bg-slate-100 text-slate-500';
        if (index === 0) rankClass = 'bg-slate-900 text-white';
        else if (index === 1) rankClass = 'bg-slate-700 text-white';
        else if (index === 2) rankClass = 'bg-slate-500 text-white';

        tbody.append(\`
          <tr class="border-b border-slate-100 last:border-0">
            <td class="py-3 pr-4">
              <span class="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold \${rankClass}">\${index + 1}</span>
            </td>
            <td class="py-3 pr-4 text-slate-700 font-medium">\${item.model}</td>
            <td class="py-3 pr-4 text-center">\${formatNumber(item.requests || 0)}</td>
            <td class="py-3 pr-4 text-center text-emerald-600">\${formatNumber(item.success || 0)}</td>
            <td class="py-3 pr-4 text-center text-rose-500">\${formatNumber(item.failure || 0)}</td>
            <td class="py-3 pr-4 text-center text-slate-700 font-semibold">\${successRate}</td>
          </tr>
        \`);
      });
    }

    $(document).ready(() => {
      fetchStats(true);
      state.timer = setInterval(() => fetchStats(false), REFRESH_INTERVAL);

      $('#refresh-btn').on('click', () => {
        fetchStats(true);
        showToast('正在刷新', 'success');
      });

      $(window).on('beforeunload', () => {
        if (state.timer) clearInterval(state.timer);
      });

      $(window).on('resize', () => {
        if (state.modelsChart) {
          state.modelsChart.resize();
        }
      });
    });
  </script>
</body>
</html>`;

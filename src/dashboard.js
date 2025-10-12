/**
 * 管理后台路由 - 返回静态 HTML 文件
 */

import { loginHtml } from './html/login.js';
import { dashboardHtml } from './html/main-dashboard.js';
import { userDashboardHtml } from './html/user-dashboard.js';
import { getBuildTime } from './buildInfo.js';

export async function handleDashboard(request, env) {
  const url = new URL(request.url);
  const verify = url.searchParams.get('verify');

  // 已验证用户返回主仪表盘，否则返回登录页
  let html = verify === 'true' ? dashboardHtml : loginHtml;

  // 注入构建时间
  const buildTime = getBuildTime(env);
  html = html.replace(/{{BUILD_TIME}}/g, buildTime);
  const turnstileSiteKey = env.TURNSTILE_SITE_KEY || '';
  html = html.replace(/{{TURNSTILE_SITE_KEY}}/g, turnstileSiteKey);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

export async function handleUserDashboard(request, env) {
  const buildTime = getBuildTime(env);
  const html = userDashboardHtml.replace(/{{BUILD_TIME}}/g, buildTime);

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

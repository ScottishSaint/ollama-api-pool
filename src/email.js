/**
 * 邮件推送封装 - 通过 push-all-in-one 转发服务发送验证码/通知
 */

const DEFAULT_EMAIL_TYPE = 'html';
const EMAIL_TYPE_LABEL = {
  html: 'HTML',
  text: '\u6587\u672C'
};

function assertEnv(env) {
  const required = [
    'EMAIL_FORWARD_URL',
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_AUTH_USER',
    'EMAIL_AUTH_PASS'
  ];
  for (const key of required) {
    if (!env[key]) {
      throw new Error(`${key} is not configured in environment variables`);
    }
  }
}

/**
 * 发送自定义邮件
 * @param {Env} env - Cloudflare Worker 环境变量
 * @param {Object} options
 * @param {string} options.to 收件人邮箱
 * @param {string} options.subject 邮件标题
 * @param {string} options.content 邮件正文（HTML 或纯文本）
 * @param {('html'|'text')} [options.contentType='html'] 正文类型
 * @returns {Promise<any>}
 */
export async function forwardCustomEmail(env, { to, subject, content, contentType = DEFAULT_EMAIL_TYPE }) {
  assertEnv(env);

  if (!to) {
    throw new Error('Email recipient is required');
  }
  if (!subject) {
    throw new Error('Email subject is required');
  }
  const normalizedType = contentType === 'text' ? 'text' : DEFAULT_EMAIL_TYPE;

  const payload = {
    title: subject,
    desp: content,
    type: 'CustomEmail',
    config: {
      EMAIL_TYPE: normalizedType,
      EMAIL_TO_ADDRESS: to,
      EMAIL_AUTH_USER: env.EMAIL_AUTH_USER,
      EMAIL_AUTH_PASS: env.EMAIL_AUTH_PASS,
      EMAIL_HOST: env.EMAIL_HOST,
      EMAIL_PORT: Number(env.EMAIL_PORT || 587),
      EMAIL_SECURE: env.EMAIL_SECURE === 'true',
      $EMAIL_TYPE: EMAIL_TYPE_LABEL[normalizedType]
    },
    option: {}
  };

  const response = await fetch(env.EMAIL_FORWARD_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email forward request failed: ${response.status} ${response.statusText} - ${body}`);
  }

  const json = await response.json();
  if (!json || json.message !== 'OK') {
    throw new Error(`Email forward service responded with error: ${JSON.stringify(json)}`);
  }

  return json.data;
}

/**
 * 发送验证码邮件，默认模板
 * @param {Env} env
 * @param {Object} options
 * @param {string} options.to 收件人
 * @param {string} options.code 验证码
 * @param {number} [options.ttlMinutes=10] 有效时间（分钟）
 */
export async function sendVerificationEmail(env, { to, code, ttlMinutes = 10 }) {
  const content = `<!DOCTYPE html>
<html lang="zh-CN">
  <body style="margin:0;padding:0;background:#f8fafc;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto;font-family:'Segoe UI','PingFang SC','Microsoft Yahei','Helvetica Neue',Arial,sans-serif;color:#0f172a;">
      <tr>
        <td style="padding:32px 32px 0;">
          <div style="border-radius:18px;overflow:hidden;box-shadow:0 30px 60px -28px rgba(30,41,59,0.4);background:#ffffff;">
            <div style="padding:28px 32px;background:linear-gradient(135deg,#4f46e5,#0ea5e9);color:#ffffff;">
              <p style="margin:0;font-size:12px;letter-spacing:0.32em;text-transform:uppercase;opacity:0.8;">Ollama / OpenRouter API Pool</p>
              <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;">登录验证码</h1>
              <p style="margin:12px 0 0;font-size:14px;line-height:1.6;opacity:0.9;">
                统一入口调度多 Provider，保障您的应用稳定运行。
              </p>
            </div>
            <div style="padding:32px;">
              <p style="margin:0 0 12px;font-size:16px;line-height:1.7;">
                您正在尝试登录 <strong>Ollama API Pool 管理中心</strong>。请在 <strong>${ttlMinutes}</strong> 分钟内输入以下验证码完成操作：
              </p>
              <div style="margin:18px 0;padding:20px 24px;border-radius:16px;background:#eef2ff;color:#4338ca;font-size:32px;font-weight:700;letter-spacing:0.28em;text-align:center;">
                ${code}
              </div>
              <p style="margin:0 0 20px;font-size:14px;line-height:1.7;color:#475569;">
                该验证码仅可使用一次，请勿转发或泄露。如果这不是您的请求，可直接忽略本邮件，我们会持续监控账号安全状态。
              </p>
              <div style="margin:0 0 24px;">
                <p style="margin:0 0 8px;font-size:13px;color:#1e293b;font-weight:600;">为什么选择我们？</p>
                <ul style="margin:0;padding-left:20px;color:#475569;font-size:13px;line-height:1.7;">
                  <li>多 Provider 自动轮询，故障秒级切换，保障调用稳定性</li>
                  <li>统一鉴权与可视化控制台，轻松管理上游 API 账号</li>
                  <li>实时统计请求成功率与热点模型，用数据驱动运营决策</li>
                </ul>
              </div>
              <div style="margin:0 0 20px;padding:18px;border-radius:12px;background:linear-gradient(135deg,#eef2ff,#e0e7ff);border:1px solid #c7d2fe;">
                <p style="margin:0 0 8px;font-size:13px;color:#4338ca;font-weight:600;">🔗 相关服务推荐</p>
                <p style="margin:0;font-size:13px;line-height:1.7;color:#475569;">
                  访问 <a href="https://ollama-api-pool.h7ml.workers.dev/?source=email" style="color:#4f46e5;text-decoration:none;font-weight:600;">Ollama API Pool 管理中心</a> 了解更多 API 代理服务，体验高可用的 AI 模型调用。
                </p>
              </div>
              <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">
                若需协助，可回复本邮件与团队联系。感谢使用 Ollama API Pool！
              </p>
            </div>
            <div style="padding:20px 32px;background:#f1f5f9;color:#94a3b8;font-size:11px;line-height:1.6;">
              <p style="margin:0 0 6px;">© ${new Date().getFullYear()} Ollama API Pool · 构建稳定的多 Provider LLM 代理池</p>
              <p style="margin:0;">
                <a href="https://ollama-api-pool.h7ml.workers.dev/?source=email" style="color:#94a3b8;text-decoration:none;">https://ollama-api-pool.h7ml.workers.dev</a>
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return forwardCustomEmail(env, {
    to,
    subject: 'Ollama API Pool 登录验证码',
    content,
    contentType: 'html'
  });
}

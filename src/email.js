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
  <html>
    <body style="font-family: Helvetica, Arial, sans-serif; color: #1f2933;">
      <h2 style="margin-bottom: 12px;">您的验证码</h2>
      <p>验证码：<strong style="font-size: 18px;">${code}</strong></p>
      <p style="color: #64748b;">有效期 ${ttlMinutes} 分钟，请勿泄露。</p>
      <p style="margin-top: 24px; color: #94a3b8; font-size: 12px;">如果不是本人操作，可忽略本邮件。</p>
    </body>
  </html>`;

  return forwardCustomEmail(env, {
    to,
    subject: '验证码',
    content,
    contentType: 'html'
  });
}

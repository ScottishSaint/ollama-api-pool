/**
 * Login.js 静态文件内容
 */

export const loginJs = `const STORAGE_KEY = 'adminToken';
const loginForm = $('#login-form');
const tokenInput = $('#admin-token');
const rememberMe = $('#remember-me');
const errorMessage = $('#error-message');
const startLogin = $('#start-login');
const introSection = $('#intro-section');

function updateFooterTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = \`\${year}年\${month}月\${day}日 \${hours}:\${minutes}:\${seconds}\`;
    $('#footer-time').text(timeStr);
}
updateFooterTime();
setInterval(updateFooterTime, 1000);

function showToast(message, type) {
    const colors = {success: 'from-emerald-500 to-green-500', error: 'from-rose-500 to-red-500'};
    const icons = {success: '✅', error: '❌'};
    const toast = $('<div>').addClass('transform transition-all duration-300 translate-x-full opacity-0')
        .html('<div class="flex items-center gap-3 text-white px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-r ' + colors[type] + '">' +
              '<span class="text-lg">' + icons[type] + '</span><span class="text-sm">' + message + '</span></div>');
    $('#toast-container').append(toast);
    setTimeout(() => toast.removeClass('translate-x-full opacity-0').addClass('translate-x-0 opacity-100'), 10);
    setTimeout(() => { toast.addClass('translate-x-full opacity-0'); setTimeout(() => toast.remove(), 300); }, 3600);
}

const savedToken = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
if (savedToken) window.location.href = '/dashboard?verify=true';

startLogin.on('click', () => { introSection.addClass('hidden'); loginForm.removeClass('hidden'); tokenInput.trigger('focus'); });

loginForm.on('submit', async (e) => {
    e.preventDefault();
    const token = tokenInput.val().trim();
    if (!token) { showToast('请输入管理员 Token', 'error'); return; }

    const btn = loginForm.find('button[type="submit"]');
    btn.prop('disabled', true).addClass('opacity-70').text('登录中...');

    try {
        const res = await fetch('/admin/stats', { headers: { 'Authorization': 'Bearer ' + token } });
        if (!res.ok) { showToast(res.status === 401 || res.status === 403 ? 'Token 无效' : '登录失败', 'error'); return; }

        if (rememberMe.is(':checked')) localStorage.setItem(STORAGE_KEY, token);
        else sessionStorage.setItem(STORAGE_KEY, token);

        showToast('登录成功', 'success');
        setTimeout(() => window.location.href = '/dashboard?verify=true', 400);
    } catch (err) {
        showToast('网络异常', 'error');
    } finally {
        btn.prop('disabled', false).removeClass('opacity-70').text('进入控制台');
    }
});

tokenInput.on('input', () => errorMessage.addClass('hidden'));
`;

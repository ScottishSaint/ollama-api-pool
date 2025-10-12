/**
 * 用户后台脚本
 */

export const userDashboardJs = `const SESSION_KEY = 'userSessionToken';
const PROFILE_KEY = 'userProfile';
const API_KEY_KEY = 'userApiKey';
const PAGE_SIZE = 10;

const state = {
    token: '',
    profile: null,
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    pageCount: 1,
    latestSigninDate: null,
    signedToday: false
};

const elements = {};

function initElements() {
    elements.email = document.getElementById('user-email');
    elements.provider = document.getElementById('user-provider');
    elements.createdAt = document.getElementById('user-created-at');
    elements.lastLogin = document.getElementById('user-last-login');
    elements.keyExpire = document.getElementById('user-key-expire');
    elements.sessionToken = document.getElementById('session-token');
    elements.apiToken = document.getElementById('api-token');
    elements.signinTableBody = document.getElementById('signin-table-body');
    elements.signinsSummary = document.getElementById('signins-summary');
    elements.paginationPage = document.getElementById('pagination-page');
    elements.paginationTotal = document.getElementById('pagination-total');
    elements.paginationTotalCount = document.getElementById('pagination-total-count');
    elements.paginationPrev = document.getElementById('pagination-prev');
    elements.paginationNext = document.getElementById('pagination-next');
    elements.toastContainer = document.getElementById('toast-container');
    elements.refreshProfileBtn = document.getElementById('refresh-profile-btn');
    elements.logoutBtn = document.getElementById('logout-btn');
    elements.signStatus = document.getElementById('sign-status');
    elements.signBtn = document.getElementById('sign-btn');
    elements.statRequestCount = document.getElementById('stat-request-count');
    elements.statTotalSignins = document.getElementById('stat-total-signins');
    elements.statLastSignin = document.getElementById('stat-last-signin');
    elements.statLastLogin = document.getElementById('stat-last-login');
    elements.statKeyExpire = document.getElementById('stat-key-expire');
}

function showToast(message, type) {
    if (!elements.toastContainer) return;
    const colors = {
        success: 'from-emerald-500 to-green-500',
        error: 'from-rose-500 to-red-500',
        info: 'from-indigo-500 to-primary'
    };
    const icons = {
        success: '✅',
        error: '⚠️',
        info: 'ℹ️'
    };
    const wrapper = document.createElement('div');
    wrapper.className = 'transform transition-all duration-300 translate-x-full opacity-0';
    wrapper.innerHTML =
        '<div class="flex items-center gap-3 text-white px-4 py-3 rounded-2xl shadow-lg bg-gradient-to-r ' + (colors[type] || colors.info) + '">' +
        '<span class="text-lg">' + (icons[type] || icons.info) + '</span>' +
        '<span class="text-sm">' + message + '</span>' +
        '</div>';
    elements.toastContainer.appendChild(wrapper);
    requestAnimationFrame(function () {
        wrapper.classList.remove('translate-x-full', 'opacity-0');
        wrapper.classList.add('translate-x-0', 'opacity-100');
    });
    setTimeout(function () {
        wrapper.classList.remove('translate-x-0', 'opacity-100');
        wrapper.classList.add('translate-x-full', 'opacity-0');
        setTimeout(function () {
            wrapper.remove();
        }, 320);
    }, 3600);
}

function getSessionToken() {
    return localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || '';
}

function getStorageForSession() {
    return localStorage.getItem(SESSION_KEY) ? localStorage : sessionStorage;
}

function persistProfile(profile) {
    const storage = getStorageForSession();
    storage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (profile && profile.keyToken) {
        storage.setItem(API_KEY_KEY, profile.keyToken);
    }
}

function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(API_KEY_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(PROFILE_KEY);
    sessionStorage.removeItem(API_KEY_KEY);
}

function redirectToLogin() {
    window.location.href = '/dashboard';
}

function formatDateTime(value) {
    if (!value) return '--';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + s;
}

function applyBlurToggle(targetId, button) {
    const el = document.getElementById(targetId);
    if (!el) return;
    el.classList.toggle('blur-sm');
    const blurred = el.classList.contains('blur-sm');
    button.textContent = blurred ? '显示' : '隐藏';
}

async function copyTextFrom(targetId) {
    const el = document.getElementById(targetId);
    if (!el) {
        showToast('未找到复制内容', 'error');
        return;
    }
    const text = el.textContent.trim();
    if (!text || text === '--') {
        showToast('暂无可复制内容', 'error');
        return;
    }
    try {
        await navigator.clipboard.writeText(text);
        showToast('已复制到剪贴板', 'success');
    } catch (error) {
        showToast('复制失败，请手动选择', 'error');
    }
}

function renderProfile(profile) {
    state.profile = profile;
    if (!profile) return;
    if (elements.email) elements.email.textContent = profile.email || '--';
    if (elements.provider) elements.provider.textContent = (profile.keyProvider || profile.defaultProvider || '—').toUpperCase();
    if (elements.createdAt) elements.createdAt.textContent = formatDateTime(profile.createdAt);
    if (elements.lastLogin) elements.lastLogin.textContent = formatDateTime(profile.lastLoginAt || profile.lastSignInAt);
    if (elements.keyExpire) elements.keyExpire.textContent = profile.keyExpiresAt ? formatDateTime(profile.keyExpiresAt) : '尚未生成';

    if (elements.sessionToken) elements.sessionToken.textContent = state.token || '--';
    const storage = getStorageForSession();
    const apiToken = profile.keyToken || storage.getItem(API_KEY_KEY) || '--';
    if (elements.apiToken) elements.apiToken.textContent = apiToken;
    updateStats();
}

function renderSignins(items) {
    if (!elements.signinTableBody) return;
    if (!Array.isArray(items) || items.length === 0) {
        elements.signinTableBody.innerHTML =
            '<tr><td colspan="2" class="px-4 py-6 text-center text-slate-400 text-sm">暂无登录/签到记录</td></tr>';
        return;
    }
    const rows = items.map(function (item) {
        const day = item.signDay ? item.signDay : '--';
        const created = item.createdAt ? formatDateTime(item.createdAt) : '--';
        return '<tr>' +
            '<td class="px-4 py-3 text-sm text-slate-700">' + day + '</td>' +
            '<td class="px-4 py-3 text-sm text-slate-500">' + created + '</td>' +
        '</tr>';
    }).join('');
    elements.signinTableBody.innerHTML = rows;
}

function updatePaginationControls() {
    if (elements.paginationPage) elements.paginationPage.textContent = state.page;
    if (elements.paginationTotal) elements.paginationTotal.textContent = state.pageCount;
    if (elements.paginationTotalCount) elements.paginationTotalCount.textContent = state.total;
    if (elements.paginationPrev) elements.paginationPrev.disabled = state.page <= 1;
    if (elements.paginationNext) elements.paginationNext.disabled = state.page >= state.pageCount;
    if (elements.signinsSummary) {
        elements.signinsSummary.textContent = '最近 ' + Math.min(state.limit, state.total) + ' 条记录 · 累计 ' + state.total + ' 次';
    }
}

async function fetchWithAuth(url, options) {
    const headers = new Headers(options && options.headers ? options.headers : undefined);
    headers.set('Authorization', 'Bearer ' + state.token);
    const response = await fetch(url, Object.assign({}, options, { headers }));
    if (response.status === 401) {
        clearSession();
        redirectToLogin();
        return null;
    }
    return response;
    updateStats();
}

function getTodayISO() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

function updateStats() {
    const requestCount = state.profile && typeof state.profile.keyRequestCount === 'number'
        ? state.profile.keyRequestCount
        : 0;
    if (elements.statRequestCount) {
        elements.statRequestCount.textContent = requestCount;
    }
    if (elements.statTotalSignins) {
        elements.statTotalSignins.textContent = state.total || 0;
    }
    if (elements.statLastSignin) {
        elements.statLastSignin.textContent = state.latestSigninDate || '--';
    }
    if (elements.statLastLogin) {
        const value = state.profile ? (state.profile.lastLoginAt || state.profile.lastSignInAt) : null;
        elements.statLastLogin.textContent = formatDateTime(value);
    }
    if (elements.statKeyExpire) {
        const value = state.profile ? state.profile.keyExpiresAt : null;
        elements.statKeyExpire.textContent = value ? formatDateTime(value) : '尚未生成';
    }
    if (elements.signStatus) {
        elements.signStatus.textContent = state.signedToday ? '今日已签到' : '今日未签到';
        elements.signStatus.className = state.signedToday
            ? 'mt-2 text-lg font-semibold text-emerald-600'
            : 'mt-2 text-lg font-semibold text-slate-900';
    }
    if (elements.signBtn) {
        const disabled = state.signedToday;
        elements.signBtn.disabled = disabled;
        elements.signBtn.innerHTML = disabled
            ? '<span data-icon>✔️</span><span>今日已签到</span>'
            : '<span data-icon>✅</span><span>立即签到</span>';
        elements.signBtn.classList.toggle('opacity-70', disabled);
        elements.signBtn.classList.toggle('cursor-not-allowed', disabled);
        elements.signBtn.classList.toggle('bg-primary', !disabled);
        elements.signBtn.classList.toggle('text-white', !disabled);
        elements.signBtn.classList.toggle('bg-slate-200', disabled);
        elements.signBtn.classList.toggle('text-slate-500', disabled);
        elements.signBtn.classList.toggle('border', disabled);
        elements.signBtn.classList.toggle('border-slate-200', disabled);
        elements.signBtn.classList.toggle('shadow', !disabled);
    }
}

async function refreshProfile() {
    const response = await fetchWithAuth('/api/auth/profile');
    if (!response) return;
    if (!response.ok) {
        showToast('获取用户信息失败', 'error');
        return;
    }
    const data = await response.json().catch(function () { return null; });
    if (!data || !data.user) {
        showToast('用户信息解析失败', 'error');
        return;
    }
    persistProfile(data.user);
    renderProfile(data.user);
    showToast('已刷新用户信息', 'success');
}

async function loadSignins(page) {
    const targetPage = page || 1;
    const response = await fetchWithAuth('/api/auth/signins?page=' + targetPage + '&limit=' + state.limit);
    if (!response) return;
    if (!response.ok) {
        showToast('获取登录记录失败', 'error');
        return;
    }
    const data = await response.json().catch(function () { return null; });
    if (!data) {
        showToast('登录记录解析失败', 'error');
        return;
    }
    state.page = data.page || targetPage;
    state.limit = data.limit || state.limit;
    state.total = data.total || 0;
    state.pageCount = Math.max(1, data.pageCount || Math.ceil((state.total || 0) / state.limit) || 1);
    const items = Array.isArray(data.items) ? data.items : [];
    const first = items.length > 0 ? items[0] : null;
    const today = getTodayISO();
    state.latestSigninDate = first && (first.signDay || first.sign_day) ? (first.signDay || first.sign_day) : null;
    state.signedToday = state.latestSigninDate ? state.latestSigninDate === today : false;
    renderSignins(Array.isArray(data.items) ? data.items : []);
    updatePaginationControls();
}

function bindEvents() {
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', function () {
            clearSession();
            redirectToLogin();
        });
    }

    if (elements.refreshProfileBtn) {
        elements.refreshProfileBtn.addEventListener('click', function () {
            refreshProfile();
        });
    }

    if (elements.signBtn) {
        elements.signBtn.addEventListener('click', function () {
            handleDailySign();
        });
    }

    if (elements.paginationPrev) {
        elements.paginationPrev.addEventListener('click', function () {
            if (state.page <= 1) return;
            loadSignins(state.page - 1);
        });
    }

    if (elements.paginationNext) {
        elements.paginationNext.addEventListener('click', function () {
            if (state.page >= state.pageCount) return;
            loadSignins(state.page + 1);
        });
    }

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const target = btn.getAttribute('data-copy-target');
            if (target) {
                copyTextFrom(target);
            }
        });
    });

    document.querySelectorAll('.toggle-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const target = btn.getAttribute('data-toggle-target');
            if (target) {
                applyBlurToggle(target, btn);
            }
        });
    });
}

function loadCachedProfile() {
    const storage = getStorageForSession();
    const cached = storage.getItem(PROFILE_KEY);
    if (cached) {
        try {
            const parsed = JSON.parse(cached);
            renderProfile(parsed);
        } catch (error) {
            console.warn('解析本地用户信息失败', error);
        }
    } else if (elements.sessionToken) {
        elements.sessionToken.textContent = state.token;
    }
}

async function bootstrap() {
    initElements();
    state.token = getSessionToken();
    if (!state.token) {
        redirectToLogin();
        return;
    }

    loadCachedProfile();
    bindEvents();
    await Promise.all([
        refreshProfile(),
        loadSignins(1)
    ]);
}

document.addEventListener('DOMContentLoaded', bootstrap);

async function handleDailySign() {
    if (!elements.signBtn) return;
    elements.signBtn.disabled = true;
    elements.signBtn.classList.add('opacity-70');
    try {
        const response = await fetchWithAuth('/api/auth/sign', {
            method: 'POST'
        });
        if (!response) return;
        const result = await response.json().catch(function () { return null; });
        if (!response.ok) {
            const message = result && result.error ? result.error : '签到失败';
            showToast(message, 'error');
            return;
        }
        if (result && result.keyExpiresAt && elements.keyExpire) {
            elements.keyExpire.textContent = formatDateTime(result.keyExpiresAt);
        }
        showToast('签到成功，访问凭证已续期', 'success');
        await Promise.all([refreshProfile(), loadSignins(1)]);
    } catch (error) {
        showToast('签到失败，请稍后重试', 'error');
    } finally {
        updateStats();
    }
}
`;

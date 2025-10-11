export const projectJs = `const README_SOURCES = {
    zh: 'https://proxy.jhun.edu.kg/https/raw.githubusercontent.com/dext7r/ollama-api-pool/main/README.md',
    en: 'https://proxy.jhun.edu.kg/https/raw.githubusercontent.com/dext7r/ollama-api-pool/main/README_EN.md'
};

const REPO_META_URL = '/project/meta';
const REPO_NAME = 'dext7r/ollama-api-pool';

const readmeCache = {};
const repoCache = { info: null, tags: [], fetchedAt: null };

function setActiveTab(lang) {
    var buttons = document.querySelectorAll('.lang-switch button');
    buttons.forEach(function(button) {
        button.classList.toggle('active', button.getAttribute('data-lang') === lang);
    });
}

function setCardHtml(element, title, body) {
    if (!element) return;
    element.innerHTML = '<h3>' + title + '</h3>' + body;
}

function buildLine(icon, content) {
    return '<div class="meta-line"><span class="meta-icon">' + icon + '</span><span>' + content + '</span></div>';
}

function renderMeta(info, tags, fetchedAt) {
    var versionCard = document.getElementById('repo-version');
    var updatedCard = document.getElementById('repo-updated');
    var tagsCard = document.getElementById('repo-tags');

    var repoName = info && info.full_name ? info.full_name : REPO_NAME;
    var branch = info && info.default_branch ? info.default_branch : 'main';

    if (info) {
        var latestCommit = info.pushed_at ? info.pushed_at.split('T')[0] : '未知';
        var stars = Number(info.stargazers_count || 0).toLocaleString('zh-CN');
        var forks = Number(info.forks_count || 0).toLocaleString('zh-CN');
        var issues = Number(info.open_issues_count || 0).toLocaleString('zh-CN');
        var versionBody = '<div class="meta-meta">';
        versionBody += buildLine('🌿', '默认分支 <a class="meta-link" href="https://github.com/' + repoName + '/tree/' + branch + '" target="_blank" rel="noopener">' + branch + '</a>');
        versionBody += buildLine('🕒', '最新 Commit <strong>' + latestCommit + '</strong> · <a class="meta-link" href="https://github.com/' + repoName + '/commits/' + branch + '" target="_blank" rel="noopener">查看提交</a>');
        versionBody += buildLine('⭐', 'Stars <strong>' + stars + '</strong>');
        versionBody += buildLine('🍴', 'Forks <strong>' + forks + '</strong>');
        versionBody += buildLine('❗', 'Open Issues <strong>' + issues + '</strong>');
        versionBody += '</div>';
        setCardHtml(versionCard, '版本状态', versionBody);
    } else {
        setCardHtml(versionCard, '版本状态', '<div class="meta-meta">' + buildLine('ℹ️', '暂无法获取仓库信息。') + '</div>');
    }

    var lastPushTime = info && info.pushed_at ? new Date(info.pushed_at).toLocaleString('zh-CN', { hour12: false }) : '未知';
    var fetchedTime = fetchedAt ? new Date(fetchedAt).toLocaleString('zh-CN', { hour12: false }) : '当前缓存';
    var updateBody = '<div class="meta-meta">';
    updateBody += buildLine('⏱️', '最后推送 <strong>' + lastPushTime + '</strong>');
    updateBody += buildLine('📦', '当前版本 <strong>' + repoName + '@' + branch + '</strong>');
    updateBody += buildLine('🔗', '<a class="meta-link" href="https://github.com/' + repoName + '" target="_blank" rel="noopener">前往 GitHub 仓库</a>');
    updateBody += buildLine('💾', '缓存时间 <strong>' + fetchedTime + '</strong>');
    updateBody += '</div>';
    setCardHtml(updatedCard, '最近更新', updateBody);

    if (Array.isArray(tags) && tags.length) {
        var list = '<div class="tag-cloud">';
        tags.forEach(function(tag) {
            if (!tag || !tag.name) return;
            var nameText = tag.name;
            var shaText = tag.sha || '';
            var tagUrl = tag.url || 'https://github.com/' + repoName + '/releases/tag/' + encodeURIComponent(nameText);
            var commitUrl = tag.commit_url || (tag.commit_sha ? 'https://github.com/' + repoName + '/commit/' + tag.commit_sha : '');

            list += '<a class="tag-pill" href="' + tagUrl + '" target="_blank" rel="noopener">' + nameText;
            if (shaText) {
                list += '<span>' + shaText + '</span>';
            }
            list += '</a>';

            if (commitUrl && shaText) {
                list += '<a class="tag-pill tag-pill--ghost" href="' + commitUrl + '" target="_blank" rel="noopener">Commit <span>' + shaText + '</span></a>';
            }
        });
        list += '</div>';
        setCardHtml(tagsCard, '最新标签', list);
    } else {
        setCardHtml(tagsCard, '最新标签', '<div class="meta-meta">' + buildLine('🧭', '暂无发布标签记录。') + '</div>');
    }
}

function renderMetaError(message) {
    var fallback = '<div class="meta-meta">' + buildLine('⚠️', message) + '</div>';
    setCardHtml(document.getElementById('repo-version'), '版本状态', fallback);
    setCardHtml(document.getElementById('repo-updated'), '最近更新', fallback);
    setCardHtml(document.getElementById('repo-tags'), '最新标签', fallback);
}

function renderMermaid(container) {
    if (!container) return;
    var blocks = Array.prototype.slice.call(container.querySelectorAll('pre code'));
    var hasDiagram = false;

    blocks.forEach(function(code) {
        var text = (code.textContent || '').trim();
        var isMermaid = code.classList.contains('language-mermaid') || /^(graph|sequenceDiagram|classDiagram|erDiagram|stateDiagram|journey)\b/.test(text);
        if (!isMermaid) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'mermaid';
        wrapper.textContent = text;

        var pre = code.parentElement;
        if (pre && pre.parentElement) {
            pre.parentElement.replaceChild(wrapper, pre);
        }
        hasDiagram = true;
    });

    if (hasDiagram && window.mermaid) {
        try {
            window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
            window.mermaid.run();
        } catch (error) {
            console.error('Mermaid 渲染失败:', error);
        }
    }
}

async function loadRepoMeta() {
    try {
        var response = await fetch(REPO_META_URL, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        var data = await response.json();
        repoCache.info = data.info || null;
        repoCache.tags = Array.isArray(data.tags) ? data.tags : [];
        repoCache.fetchedAt = data.fetched_at || null;
        renderMeta(repoCache.info, repoCache.tags, repoCache.fetchedAt);
    } catch (error) {
        console.error('加载仓库信息失败:', error);
        if (repoCache.info || (repoCache.tags && repoCache.tags.length)) {
            renderMeta(repoCache.info, repoCache.tags, repoCache.fetchedAt);
        } else {
            renderMetaError('仓库信息加载失败，请稍后重试。');
        }
    }
}

async function loadReadme(lang) {
    var container = document.getElementById('project-content');
    if (!container) return;

    if (readmeCache[lang]) {
        container.innerHTML = readmeCache[lang];
        renderMermaid(container);
        return;
    }

    container.innerHTML = "<p style='color:#64748b;'>正在从 GitHub 获取内容…</p>";

    try {
        var response = await fetch(README_SOURCES[lang]);
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        var markdown = await response.text();
        var html = window.marked.parse(markdown, { mangle: false, headerIds: true });
        readmeCache[lang] = html;
        container.innerHTML = html;
        renderMermaid(container);
    } catch (error) {
        console.error('加载 README 失败:', error);
        container.innerHTML = "<div class='callout' style='background:#fee2e2;border:1px solid #fecaca;border-radius:12px;padding:16px;color:#991b1b;'>加载 README 失败，请稍后重试。</div>";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var defaultLang = 'zh';
    setActiveTab(defaultLang);
    loadReadme(defaultLang);
    loadRepoMeta();

    var buttons = document.querySelectorAll('.lang-switch button');
    buttons.forEach(function(button) {
        button.addEventListener('click', function() {
            var lang = button.getAttribute('data-lang');
            if (!lang || button.classList.contains('active')) {
                return;
            }
            setActiveTab(lang);
            loadReadme(lang);
        });
    });
});
`;

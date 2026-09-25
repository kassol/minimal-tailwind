document.addEventListener('DOMContentLoaded', function() {
  initThemeToggle();
  initMenu();

  // 初始化GLightbox（使用全局变量）；灯箱链接由 render-image.html 输出
  if (typeof GLightbox !== 'undefined') {
    GLightbox({
      selector: '[data-glightbox]',
      touchNavigation: true,
      loop: true,
      autoplayVideos: false,
      closeButton: true,
      openEffect: 'fade',
      closeEffect: 'fade'
    });
  }
  
  // TOC功能初始化
  initTableOfContents();

  initChapterRing();

  initSearch();
});

// 搜索浮层（search.html）：<dialog> 模态打开，焦点圈在浮层内、Esc 关闭由浏览器处理；关闭后焦点回到打开者。
// 索引首次打开时加载；匹配为不分词的子串（多个词用空格分隔，须全部出现），标题命中在前，其余按日期倒序
// ponytail: 每次输入线性扫描全部文章，约 1000 篇以内无感；索引变大后再考虑分片或 Pagefind
function initSearch() {
  const dialog = document.getElementById('search');
  if (!dialog) return;
  const input = dialog.querySelector('#search-q');
  const list = dialog.querySelector('#search-results');
  const status = dialog.querySelector('[data-search-status]');
  const empty = dialog.querySelector('[data-search-empty]');
  const rowTemplate = dialog.querySelector('#search-row');
  let index = null, loading = null, rows = [], active = -1, opener = null;

  const load = () => loading || (loading = fetch(dialog.dataset.searchIndex)
    .then(r => r.json())
    .then(items => {
      index = items.map(p => ({ ...p, hay: (p.t + '\n' + p.s + '\n' + p.c).toLowerCase() }));
      render();
    })
    .catch(() => {
      loading = null;
      status.textContent = '索引加载失败，请稍后重试';
    }));

  const escapeRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 片段：正文中第一个命中处前 20 字起取 80 字；正文没有命中时取 AI 总结
  function snippet(p, terms) {
    for (const text of [p.c, p.s]) {
      const lower = text.toLowerCase();
      const hits = terms.map(t => lower.indexOf(t)).filter(i => i >= 0);
      if (!hits.length) continue;
      const start = Math.max(0, Math.min(...hits) - 20);
      return (start ? '…' : '') + text.slice(start, start + 80);
    }
    return p.s || p.c.slice(0, 80);
  }

  function highlight(el, text, re) {
    text.split(re).forEach((part, i) => {
      if (!part) return;
      if (i % 2) {
        const mark = document.createElement('mark');
        mark.textContent = part;
        el.append(mark);
      } else {
        el.append(part);
      }
    });
  }

  function select(i) {
    if (rows[active]) rows[active].setAttribute('aria-selected', 'false');
    active = i;
    const row = rows[i];
    if (!row) return input.removeAttribute('aria-activedescendant');
    row.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', row.id);
    row.scrollIntoView({ block: 'nearest' });
  }

  function render() {
    const query = input.value.trim();
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    rows = [];
    active = -1;
    list.replaceChildren();
    input.removeAttribute('aria-activedescendant');
    empty.hidden = true;
    status.textContent = '';
    if (!terms.length) return input.setAttribute('aria-expanded', 'false');
    if (!index) {
      status.textContent = '正在加载索引…';
      return;
    }

    const found = index.filter(p => terms.every(t => p.hay.includes(t)));
    const inTitle = p => terms.some(t => p.t.toLowerCase().includes(t)) ? 1 : 0;
    found.sort((a, b) => inTitle(b) - inTitle(a));

    const re = new RegExp('(' + terms.map(escapeRe).join('|') + ')', 'i');
    rows = found.map((p, i) => {
      const row = rowTemplate.content.firstElementChild.cloneNode(true);
      row.id = 'search-option-' + i;
      row.href = p.u;
      row.querySelector('[data-title]').textContent = p.t;
      const date = row.querySelector('[data-date]');
      date.textContent = p.d;
      date.dateTime = p.d;
      highlight(row.querySelector('[data-snippet]'), snippet(p, terms), re);
      row.addEventListener('pointermove', () => { if (active !== i) select(i); });
      return row;
    });
    list.append(...rows);
    status.textContent = found.length + ' 条结果';
    if (!found.length) {
      empty.textContent = '没有找到包含「' + query + '」的文章。换个词，或少输几个字试试。';
      empty.hidden = false;
    }
    input.setAttribute('aria-expanded', String(found.length > 0));
    select(found.length ? 0 : -1);
  }

  function open(query, from) {
    opener = from || document.activeElement;
    if (query != null) input.value = query;
    if (!dialog.open) dialog.showModal();
    input.focus();
    if (query == null) input.select();
    load();
    render();
  }

  dialog.addEventListener('close', () => { if (opener && opener.focus) opener.focus(); });
  // 点击遮罩（面板以外）关闭
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.querySelectorAll('[data-search-close]').forEach(b => b.addEventListener('click', () => dialog.close()));

  // 输入法组合中不搜索、不响应方向键与回车（回车用于上屏）
  input.addEventListener('input', e => { if (!e.isComposing) render(); });
  input.addEventListener('compositionend', render);
  input.addEventListener('keydown', e => {
    if (e.isComposing || e.keyCode === 229) return;
    // type=search 的输入框里 Esc 默认先清空内容，这里直接关闭浮层
    if (e.key === 'Escape') {
      e.preventDefault();
      dialog.close();
    } else if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && rows.length) {
      e.preventDefault();
      select((active + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length);
    } else if (e.key === 'Enter' && rows[active]) {
      e.preventDefault();
      rows[active].click();
    }
  });

  document.querySelectorAll('[data-search-open]').forEach(b => b.addEventListener('click', () => open(null, b)));
  document.querySelectorAll('[data-search-form]').forEach(form => form.addEventListener('submit', e => {
    e.preventDefault();
    const field = form.querySelector('input');
    open(field.value, field);
  }));
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog.open) input.select();
      else open();
    }
  });
}

// 首页年轮分镜：章节顶部越过视口 40% 处即为当前章，写入 data-active-chapter；上色由 CSS 按 data-chapter 完成
function initChapterRing() {
  const root = document.querySelector('[data-active-chapter]');
  if (!root || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) root.dataset.activeChapter = e.target.dataset.chapter;
    });
  }, { rootMargin: '-40% 0px -59% 0px' });

  root.querySelectorAll('article[data-chapter]').forEach(el => observer.observe(el));
}

// 手机菜单（header.html 的 popover）：打开前把面板贴到页眉下沿，开关时同步按钮的 aria-expanded
function initMenu() {
  const panel = document.getElementById('site-menu');
  const button = document.querySelector('[popovertarget="site-menu"]');
  if (!panel || !button) return;
  panel.addEventListener('beforetoggle', e => {
    if (e.newState === 'open') panel.style.top = Math.max(0, panel.parentElement.getBoundingClientRect().bottom) + 'px';
  });
  panel.addEventListener('toggle', e => button.setAttribute('aria-expanded', String(e.newState === 'open')));
}

// 外观三态：localStorage.theme = light | dark；缺省为跟随系统（不设 data-theme，交给 prefers-color-scheme）
function initThemeToggle() {
  const buttons = document.querySelectorAll('[data-theme-toggle] button');
  if (!buttons.length) return;

  const apply = (mode) => {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (mode === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', mode);
  };

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  apply(saved === 'light' || saved === 'dark' ? saved : 'system');

  buttons.forEach(b => b.addEventListener('click', () => {
    const mode = b.dataset.mode;
    try {
      if (mode === 'system') localStorage.removeItem('theme');
      else localStorage.setItem('theme', mode);
    } catch (e) {}
    apply(mode);
  }));
}

function initTableOfContents() {
  const tocNav = document.getElementById('toc-nav');
  const tocToggle = document.getElementById('toc-toggle');
  const tocContent = document.getElementById('toc-content');
  
  if (!tocNav) return; // 如果没有TOC，退出
  
  // 移动端目录折叠：桌面上 lg:block 始终显示
  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', function() {
      const open = !tocContent.classList.toggle('hidden');
      tocToggle.setAttribute('aria-expanded', String(open));
    });
  }
  
  // 获取所有标题和TOC链接
  const headings = document.querySelectorAll('.prose h2, .prose h3, .prose h4');
  const tocLinks = tocNav.querySelectorAll('a');
  
  if (headings.length === 0 || tocLinks.length === 0) return;
  
  // 点击目录的跳转交给浏览器：标题留白与平滑滚动见 styles.css（.article-body 标题的 scroll-margin、html 的 scroll-behavior）
  // 滚动高亮当前章节
  function updateTocHighlight() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    let currentHeading = null;
    
    // 找到当前可见的标题
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      const headingTop = heading.offsetTop - 100; // 100px offset
      
      if (scrollTop >= headingTop) {
        currentHeading = heading;
        break;
      }
    }
    
    // 更新TOC链接的active状态
    tocLinks.forEach(link => {
      link.classList.remove('active');
      
      if (currentHeading) {
        const href = link.getAttribute('href');
        if (href === `#${currentHeading.id}`) {
          link.classList.add('active');
        }
      }
    });
  }
  
  // 监听滚动事件，使用节流优化性能
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(function() {
        updateTocHighlight();
        ticking = false;
      });
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', onScroll);
  
  // 初始化时也调用一次
  updateTocHighlight();
}

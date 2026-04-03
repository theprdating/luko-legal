/* ============================================================
   legal-renderer.js — Luko 法律文件頁面渲染引擎
   讀取 window.DOC，動態建構 DOM

   資料結構（DOC.sections[].items 支援的 type）：
     clause    → 條文段落（可選 bold: true）
     bullet    → 圓點列舉
     notice    → 重要提示框（左側金色邊線）
     subheading → 小節子標題
   ============================================================ */

(function () {
  'use strict';

  /* ── 工具函式 ─────────────────────────────────────────── */

  function make(tag, className) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  }

  /* ── Item 渲染器（對應 Flutter LegalXxx widgets） ─────── */

  function renderItem(item) {
    switch (item.type) {

      case 'clause': {
        const p = make('p', 'clause' + (item.bold ? ' bold' : ''));
        p.textContent = item.text;
        return p;
      }

      case 'bullet': {
        const d = make('div', 'bullet-item');
        d.appendChild(make('div', 'bullet-dot'));
        const span = make('span', 'bullet-text');
        span.textContent = item.text;
        d.appendChild(span);
        return d;
      }

      case 'notice': {
        const d = make('div', 'notice');
        d.textContent = item.text;
        return d;
      }

      case 'subheading': {
        const d = make('div', 'subheading');
        d.textContent = item.text;
        return d;
      }

      default:
        return null;
    }
  }

  /* ── Section 渲染器（對應 LegalSection + children） ───── */

  function renderSection(section) {
    const frag = document.createDocumentFragment();

    // 章節標題列（大裝飾數字 + 金線 + 標題）
    const headerRow = make('div', 'section-header');

    const num = make('span', 'section-number');
    num.textContent = section.number;
    headerRow.appendChild(num);

    const titleGroup = make('div', 'section-title-group');
    titleGroup.appendChild(make('div', 'section-title-line'));
    const titleText = make('div', 'section-title-text');
    titleText.textContent = section.title;
    titleGroup.appendChild(titleText);
    headerRow.appendChild(titleGroup);

    frag.appendChild(headerRow);

    // 章節內容
    section.items.forEach(function (item) {
      const rendered = renderItem(item);
      if (rendered) frag.appendChild(rendered);
    });

    return frag;
  }

  /* ── 主要渲染函式 ─────────────────────────────────────── */

  function init() {
    const doc = window.DOC;
    const app = document.getElementById('app');
    if (!app || !doc) {
      console.error('[legal-renderer] Missing #app or window.DOC');
      return;
    }

    // 設定頁面 title
    document.title = doc.title + ' — Luko';

    /* ── 吸頂品牌列 ──────────────────────────────────────── */
    const header = make('header', 'luko-header');

    const headerInner = make('div', 'header-inner');

    const backBtn = make('a', 'back-btn');
    backBtn.href = '#';
    backBtn.title = '返回';
    backBtn.setAttribute('aria-label', '返回上一頁');
    backBtn.textContent = '←';
    backBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    });

    const logoImg = make('img', 'logo-img');
    logoImg.src = 'logo.png';
    logoImg.alt = 'Luko';
    logoImg.width = 20;
    logoImg.height = 20;

    const logoText = make('span', 'logo-text');
    logoText.textContent = 'LUKO';

    headerInner.appendChild(backBtn);
    headerInner.appendChild(logoImg);
    headerInner.appendChild(logoText);
    header.appendChild(headerInner);

    const progressTrack = make('div', 'progress-track');
    const progressFill = make('div', 'progress-fill');
    progressTrack.appendChild(progressFill);
    header.appendChild(progressTrack);

    app.appendChild(header);

    /* ── 正文容器 ─────────────────────────────────────────── */
    const main = make('main', 'legal-main');

    // Hero：Logo
    const heroLogo = make('img', 'hero-logo');
    heroLogo.src = 'logo.png';
    heroLogo.alt = 'Luko';
    main.appendChild(heroLogo);

    // Hero：大標題
    const heroTitle = make('h1', 'hero-title');
    heroTitle.textContent = doc.title;
    main.appendChild(heroTitle);

    // Hero：金線
    main.appendChild(make('div', 'hero-line'));

    // Hero：英文副標（全大寫）
    const heroSub = make('p', 'hero-subtitle');
    heroSub.textContent = doc.subtitle;
    main.appendChild(heroSub);

    // Hero：版本 badge
    const badge = make('div', 'version-badge');
    badge.textContent = doc.version + '\u3000\xb7\u3000' + doc.date;
    main.appendChild(badge);

    // 分隔線
    main.appendChild(make('div', 'hero-divider'));

    // 各章節
    doc.sections.forEach(function (section) {
      main.appendChild(renderSection(section));
    });

    // 頁底版權
    const footer = make('div', 'legal-footer');
    footer.appendChild(make('div', 'footer-divider'));
    const footerText = make('p', 'footer-text');
    footerText.textContent = doc.footer;
    footer.appendChild(footerText);
    main.appendChild(footer);

    app.appendChild(main);

    /* ── 捲動進度條 ───────────────────────────────────────── */
    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      var pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      progressFill.style.width = Math.min(pct, 100).toFixed(2) + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress(); // 初始化
  }

  /* ── Entry point ──────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

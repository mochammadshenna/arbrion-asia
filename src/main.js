import './style.css';
import { animate, stagger } from 'animejs';
import {
  getLang, setLang, t, tMarketers, tDownloads,
  updateAllText, updateLangButtons, waLink
} from './i18n/translations.js';
import { initProductScene } from './scene/three-scenes.js';
import { productSpecs, crossSectionSVGs } from './scene/product-data.js';

// ─── BOOT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Apply stored/default language (ID)
  document.documentElement.lang = getLang();
  updateLangButtons();
  updateAllText();

  const hideLoader = initPageLoader();
  initNavbar();
  initHeroImage(hideLoader);
  initHeroText();
  renderDownloads();
  renderContact();
  initWAFab();
  initScrollAnimations();
  initCounterAnimations();
  initBlueprintSVG();

  // Re-render dynamic sections on language change
  document.addEventListener('lang:changed', () => {
    renderDownloads();
    renderContact();
    updateWAFab();
  });
});

// ─── NAVBAR ──────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Language toggle buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Bottom nav active state on scroll
  const sections = ['hero','about','products','why','technical','contact'];
  const bnav = document.getElementById('bottom-nav');
  if (bnav) {
    window.addEventListener('scroll', () => {
      let active = 'hero';
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) active = id;
      });
      bnav.querySelectorAll('.bnav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.section === active);
      });
    }, { passive: true });
  }
}

// ─── PAGE LOADER ─────────────────────────────────────────────
// Returns a hide() function. Called externally once Three.js fires first frame.
function initPageLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) {
    document.body.classList.add('ready');
    return () => {};
  }

  const start = Date.now();
  const minDelay = 600; // ms minimum show time
  let scheduled = false;

  const hide = () => {
    if (scheduled) return;
    scheduled = true;
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minDelay - elapsed);
    setTimeout(() => {
      // Reveal body content before fading loader out
      document.body.classList.add('ready');
      animate(loader, {
        opacity: [1, 0],
        duration: 400,
        ease: 'inOutSine',
        complete: () => { loader.style.display = 'none'; },
      });
    }, wait);
  };

  // Absolute fallback: hide after 5s regardless
  setTimeout(hide, 5000);

  return hide;
}

// ─── HERO IMAGE ──────────────────────────────────────────────
function initHeroImage(hideLoader) {
  const img = document.getElementById('hero-bg-img');
  if (!img) { hideLoader?.(); return; }

  const reveal = () => {
    img.classList.add('loaded');
    hideLoader?.();
  };

  if (img.complete && img.naturalWidth > 0) {
    reveal();
  } else {
    img.addEventListener('load', reveal, { once: true });
    img.addEventListener('error', () => hideLoader?.(), { once: true });
  }
}


let heroTextRevealed = false;
function initHeroText() {
  revealHeroText();
}

// ─── BLUEPRINT SVG DRAW ANIMATION ────────────────────────────
function initBlueprintSVG() {
  const svg = document.getElementById('blueprint-svg');
  if (!svg) return;

  // Respect prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    svg.querySelectorAll('path, line, polyline, rect, circle').forEach(el => {
      el.style.strokeDashoffset = '0';
    });
    revealHeroText();
    setTimeout(() => {
      svg.style.opacity = '0';
    }, 400);
    return;
  }

  const allPaths = svg.querySelectorAll('path, line, polyline, rect, circle');
  allPaths.forEach(el => {
    try {
      const len = el.getTotalLength ? el.getTotalLength() : 100;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
    } catch (e) {
      el.style.strokeDasharray = '200';
      el.style.strokeDashoffset = '200';
    }
  });

  // Phase 1 — draw blueprint (600ms after load)
  setTimeout(() => {
    animate(allPaths, {
      strokeDashoffset: [null, 0],
      duration: 2200,
      delay: stagger(18),
      ease: 'inOutSine',
    });

    // Phase 2 — hero text (400ms into blueprint draw)
    setTimeout(() => {
      revealHeroText();

      // Phase 3 — 3D after text is visible
      setTimeout(() => {
        animate('#blueprint-svg', {
          opacity: [1, 0],
          duration: 1200,
          ease: 'inOutSine',
        });
      }, 900);
    }, 400);
  }, 600);
}

function revealHeroText() {
  if (heroTextRevealed) return;
  heroTextRevealed = true;
  animate('.hero-eyebrow', {
    opacity: [0, 1],
    translateX: [-20, 0],
    duration: 600,
    ease: 'outExpo',
  });

  const words = document.querySelectorAll('.hero-title .word .inner');
  animate(words, {
    translateY: ['110%', '0%'],
    duration: 800,
    delay: stagger(120),
    ease: 'outExpo',
  });

  animate(['.hero-tagline', '.hero-actions', '.hero-badges'], {
    opacity: [0, 1],
    translateY: [24, 0],
    duration: 700,
    delay: stagger(120, { start: 400 }),
    ease: 'outExpo',
  });

  // Annotation labels — CSS transition via .visible class, staggered
  setTimeout(() => {
    document.querySelectorAll('.hero-annotation').forEach(el => {
      el.classList.add('visible');
    });
  }, 900);
}

// ─── DOWNLOADS ───────────────────────────────────────────────
function renderDownloads() {
  const list = document.getElementById('downloads-list');
  if (!list) return;

  const downloads = tDownloads();
  list.innerHTML = downloads.map((dl, i) => `
    <div class="download-item" data-index="${i}">
      <div class="download-left">
        <span class="download-type">${dl.type}</span>
        <div>
          <div class="download-name">${dl.name}</div>
          <div class="download-desc">${dl.desc}</div>
        </div>
      </div>
      <div class="download-right">
        ${dl.size ? `<span class="download-size">${dl.size}</span>` : ''}
        <a href="${dl.href}" class="download-btn" aria-label="Download ${dl.name}" download target="_blank" rel="noopener">
          <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <line x1="6" y1="1" x2="6" y2="9"/>
            <polyline points="3,6 6,9 9,6"/>
            <line x1="1" y1="11" x2="11" y2="11"/>
          </svg>
          <span>${t('dl_btn')}</span>
        </a>
      </div>
    </div>
  `).join('');

  const items = list.querySelectorAll('.download-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = parseInt(entry.target.dataset.index);
      setTimeout(() => entry.target.classList.add('visible'), idx * 60);
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });
  items.forEach(item => io.observe(item));
}

// ─── CONTACT ─────────────────────────────────────────────────
function renderContact() {
  // Office details
  const detailsEl = document.getElementById('contact-details');
  if (detailsEl) {
    const rows = [
      { label: 'contact_address_label', value: 'contact_address_val' },
      { label: 'contact_phone_label',   value: 'contact_phone_val' },
      { label: 'contact_fax_label',     value: 'contact_fax_val' },
      { label: 'contact_email_label',   value: 'contact_email_val' },
      { label: 'contact_hours_label',   value: 'contact_hours_val' },
    ];
    detailsEl.innerHTML = rows.map(r => `
      <div class="contact-detail-row">
        <span class="contact-detail-label">${t(r.label)}</span>
        <span class="contact-detail-value">${t(r.value)}</span>
      </div>
    `).join('');
  }

  // Marketer cards — real WA numbers from translations
  const cardsEl = document.getElementById('marketer-cards');
  if (cardsEl) {
    const marketers = tMarketers();
    const waMsg = encodeURIComponent(t('wa_msg_default'));
    cardsEl.innerHTML = marketers.map(m => `
      <div class="marketer-card">
        <div class="marketer-avatar">${m.name[0]}</div>
        <div class="marketer-info">
          <div class="marketer-name">${m.name}</div>
          <div class="marketer-role">${m.role}</div>
          <div class="marketer-wa-num">${m.waDisplay}</div>
        </div>
        <a href="https://wa.me/${m.wa}?text=${waMsg}"
           class="marketer-wa-btn"
           target="_blank" rel="noopener noreferrer"
           aria-label="WhatsApp ${m.name}">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          ${t('wa_label')}
        </a>
      </div>
    `).join('');
  }
}

// ─── WHATSAPP FAB ─────────────────────────────────────────────
function initWAFab() {
  updateWAFab();

  let fabVisible = false;
  window.addEventListener('scroll', () => {
    const hero = document.getElementById('hero');
    const threshold = hero ? hero.offsetHeight * 0.4 : 400;
    const shouldShow = window.scrollY > threshold;
    if (shouldShow !== fabVisible) {
      fabVisible = shouldShow;
      const fab = document.getElementById('wa-fab');
      if (fab) fab.classList.toggle('visible', fabVisible);
    }
  }, { passive: true });
}

function updateWAFab() {
  const fabBtn = document.getElementById('wa-fab-btn');
  if (fabBtn) fabBtn.href = waLink(t('wa_fab_number'), 'wa_msg_default');

  const stickyBtn = document.getElementById('wa-sticky-btn');
  if (stickyBtn) stickyBtn.href = waLink(t('wa_fab_number'), 'wa_msg_default');

  const stickyLabel = document.getElementById('wa-sticky-label');
  if (stickyLabel) stickyLabel.textContent = t('wa_sticky_text');
}

// ─── SCROLL ANIMATIONS ────────────────────────────────────────
function initScrollAnimations() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const els = document.querySelectorAll('.anim-fade-up, .anim-fade-in, .anim-slide-left');

  if (reduced) {
    els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  // Set initial hidden state via JS (not CSS) so HMR never leaves elements invisible
  els.forEach(el => {
    if (el.dataset.animated) return; // already played — leave it visible
    if (el.classList.contains('anim-fade-up')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
    } else if (el.classList.contains('anim-fade-in')) {
      el.style.opacity = '0';
    } else if (el.classList.contains('anim-slide-left')) {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-32px)';
    }
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animated) { io.unobserve(el); return; } // guard: play once only

      el.dataset.animated = '1'; // mark before animating

      if (el.classList.contains('anim-fade-up')) {
        animate(el, { opacity: [0, 1], translateY: [32, 0], duration: 700, ease: 'outExpo' });
      } else if (el.classList.contains('anim-fade-in')) {
        animate(el, { opacity: [0, 1], duration: 800, ease: 'outSine' });
      } else if (el.classList.contains('anim-slide-left')) {
        animate(el, { opacity: [0, 1], translateX: [-32, 0], duration: 700, ease: 'outExpo' });
      }
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => {
    if (!el.dataset.animated) io.observe(el);
  });

  // Stagger grids — also guarded
  ['.why-grid', '.focus-grid'].forEach(selector => {
    const grid = document.querySelector(selector);
    if (!grid || grid.dataset.animated) return;
    const gridIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      grid.dataset.animated = '1';
      animate(grid.querySelectorAll('.why-item, .focus-item'), {
        opacity: [0, 1], translateY: [24, 0], duration: 600,
        delay: stagger(100), ease: 'outExpo',
      });
      gridIO.disconnect();
    }, { threshold: 0.1 });
    gridIO.observe(grid);
  });
}

// ─── COUNTER ANIMATIONS ───────────────────────────────────────
function initCounterAnimations() {
  [
    { id: 'stat-year',  target: 2007, duration: 1800 },
    { id: 'stat-emp',   target: 20,   duration: 1200 },
    { id: 'stat-prod',  target: 1000, duration: 2000 },
  ].forEach(({ id, target, duration }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const state = { val: 0 };
      animate(state, {
        val: target, duration, ease: 'outExpo',
        onUpdate: () => {
          el.textContent = (id === 'stat-prod' && Math.round(state.val) >= 1000)
            ? '1K' : Math.round(state.val).toString();
        },
      });
      io.disconnect();
    }, { threshold: 0.5 });
    io.observe(el);
  });
}

// ─── WHY CAROUSEL DOTS ────────────────────────────────────────
function initWhyCarousel() {
  const wrap = document.querySelector('.why-carousel-wrap');
  const dots = document.querySelectorAll('.why-dot');
  if (!wrap || !dots.length) return;
  // Only active on mobile (when why-grid is flex row / carousel)
  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return;

  const items = wrap.querySelectorAll('.why-item');
  let ticking = false;

  wrap.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const itemW = items[0] ? items[0].getBoundingClientRect().width : 0;
      const idx = itemW > 0 ? Math.round(wrap.scrollLeft / itemW) : 0;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      ticking = false;
    });
  }, { passive: true });

  // Tap dot to scroll
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const itemW = items[0] ? items[0].getBoundingClientRect().width : 0;
      wrap.scrollTo({ left: i * itemW, behavior: 'smooth' });
    });
  });
}
document.addEventListener('DOMContentLoaded', initWhyCarousel);

// ─── CATALOG SECTION ─────────────────────────────────────────
(function initCatalog() {
  const grid = document.getElementById('catalog-grid');
  const tabs = document.querySelectorAll('.catalog-tab');
  const overlay = document.getElementById('cat-drawer-overlay');
  const drawer = document.getElementById('cat-drawer');
  const drawerTitle = document.getElementById('cat-drawer-title');
  const drawerTbody = document.getElementById('cat-drawer-tbody');
  const drawerClose = document.getElementById('cat-drawer-close');
  const drawerWa = document.getElementById('cat-drawer-wa');
  const drawerCanvasWrap = document.getElementById('cat-drawer-canvas-wrap');
  const drawerCanvas = document.getElementById('cat-drawer-canvas');
  if (!grid) return;

  const paramLabels = {
    spec_width: 'Lebar',
    spec_height: 'Tinggi',
    spec_thickness: 'Tebal',
    spec_length: 'Panjang',
    spec_load: 'Beban Maks.',
    spec_material: 'Material',
    spec_finish: 'Finishing',
    spec_standard: 'Standar',
  };

  const waMessages = {
    'type-c':       'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cable%20Tray%20Tipe%20C',
    'type-u':       'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cable%20Tray%20Tipe%20U',
    'type-w':       'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cable%20Tray%20Tipe%20W',
    'heavy-duty':   'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cable%20Tray%20Heavy%20Duty',
    'cable-ladder': 'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cable%20Ladder',
    'cover':        'Halo%2C%20saya%20ingin%20menanyakan%20harga%20Cover%20Cable%20Tray',
  };

  const productNames = {
    'type-c':       'Cable Tray Tipe C',
    'type-u':       'Cable Tray Tipe U',
    'type-w':       'Cable Tray Tipe W',
    'heavy-duty':   'Cable Tray Heavy Duty',
    'cable-ladder': 'Cable Ladder',
    'cover':        'Cover / Tutup',
  };

  const coverRows = [
    ['Lebar',     '100 / 150 / 200 / 300 / 400 / 500 mm'],
    ['Tipe',      'Flat / Dome'],
    ['Tebal',     '1.2 / 1.5 mm'],
    ['Panjang',   '3,000 mm (standard)'],
    ['Material',  'SGCC JIS G3302'],
    ['Finishing', 'Hot-Dip Galvanized Z275'],
    ['Standar',   'Sesuai dimensi tray'],
  ];

  // Lazy-init 3D scene once on first drawer open
  let drawerScene = null;

  // Filter tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      grid.querySelectorAll('.cat-card').forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          setTimeout(() => card.classList.add('visible'), 30);
        } else {
          card.classList.add('hidden');
          card.classList.remove('visible');
        }
      });
    });
  });

  // Open drawer on "Lihat Spesifikasi"
  grid.addEventListener('click', e => {
    const btn = e.target.closest('.cat-detail-btn');
    if (!btn) return;
    openDrawer(btn.dataset.product);
  });

  function openDrawer(productId) {
    const spec = productSpecs[productId];
    drawerTitle.textContent = productNames[productId] || productId;
    drawerWa.href = `https://wa.me/6285811157844?text=${waMessages[productId] || ''}`;

    // Spec table with stagger animation
    drawerTbody.innerHTML = '';
    const rows = spec
      ? spec.rows.map(row => [paramLabels[row.param] || row.param, row.value])
      : coverRows;
    rows.forEach(([label, val]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${label}</td><td>${val}</td>`;
      drawerTbody.appendChild(tr);
    });

    // Open drawer first so canvas has layout dimensions
    overlay.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

      // 3D scene — lazy init once, then just load product
      requestAnimationFrame(() => {
        if (!drawerScene) {
          drawerScene = initProductScene(drawerCanvas);
        }
        drawerScene.loadProduct(productId);

      // Animate table rows after open
      const trs = drawerTbody.querySelectorAll('tr');
      trs.forEach(r => { r.style.opacity = '0'; r.style.transform = 'translateX(-10px)'; });
      animate(trs, {
        opacity: [0, 1],
        translateX: [-10, 0],
        duration: 300,
        delay: stagger(35),
        ease: 'outCubic',
      });
    });
  }

  function closeDrawer() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  drawerClose && drawerClose.addEventListener('click', closeDrawer);
  overlay && overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // Scroll-in animation
  const cards = grid.querySelectorAll('.cat-card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  cards.forEach(card => io.observe(card));
})();

// ── CATALOG MOBILE SLIDER ─────────────────────────────────
(function initCatalogSlider() {
  const grid = document.getElementById('catalog-grid');
  const nav  = document.getElementById('cat-slider-nav');
  const btnPrev = document.getElementById('cat-prev');
  const btnNext = document.getElementById('cat-next');
  if (!grid || !nav || !btnPrev || !btnNext) return;

  function isMobile() { return window.innerWidth < 768; }

  function visibleCards() {
    return [...grid.querySelectorAll('.cat-card')].filter(c => !c.classList.contains('hidden'));
  }

  function currentIndex() {
    const cards = visibleCards();
    if (!cards.length) return 0;
    const cardW = cards[0].offsetWidth;
    if (cardW === 0) return 0;
    return Math.round(grid.scrollLeft / cardW);
  }

  function scrollTo(idx) {
    const cards = visibleCards();
    if (!cards.length) return;
    const cardW = cards[0].offsetWidth;
    grid.scrollTo({ left: idx * cardW, behavior: 'smooth' });
  }

  function updateButtons() {
    if (!isMobile()) return;
    const idx = currentIndex();
    const total = visibleCards().length;
    btnPrev.disabled = idx <= 0;
    btnNext.disabled = idx >= total - 1;
  }

  function show() {
    if (isMobile()) {
      nav.style.display = 'flex';
      updateButtons();
    } else {
      nav.style.display = 'none';
    }
  }

  btnPrev.addEventListener('click', () => scrollTo(currentIndex() - 1));
  btnNext.addEventListener('click', () => scrollTo(currentIndex() + 1));
  grid.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', show);

  // Rebuild on filter tab change
  document.querySelectorAll('.catalog-tab').forEach(tab => {
    tab.addEventListener('click', () => setTimeout(() => { grid.scrollTo({ left: 0 }); show(); }, 50));
  });

  show();
})();

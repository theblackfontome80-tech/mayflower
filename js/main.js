/* Fleuriste May Flower — interactions
   Aucune dépendance. Tout fonctionne aussi sans JavaScript (liens, ancres, images). */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Les photos de la galerie se dévoilent en rideau, en alternant les délais par colonne
  $$('.g-col').forEach((col, c) => $$('.g-open', col).forEach((btn) => {
    btn.classList.add('img-reveal');
    if (c % 2) btn.dataset.delay = '';
  }));

  /* ---------- En-tête : état au défilement + barre d'actions mobile ---------- */
  const header = $('[data-header]');
  const actionBar = $('.action-bar');
  const hero = $('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    if (actionBar && hero) actionBar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = $('[data-menu-toggle]');
  const setMenu = (open) => {
    document.documentElement.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', toggle).textContent = open ? 'Fermer le menu' : 'Ouvrir le menu';
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('#menu a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ---------- Lien de navigation actif ---------- */
  const navLinks = $$('.main-nav a[href^="#"]');
  const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const navObs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navObs.observe(s));
  }

  /* ---------- Apparitions discrètes ---------- */
  const reveals = $$('.reveal, .img-reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    // Une image masquée par clip-path n'est jamais « visible » pour l'observateur :
    // on observe donc son parent, puis on dévoile l'image.
    const targets = new Map();
    reveals.forEach((el) => {
      const watched = el.classList.contains('img-reveal') ? el.parentElement : el;
      if (!targets.has(watched)) targets.set(watched, []);
      targets.get(watched).push(el);
    });
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        targets.get(entry.target).forEach((el) => el.classList.add('is-visible'));
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((_, watched) => obs.observe(watched));
  }

  /* ---------- Créations : aperçu au survol ---------- */
  const previewImgs = $$('.preview-img');
  const previewCaption = $('[data-preview-caption]');
  const creations = $$('[data-open-cat]');
  let activeLayer = 0;
  const showPreview = (btn) => {
    creations.forEach((b) => b.classList.toggle('is-active', b === btn));
    const src = btn.dataset.preview;
    const current = previewImgs[activeLayer];
    if (!src || current.getAttribute('src') === src) return;
    const next = previewImgs[1 - activeLayer];
    next.onload = () => {
      next.classList.add('is-active');
      current.classList.remove('is-active');
      activeLayer = 1 - activeLayer;
    };
    next.src = src;
    if (previewCaption) previewCaption.textContent = btn.dataset.previewCaption || '';
  };
  creations.forEach((btn) => {
    btn.addEventListener('mouseenter', () => showPreview(btn));
    btn.addEventListener('focus', () => showPreview(btn));
  });
  if (creations[0]) creations[0].classList.add('is-active');

  /* ---------- Visionneuse ---------- */
  const lb = $('[data-lightbox]');
  const lbImg = $('[data-lb-img]');
  const lbCaption = $('[data-lb-caption]');
  const lbCount = $('[data-lb-count]');
  const lbPrev = $('[data-lb-prev]');
  const lbNext = $('[data-lb-next]');
  const items = $$('.g-item').map((fig) => {
    const btn = $('.g-open', fig);
    const img = $('img', fig);
    return {
      fig, btn,
      full: btn.dataset.full,
      alt: img.alt,
      caption: ($('figcaption', fig) || {}).textContent || '',
      cats: (fig.dataset.cats || '').split(/\s+/),
    };
  });
  let set = items;
  let index = 0;
  let opener = null;

  const render = () => {
    const item = set[index];
    lbImg.classList.add('is-loading');
    lbImg.onload = () => lbImg.classList.remove('is-loading');
    lbImg.src = item.full;
    lbImg.alt = item.alt;
    lbCaption.textContent = item.caption;
    lbCount.textContent = `${index + 1} / ${set.length}`;
    const single = set.length < 2;
    lbPrev.hidden = single;
    lbNext.hidden = single;
    // Précharge la suivante
    if (!single) { const pre = new Image(); pre.src = set[(index + 1) % set.length].full; }
  };
  const open = (list, i, trigger) => {
    set = list; index = i; opener = trigger || document.activeElement;
    render();
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
    document.documentElement.style.overflow = 'hidden';
  };
  const close = () => { if (lb.open) lb.close(); };
  const step = (d) => { index = (index + d + set.length) % set.length; render(); };

  lb.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    lbImg.removeAttribute('src');
    if (opener && opener.focus) opener.focus();
  });
  items.forEach((item, i) => item.btn.addEventListener('click', () => open(items, i, item.btn)));
  creations.forEach((btn) => btn.addEventListener('click', () => {
    const cat = btn.dataset.openCat;
    const list = items.filter((it) => it.cats.includes(cat));
    if (list.length) open(list, 0, btn);
  }));
  lbPrev.addEventListener('click', () => step(-1));
  lbNext.addEventListener('click', () => step(1));
  $('[data-lb-close]').addEventListener('click', close);
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  // Balayage tactile
  let touchX = null;
  lb.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50 && set.length > 1) step(dx < 0 ? 1 : -1);
    touchX = null;
  }, { passive: true });

  /* ---------- Horaires : jour courant et statut (heure de Tunis) ---------- */
  const OPEN = 7 * 60 + 30;  // 7h30
  const CLOSE = 21 * 60;     // 21h00
  const status = $('[data-open-status]');
  const updateHours = () => {
    let day, minutes;
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Tunis', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
      }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      minutes = Number(get('hour')) * 60 + Number(get('minute'));
    } catch {
      const d = new Date(); day = d.getDay(); minutes = d.getHours() * 60 + d.getMinutes();
    }
    $$('[data-hours] tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === day));
    if (!status) return;
    const isOpen = minutes >= OPEN && minutes < CLOSE;
    status.classList.toggle('is-open', isOpen);
    status.classList.toggle('is-closed', !isOpen);
    if (isOpen) {
      status.textContent = CLOSE - minutes <= 60 ? 'Ouvert · ferme bientôt (21h00)' : 'Ouvert maintenant · jusqu’à 21h00';
    } else {
      status.textContent = 'Fermé · ouvre à 7h30';
    }
  };
  updateHours();
  setInterval(updateHours, 60 * 1000);

  /* ---------- Bandeau photo : boucle infinie + ouverture dans la visionneuse ---------- */
  const ribbon = $('[data-ribbon]');
  if (ribbon) {
    const originals = $$(':scope > li', ribbon);
    if (!reduceMotion) {
      originals.forEach((li) => {
        const clone = li.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        $$('button', clone).forEach((b) => { b.tabIndex = -1; });
        ribbon.appendChild(clone);
      });
      const setGap = () => {
        const gap = parseFloat(getComputedStyle(ribbon).columnGap) || 0;
        ribbon.style.setProperty('--ribbon-gap', `${gap / 2}px`);
      };
      setGap();
      window.addEventListener('resize', setGap);
    }
    ribbon.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-full]');
      if (!btn) return;
      const i = items.findIndex((it) => it.full === btn.dataset.full);
      if (i > -1) open(items, i, btn);
    });
  }

  /* ---------- Diaporama du hero ---------- */
  const show = $('[data-slideshow]');
  if (show) {
    const SLIDE_MS = 5500;
    const slides = $$('.hero-slide', show);
    const insets = $$('.inset-slide');
    const num = $('[data-slide-num]', show);
    const bar = $('[data-slide-bar]', show);
    const pauseBtn = $('[data-slide-pause]', show);
    const caption = $('[data-hero-caption]');
    const pad = (n) => String(n).padStart(2, '0');
    $('[data-slide-total]', show).textContent = pad(slides.length);
    show.style.setProperty('--slide-ms', `${SLIDE_MS}ms`);

    let cur = 0;
    let insetCur = 0;
    let timer = null;
    let paused = reduceMotion;
    let inView = true;

    // Chargement différé des images suivantes, une fois la page chargée
    const loadDeferred = () => $$('img[data-src]').forEach((img) => {
      if (img.closest('[data-slideshow], [data-inset]')) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
    });
    if (document.readyState === 'complete') loadDeferred(); else window.addEventListener('load', loadDeferred);

    const restartBar = () => {
      bar.classList.remove('is-running');
      void bar.offsetWidth; // relance l'animation CSS
      if (!paused) bar.classList.add('is-running');
    };
    const go = (n) => {
      const next = (n + slides.length) % slides.length;
      const img = slides[next];
      if (!img.complete || !img.naturalWidth) { schedule(1200); return; } // pas encore chargée : on patiente
      slides[cur].classList.remove('is-active');
      img.classList.add('is-active');
      cur = next;
      num.textContent = pad(cur + 1);
      if (caption) {
        caption.classList.add('is-changing');
        setTimeout(() => { caption.textContent = img.dataset.caption || ''; caption.classList.remove('is-changing'); }, 450);
      }
      // La vignette change une fois sur deux, en décalé
      if (insets.length > 1 && cur % 2 === 1) {
        const ni = (insetCur + 1) % insets.length;
        if (insets[ni].complete && insets[ni].naturalWidth) {
          insets[insetCur].classList.remove('is-active');
          insets[ni].classList.add('is-active');
          insetCur = ni;
        }
      }
      restartBar();
      schedule(SLIDE_MS);
    };
    function schedule(ms) {
      clearTimeout(timer);
      if (!paused && inView && !document.hidden) timer = setTimeout(() => go(cur + 1), ms);
    }
    const setPaused = (p) => {
      paused = p;
      show.classList.toggle('is-paused', p);
      pauseBtn.setAttribute('aria-label', p ? 'Relancer le diaporama' : 'Mettre le diaporama en pause');
      pauseBtn.textContent = p ? '▶' : '❚❚';
      if (p) { clearTimeout(timer); bar.classList.remove('is-running'); } else { restartBar(); schedule(SLIDE_MS); }
    };
    pauseBtn.addEventListener('click', () => setPaused(!paused));
    document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : schedule(SLIDE_MS)));
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        inView = e.isIntersecting;
        if (inView) { restartBar(); schedule(SLIDE_MS); } else clearTimeout(timer);
      }).observe(show);
    }
    // Balayage tactile sur le diaporama
    let sx = null;
    show.addEventListener('touchstart', (e) => { sx = e.changedTouches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });

    setPaused(paused);
  }

  /* ---------- Parallaxe douce des photos ---------- */
  if (!reduceMotion) {
    const frames = $$('.univers-shop, .univers-detail, .livraison-media, .hero-inset');
    frames.forEach((f) => f.classList.add('has-parallax'));
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      frames.forEach((f) => {
        const r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2); // -1 … 1
        const shift = Math.max(-1, Math.min(1, progress)) * -30;
        $$('img', f).forEach((img) => { img.style.translate = `0 ${shift.toFixed(1)}px`; });
      });
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Galerie : sur mobile, le titre passe avant les photos ---------- */
  const gIntro = $('.g-intro');
  const gallery = $('[data-gallery]');
  if (gIntro && gallery) {
    const home = gIntro.parentElement;
    const mq = window.matchMedia('(max-width: 700px)');
    const place = () => {
      if (mq.matches) gallery.before(gIntro);
      else home.prepend(gIntro);
    };
    place();
    mq.addEventListener('change', place);
  }

  /* ---------- Année du pied de page ---------- */
  const year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();

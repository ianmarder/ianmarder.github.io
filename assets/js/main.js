async function includeHTML() {
  const elements = document.querySelectorAll('[data-include]');

  for (const el of elements) {
    const file = el.getAttribute('data-include');

    try {
      const response = await fetch(file);
      if (response.ok) {
        const content = await response.text();
        el.innerHTML = content;

        if (file.includes('header')) {
          setupNav();
          setActiveNav();
        }

        if (file.includes('footer')) {
          const yearEl = document.getElementById('year');
          if (yearEl) yearEl.textContent = new Date().getFullYear();
          initCopyEmail();
        }

        if (file.includes('project-nav')) {
          const path = window.location.pathname;
          document.querySelectorAll('.project-pill').forEach(pill => {
            if (pill.getAttribute('href') === path) {
              pill.classList.add('active');
            }
          });
        }
      }
    } catch (err) {
      console.error("Fetch failed for:", file, err);
    }
  }
}

// 1. Copy Email to Clipboard
function initCopyEmail() {
  const emailBtns = document.querySelectorAll('.footer-btn, .header-btn');
  if (emailBtns.length === 0) return;

  emailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      const email = "hellothere@ianmarder.com";
      navigator.clipboard.writeText(email).then(() => {
        const originalText = btn.textContent;

        btn.textContent = "Email Copied!";
        btn.style.backgroundColor = "#01CB84";
        btn.style.color = "#0b1120";

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = "";
          btn.style.color = "";
        }, 2000);
      }).catch(() => {
        window.location.href = "mailto:hellothere@ianmarder.com";
      });
    });
  });
}

// 2. Navigation — mobile toggle
function setupNav() {
  const menu = document.querySelector('#mobile-menu');
  const navLinks = document.querySelector('.nav-menu');

  if (menu && navLinks) {
    menu.addEventListener('click', () => {
      menu.classList.toggle('is-active');
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('is-active');
        navLinks.classList.remove('active');
      });
    });
  }
}

// 3. Navigation — highlight active page
function setActiveNav() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-menu a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto')) return;

    if (href === '/' && path === '/') {
      link.classList.add('active');
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
    }
  });
}

// 4. Scroll animation observer
function initObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay;
        if (delay) el.style.setProperty("--delay", delay + "ms");
        el.classList.add("is-visible");
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// 5. Hero blob
function initBlob() {
  const canvas = document.getElementById('blob-canvas');
  if (!canvas) return;
  const ctx  = canvas.getContext('2d');
  const hero = canvas.parentElement;

  const BLUES      = ['#0b5f80','#1d6f91','#23458f','#05080f','#05080f','#05080f','#1b3878','#050f1f','#0b5f80','#1d6f91','#23458f','#23458f'];
  const WAVE_COLS  = 16;
  const WAVE_AMP   = 32;
  const WAVE_SPEED = 0.002;
  let t = 0;

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  function makeGradient(H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H * 3);
    BLUES.forEach((c, i) => grad.addColorStop(i / (BLUES.length - 1), c));
    return grad;
  }

  function buildWave(W, H) {
    const RADIUS  = 0;
    const bLeft   = 0;
    const bRight  = W + 2;
    const bBottom = H + 2;
    const waveMid = H * 0.32;
    const cols    = WAVE_COLS + 2;
    const pts     = [];

    for (let i = 0; i <= cols; i++) {
      const px = bLeft + (i / cols) * (bRight - bLeft);
      const p1 = (i / cols) * Math.PI * 3   - t * Math.PI * 2;
      const p2 = (i / cols) * Math.PI * 1.7 - t * Math.PI * 2 * 0.6;
      const p3 = (i / cols) * Math.PI * 5   - t * Math.PI * 2 * 1.4;
      const wave = Math.sin(p1)*WAVE_AMP + Math.sin(p2)*WAVE_AMP*0.4 + Math.sin(p3)*WAVE_AMP*0.18;
      pts.push([px, waveMid + wave]);
    }

    ctx.beginPath();
    ctx.moveTo(bLeft + RADIUS, bBottom);
    ctx.lineTo(bRight - RADIUS, bBottom);
    ctx.arcTo(bRight, bBottom, bRight, bBottom - RADIUS, RADIUS);
    ctx.lineTo(bRight, pts[pts.length - 1][1]);

    for (let i = pts.length - 1; i > 0; i--) {
      const [x1, y1] = pts[i];
      const [x0, y0] = pts[i - 1];
      ctx.quadraticCurveTo(x1, y1, (x0 + x1) / 2, (y0 + y1) / 2);
    }

    ctx.lineTo(pts[0][0], pts[0][1]);
    ctx.lineTo(bLeft, bBottom - RADIUS);
    ctx.arcTo(bLeft, bBottom, bLeft + RADIUS, bBottom, RADIUS);
    ctx.closePath();
  }

  function loop() {
    resize();
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    buildWave(W, H);
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = makeGradient(H);
    ctx.fill();
    ctx.globalAlpha = 1;
    t += WAVE_SPEED;
    requestAnimationFrame(loop);
  }

  loop();
}

// 6. Ken Burns Slideshow (only runs if slides exist)
let slideIndex = 0;
function showSlides() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;

  const currentActive = document.querySelector(".slide.active");
  slideIndex = (slideIndex % slides.length) + 1;
  if (currentActive) currentActive.classList.remove("active");
  slides[slideIndex - 1].classList.add("active");
  setTimeout(showSlides, 7000);
}

// 7. Lightbox — init fslightbox on all placeholder images
function initLightbox() {
  document.querySelectorAll('.placeholder img').forEach((img) => {
    if (img.parentElement.tagName === 'A') return;

    const a = document.createElement('a');

    if (img.hasAttribute('data-no-lightbox')) {
      a.href = img.getAttribute('data-href') || img.src;
      a.target = '_blank';
    } else {
      a.href = img.src;
      a.setAttribute('data-fslightbox', 'gallery');
      if (img.alt) a.setAttribute('data-caption', img.alt);
      a.addEventListener('click', startCaptionPoll);
    }

    if (img.style.cssText) {
      a.style.cssText = img.style.cssText;
      img.style.cssText = 'cursor: zoom-in;';
    }

    img.parentNode.insertBefore(a, img);
    a.appendChild(img);

    img.style.cursor = img.hasAttribute('data-no-lightbox') ? 'pointer' : 'zoom-in';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.objectPosition = 'center';
  });

  refreshFsLightbox();
}

// 8. Lightbox captions — pulls alt text into a caption when fslightbox is open
let fsCaptionEl = null;
let captionPollTimer = null;
let captionLastIndex = null;

function ensureCaptionEl() {
  fsCaptionEl = document.getElementById('fs-caption');
  if (!fsCaptionEl) {
    fsCaptionEl = document.createElement('div');
    fsCaptionEl.id = 'fs-caption';
    document.body.appendChild(fsCaptionEl);
  }
}

function pollCaption() {
  const inst = window.fsLightboxInstances && window.fsLightboxInstances['gallery'];
  const isOpen = document.querySelector('.fslightbox-container');

  if (!inst || !isOpen) {
    if (captionPollTimer) { clearInterval(captionPollTimer); captionPollTimer = null; }
    if (fsCaptionEl) fsCaptionEl.textContent = '';
    captionLastIndex = null;
    return;
  }

  const idx = inst.stageIndexes.current;
  if (idx !== captionLastIndex) {
    captionLastIndex = idx;
    ensureCaptionEl();
    const anchorEl = inst.elements.a[idx];
    fsCaptionEl.textContent = anchorEl ? (anchorEl.getAttribute('data-caption') || '') : '';
  }
}

function startCaptionPoll() {
  ensureCaptionEl();
  captionLastIndex = null;
  if (!captionPollTimer) captionPollTimer = setInterval(pollCaption, 100);
  setTimeout(pollCaption, 50);
}

// 9. AC ID card slideshow
function initIdSlideshow() {
  const slides = document.querySelectorAll('.ac-id-slide');
  if (slides.length === 0) return;
  let idx = 0;
  setInterval(() => {
    slides[idx].classList.remove('active');
    idx = (idx + 1) % slides.length;
    slides[idx].classList.add('active');
  }, 3000);
}

// 10. Brand switcher — swaps a bento grid's images between client variants.
// Images use data-slot; non-default brands load from {data-brand-path}{brand}-{slot}.jpg
function initBrandSwitcher() {
  const grid    = document.querySelector('[data-brand-grid]');
  const buttons = document.querySelectorAll('.brand-switcher [data-brand]');
  if (!grid || buttons.length === 0) return;

  const path   = grid.dataset.brandPath;
  const imgs   = Array.from(grid.querySelectorAll('img[data-slot]'));
  const brands = Array.from(buttons).map(b => b.dataset.brand);
  const defaultBrand = brands[0];

  const CYCLE_MS   = 4500;
  const FADE_MS    = 250;
  const STAGGER_MS = 70;

  let current  = defaultBrand;
  let swapId   = 0;
  let auto     = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let inView   = false;
  let hovering = false;

  imgs.forEach(img => {
    img.dataset.defaultSrc = img.getAttribute('src');
    img.dataset.defaultAlt = img.alt;
    img.style.transition = `opacity ${FADE_MS}ms ease`;
  });

  function srcFor(brand, img) {
    return brand === defaultBrand ? img.dataset.defaultSrc : `${path}${brand}-${img.dataset.slot}.jpg`;
  }

  function preload(srcs) {
    return Promise.all(srcs.map(src => new Promise(resolve => {
      const im = new Image();
      im.onload = im.onerror = resolve;
      im.src = src;
    })));
  }

  function show(brand) {
    if (brand === current) return;
    current = brand;
    const id = ++swapId;

    buttons.forEach(b => {
      const on = b.dataset.brand === brand;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', on);
    });

    const label = Array.from(buttons).find(b => b.dataset.brand === brand).textContent;

    preload(imgs.map(img => srcFor(brand, img))).then(() => {
      if (id !== swapId) return;
      imgs.forEach((img, i) => {
        setTimeout(() => {
          if (id !== swapId) return;
          img.style.opacity = 0;
          setTimeout(() => {
            if (id !== swapId) return;
            const src = srcFor(brand, img);
            const alt = brand === defaultBrand ? img.dataset.defaultAlt : `${label} ${img.dataset.label}`;
            img.src = src;
            img.alt = alt;
            const a = img.closest('a');
            if (a) {
              a.href = src;
              a.setAttribute('data-caption', alt);
            }
            img.style.opacity = 1;
            if (i === imgs.length - 1 && typeof refreshFsLightbox === 'function') refreshFsLightbox();
          }, FADE_MS);
        }, i * STAGGER_MS);
      });
    });
  }

  buttons.forEach(b => b.addEventListener('click', () => {
    auto = false;
    show(b.dataset.brand);
  }));

  // Auto-cycle only while visible, not hovered, and no lightbox is open
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; }, { threshold: 0.3 }).observe(grid);
  grid.addEventListener('mouseenter', () => { hovering = true; });
  grid.addEventListener('mouseleave', () => { hovering = false; });

  setInterval(() => {
    if (!auto || !inView || hovering || document.hidden) return;
    if (document.querySelector('.fslightbox-container')) return;
    show(brands[(brands.indexOf(current) + 1) % brands.length]);
  }, CYCLE_MS);
}

// 11. Preloader — wave recession on first visit
function initPreloader() {
  if (sessionStorage.getItem('visited')) return;
  sessionStorage.setItem('visited', '1');

  const BLUES     = ['#0b5f80','#1d6f91','#23458f','#041f2b','#1b3878','#050f1f','#0b5f80','#1d6f91','#23458f'];
  const WAVE_AMP  = 32;
  const WAVE_COLS = 16;

  const HOLD_END  = 1000;
  const LOGO_FADE = 200;
  const RECV_END  = 2000;
  const FADE_END  = 1600;

  const cv = document.createElement('canvas');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:9999;pointer-events:none;';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');

  const logo = new Image();
  logo.src = '/assets/images/logos/IM-logo-white.svg';

  let t     = 0;
  let start = null;

  function easeOutExpo(x) {
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
  }

  function makeGradient(H) {
    const grad = ctx.createLinearGradient(0, 0, 0, H * 3);
    BLUES.forEach((c, i) => grad.addColorStop(i / (BLUES.length - 1), c));
    return grad;
  }

  function drawFullScreen(W, H) {
    ctx.fillStyle = makeGradient(H);
    ctx.fillRect(0, 0, W, H);
  }

  function drawWave(W, H, waveTop) {
    const cols = WAVE_COLS + 2;
    const pts  = [];
    for (let i = 0; i <= cols; i++) {
      const px   = (i / cols) * W;
      const p1   = (i / cols) * Math.PI * 3   - t * Math.PI * 2;
      const p2   = (i / cols) * Math.PI * 1.7 - t * Math.PI * 2 * 0.6;
      const p3   = (i / cols) * Math.PI * 5   - t * Math.PI * 2 * 1.4;
      const wave = Math.sin(p1)*WAVE_AMP + Math.sin(p2)*WAVE_AMP*0.4 + Math.sin(p3)*WAVE_AMP*0.18;
      pts.push([px, waveTop + wave]);
    }

    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(W, H);
    ctx.lineTo(W, pts[pts.length - 1][1]);
    for (let i = pts.length - 1; i > 0; i--) {
      const [x1, y1] = pts[i];
      const [x0, y0] = pts[i - 1];
      ctx.quadraticCurveTo(x1, y1, (x0 + x1) / 2, (y0 + y1) / 2);
    }
    ctx.lineTo(0, pts[0][1]);
    ctx.closePath();
    ctx.fillStyle = makeGradient(H);
    ctx.fill();
  }

  function draw(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;

    const W = window.innerWidth;
    const H = window.innerHeight;
    cv.width  = W;
    cv.height = H;
    ctx.clearRect(0, 0, W, H);

    if (elapsed < HOLD_END) {
      drawFullScreen(W, H);

      const logoAlpha = Math.min(elapsed / LOGO_FADE, 1);
      if (logo.complete && logoAlpha > 0) {
        const logoH = Math.min(H * 0.08, 60);
        const logoW = logoH * (logo.naturalWidth / logo.naturalHeight);
        ctx.globalAlpha = logoAlpha;
        ctx.filter = 'brightness(0) invert(1)';
        ctx.drawImage(logo, (W - logoW) / 2, (H - logoH) / 2, logoW, logoH);
        ctx.filter = 'none';
        ctx.globalAlpha = 1;
      }

    } else if (elapsed < RECV_END) {
      const recvProgress = (elapsed - HOLD_END) / (RECV_END - HOLD_END);
      const eased   = easeOutExpo(recvProgress);
      const waveTop = eased * (H + WAVE_AMP * 2);
      drawWave(W, H, waveTop);

    } else if (elapsed < FADE_END) {
      const fadeProgress = (elapsed - RECV_END) / (FADE_END - RECV_END);
      ctx.globalAlpha = 1 - fadeProgress;
      drawWave(W, H, H + WAVE_AMP * 2);
      ctx.globalAlpha = 1;
    }

    t += 0.008;

    if (elapsed < FADE_END) {
      requestAnimationFrame(draw);
    } else {
      document.body.removeChild(cv);
    }
  }

  requestAnimationFrame(draw);
}

// 12. Initialize All
document.addEventListener('DOMContentLoaded', async () => {
  initPreloader();
  await includeHTML();
  initObserver();
  initBlob();
  initLightbox();
  initIdSlideshow();
  initBrandSwitcher();
  showSlides();
});
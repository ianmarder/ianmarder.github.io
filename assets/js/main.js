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

  const BLUES      = ['#14AAE1','#7CD4F4','#427df2','#07374B','#3166d6','#0a1f3d','#14AAE1','#7CD4F4','#427df2'];
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
    ctx.globalAlpha = 0.10;
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
      // Link out to doc instead of lightbox
      a.href = img.getAttribute('data-href') || img.src;
      a.target = '_blank';
    } else {
      a.href = img.src;
      a.setAttribute('data-fslightbox', 'gallery');
    }

    // Transfer inline styles from img to a
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

// 8. Initialize All
document.addEventListener('DOMContentLoaded', async () => {
  await includeHTML();
  initObserver();
  initBlob();
  initLightbox();
  showSlides();
});
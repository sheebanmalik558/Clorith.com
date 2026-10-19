/* ============================================================
   CORLITH — Main interactions
   - Custom cursor
   - Lenis smooth scrolling
   - Preloader
   - GSAP + ScrollTrigger animations
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* ----------------------------------------------------------
   1. CUSTOM CURSOR
   ---------------------------------------------------------- */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (!cursor || !dot) return;

  let cx = 0, cy = 0, dx = 0, dy = 0;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX; cy = e.clientY;
    gsap.to(dot, { x: cx, y: cy, duration: 0.05, ease: 'power3.out' });
  });

  function loop() {
    dx += (cx - dx) * 0.18;
    dy += (cy - dy) * 0.18;
    cursor.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.querySelectorAll('[data-cursor="hover"]').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  // Hide on touch devices
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    dot.style.display = 'none';
    document.body.style.cursor = 'auto';
  }
})();

/* ----------------------------------------------------------
   2. LENIS SMOOTH SCROLL
   ---------------------------------------------------------- */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

/* Anchor links → smooth scroll */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -50 });
      }
    }
  });
});

/* ----------------------------------------------------------
   3. PRELOADER
   ---------------------------------------------------------- */
(function initPreloader() {
  const preloader = document.getElementById('preloader');
  const countEl = document.getElementById('preloaderCount');
  const barEl = document.getElementById('preloaderBar');
  if (!preloader) return;

  let progress = 0;
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    // ease out cubic
    const eased = 1 - Math.pow(1 - t, 3);
    progress = Math.floor(eased * 100);
    countEl.textContent = progress;
    barEl.style.width = progress + '%';
    if (t < 1) requestAnimationFrame(tick);
    else finish();
  }

  function finish() {
    countEl.textContent = 100;
    barEl.style.width = '100%';
    const tl = gsap.timeline({
      onComplete: () => { preloader.style.display = 'none'; playIntro(); }
    });
    tl.to(preloader.querySelector('.preloader__count'), {
      y: -80, opacity: 0, duration: 0.6, ease: 'power3.in'
    }, 0.2);
    tl.to(preloader.querySelector('.preloader__bar'), {
      scaleX: 0, duration: 0.6, ease: 'power3.in'
    }, 0.2);
    tl.to(preloader.querySelector('.preloader__label'), {
      y: 40, opacity: 0, duration: 0.6, ease: 'power3.in'
    }, 0.2);
    tl.to(preloader, {
      yPercent: -100, duration: 1.1, ease: 'power4.inOut'
    }, 0.5);
  }

  requestAnimationFrame(tick);
})();

/* ----------------------------------------------------------
   4. HERO INTRO ANIMATION (plays after preloader)
   ---------------------------------------------------------- */
function playIntro() {
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to('.hero__title .line > span', {
    y: 0, duration: 1.2, stagger: 0.08
  });
  tl.to('.hero__tag', { opacity: 1, y: 0, duration: 0.8 }, '-=0.7');
  tl.to('.hero__sub', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
  tl.to('.hero__actions', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6');
  tl.to('.hero__meta-item', {
    opacity: 1, y: 0, duration: 0.8, stagger: 0.1
  }, '-=0.6');
}

/* Set initial state for hero */
gsap.set('.hero__title .line > span', { y: '110%' });
gsap.set('.hero__tag', { opacity: 0, y: 20 });
gsap.set('.hero__sub', { opacity: 0, y: 20 });
gsap.set('.hero__actions', { opacity: 0, y: 20 });
gsap.set('.hero__meta-item', { opacity: 0, y: 20 });

/* ----------------------------------------------------------
   5. SCROLL-TRIGGERED ANIMATIONS
   ---------------------------------------------------------- */

/* Eyebrow + section title reveal */
gsap.utils.toArray('.section__head').forEach(head => {
  const eyebrow = head.querySelector('.eyebrow');
  const title = head.querySelector('.section__title');

  gsap.set(eyebrow, { y: 30, opacity: 0 });

  if (title && !title.dataset.split) {
    title.dataset.split = '1';
    // Replace <em>X</em> with a placeholder token, split, then restore
    const tokens = [];
    const html = title.innerHTML
      .replace(/<em>(.*?)<\/em>/g, (m, inner) => {
        const t = `__EM${tokens.length}__`;
        tokens.push(inner);
        return t;
      })
      .split(/<br\s*\/?>/i);

    title.innerHTML = html.map(line =>
      line.split(/(\s+)/).map(w => {
        const emMatch = w.match(/^__EM(\d+)__$/);
        if (emMatch) {
          const inner = tokens[parseInt(emMatch[1], 10)];
          return `<span class="word"><span><em>${inner}</em></span></span>`;
        }
        if (!w.trim()) return w;
        if (w.includes('__EM')) {
          // line was just a single em token (handled above normally)
          return w;
        }
        return `<span class="word"><span>${w}</span></span>`;
      }).join('')
    ).join('<br/>');
  }

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: head,
      start: 'top 80%',
      toggleActions: 'play none none reverse'
    }
  });
  tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
  if (title) {
    gsap.set(title.querySelectorAll('.word > span'), { y: '110%' });
    tl.to(title.querySelectorAll('.word > span'), {
      y: 0, duration: 0.9, stagger: 0.04, ease: 'power4.out'
    }, '-=0.5');
  }
});

/* About pillars */
gsap.utils.toArray('.pillar').forEach((p, i) => {
  gsap.from(p, {
    y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: p, start: 'top 85%' },
    delay: i * 0.1
  });
});

/* Stat numbers count up */
gsap.utils.toArray('.stat').forEach(stat => {
  const numEl = stat.querySelector('.stat__num');
  const target = parseFloat(numEl.dataset.count);
  const isDecimal = target % 1 !== 0;
  ScrollTrigger.create({
    trigger: stat,
    start: 'top 80%',
    onEnter: () => {
      gsap.fromTo(numEl,
        { innerText: 0 },
        {
          innerText: target,
          duration: 2,
          ease: 'power2.out',
          snap: isDecimal ? { innerText: 0.1 } : { innerText: 1 },
          onUpdate: function () {
            numEl.textContent = isDecimal
              ? parseFloat(numEl.textContent).toFixed(1)
              : Math.floor(parseFloat(numEl.textContent));
          }
        }
      );
    }
  });
});

/* Service rows */
gsap.utils.toArray('.service').forEach((s, i) => {
  gsap.from(s.querySelectorAll('.service__index, h3, p, .service__tags li'), {
    y: 40, opacity: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 80%' }
  });
});

/* Cases */
gsap.utils.toArray('.case').forEach((c, i) => {
  gsap.from(c, {
    y: 80, opacity: 0, duration: 1, ease: 'power3.out',
    scrollTrigger: { trigger: c, start: 'top 85%' }
  });
});

/* Process steps */
gsap.utils.toArray('.step').forEach((s, i) => {
  gsap.from(s, {
    y: 60, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 80%' },
    delay: i * 0.1
  });
});

/* Testimonial */
gsap.from('.testimonial__quote', {
  y: 60, opacity: 0, duration: 1.2, ease: 'power3.out',
  scrollTrigger: { trigger: '.testimonial', start: 'top 75%' }
});
gsap.from('.testimonial__author', {
  y: 30, opacity: 0, duration: 0.8, ease: 'power3.out',
  scrollTrigger: { trigger: '.testimonial', start: 'top 75%' }
});

/* Contact form fields */
gsap.from('.contact__title, .contact__sub, .field, .contact__form button', {
  y: 50, opacity: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
  scrollTrigger: { trigger: '.contact', start: 'top 70%' }
});

/* Footer big text parallax */
gsap.to('.footer__big', {
  y: -80,
  scrollTrigger: {
    trigger: '.footer',
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1
  }
});

/* Marquee speed reacts to scroll velocity */
let lastScroll = 0;
let velocity = 0;
lenis.on('scroll', ({ velocity: v }) => { velocity = v; });
const track = document.getElementById('marqueeTrack');
if (track) {
  gsap.ticker.add(() => {
    const base = 1 + Math.min(velocity * 0.01, 1.5);
    gsap.to(track, { timeScale: base, duration: 0.3, overwrite: 'auto' });
  });
}

/* Refresh ScrollTrigger after fonts load */
window.addEventListener('load', () => { ScrollTrigger.refresh(); });
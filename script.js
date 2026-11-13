/* =====================================================================
   Interacciones del rediseño
   - Navbar: variante glass → sólida al scrollear (+ Autogestión como pestaña)
   - Scroll-spy, barra de progreso, botón "volver arriba"
   - Parallax del hero
   - Reveal al entrar en viewport
   - Tilt 3D en tarjetas de beneficios
   - Lightbox de galería
   - Menú móvil
   ===================================================================== */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const navWrap  = document.getElementById('navWrap');
  const progress = document.getElementById('progress');
  const toTop    = document.getElementById('toTop');
  const heroBg   = document.getElementById('heroBg');
  const hero     = document.getElementById('inicio');
  const burger   = document.getElementById('burger');

  /* ---------- Scroll: navbar, progreso, parallax, volver arriba ---------- */
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const heroH = hero ? hero.offsetHeight : 600;

    navWrap.classList.toggle('is-scrolled', y > 80);
    toTop.classList.toggle('is-visible', y > heroH * 0.8);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    if (!reduceMotion && heroBg && y < heroH) {
      heroBg.style.transform = `translateY(${y * 0.28}px)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Scroll-spy: resalta el link de la sección visible ---------- */
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const spyTargets = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
      });
    }, { rootMargin: '-40% 0px -50% 0px' });
    spyTargets.forEach(t => spy.observe(t));
  }

  /* ---------- Reveal al scrollear ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Tilt 3D en tarjetas de beneficios ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(card => {
      const strength = 9;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateY(-0.5rem)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ---------- Lightbox de galería ---------- */
  const items   = [...document.querySelectorAll('.gal-item')];
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lbImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbSub   = document.getElementById('lbSub');
  let current = 0;

  const show = i => {
    current = (i + items.length) % items.length;
    const fig = items[current];
    const img = fig.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbImg.style.objectPosition = img.style.objectPosition || 'center';
    lbTitle.textContent = fig.querySelector('strong').textContent;
    lbSub.textContent   = fig.querySelector('span').textContent;
  };
  const open = i => {
    show(i);
    lb.hidden = false;
    requestAnimationFrame(() => lb.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => { lb.hidden = true; }, 400);
  };

  items.forEach((fig, i) => {
    fig.addEventListener('click', () => open(i));
    fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', () => show(current - 1));
  document.getElementById('lbNext').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  /* ---------- Menú móvil ---------- */
  burger.addEventListener('click', () => {
    const open = navWrap.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  document.querySelectorAll('.nav__mobile a').forEach(a => a.addEventListener('click', () => {
    navWrap.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- Links placeholder (#) no saltan al tope ---------- */
  document.querySelectorAll('a[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));
})();

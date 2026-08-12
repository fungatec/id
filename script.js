/* ==========================================================================
   FungaTec — Interacciones
   Sin dependencias externas. Todo se degrada con elegancia si algo falla.
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse     = window.matchMedia('(pointer: coarse)').matches; // móvil / táctil

  /* ======================================================================
     1. PANTALLA DE CARGA
     ====================================================================== */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (!loader) return;
    setTimeout(() => loader.classList.add('is-done'), 550);
  });

  /* ======================================================================
     2. FONDO: RED DE MICELIO
     Nodos (esporas) que flotan y se enlazan con hifas cuando están cerca.
     El cursor atrae y enciende la red a su alrededor.
     ====================================================================== */
  function initMycelium() {
    const canvas = document.getElementById('mycelium');
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Lee los colores reales desde las variables CSS, así respeta la paleta de marca
    const css      = getComputedStyle(document.documentElement);
    const primary  = (css.getPropertyValue('--primary') || '#35E08A').trim();
    const accent   = (css.getPropertyValue('--accent')  || '#59E8DA').trim();

    const LINK_DIST   = 128;   // distancia máxima para dibujar una hifa
    const MOUSE_DIST  = 190;   // radio de influencia del cursor
    const pointer     = { x: -9999, y: -9999 };

    let nodes = [], w = 0, h = 0, dpr = 1, raf = null;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Densidad proporcional al área, con techo para no castigar equipos lentos
      const count = Math.min(Math.round((w * h) / 16000), isCoarse ? 45 : 95);
      nodes = Array.from({ length: count }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r:  Math.random() * 1.7 + 0.7
      }));
    }

    function hexToRgb(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return m ? `${parseInt(m[1],16)},${parseInt(m[2],16)},${parseInt(m[3],16)}` : '53,224,138';
    }
    const rgbPrimary = hexToRgb(primary);
    const rgbAccent  = hexToRgb(accent);

    function draw() {
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];

        // Deriva orgánica
        n.x += n.vx;
        n.y += n.vy;

        // Rebote suave en los bordes
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Atracción hacia el cursor
        const dxm = pointer.x - n.x;
        const dym = pointer.y - n.y;
        const dm  = Math.hypot(dxm, dym);
        let boost = 0;
        if (dm < MOUSE_DIST) {
          boost = 1 - dm / MOUSE_DIST;
          n.x += dxm * 0.0016 * boost;
          n.y += dym * 0.0016 * boost;
        }

        // La espora
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + boost * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgbPrimary},${0.22 + boost * 0.65})`;
        ctx.fill();

        // Las hifas hacia los nodos vecinos
        for (let j = i + 1; j < nodes.length; j++) {
          const o  = nodes[j];
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const d  = Math.hypot(dx, dy);
          if (d > LINK_DIST) continue;

          const alpha = (1 - d / LINK_DIST) * (0.1 + boost * 0.5);
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = `rgba(${boost > 0.25 ? rgbAccent : rgbPrimary},${alpha})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    }

    window.addEventListener('pointermove', e => { pointer.x = e.clientX; pointer.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.x = pointer.y = -9999; });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    // Pausa el bucle cuando la pestaña no está visible: no gasta batería
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    });

    resize();
    raf = requestAnimationFrame(draw);
  }

  /* ======================================================================
     3. APARICIÓN AL HACER SCROLL
     ====================================================================== */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (!entry.isIntersecting) return;
        // Pequeño escalonado: los elementos entran en cascada, no de golpe
        setTimeout(() => entry.target.classList.add('is-visible'), i * 85);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    items.forEach(el => io.observe(el));
  }

  /* ======================================================================
     4. BARRA DE PROGRESO DE SCROLL
     ====================================================================== */
  function initProgress() {
    const bar = document.getElementById('progress');
    if (!bar) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
        ticking = false;
      });
    }, { passive: true });
  }

  /* ======================================================================
     5. INCLINACIÓN 3D DE LAS TARJETAS
     ====================================================================== */
  function initTilt() {
    if (reduceMotion || isCoarse) return;

    document.querySelectorAll('.tilt').forEach(card => {
      const glow = card.querySelector('.feature-card__glow');

      card.addEventListener('pointermove', e => {
        const r  = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;   // 0 → 1
        const py = (e.clientY - r.top)  / r.height;

        card.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * 7}deg) rotateY(${(px - 0.5) * 7}deg) translateY(-5px)`;

        if (glow) {
          glow.style.left = `${e.clientX - r.left}px`;
          glow.style.top  = `${e.clientY - r.top}px`;
        }
      });

      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ======================================================================
     6. BOTONES MAGNÉTICOS
     ====================================================================== */
  function initMagnet() {
    if (reduceMotion || isCoarse) return;

    document.querySelectorAll('.magnet').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }

  /* ======================================================================
     7. CONTADOR DE MÉTRICAS
     ====================================================================== */
  function initCounters() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) {
      nums.forEach(el => { el.textContent = el.dataset.count; });
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el     = entry.target;
        const target = parseInt(el.dataset.count, 10) || 0;
        obs.unobserve(el);

        if (reduceMotion) { el.textContent = target; return; }

        const duration = 1500;
        const start    = performance.now();

        (function tick(now) {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.5 });

    nums.forEach(el => io.observe(el));
  }

  /* ======================================================================
     8. COMPARTIR
     Usa el menú nativo del celular; en escritorio copia el enlace.
     ====================================================================== */
  function initShare() {
    const btn   = document.getElementById('shareBtn');
    const toast = document.getElementById('toast');
    if (!btn) return;

    const showToast = msg => {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 2600);
    };

    btn.addEventListener('click', async () => {
      const data = {
        title: 'FungaTec',
        text : 'FungaTec — Biotecnología del reino Fungi',
        url  : window.location.href
      };

      try {
        if (navigator.share) {
          await navigator.share(data);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.url);
          showToast('Enlace copiado ✓');
        } else {
          showToast(data.url);
        }
      } catch (err) {
        // El usuario canceló el menú de compartir: no es un error que mostrar
        if (err && err.name !== 'AbortError') showToast('No se pudo compartir');
      }
    });
  }

  /* ======================================================================
     9. DETALLES
     ====================================================================== */
  function initMisc() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Aviso en consola por si algún enlace sigue sin configurar
    const pending = [...document.querySelectorAll('a[href^="#REEMPLAZAR"]')];
    if (pending.length) {
      console.warn(
        `[FungaTec] Faltan ${pending.length} enlaces por configurar en index.html:`,
        pending.map(a => a.getAttribute('href'))
      );
    }
  }

  /* ====================================================================== */
  function init() {
    initMycelium();
    initReveal();
    initProgress();
    initTilt();
    initMagnet();
    initCounters();
    initShare();
    initMisc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

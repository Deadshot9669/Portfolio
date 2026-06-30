/**
 * Andrea Lombardo Portfolio — main.js
 * ═══════════════════════════════════════════════════════════════
 * Cinematic scroll-driven experience with GSAP + ScrollTrigger
 * Vanilla JS · CSP-safe (no inline handlers)
 * ═══════════════════════════════════════════════════════════════
 */
'use strict';

/* ============================================================
   LANGUAGE — state & strings
   ============================================================ */
var currentLang = 'it';

var TYPEWRITER_STRINGS = {
  it: [
    'Studente · Scienze e Tecnologie Agrarie',
    'Homelab & Self-Hosting Enthusiast',
    'Networking · Docker · Proxmox',
    'Automazione domotica · Home Assistant',
    'Sviluppatore Android & Web',
  ],
  en: [
    'Student · Agricultural Sciences',
    'Homelab & Self-Hosting Enthusiast',
    'Networking · Docker · Proxmox',
    'Home Automation · Home Assistant',
    'Android & Web Developer',
  ],
};

/**
 * Apply a language to the whole page.
 * Reads data-it / data-en attributes and swaps innerHTML.
 */
function applyLang(lang) {
  if (lang !== 'it' && lang !== 'en') return;
  currentLang = lang;

  /* 1. Text nodes */
  document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
    var val = el.getAttribute('data-' + lang);
    if (val !== null) el.innerHTML = val;
  });

  /* 2. Placeholders */
  document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(function (el) {
    el.placeholder = el.getAttribute('data-placeholder-' + lang);
  });

  /* 3. <html lang> */
  document.documentElement.lang = lang;

  /* 4. Dropdown toggle label */
  var toggleFlag = document.getElementById('lang-flag');
  var toggleCode = document.getElementById('lang-code');
  if (toggleFlag) toggleFlag.textContent = lang === 'it' ? '🇮🇹' : '🇬🇧';
  if (toggleCode) toggleCode.textContent = lang.toUpperCase();

  /* 5. Active state */
  document.querySelectorAll('#lang-menu button[data-lang]').forEach(function (btn) {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang') === lang);
  });

  /* 6. Restart typewriter */
  resetTypewriter();
}

/* ============================================================
   BOOT — DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initThemeToggle();
  initDigitalTopography();
  initNavigation();
  initContactForm();
  initPrivacyModal();
  initMobileMenu();
  initLangDropdown();
  initProfilePhoto();
  initTypewriter();
  initScrollProgress();
  initMagneticButtons();
  initHardSkillsCarousel();
  initCyberRoots();
  initAgritechElements();
  initCustomCursor();

  /* Set current year dynamically */
  var yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ── GSAP Animations ────────────────────────────────────────
     Wait for GSAP to be loaded (deferred CDN), then init.
     If GSAP isn't available yet, retry after a short delay.
     ──────────────────────────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initGSAPAnimations();
  } else {
    /* GSAP is loaded defer — wait for it */
    var gsapCheck = setInterval(function () {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        clearInterval(gsapCheck);
        initGSAPAnimations();
      }
    }, 50);
    /* Safety: stop checking after 5 seconds */
    setTimeout(function () { clearInterval(gsapCheck); }, 5000);
  }
});

/* ============================================================
   SCROLL PROGRESS BAR
   Thin neon line at the top showing scroll progress.
   ============================================================ */
function initScrollProgress() {
  var bar = document.getElementById('scroll-progress');
  if (!bar) return;

  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = progress + '%';
  }, { passive: true });
}

/* ============================================================
   MAGNETIC BUTTON EFFECT
   Buttons subtly follow mouse position on hover (desktop only).
   ============================================================ */
function initMagneticButtons() {
  var isTouchDevice = ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isTouchDevice || window.innerWidth < 768) return;

  document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });
}

/* ============================================================
   GSAP + ScrollTrigger — MAIN ANIMATION ENGINE
   ──────────────────────────────────────────────────────────────
   All scroll-driven animations are registered here.
   Uses ScrollTrigger.matchMedia() for responsive behavior.
   ============================================================ */
function initGSAPAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  /* Register ScrollToPlugin for smooth programmatic scrolling */
  if (typeof ScrollToPlugin !== 'undefined') {
    gsap.registerPlugin(ScrollToPlugin);
  }

  /* Force GPU compositing for smoother animations */
  gsap.config({ force3D: true });

  /* ── Default ease for all animations ──────────────────────── */
  gsap.defaults({
    ease: 'power3.out',
    duration: 1,
  });

  /* ── HERO SECTION — entrance animation (not scroll-driven) ── */
  animateHero();

  /* ── ScrollTrigger.matchMedia for responsive ──────────────── */
  ScrollTrigger.matchMedia({

    /* ══ DESKTOP (768px+) ═══════════════════════════════════ */
    '(min-width: 768px)': function () {

      /* ── Profile photo parallax ────────────────────────── */
      gsap.to('#profile-frame', {
        y: -80,
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        }
      });

      /* ── Scroll indicator fade out ─────────────────────── */
      gsap.to('#scroll-indicator', {
        opacity: 0,
        y: 20,
        scrollTrigger: {
          trigger: '#hero',
          start: '15% top',
          end: '30% top',
          scrub: true,
        }
      });

      /* ── Skill cards: 3D tilt on hover (desktop) ───────── */
      initSkillCardTilt();
    },

    /* ══ ALL SCREEN SIZES ═══════════════════════════════════ */
    'all': function () {

      /* ── PROFILO SECTION ────────────────────────────────── */
      animateSection('#profilo');

      /* ── Profile text — scrub opacity ──────────────────── */
      var profileTexts = document.querySelectorAll('#profile-text-block .gsap-fade-up');
      profileTexts.forEach(function (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 1,
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              end: 'top 55%',
              scrub: 0.8,
            }
          }
        );
      });

      /* ── Bento grid cards — staggered scale-in ──────────── */
      var bentoCards = document.querySelectorAll('#bento-grid .gsap-scale-in');
      gsap.fromTo(bentoCards,
        { opacity: 0, scale: 0.85, y: 30 },
        {
          opacity: 1, scale: 1, y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '#bento-grid',
            start: 'top 80%',
          }
        }
      );

      /* ── SKILLS SECTION ─────────────────────────────────── */
      animateSection('#skills');

      /* ── Skill cards — staggered entrance ────────────────── */
      var skillCards = document.querySelectorAll('#skills-grid .gsap-fade-up');
      gsap.fromTo(skillCards,
        { opacity: 0, y: 60, scale: 0.92 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          stagger: { amount: 0.8, from: 'start' },
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#skills-grid',
            start: 'top 80%',
          }
        }
      );

      /* ── ESPERIENZE SECTION ─────────────────────────────── */
      animateSection('#esperienze');

      /* ── Timeline items — slide from left ────────────────── */
      var timelineItems = document.querySelectorAll('#esperienze .gsap-fade-left');
      timelineItems.forEach(function (item) {
        gsap.fromTo(item,
          { opacity: 0, x: -60 },
          {
            opacity: 1, x: 0,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
            }
          }
        );
      });

      /* ── Experience section fade-ups ─────────────────────── */
      document.querySelectorAll('#esperienze .gsap-fade-up').forEach(function (el) {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
            }
          }
        );
      });

      /* ── ISTRUZIONE SECTION ─────────────────────────────── */
      animateSection('#istruzione');

      /* ── Education cards — staggered entrance ────────────── */
      var eduCards = document.querySelectorAll('#istruzione .gsap-fade-up');
      gsap.fromTo(eduCards,
        { opacity: 0, y: 50, rotateX: 5 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '#istruzione .grid',
            start: 'top 80%',
          }
        }
      );

      /* ── CONTATTI SECTION ────────────────────────────────── */
      animateSection('#contatti');

      /* ── Contact cards — slide from left ─────────────────── */
      var contactLeft = document.querySelectorAll('#contatti .gsap-fade-left');
      gsap.fromTo(contactLeft,
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0,
          duration: 0.7,
          stagger: 0.12,
          scrollTrigger: {
            trigger: '#contatti .grid',
            start: 'top 80%',
          }
        }
      );

      /* ── Contact form — slide from right ─────────────────── */
      var contactRight = document.querySelectorAll('#contatti .gsap-fade-right');
      gsap.fromTo(contactRight,
        { opacity: 0, x: 50, scale: 0.96 },
        {
          opacity: 1, x: 0, scale: 1,
          duration: 0.9,
          scrollTrigger: {
            trigger: '#contatti .grid',
            start: 'top 80%',
          }
        }
      );

    } /* end 'all' */
  }); /* end matchMedia */
}

/**
 * Animate section headers (subtitle, title, divider).
 * Reusable helper for all fullscreen sections.
 */
function animateSection(sectionSelector) {
  var sectionEls = document.querySelectorAll(sectionSelector + ' > div > .text-center .gsap-fade-up');
  if (sectionEls.length === 0) return;

  gsap.fromTo(sectionEls,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      stagger: 0.1,
      scrollTrigger: {
        trigger: sectionSelector,
        start: 'top 75%',
      }
    }
  );
}

/**
 * HERO — Entrance animations (triggered on page load, not scroll).
 */
function animateHero() {
  var heroEls = document.querySelectorAll('#hero .gsap-fade-up, #hero .gsap-scale-in');
  if (heroEls.length === 0) return;

  /* Sort by data-delay for sequencing */
  var sorted = Array.prototype.slice.call(heroEls).sort(function (a, b) {
    var da = parseFloat(a.getAttribute('data-delay') || '0');
    var db = parseFloat(b.getAttribute('data-delay') || '0');
    return da - db;
  });

  var tl = gsap.timeline({ delay: 0.3 });

  sorted.forEach(function (el) {
    var delay = parseFloat(el.getAttribute('data-delay') || '0');
    var isScale = el.classList.contains('gsap-scale-in');

    if (isScale) {
      tl.fromTo(el,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.4)' },
        delay
      );
    } else {
      tl.fromTo(el,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' },
        delay
      );
    }
  });
}

/* ============================================================
   SKILL CARD TILT (3D perspective on hover)
   Creates a subtle 3D tilt (parallax) effect on mouse movement.
   Lifting translation (translateY) has been removed.
   ============================================================ */
function initSkillCardTilt() {
  /* Effect completely disabled upon user request */
  return;
}

/* ============================================================
   THEME TOGGLE — Manual light/dark toggle
   ============================================================ */
function initThemeToggle() {
  var btn      = document.getElementById('theme-toggle');
  var iconSun  = document.getElementById('theme-icon-sun');
  var iconMoon = document.getElementById('theme-icon-moon');
  if (!btn) return;

  function syncIcon() {
    var isDark = document.documentElement.classList.contains('dark');
    if (iconSun)  iconSun.classList.toggle('hidden', !isDark);
    if (iconMoon) iconMoon.classList.toggle('hidden', isDark);
    btn.setAttribute('aria-label', isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro');
  }

  function setTheme(dark) {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    syncIcon();
    window.dispatchEvent(new CustomEvent('themechange'));
  }

  btn.addEventListener('click', function () {
    setTheme(!document.documentElement.classList.contains('dark'));
  });

  syncIcon();
}

/* ============================================================
   LANGUAGE DROPDOWN
   ============================================================ */
function initLangDropdown() {
  var wrapper = document.getElementById('lang-dropdown');
  var toggle  = document.getElementById('lang-toggle');
  var menu    = document.getElementById('lang-menu');
  if (!wrapper || !toggle || !menu) return;

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = wrapper.classList.contains('open');
    if (isOpen) { closeDropdown(); } else { openDropdown(); }
  });

  function openDropdown() {
    wrapper.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeDropdown() {
    wrapper.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  menu.querySelectorAll('button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
      closeDropdown();
    });
  });

  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) closeDropdown();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDropdown();
  });
}

/* ============================================================
   PROFILE PHOTO — graceful fallback if image fails
   ============================================================ */
function initProfilePhoto() {
  var img       = document.getElementById('profile-img');
  var container = document.getElementById('profile-frame');
  if (!img || !container) return;

  container.style.willChange = 'transform';
  img.style.willChange       = 'transform';

  img.addEventListener('error', function () {
    img.style.display = 'none';
    var fallback = document.createElement('div');
    fallback.className = 'profile-initials';
    fallback.textContent = 'AL';
    container.appendChild(fallback);
  });
}

/* ============================================================
   NETWORK CANVAS — Cyber particle background
   Particles confined to left 15% and right 15% bands.
   ============================================================ */
function initDigitalTopography() {
  var canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  
  var W, H, isMobile;
  var time = 0;
  var spores = [];
  
  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    isMobile = W < 768;
    initSpores();
  }
  
  function initSpores() {
    spores = [];
    var S_COUNT = isMobile ? 30 : 60;
    for(var i=0; i<S_COUNT; i++) {
      spores.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.15 - Math.random() * 0.4, /* fluttuano verso l'alto */
        r: Math.random() * 2 + 0.5,
        alphaBase: Math.random() * 0.5 + 0.1,
        pulseOffset: Math.random() * Math.PI * 2,
        isEmerald: Math.random() > 0.5
      });
    }
  }

  function getNoise(x, y, t) {
      var nx = x * 0.003;
      var ny = y * 0.002;
      return Math.sin(nx * 2.5 + ny * 1.5 + t * 0.7) * 0.5 + 
             Math.cos(nx * 1.2 - ny * 2.1 + t * 0.9) * 0.5;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var isDark = document.documentElement.classList.contains('dark');
    
    /* Regolazione colori topografia laterale */
    var baseColor = isDark ? '0, 200, 255' : '30, 64, 175'; 
    var shadowColor = isDark ? '0, 240, 255' : '29, 78, 216'; 
    var maxAlpha = isDark ? 0.35 : 0.60; 
    
    var lineCountPerSide = isMobile ? 8 : 16;
    var bandW = isMobile ? (W * 0.18) : (W * 0.18);
    
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = isDark ? 8 : 6;
    ctx.shadowColor = 'rgba(' + shadowColor + ', ' + (isDark ? '0.5' : '0.6') + ')';

    /* Disegno Topografia */
    for (var side = 0; side < 2; side++) {
        var isLeft = (side === 0);
        for(var i = 0; i < lineCountPerSide; i++) {
            var progress = i / (lineCountPerSide - 1);
            ctx.beginPath();
            for(var y = -50; y <= H + 50; y += 20) {
                var baseX = isLeft ? (progress * bandW) : (W - progress * bandW);
                var n = getNoise(baseX, y, time);
                var waveAmplitude = 45 * (progress + 0.1);
                var x = baseX + (n * waveAmplitude);
                if (y === -50) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            var alpha = maxAlpha * (1 - progress);
            alpha = Math.pow(alpha / maxAlpha, 1.5) * maxAlpha; 
            if (alpha < 0) alpha = 0;
            
            ctx.strokeStyle = 'rgba(' + baseColor + ', ' + alpha + ')';
            ctx.stroke();
        }
    }
    
    /* Disegno Digital Spores (Polline) e Connessioni Micelio */
    ctx.shadowBlur = isDark ? 10 : 5;
    
    // Draw Mycelium connections (Ottimizzato: no radici quadrate inutili)
    for (var i = 0; i < spores.length; i++) {
      for (var j = i + 1; j < spores.length; j++) {
        var dx = spores[i].x - spores[j].x;
        var dy = spores[i].y - spores[j].y;
        var distSq = dx * dx + dy * dy;
        var maxDist = isMobile ? 80 : 120;
        var maxDistSq = maxDist * maxDist;
        if (distSq < maxDistSq) {
          var lineAlpha = (1 - Math.sqrt(distSq) / maxDist) * 0.15;
          if (!isDark) lineAlpha *= 1.5;
          
          ctx.beginPath();
          ctx.moveTo(spores[i].x, spores[i].y);
          // Curve bezier organica
          var cx = (spores[i].x + spores[j].x) / 2 + (Math.random() - 0.5) * 15;
          var cy = (spores[i].y + spores[j].y) / 2 + (Math.random() - 0.5) * 15;
          ctx.quadraticCurveTo(cx, cy, spores[j].x, spores[j].y);
          ctx.strokeStyle = 'rgba(16, 185, 129, ' + lineAlpha + ')'; // Smeraldo
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    for (var i = 0; i < spores.length; i++) {
      var s = spores[i];
      s.x += s.vx;
      s.y += s.vy;
      s.pulseOffset += 0.02;
      
      /* Onde per lo spostamento orizzontale */
      s.x += Math.sin(time + s.pulseOffset) * 0.2;
      
      /* Interazione repulsione mouse morbida e ottimizzata */
      if (mouseX !== null && mouseY !== null) {
        var mdx = s.x - mouseX;
        var mdy = s.y - mouseY;
        var mDistSq = mdx*mdx + mdy*mdy;
        if (mDistSq < 15000) {
          var repulseForce = (15000 - mDistSq) / 150000;
          s.x += mdx * repulseForce;
          s.y += mdy * repulseForce;
        }
      }

      /* Wrap-around */
      if (s.y < -10) s.y = H + 10;
      if (s.x < -10) s.x = W + 10;
      if (s.x > W + 10) s.x = -10;
      
      /* Calcolo opacità */
      var pulse = Math.abs(Math.sin(s.pulseOffset));
      var currentAlpha = s.alphaBase * pulse;
      if (!isDark) currentAlpha *= 1.5; /* Boost visibilità in light mode */
      
      /* Colore della spora (Emerald vs Cyan) */
      var cColor = s.isEmerald ? (isDark ? '16, 185, 129' : '5, 150, 105') : (isDark ? '0, 229, 255' : '2, 132, 199');
      
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + cColor + ', ' + currentAlpha + ')';
      ctx.shadowColor = 'rgba(' + cColor + ', ' + currentAlpha + ')';
      ctx.fill();
    }
    
    time += 0.012; 
    requestAnimationFrame(draw);
  }
  
  var mouseX = null, mouseY = null;
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseout', function() {
    mouseX = null; mouseY = null;
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  draw();
}

/* ============================================================
   SMOOTH SCROLL HELPER
   Centralises smooth-scroll logic used by nav links, CTA
   buttons, and any other internal anchor <a href="#..."> links.
   Uses GSAP when available for a cinematic ease-out feel;
   falls back to native browser smooth scroll otherwise.
   ============================================================ */
function smoothScrollTo(targetId) {
  var nav    = document.getElementById('main-nav');
  var navH   = nav ? nav.offsetHeight : 64;
  var target = document.getElementById(targetId);
  if (!target) return;

  var destY = target.getBoundingClientRect().top + window.scrollY - navH - 20;

  /* Prefer GSAP for a premium cinematic ease */
  if (typeof gsap !== 'undefined') {
    gsap.to(window, {
      scrollTo: { y: destY, autoKill: false },
      duration: 1.1,
      ease: 'power3.inOut',
    });
  } else {
    /* Native fallback */
    window.scrollTo({ top: destY, behavior: 'smooth' });
  }
}

/* ============================================================
   NAVIGATION — scroll spy + active link
   ============================================================ */
function initNavigation() {
  var nav      = document.getElementById('main-nav');
  var navLinks = document.querySelectorAll('.nav-link[data-section]');
  var sections = document.querySelectorAll('section[id]');

  /* ── Scroll spy: highlight the active nav link ──────────── */
  function handleScroll() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    var scrollPos = window.scrollY + 130;
    var current   = '';
    sections.forEach(function (s) {
      if (scrollPos >= s.offsetTop && scrollPos < s.offsetTop + s.offsetHeight) {
        current = s.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.dataset.section === current);
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Smooth scroll on nav links ─────────────────────────── */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = link.getAttribute('href').replace('#', '');
      smoothScrollTo(id);
      closeMobileMenu();
    });
  });

  /* ── Smooth scroll on ALL other internal anchor links ──────
     This catches CTA buttons ("Contattami", "Esplora le skills"),
     footer links, QR links, and any future <a href="#..."> added.
     Excludes links already handled as nav-links and those that
     open a modal (data-open-privacy).
     ──────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    /* Skip nav-links (already handled above) and modal triggers */
    if (anchor.classList.contains('nav-link')) return;
    if (anchor.hasAttribute('data-open-privacy')) return;

    anchor.addEventListener('click', function (e) {
      var href = anchor.getAttribute('href');
      if (!href || href === '#') return; /* bare '#' — do nothing */
      e.preventDefault();
      var id = href.replace('#', '');
      smoothScrollTo(id);
      closeMobileMenu();
    });
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  var form      = document.getElementById('contact-form');
  if (!form) return;
  var submitBtn = form.querySelector('button[type="submit"]');
  var btnText   = submitBtn && submitBtn.querySelector('.btn-text');
  var spinner   = submitBtn && submitBtn.querySelector('.btn-spinner');
  var success   = document.getElementById('form-success');
  var error     = document.getElementById('form-error');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var privacyBox = document.getElementById('privacy-consent');
    if (!privacyBox || !privacyBox.checked) {
      if (form.reportValidity) form.reportValidity();
      return;
    }

    if (success) success.classList.add('hidden');
    if (error)   error.classList.add('hidden');

    var subjectField = document.getElementById('form-subject');
    if (subjectField) {
      subjectField.value = currentLang === 'en'
        ? 'New message from portfolio'
        : 'Nuovo messaggio dal portfolio';
    }

    if (btnText)   btnText.textContent = currentLang === 'en' ? 'Sending…' : 'Invio in corso…';
    if (spinner)   spinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    var formData = new FormData(form);
    formData.delete('g-recaptcha-response');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
      .then(function (r) { return r.json(); })
      .then(function (result) {
        if (result.success) {
          if (success) success.classList.remove('hidden');
          form.reset();
        } else {
          throw new Error(result.message || 'Error');
        }
      })
      .catch(function () {
        if (error) error.classList.remove('hidden');
      })
      .finally(function () {
        var defaultText = currentLang === 'en' ? 'Send message' : 'Invia messaggio';
        if (btnText)   btnText.textContent = defaultText;
        if (spinner)   spinner.classList.add('hidden');
        if (submitBtn) submitBtn.disabled = false;
      });
  });
}

/* ============================================================
   PRIVACY MODAL
   ============================================================ */
function initPrivacyModal() {
  var modal = document.getElementById('privacy-modal');
  if (!modal) return;

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    var btn = modal.querySelector('[data-close-modal]');
    if (btn) btn.focus();
  }
  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-privacy]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
  });
  modal.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
}

/* ============================================================
   MOBILE MENU
   ============================================================ */
function initMobileMenu() {
  var btn    = document.getElementById('mobile-menu-btn');
  var menu   = document.getElementById('mobile-menu');
  var hIcon  = document.getElementById('hamburger-icon');
  var cIcon  = document.getElementById('close-icon');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    var isOpen = menu.classList.contains('max-h-96');
    if (isOpen) {
      closeMobileMenu();
    } else {
      menu.classList.remove('max-h-0');
      menu.classList.add('max-h-96');
      btn.setAttribute('aria-expanded', 'true');
      if (hIcon) hIcon.classList.add('hidden');
      if (cIcon) cIcon.classList.remove('hidden');
    }
  });
}

function closeMobileMenu() {
  var menu  = document.getElementById('mobile-menu');
  var btn   = document.getElementById('mobile-menu-btn');
  var hIcon = document.getElementById('hamburger-icon');
  var cIcon = document.getElementById('close-icon');
  if (menu) { menu.classList.add('max-h-0'); menu.classList.remove('max-h-96'); }
  if (btn)  btn.setAttribute('aria-expanded', 'false');
  if (hIcon) hIcon.classList.remove('hidden');
  if (cIcon) cIcon.classList.add('hidden');
}

/* ============================================================
   TYPEWRITER (bilingual)
   ============================================================ */
var _twEl = null;
var _twIdx = 0, _twChar = 0, _twDeleting = false;
var _twTimer = null;

function initTypewriter() {
  _twEl = document.getElementById('typewriter');
  if (!_twEl) return;
  clearTimeout(_twTimer);
  _twIdx = 0; _twChar = 0; _twDeleting = false;
  _twTimer = setTimeout(_twTick, 1200);
}

function resetTypewriter() {
  if (!_twEl) return;
  clearTimeout(_twTimer);
  _twEl.textContent = '';
  _twIdx = 0; _twChar = 0; _twDeleting = false;
  _twTimer = setTimeout(_twTick, 300);
}

function _twTick() {
  if (!_twEl) return;
  var strings = TYPEWRITER_STRINGS[currentLang];
  var current = strings[_twIdx];

  if (!_twDeleting) {
    _twEl.textContent = current.substring(0, _twChar + 1);
    _twChar++;
    if (_twChar === current.length) {
      _twDeleting = true;
      _twTimer = setTimeout(_twTick, 2200);
      return;
    }
  } else {
    _twEl.textContent = current.substring(0, _twChar - 1);
    _twChar--;
    if (_twChar === 0) {
      _twDeleting = false;
      _twIdx = (_twIdx + 1) % strings.length;
      _twTimer = setTimeout(_twTick, 400);
      return;
    }
  }
  _twTimer = setTimeout(_twTick, _twDeleting ? 38 : 62);
}

/* ============================================================
   HARD SKILLS CAROUSEL — Mobile autoplay (< 768px)
   Converts grid to horizontal slider on mobile only.
   Pauses on touch/interaction. Grid intact on desktop.
   ============================================================ */
function initHardSkillsCarousel() {
  if (window.innerWidth >= 768) return;

  var skillsGrid = document.getElementById('skills-grid');
  if (!skillsGrid) return;

  var originalCards = Array.prototype.slice.call(skillsGrid.querySelectorAll('.skill-card'));
  if (originalCards.length === 0) return;

  /* Build carousel DOM */
  var wrapper = document.createElement('div');
  wrapper.className = 'skills-carousel-wrapper';
  wrapper.setAttribute('aria-label', 'Skills carousel');
  wrapper.style.overflow = 'hidden';
  wrapper.style.width = '100%';

  var track = document.createElement('div');
  track.className = 'skills-carousel-track';
  track.id = 'skills-carousel-track';
  track.style.display = 'flex';
  track.style.gap = '16px';
  track.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  
  /* Dots indicator */
  var dots = document.createElement('div');
  dots.className = 'skills-carousel-dots';
  dots.style.cssText = 'display:flex; justify-content:center; gap:8px; margin-top:20px;';

  /* Clone cards to track */
  var cloni = [];
  originalCards.forEach(function (c, i) {
    var clone = c.cloneNode(true);
    clone.classList.remove('gsap-fade-up');
    clone.style.opacity = '1';
    clone.style.visibility = 'visible';
    clone.style.transform = 'none';
    clone.style.flexShrink = '0';
    
    cloni.push(clone);
    track.appendChild(clone);
    
    var dot = document.createElement('button');
    dot.style.cssText = 'width:8px; height:8px; border-radius:50%; border:none; cursor:pointer; transition: all 0.3s; background:' + (i === 0 ? '#00C8FF' : 'rgba(148,163,184,0.4)') + '; padding:0;';
    dot.setAttribute('aria-label', 'Slide ' + (i + 1));
    dot.addEventListener('click', function () {
      goTo(i);
      pauseAutoplay();
    });
    dots.appendChild(dot);
  });

  wrapper.appendChild(track);
  skillsGrid.parentNode.insertBefore(wrapper, skillsGrid);
  skillsGrid.style.display = 'none';
  wrapper.after(dots);

  var currentIdx = 0;
  var totalCards = originalCards.length;
  var autoplayTimer = null;
  var isPaused = false;
  var cardW = 0;

  function updateDimensions() {
    /* Misuriamo e applichiamo forzatamente i pixel al volo */
    cardW = wrapper.clientWidth;
    cloni.forEach(function(clone) {
      clone.style.width = cardW + 'px';
      clone.style.minWidth = cardW + 'px';
      clone.style.maxWidth = cardW + 'px';
    });
    /* Ri-applica il transform coi nuovi pixel */
    var shift = currentIdx * (cardW + 16);
    track.style.transition = 'none'; // Nessuna animazione durante il resize
    track.style.transform = 'translateX(-' + shift + 'px)';
    // Force reflow
    void track.offsetWidth;
    track.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  }

  function goTo(idx) {
    currentIdx = ((idx % totalCards) + totalCards) % totalCards;
    
    var shift = currentIdx * (cardW + 16); 
    track.style.transform = 'translateX(-' + shift + 'px)';

    var allDots = dots.querySelectorAll('button');
    allDots.forEach(function (dot, i) {
      dot.style.background = i === currentIdx ? '#00C8FF' : 'rgba(148,163,184,0.4)';
      dot.style.transform  = i === currentIdx ? 'scale(1.3)' : 'scale(1)';
    });
  }

  function next() {
    goTo(currentIdx + 1);
  }

  function startAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      if (!isPaused) next();
    }, 3500);
  }

  function pauseAutoplay() {
    isPaused = true;
    clearTimeout(pauseAutoplay._resumeTimer);
    pauseAutoplay._resumeTimer = setTimeout(function () {
      isPaused = false;
    }, 6000);
  }

  /* Touch events */
  var touchStartX = 0;
  var touchStartY = 0;
  wrapper.addEventListener('touchstart', function (e) {
    pauseAutoplay();
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  wrapper.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) goTo(currentIdx + 1);
      else        goTo(currentIdx - 1);
    }
  }, { passive: true });

  /* Setup iniziale */
  updateDimensions();
  goTo(0);
  startAutoplay();

  /* Re-init on resize */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
      if (autoplayTimer) clearInterval(autoplayTimer);
      skillsGrid.style.display = '';
      wrapper.style.display    = 'none';
      dots.style.display       = 'none';
    } else {
      skillsGrid.style.display = 'none';
      wrapper.style.display    = 'block';
      dots.style.display       = 'flex';
      updateDimensions();
    }
  }, { passive: true });
}

/* ============================================================
   CYBER ROOTS — Optimized Neural Network & Fractal Sprout
   ============================================================ */
function initCyberRoots() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  var wrapper = document.getElementById('svg-roots-wrapper');
  if (!wrapper) return;

  function build() {
    wrapper.innerHTML = '';
    var W = window.innerWidth;
    var totalH = document.body.scrollHeight;
    
    wrapper.style.height = totalH + 'px';

    var prof = document.getElementById('profile-frame');
    var startX = W / 2;
    var startY = W > 768 ? 400 : 300;
    
    if (prof) {
      var rect = prof.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.bottom + window.scrollY;
    }

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", `0 0 ${W} ${totalH}`);
    svg.style.width = '100%';
    svg.style.height = totalH + 'px';
    svg.style.overflow = 'visible';
    
    // Ottimizzazione: Forziamo l'hardware acceleration sul container SVG per evitare repaint massivi
    svg.style.transform = 'translateZ(0)';
    svg.style.willChange = 'opacity, transform';
    
    // Opacità globale abbassata e più elegante
    svg.style.opacity = '0.5';

    var footer = document.querySelector('footer');
    var endY = totalH - 100;
    var endX = W / 2; 
    if (footer) {
      endY = totalH - footer.offsetHeight + 50; 
    }

    var isDark = document.documentElement.classList.contains('dark');
    var stemColor = isDark ? '#10B981' : '#059669';  
    var leafColor = isDark ? '#00E5FF' : '#0284C7';  
    
    // Inizializziamo subito il gruppo per poterci appendere le micro-foglie delle radici
    var sproutGroup = document.createElementNS(svgNS, "g");
    sproutGroup.style.opacity = '1';
    var fractalPaths = [];
    var fractalLeaves = [];
    
    // --- 1. RADICI MULTIPLE (DISTRIBUZIONE ELEGANTE E INTRECCIATA) ---
    var rootPaths = [];
    var numRoots = W > 768 ? 6 : 4; 
    var maxSpread = W * 0.6; // Si aprono ma lasciano respiro
    
    for (var r = 0; r < numRoots; r++) {
      var path = document.createElementNS(svgNS, "path");
      var d = `M ${startX} ${startY} `;
      var curX = startX;
      var curY = startY;
      
      var steps = 16; // Aumentato leggermente per curve di incrocio più fluide
      var stepY = (endY - startY) / steps;
      
      // Distribuzione a ventaglio di base (per non avere accumuli caotici)
      var t = numRoots > 1 ? (r / (numRoots - 1)) : 0.5; // da 0 a 1
      var idealTargetX = startX + (t - 0.5) * maxSpread;
      
      // Caratteristiche uniche dell'onda per creare incroci a DNA
      var freq = 2.5 + Math.random() * 1.5; // Frequenze sfasate (2.5 - 4 onde)
      var phase = Math.random() * Math.PI * 2;
      var waveAmp = 100 + Math.random() * 80; // Ampiezza sufficiente per accavallarsi (100-180px)

      for (var i = 1; i <= steps; i++) {
         var progress = i / steps; 
         var nextY = startY + stepY * i;
         var nextX;
         
         if (progress < 0.15) {
            // Fase 1: Sventagliamento morbido e apertura
            var p = progress / 0.15; 
            nextX = startX + (idealTargetX - startX) * Math.sin(p * Math.PI / 2);
         } else if (progress < 0.85) {
            // Fase 2: Onde ampie e sfasate che si incrociano dolcemente al centro
            var wave = Math.sin(progress * Math.PI * freq + phase) * waveAmp;
            // Tendiamo leggermente verso il centro per farle incrociare bene
            var centerPull = (startX - idealTargetX) * Math.sin(progress * Math.PI);
            nextX = idealTargetX + wave + (centerPull * 0.3);
         } else {
            // Fase 3: Convergenza all'imbuto finale verso il germoglio
            var p = (1 - progress) / 0.15; // 1 -> 0
            var wave = Math.sin(progress * Math.PI * freq + phase) * waveAmp;
            nextX = endX + ((idealTargetX - endX) + wave) * Math.pow(p, 1.5);
         }
         
         // Smooth curve bezier
         var cp1X = curX;
         var cp1Y = curY + stepY * 0.6;
         var cp2X = nextX;
         var cp2Y = curY + stepY * 0.4;
         
         d += `C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${nextX} ${nextY} `;
         
         // --- Micro-foglie botaniche (Agritech touch) ---
         if (i > 2 && i < steps - 2 && Math.random() > 0.6) {
           var leaf = document.createElementNS(svgNS, "path");
           var leafSide = Math.random() > 0.5 ? 1 : -1;
           var lx = nextX + 8 * leafSide;
           var ly = nextY - 5;
           leaf.setAttribute("d", `M ${nextX} ${nextY} Q ${lx} ${nextY} ${lx} ${ly} Q ${nextX} ${ly} ${nextX} ${nextY}`);
           leaf.setAttribute("fill", leafColor);
           leaf.setAttribute("opacity", "0.6");
           // Ottimizzazione: niente filtri, solo opacity
           sproutGroup.appendChild(leaf);
           fractalLeaves.push(leaf);
         }
         
         curX = nextX; 
         curY = nextY;
      }

      path.setAttribute("d", d);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", stemColor);
      // Spessore più sottile e sofisticato (1.5 - 2.5)
      path.setAttribute("stroke-width", 1.5 + Math.abs(t - 0.5) * 2);
      path.setAttribute("stroke-linecap", "round");
      
      // Ottimizzazione Estrema: Nessun drop-shadow per zero lag
      path.setAttribute("opacity", 0.5 + Math.abs(t - 0.5) * 0.4); 
      path.style.willChange = "stroke-dashoffset";
      
      svg.appendChild(path);
      rootPaths.push(path);
    }

    // --- 2. GERMOGLIO: ALBERO FRATTALE GIGANTE ---
    var isMobile = W <= 768;
    // Angolo di diramazione: su desktop 28°, su mobile molto più aperto (38°)
    // in modo che i rami escano dai lati del modulo contatti e siano ben visibili.
    var baseBranchAngle = isMobile ? 38 : 28;

    function drawBranch(x, y, len, angle, depth, maxDepth) {
      if (depth === 0) return;
      
      var radian = angle * Math.PI / 180;
      var bx = x + len * Math.cos(radian);
      var by = y + len * Math.sin(radian);

      var curveAmp = len * 0.25; 
      var bendDir = (angle > -90) ? 1 : -1; 
      var cx = x + (len * 0.5) * Math.cos(radian) + curveAmp * Math.cos(radian + Math.PI/2) * bendDir;
      var cy = y + (len * 0.5) * Math.sin(radian) + curveAmp * Math.sin(radian + Math.PI/2) * bendDir;

      var path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", `M ${x} ${y} Q ${cx} ${cy} ${bx} ${by}`);
      path.setAttribute("fill", "none");
      
      var isEdge = depth <= 2;
      path.setAttribute("stroke", isEdge ? leafColor : stemColor);
      path.setAttribute("stroke-width", depth * 1.5); 
      path.setAttribute("stroke-linecap", "round");
      path.style.willChange = "stroke-dashoffset";
      
      sproutGroup.appendChild(path);
      fractalPaths.push(path);

      if (depth === 1) {
         var circle = document.createElementNS(svgNS, "circle");
         circle.setAttribute("cx", bx);
         circle.setAttribute("cy", by);
         circle.setAttribute("r", "6");
         circle.setAttribute("fill", leafColor);
         circle.setAttribute("stroke", "none");
         // Rimosso il drop-shadow SVG costoso. Usiamo opacity per un glow leggero e performante.
         circle.setAttribute("opacity", "0.9");
         sproutGroup.appendChild(circle);
         fractalLeaves.push(circle);
      } else {
         var randAngle = (Math.random() - 0.5) * 15;
         var randLen = 0.75 + Math.random() * 0.1;
         
         drawBranch(bx, by, len * randLen, angle - baseBranchAngle + randAngle, depth - 1, maxDepth);
         drawBranch(bx, by, len * randLen, angle + baseBranchAngle + randAngle, depth - 1, maxDepth);
      }
    }

    // Su mobile: tronco molto più lungo (140) e partenza sollevata (-30)
    // così la chioma sbuca *sopra* e *ai lati* del modulo contatti!
    // Su desktop: misure originali intatte (100, +20).
    var trunkLen = isMobile ? 140 : 100;
    var startOffsetY = isMobile ? -30 : 20;

    drawBranch(endX, endY + startOffsetY, trunkLen, -90, 5, 5);
    
    svg.appendChild(sproutGroup);
    wrapper.appendChild(svg);

    // --- 3. ANIMAZIONE GSAP OTTIMIZZATA ---
    // Usiamo power0.none e forziamo gsap a non lottare con filter reflows
    var rootTl = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
        fastScrollEnd: true
      }
    });

    rootPaths.forEach(function(p) {
      var len = p.getTotalLength();
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      rootTl.to(p, { strokeDashoffset: 0, ease: 'none' }, 0);
    });
    
    var sproutTl = gsap.timeline({
      scrollTrigger: {
        trigger: 'footer',
        start: 'top 95%', 
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    fractalPaths.forEach(function(sp) {
      var slen = sp.getTotalLength();
      sp.style.strokeDasharray = slen;
      sp.style.strokeDashoffset = slen;
      sproutTl.to(sp, { strokeDashoffset: 0, ease: 'power1.out', duration: 1 }, 0);
    });

    fractalLeaves.forEach(function(lf) {
      gsap.set(lf, { scale: 0, transformOrigin: 'center' });
      sproutTl.to(lf, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.6);
    });
  }

  if (document.readyState === 'complete') {
    setTimeout(build, 100);
  } else {
    window.addEventListener('load', function() { setTimeout(build, 100); });
  }

  var rT;
  window.addEventListener('resize', function() {
    clearTimeout(rT);
    rT = setTimeout(build, 500);
  }, { passive: true });
}

/* ============================================================
   AGRITECH ELEMENTS (Hover Bloom & Dividers)
   ============================================================ */
function initAgritechElements() {
  // Add bloom icon to cards
  var cards = document.querySelectorAll('.glass-card, .skill-card');
  cards.forEach(function(card) {
    if (!card.querySelector('.bloom-icon')) {
      var svgHTML = '<svg class="bloom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0114 6a7 7 0 01-3 14z"/><path d="M14 6a7 7 0 013 14 7 7 0 01-3-14z"/><path d="M12.5 13v7"/><path d="M12.5 16s2-1.5 2-4"/></svg>';
      card.insertAdjacentHTML('afterbegin', svgHTML);
      if(!card.classList.contains('group') && card.classList.contains('glass-card')) {
        card.classList.add('group');
      }
    }
  });

  // Add leaf icon to section dividers
  var dividers = document.querySelectorAll('.section-glow-divider');
  dividers.forEach(function(div) {
    if (!div.querySelector('svg')) {
      div.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-9" /><path d="M12 13a4 4 0 0 0-4-4h-1a4 4 0 0 1 4-4h1" /><path d="M12 13a4 4 0 0 1 4-4h1a4 4 0 0 0-4-4h-1" /></svg>';
    }
  });
}

/* ============================================================
   CUSTOM CURSOR (Spores/Fireflies)
   ============================================================ */
function initCustomCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  var cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  var mouseX = window.innerWidth / 2;
  var mouseY = window.innerHeight / 2;
  var cursorX = mouseX;
  var cursorY = mouseY;
  
  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  var interactiveEls = document.querySelectorAll('a, button, input, textarea, select, .glass-card, .skill-card');
  interactiveEls.forEach(function(el) {
    el.addEventListener('mouseenter', function() { cursor.classList.add('hovering'); });
    el.addEventListener('mouseleave', function() { cursor.classList.remove('hovering'); });
  });

  var spores = [];
  function render() {
    cursorX += (mouseX - cursorX) * 0.3;
    cursorY += (mouseY - cursorY) * 0.3;
    // Ottimizzato: translate3d attiva l'accelerazione GPU
    cursor.style.transform = 'translate3d(' + cursorX + 'px, ' + cursorY + 'px, 0)';

    var isMoving = Math.abs(mouseX - cursorX) > 1 || Math.abs(mouseY - cursorY) > 1;
    if (isMoving && Math.random() > 0.6) {
      var spore = document.createElement('div');
      spore.className = 'cursor-spore';
      spore.style.left = '0px';
      spore.style.top = '0px';
      document.body.appendChild(spore);
      
      spores.push({ 
        el: spore, x: cursorX, y: cursorY, 
        vx: (Math.random() - 0.5) * 2, 
        vy: (Math.random() - 0.5) * 2 - 0.5,
        life: 1.0 
      });
    }

    for (var i = spores.length - 1; i >= 0; i--) {
      var s = spores[i];
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.02;
      s.el.style.transform = 'translate3d(' + s.x + 'px, ' + s.y + 'px, 0) scale(' + s.life + ')';
      s.el.style.opacity = s.life;
      
      if (s.life <= 0) {
        if(s.el.parentNode) s.el.parentNode.removeChild(s.el);
        spores.splice(i, 1);
      }
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

/**
 * Andrea Lombardo Portfolio — main.js
 * Vanilla JS · No external dependencies · CSP-safe (no inline handlers)
 * GitHub Pages static hosting compatible
 */
'use strict';

/* ============================================================
   LANGUAGE — state
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

/* Language labels shown in the toggle button */
var LANG_LABELS = { it: '🇮🇹 IT', en: '🇬🇧 EN' };

/**
 * Apply a language to the whole page.
 * Reads data-it / data-en attributes and swaps innerHTML.
 * Also updates placeholders, <html lang>, and the dropdown UI.
 */
function applyLang(lang) {
  if (lang !== 'it' && lang !== 'en') return;
  currentLang = lang;

  /* 1. Text nodes with data-it / data-en */
  document.querySelectorAll('[data-' + lang + ']').forEach(function (el) {
    var val = el.getAttribute('data-' + lang);
    if (val !== null) el.innerHTML = val;
  });

  /* 2. Input / textarea placeholders */
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

  /* 5. Active state on dropdown options */
  document.querySelectorAll('#lang-menu button[data-lang]').forEach(function (btn) {
    btn.classList.toggle('lang-active', btn.getAttribute('data-lang') === lang);
  });

  /* 6. Restart typewriter in new language */
  resetTypewriter();
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initNetworkCanvas();
  initNavigation();
  initScrollReveal();
  initContactForm();
  initPrivacyModal();
  initMobileMenu();
  initLangDropdown();
  initSkillCardTilt();
  initProfilePhoto();
  initTypewriter();
});

/* ============================================================
   LANGUAGE DROPDOWN
   ============================================================ */
function initLangDropdown() {
  var wrapper = document.getElementById('lang-dropdown');
  var toggle  = document.getElementById('lang-toggle');
  var menu    = document.getElementById('lang-menu');
  if (!wrapper || !toggle || !menu) return;

  /* Toggle open/close */
  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    var isOpen = wrapper.classList.contains('open');
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  function openDropdown() {
    wrapper.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
  }
  function closeDropdown() {
    wrapper.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  /* Language selection */
  menu.querySelectorAll('button[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'));
      closeDropdown();
    });
  });

  /* Close when clicking outside */
  document.addEventListener('click', function (e) {
    if (!wrapper.contains(e.target)) closeDropdown();
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDropdown();
  });
}

/* ============================================================
   PROFILE PHOTO — graceful fallback if image fails
   ============================================================ */
function initProfilePhoto() {
  var img       = document.getElementById('profile-img');
  var container = document.getElementById('profile-frame'); /* ora è .profile-photo-wrap */
  if (!img || !container) return;

  img.addEventListener('error', function () {
    img.style.display = 'none';
    var fallback = document.createElement('div');
    fallback.className = 'profile-initials';
    fallback.textContent = 'AL';
    container.appendChild(fallback);
  });
}

/* ============================================================
   NETWORK CANVAS — AgriTech IoT background
   VINCOLO DESIGN: particelle SOLO nel 15% sinistro e 15% destro.
   La colonna centrale (70%) è un vuoto assoluto.
   ============================================================ */
function initNetworkCanvas() {
  var canvas = document.getElementById('network-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var W, H, nodes;
  var mouse = { x: -9999, y: -9999 };
  var scrollY = 0;

  /* Parametri per ciascuna banda laterale */
  var NODES_PER_BAND = 28;   /* nodi per ciascuna delle 2 bande */
  var CONNECT_DIST   = 120;
  var MOUSE_DIST     = 160;
  var NODE_SPEED     = 0.28;
  var BAND_WIDTH     = 0.15; /* 15% dello schermo per banda */

  /* Palette Blu di Prussia */
  var COLORS = [
    'rgba(37,99,235,',    /* blue-600 */
    'rgba(59,130,246,',   /* blue-500 */
    'rgba(96,165,250,',   /* blue-400 */
    'rgba(147,197,253,',  /* blue-300 */
    'rgba(30,58,138,',    /* blue-900 */
  ];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /**
   * Crea i nodi e li confina nelle bande laterali.
   * band = 'left'  → x ∈ [0,  W * BAND_WIDTH]
   * band = 'right' → x ∈ [W * (1 - BAND_WIDTH),  W]
   */
  function createNodes() {
    nodes = [];
    var bandW = W * BAND_WIDTH;

    for (var i = 0; i < NODES_PER_BAND * 2; i++) {
      var isLeft = (i < NODES_PER_BAND);
      var xMin   = isLeft ? 0         : W - bandW;
      var xMax   = isLeft ? bandW     : W;
      var color  = COLORS[Math.floor(Math.random() * COLORS.length)];

      nodes.push({
        x:          xMin + Math.random() * (xMax - xMin),
        y:          Math.random() * H,
        vx:         (Math.random() - 0.5) * NODE_SPEED,
        vy:         (Math.random() - 0.5) * NODE_SPEED,
        r:          Math.random() * 1.8 + 1.2,
        color:      color,
        pulse:      Math.random() * Math.PI * 2,
        pulseSpeed: 0.018 + Math.random() * 0.012,
        isLeft:     isLeft,
        xMin:       xMin,
        xMax:       xMax,
      });
    }
  }

  function dist(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  var raf = null;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    var bandW = W * BAND_WIDTH;

    /* Gradient fade-in ai bordi della banda (verso il centro) */
    /* Banda sinistra: fade da x=0 a x=bandW */
    var fadeL = ctx.createLinearGradient(0, 0, bandW, 0);
    fadeL.addColorStop(0,   'rgba(37,99,235,0.06)');
    fadeL.addColorStop(0.6, 'rgba(37,99,235,0.02)');
    fadeL.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = fadeL;
    ctx.fillRect(0, 0, bandW, H);

    /* Banda destra */
    var fadeR = ctx.createLinearGradient(W - bandW, 0, W, 0);
    fadeR.addColorStop(0,   'rgba(0,0,0,0)');
    fadeR.addColorStop(0.4, 'rgba(37,99,235,0.02)');
    fadeR.addColorStop(1,   'rgba(37,99,235,0.06)');
    ctx.fillStyle = fadeR;
    ctx.fillRect(W - bandW, 0, bandW, H);

    /* Aggiorna e disegna i nodi */
    for (var i = 0; i < nodes.length; i++) {
      var n  = nodes[i];

      /* Parallax leggero allo scroll */
      var parallaxY = (scrollY * 0.04) % H;

      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;

      /* Rimbalzo verticale */
      if (n.y < 0 || n.y > H) n.vy *= -1;

      /* Rimbalzo orizzontale DENTRO la banda assegnata */
      if (n.x < n.xMin) { n.x = n.xMin; n.vx = Math.abs(n.vx); }
      if (n.x > n.xMax) { n.x = n.xMax; n.vx = -Math.abs(n.vx); }

      /* Repulsione mouse (solo se il mouse è nella stessa banda) */
      var md = dist(n, mouse);
      if (md < MOUSE_DIST && md > 0) {
        var force = (MOUSE_DIST - md) / MOUSE_DIST;
        n.vx -= ((n.x - mouse.x) / md) * force * 0.02;
        n.vy -= ((n.y - mouse.y) / md) * force * 0.02;
      }

      /* Cap velocità */
      var speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > NODE_SPEED * 2.8) {
        n.vx = (n.vx / speed) * NODE_SPEED * 2.8;
        n.vy = (n.vy / speed) * NODE_SPEED * 2.8;
      }

      /* Opacità proporzionale alla distanza dal bordo verso il centro */
      /* (il nodo sfuma avvicinandosi al centro della banda) */
      var relPos   = n.isLeft
        ? (n.x / bandW)                 /* 0=bordo, 1=centro banda */
        : ((n.x - (W - bandW)) / bandW);
      var edgeFade = 1 - Math.max(0, relPos - 0.3) / 0.7; /* sfuma nell'ultimo 70% della banda */

      var baseAlpha = (0.55 + 0.2 * Math.sin(n.pulse)) * edgeFade;

      /* Glow radiale */
      var gr = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 5);
      gr.addColorStop(0, n.color + (baseAlpha * 0.9) + ')');
      gr.addColorStop(1, n.color + '0)');
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 5, 0, Math.PI * 2);
      ctx.fillStyle = gr;
      ctx.fill();

      /* Punto centrale */
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color + baseAlpha + ')';
      ctx.fill();
    }

    /* Connessioni — SOLO tra nodi della stessa banda */
    for (var i = 0; i < nodes.length; i++) {
      for (var j = i + 1; j < nodes.length; j++) {
        if (nodes[i].isLeft !== nodes[j].isLeft) continue; /* bande diverse: skip */
        var d = dist(nodes[i], nodes[j]);
        if (d < CONNECT_DIST) {
          var alpha = (1 - d / CONNECT_DIST) * 0.28;
          ctx.save();
          ctx.setLineDash([3, 7]);
          ctx.lineDashOffset = -(Date.now() / 100) % 10;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(37,99,235,' + alpha + ')';
          ctx.lineWidth = 0.7;
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    raf = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function () {
    resize();
    createNodes();
  }, { passive: true });

  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY || window.pageYOffset;
  }, { passive: true });

  resize();
  createNodes();
  draw();
}

/* ============================================================
   NAVIGATION — scroll spy + active link
   ============================================================ */
function initNavigation() {
  var nav      = document.getElementById('main-nav');
  var navLinks = document.querySelectorAll('.nav-link[data-section]');
  var sections = document.querySelectorAll('section[id]');

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

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var id = link.getAttribute('href').substring(1);
      var el = document.getElementById(id);
      if (el) {
        window.scrollTo({ top: el.offsetTop - nav.offsetHeight - 20, behavior: 'smooth' });
      }
      closeMobileMenu();
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('revealed'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseInt(entry.target.dataset.delay || '0', 10);
        setTimeout(function () { entry.target.classList.add('revealed'); }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  els.forEach(function (el) { observer.observe(el); });
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

    /* ── GUARDRAIL PRIVACY: blocco JS invalicabile ── */
    var privacyBox = document.getElementById('privacy-consent');
    if (!privacyBox || !privacyBox.checked) {
      /* Mostra il validation bubble nativo del browser sulla checkbox */
      if (form.reportValidity) form.reportValidity();
      return;
    }

    if (success) success.classList.add('hidden');
    if (error)   error.classList.add('hidden');

    /* Update subject field based on current language */
    var subjectField = document.getElementById('form-subject');
    if (subjectField) {
      subjectField.value = currentLang === 'en'
        ? 'New message from portfolio'
        : 'Nuovo messaggio dal portfolio';
    }

    if (btnText)   btnText.textContent = currentLang === 'en' ? 'Sending…' : 'Invio in corso…';
    if (spinner)   spinner.classList.remove('hidden');
    if (submitBtn) submitBtn.disabled = true;

    fetch('https://api.web3forms.com/submit', { 
      method: 'POST', 
      headers: {
        'Accept': 'application/json'
      },
      body: new FormData(form) 
    })
      .then(function (r) { 
        console.log("Risposta server:", r);
        return r.json(); 
      })
      .then(function (result) {
        console.log("Dati Web3Forms:", result);
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
   SKILL CARD TILT (3D perspective on hover)
   ============================================================ */
function initSkillCardTilt() {
  document.querySelectorAll('.skill-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var dx   = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      var dy   = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      card.style.transform  = 'translateY(-8px) rotateX(' + (-dy * 5) + 'deg) rotateY(' + (dx * 5) + 'deg)';
      card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform  = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease, border-color 0.5s ease';
    });
  });
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

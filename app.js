/* app.js — Volta Partners */

(function () {
  'use strict';

  // ===========================
  // CMS Configuration
  // ===========================
  var CGI_BIN = '__CGI_BIN__';

  // ===========================
  // Theme Toggle
  // ===========================
  var toggle = document.querySelector('[data-theme-toggle]');
  var root = document.documentElement;
  var theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function () {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
      updateToggleIcon();
    });
  }

  function updateToggleIcon() {
    if (!toggle) return;
    toggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  // ===========================
  // Mobile Menu
  // ===========================
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  var mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        mobileMenu.classList.add('is-open');
        menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function closeMobileMenu() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.remove('is-open');
    menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  // ===========================
  // Scroll Reveal (IntersectionObserver)
  // ===========================
  var revealObserver = null;

  function initReveal() {
    var revealElements = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
      });
    }

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  initReveal();

  // ===========================
  // Counter Animation for Metrics
  // ===========================
  var countersAnimated = false;
  var counterObserver = null;

  function getCounterEls() {
    return document.querySelectorAll('[data-count]');
  }

  function resetCounterDisplays() {
    getCounterEls().forEach(function (el) {
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + '0' + suffix;
    });
  }

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    getCounterEls().forEach(function (el) {
      var target = el.getAttribute('data-count');
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var targetNum = parseFloat(target);
      var duration = 800;
      var start = performance.now();

      function step(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = targetNum * eased;

        if (target.indexOf('.') !== -1) {
          el.textContent = prefix + current.toFixed(1) + suffix;
        } else {
          el.textContent = prefix + Math.round(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  function initCounters() {
    var counters = getCounterEls();
    if (counters.length === 0) return;

    resetCounterDisplays();
    countersAnimated = false;

    if (!('IntersectionObserver' in window)) {
      animateCounters();
      return;
    }

    if (counterObserver) counterObserver.disconnect();

    counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    var anchor = counters[0].closest('.metrics-bar') || counters[0];
    counterObserver.observe(anchor);
  }

  initCounters();

  // ===========================
  // Smooth Scroll for Anchor Links
  // ===========================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      if (anchor.dataset.smoothScroll) return;
      anchor.dataset.smoothScroll = '1';
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          closeMobileMenu();
        }
      });
    });
  }

  initSmoothScroll();

  // ===========================
  // Helper: generate initials from a name string
  // ===========================
  function getInitials(name) {
    var cleaned = name.split(',')[0].trim();
    var parts = cleaned.split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // ===========================
  // Helper: escape HTML to prevent XSS
  // ===========================
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ===========================
  // CMS: Load & Apply
  // ===========================
  async function loadCMSContent() {
    try {
      var res = await fetch(CGI_BIN + '/content.py');
      if (!res.ok) return;
      var content = await res.json();
      if (!content || content.error) return;
      applyCMSContent(content);
    } catch (e) {
      console.log('CMS: Using static content');
    }
  }

  function applyCMSContent(c) {
    function setText(selector, text) {
      var el = document.querySelector(selector);
      if (el && text !== undefined && text !== '') el.textContent = text;
    }

    function setHTML(selector, html) {
      var el = document.querySelector(selector);
      if (el && html !== undefined && html !== '') el.innerHTML = html;
    }

    function val(key) {
      return c[key] ? c[key].value : null;
    }

    function val2(key) {
      return c[key] ? c[key].value2 : null;
    }

    // ---- Meta ----
    if (val('page_title')) document.title = val('page_title');
    if (val('meta_description')) {
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', val('meta_description'));
    }

    // ---- Hero ----
    if (val('hero_overline')) setText('.hero__overline', val('hero_overline'));
    if (val('hero_title')) setText('.hero__title', val('hero_title'));
    if (val('hero_subtitle')) setText('.hero__subtitle', val('hero_subtitle'));
    if (val('hero_cta')) {
      var ctaEl = document.querySelector('.hero__cta');
      if (ctaEl) {
        var svgEl = ctaEl.querySelector('svg');
        ctaEl.textContent = val('hero_cta') + ' ';
        if (svgEl) ctaEl.appendChild(svgEl);
      }
    }

    // ---- Metrics ----
    var metricsContainer = document.querySelector('.metrics-bar__inner');
    if (metricsContainer) {
      var metrics = Object.entries(c)
        .filter(function (entry) { return entry[1].section === 'metrics'; })
        .sort(function (a, b) { return a[1].order - b[1].order; });

      if (metrics.length > 0) {
        metricsContainer.innerHTML = metrics.map(function (entry) {
          var m = entry[1];
          var raw = m.value;
          var match = raw.match(/^(\$?)([0-9.]+)(.*)$/);
          var prefix = match ? match[1] : '';
          var num = match ? match[2] : '0';
          var suffix = match ? match[3] : '';
          return '<div class="metric">'
            + '<div class="metric__value" data-count="' + escHtml(num) + '" data-prefix="' + escHtml(prefix) + '" data-suffix="' + escHtml(suffix) + '">' + escHtml(raw) + '</div>'
            + '<div class="metric__label">' + escHtml(m.value2) + '</div>'
            + '</div>';
        }).join('');
        initCounters();
      }
    }

    // ---- About ----
    if (val('about_title')) {
      var aboutHeading = document.querySelector('#about-heading');
      if (aboutHeading) {
        var titleText = val('about_title');
        var commaIdx = titleText.indexOf(',');
        if (commaIdx !== -1) {
          aboutHeading.innerHTML = escHtml(titleText.substring(0, commaIdx + 1)) + '<br>' + escHtml(titleText.substring(commaIdx + 1).trim());
        } else {
          aboutHeading.textContent = titleText;
        }
      }
    }
    var aboutParas = document.querySelectorAll('.about__text p');
    if (aboutParas.length >= 1 && val('about_p1')) aboutParas[0].textContent = val('about_p1');
    if (aboutParas.length >= 2 && val('about_p2')) aboutParas[1].textContent = val('about_p2');

    // ---- Services ----
    if (val('services_intro')) setText('#services-heading', val('services_intro'));
    if (val2('services_intro')) setText('#services .section__desc', val2('services_intro'));
    var servicesGrid = document.querySelector('.services-grid');
    if (servicesGrid) {
      var services = Object.entries(c)
        .filter(function (entry) { return entry[1].section === 'services' && entry[1].order > 0; })
        .sort(function (a, b) { return a[1].order - b[1].order; });
      if (services.length > 0) {
        servicesGrid.innerHTML = services.map(function (entry) {
          var s = entry[1];
          return '<div class="service-card reveal"><h3 class="service-card__title">' + escHtml(s.value) + '</h3><p class="service-card__desc">' + escHtml(s.value2) + '</p></div>';
        }).join('');
      }
    }

    // ---- Team ----
    if (val('team_intro')) setText('#team-heading', val('team_intro'));
    if (val2('team_intro')) setText('#team .section__desc', val2('team_intro'));
    var teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
      var members = Object.entries(c)
        .filter(function (entry) { return entry[1].section === 'team' && entry[1].order > 0; })
        .sort(function (a, b) { return a[1].order - b[1].order; });
      if (members.length > 0) {
        teamGrid.innerHTML = members.map(function (entry) {
          var m = entry[1];
          var initials = getInitials(m.value);
          return '<div class="team-card reveal"><div class="team-card__avatar" aria-hidden="true">' + escHtml(initials) + '</div><div class="team-card__info"><div class="team-card__name">' + escHtml(m.value) + '</div><div class="team-card__title">' + escHtml(m.value2) + '</div><div class="team-card__bio">' + escHtml(m.value3) + '</div></div></div>';
        }).join('');
      }
    }

    // ---- Engagements ----
    if (val('engagements_intro')) setText('#engagements-heading', val('engagements_intro'));
    if (val2('engagements_intro')) setText('#engagements .section__desc', val2('engagements_intro'));
    var engagementsGrid = document.querySelector('.engagements-grid');
    if (engagementsGrid) {
      var engagements = Object.entries(c)
        .filter(function (entry) { return entry[1].section === 'engagements' && entry[1].order > 0; })
        .sort(function (a, b) { return a[1].order - b[1].order; });
      if (engagements.length > 0) {
        engagementsGrid.innerHTML = engagements.map(function (entry) {
          var e = entry[1];
          return '<div class="engagement-card reveal"><div class="engagement-card__institution">' + escHtml(e.value2) + '</div><h3 class="engagement-card__title">' + escHtml(e.value) + '</h3><p class="engagement-card__desc">' + escHtml(e.value3) + '</p></div>';
        }).join('');
      }
    }

    // ---- Contact ----
    if (val('contact_email')) {
      var emailLink = document.querySelector('#contact a[href^="mailto"]');
      if (emailLink) {
        emailLink.href = 'mailto:' + val('contact_email');
        emailLink.textContent = val('contact_email');
      }
    }
    if (val('contact_locations')) {
      var locEl = document.querySelector('#contact .contact__item:last-child .contact__item-value');
      if (locEl) locEl.textContent = val('contact_locations');
    }

    // ---- Footer ----
    if (val('footer_brand') || val2('footer_brand')) {
      var footerBrand = document.querySelector('.footer__brand');
      if (footerBrand) {
        var brandName = val('footer_brand') || 'Volta Partners';
        var brandSub = val2('footer_brand') || '';
        footerBrand.innerHTML = '<strong>' + escHtml(brandName) + '</strong>' + (brandSub ? ' \u2014 ' + escHtml(brandSub) : '');
      }
    }
    if (val('footer_copyright')) setText('.footer__legal', val('footer_copyright'));

    // ---- Re-init ----
    initReveal();
    initSmoothScroll();
  }

  loadCMSContent();

})();
/* app.js — Volta Partners */

(function() {
  'use strict';

  // ===========================
  // Theme Toggle
  // ===========================
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateToggleIcon();

  if (toggle) {
    toggle.addEventListener('click', function() {
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
    menuBtn.addEventListener('click', function() {
      var isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        mobileMenu.classList.add('is-open');
        menuBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach(function(link) {
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
  // Scroll Reveal (IntersectionObserver fallback)
  // ===========================
  // Always use IntersectionObserver for .reveal elements
  var revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    // No IO support, just show everything
    revealElements.forEach(function(el) {
      el.classList.add('is-visible');
    });
  }

  // ===========================
  // Counter Animation for Metrics
  // ===========================
  var counters = document.querySelectorAll('[data-count]');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;

    counters.forEach(function(el) {
      var target = el.getAttribute('data-count');
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var targetNum = parseFloat(target);
      var duration = 800;
      var start = performance.now();

      function step(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        // Eased progress
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = targetNum * eased;

        if (target.includes('.')) {
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

  // Reset counters to 0 initially for animation
  counters.forEach(function(el) {
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    el.textContent = prefix + '0' + suffix;
  });

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(counters[0].closest('.metrics-bar') || counters[0]);
  }

  // ===========================
  // Smooth Scroll for CTA
  // ===========================
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
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

})();
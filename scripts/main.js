/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Minimal JavaScript for essential functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  initSmoothScroll();
  // Mobile navigation
  initMobileNav();
});

/**
 * Mobile Navigation Toggle
 */
function initMobileNav() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', function() {
    const isOpen = nav.classList.contains('is-open');
    nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', !isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Menü öffnen' : 'Menü schließen');
  });

  // Close menu when clicking a link
  nav.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Menü öffnen');
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');

      if (targetId === '#') return;

      const target = document.querySelector(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Email contact function (obfuscated against spam bots)
 */
function schicken() {
  window.location.href = "mailto:" + "kontakt" + "@" + "ki-sicherheit.jetzt";
  return false;
}

function schickenMitBetreff(subject) {
  window.location.href = "mailto:" + "kontakt" + "@" + "ki-sicherheit.jetzt" + "?subject=" + encodeURIComponent(subject);
  return false;
}

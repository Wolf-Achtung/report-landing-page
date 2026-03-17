/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Minimal JavaScript for essential functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  initSmoothScroll();
  // Mobile navigation
  initMobileNav();
  // Urgency banner rotation
  initUrgencyBanner();
  // Waitlist form
  initWaitlistForm();
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
 * Urgency Banner - rotating statements
 */
function initUrgencyBanner() {
  var statements = document.querySelectorAll('.urgency-statement');
  if (statements.length < 2) return;
  var current = 0;
  setInterval(function() {
    statements[current].classList.remove('urgency-active');
    current = (current + 1) % statements.length;
    statements[current].classList.add('urgency-active');
  }, 5000);
}

/**
 * Waitlist form submission
 */
function initWaitlistForm() {
  var form = document.getElementById('waitlist-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('waitlist_email').value;
    var statusEl = document.getElementById('waitlist-status');

    fetch('https://api-ki-backend-neu-production.up.railway.app/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        type: 'waitlist_training',
        timestamp: new Date().toISOString()
      })
    })
    .then(function(res) {
      if (res.ok) {
        statusEl.textContent = '✅ Eingetragen! Wir melden uns.';
        form.reset();
        if (typeof plausible === 'function') plausible('Waitlist-Training');
      } else {
        throw new Error();
      }
    })
    .catch(function() {
      statusEl.textContent = '❗ Fehler — bitte später nochmal versuchen.';
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

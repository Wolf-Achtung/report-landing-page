/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Minimal JavaScript for essential functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  // Smooth scroll for anchor links
  initSmoothScroll();
});

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

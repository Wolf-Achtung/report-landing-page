/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
  // Jahr im Footer automatisch setzen
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // FAQ Accordion Funktionalität
  initFAQ();

  // Smooth Scroll für Anchor Links
  initSmoothScroll();

  // CTA Button Click Handler
  initCTAButtons();
});

/**
 * FAQ Accordion initialisieren
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    if (question) {
      question.addEventListener('click', () => {
        // Schließe andere offene Items (optional: entfernen für Multi-Open)
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle aktuelles Item
        item.classList.toggle('active');
      });

      // Keyboard Accessibility
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    }
  });
}

/**
 * Smooth Scroll für Anchor Links
 */
function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');

      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}

/**
 * CTA Button Handler
 */
function initCTAButtons() {
  // Primary CTA - KI-Check anfragen
  const primaryCTAs = document.querySelectorAll('[data-action="request-check"]');
  primaryCTAs.forEach(btn => {
    btn.addEventListener('click', () => {
      // Hier kann später eine Modal-Funktionalität oder ein Redirect eingefügt werden
      window.location.href = 'mailto:kontakt@ki-sicherheit.jetzt?subject=KI-Check%20anfragen';
    });
  });

  // Secondary CTA - Beispiel-Report anfordern
  const secondaryCTAs = document.querySelectorAll('[data-action="request-sample"]');
  secondaryCTAs.forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = 'mailto:kontakt@ki-sicherheit.jetzt?subject=Beispiel-Report%20anfordern';
    });
  });
}

/**
 * Scroll Animation Observer (optional für fade-in Effekte)
 */
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });
}

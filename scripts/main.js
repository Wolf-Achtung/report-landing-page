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

  // Initialisierungen
  initDarkMode();
  initFAQ();
  initSmoothScroll();
  initCTAButtons();
  initPrivacyModal();
  initScrollReveal();
});

/* ==================== E-MAIL FUNKTION ==================== */

/**
 * Öffnet E-Mail-Client mit Kontaktadresse
 * Obfuskation der E-Mail-Adresse gegen Spam-Bots
 */
function schicken() {
  window.location.href = "mailto:" + "kontakt" + "@" + "ki-sicherheit.jetzt";
  return false;
}

/**
 * Öffnet E-Mail mit spezifischem Betreff
 * @param {string} subject - Der Betreff der E-Mail
 */
function schickenMitBetreff(subject) {
  window.location.href = "mailto:" + "kontakt" + "@" + "ki-sicherheit.jetzt" + "?subject=" + encodeURIComponent(subject);
  return false;
}

// Global verfügbar machen
window.schicken = schicken;
window.schickenMitBetreff = schickenMitBetreff;

/* ==================== DARK MODE ==================== */

/**
 * Dark Mode initialisieren
 */
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;

  // Status aus localStorage laden
  const savedMode = localStorage.getItem('darkMode');

  if (savedMode === 'true') {
    html.classList.add('dark-mode');
  } else if (savedMode === null) {
    // System-Präferenz prüfen
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.classList.add('dark-mode');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      html.classList.toggle('dark-mode');
      const isDark = html.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);
    });
  }

  // System-Änderungen beobachten
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('darkMode') === null) {
        if (e.matches) {
          html.classList.add('dark-mode');
        } else {
          html.classList.remove('dark-mode');
        }
      }
    });
  }
}

/* ==================== FAQ ACCORDION ==================== */

/**
 * FAQ Accordion initialisieren
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');

    if (question) {
      question.addEventListener('click', () => {
        // Schließe andere offene Items
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

/* ==================== SMOOTH SCROLL ==================== */

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

          // Offset für fixierte Elemente
          const offset = 20;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

/* ==================== CTA BUTTONS ==================== */

/**
 * CTA Button Handler
 */
function initCTAButtons() {
  // Primary CTA - KI-Check anfragen
  const primaryCTAs = document.querySelectorAll('[data-action="request-check"]');
  primaryCTAs.forEach(btn => {
    btn.addEventListener('click', () => {
      schickenMitBetreff('KI-Check anfragen');
    });
  });

  // Secondary CTA - Beispiel-Report anfordern
  const secondaryCTAs = document.querySelectorAll('[data-action="request-sample"]');
  secondaryCTAs.forEach(btn => {
    btn.addEventListener('click', () => {
      schickenMitBetreff('Beispiel-Report anfordern');
    });
  });

  // E-Mail Button
  const emailBtns = document.querySelectorAll('[data-action="email"]');
  emailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      schicken();
    });
  });
}

/* ==================== PRIVACY MODAL ==================== */

/**
 * Privacy Modal initialisieren
 */
function initPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  const fab = document.getElementById('legal-fab');
  const closeBtn = modal?.querySelector('.privacy-modal-close');
  const overlay = modal?.querySelector('.privacy-modal-overlay');

  if (!modal || !fab) return;

  // Modal öffnen
  fab.addEventListener('click', () => {
    openModal();
  });

  // Modal schließen - Close Button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal();
    });
  }

  // Modal schließen - Overlay Klick
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeModal();
    });
  }

  // Modal schließen - Escape Taste
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal();
    }
  });

  function openModal() {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    // Focus auf Modal setzen für Accessibility
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  function closeModal() {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    // Focus zurück auf FAB
    fab.focus();
  }
}

// Footer-Links für Datenschutz-Modal
function openPrivacyModal() {
  const modal = document.getElementById('privacy-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

window.openPrivacyModal = openPrivacyModal;

/* ==================== SCROLL REVEAL ==================== */

/**
 * Scroll Reveal Animationen initialisieren
 */
function initScrollReveal() {
  const revealSections = document.querySelectorAll('.reveal-section');

  if (revealSections.length === 0) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Element weiter beobachten entfernen für Performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealSections.forEach(section => {
    observer.observe(section);
  });
}

/* ==================== UTILITY FUNCTIONS ==================== */

/**
 * Debounce Funktion für Performance
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Prüft ob Element im Viewport ist
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

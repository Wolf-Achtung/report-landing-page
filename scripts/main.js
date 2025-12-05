/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Main JavaScript - PayPal-inspired Premium Version
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
  initHoverEffects();
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
 * Dark Mode initialisieren mit smoothen Transitions
 */
function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;

  // Prevent flash of wrong theme
  html.style.transition = 'none';

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

  // Re-enable transitions after initial load
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      html.style.transition = '';
    });
  });

  if (toggle) {
    toggle.addEventListener('click', () => {
      // Smooth transition
      html.style.transition = 'background-color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), color 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      html.classList.toggle('dark-mode');
      const isDark = html.classList.contains('dark-mode');
      localStorage.setItem('darkMode', isDark);

      // Haptic-like feedback animation
      toggle.style.transform = 'scale(0.9)';
      setTimeout(() => {
        toggle.style.transform = '';
      }, 150);
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
 * FAQ Accordion mit smoothen Animationen
 */
function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        // Schließe andere offene Items mit Animation
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
 * Smooth Scroll für Anchor Links mit easing
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
          const offset = 24;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

          // Smooth scroll with custom easing
          smoothScrollTo(targetPosition, 800);
        }
      }
    });
  });
}

/**
 * Custom smooth scroll function with easing
 */
function smoothScrollTo(targetPosition, duration) {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Easing function: easeInOutCubic
    const ease = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/* ==================== CTA BUTTONS ==================== */

/**
 * CTA Button Handler mit Click-Animation
 */
function initCTAButtons() {
  // Primary CTA - KI-Check anfragen
  const primaryCTAs = document.querySelectorAll('[data-action="request-check"]');
  primaryCTAs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      addRippleEffect(e, btn);
      setTimeout(() => {
        schickenMitBetreff('KI-Check anfragen');
      }, 200);
    });
  });

  // Secondary CTA - Beispiel-Report anfordern
  const secondaryCTAs = document.querySelectorAll('[data-action="request-sample"]');
  secondaryCTAs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      addRippleEffect(e, btn);
      setTimeout(() => {
        schickenMitBetreff('Beispiel-Report anfordern');
      }, 200);
    });
  });

  // E-Mail Button
  const emailBtns = document.querySelectorAll('[data-action="email"]');
  emailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      addRippleEffect(e, btn);
      setTimeout(() => {
        schicken();
      }, 200);
    });
  });
}

/**
 * Ripple effect for buttons
 */
function addRippleEffect(e, button) {
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s ease-out;
    pointer-events: none;
  `;

  // Ensure button has relative positioning
  const originalPosition = button.style.position;
  if (!originalPosition || originalPosition === 'static') {
    button.style.position = 'relative';
  }
  button.style.overflow = 'hidden';

  button.appendChild(ripple);

  // Add ripple keyframes if not exists
  if (!document.getElementById('ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

/* ==================== PRIVACY MODAL ==================== */

/**
 * Privacy Modal mit smoothen Animationen
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

    // Animate content
    const content = modal.querySelector('.privacy-modal-content');
    if (content) {
      content.style.transform = 'translateY(24px) scale(0.98)';
      requestAnimationFrame(() => {
        content.style.transform = '';
      });
    }

    // Focus auf Modal setzen für Accessibility
    const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 100);
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
 * Scroll Reveal Animationen mit IntersectionObserver
 */
function initScrollReveal() {
  const revealSections = document.querySelectorAll('.reveal-section');

  if (revealSections.length === 0) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show all sections immediately for users who prefer reduced motion
    revealSections.forEach(section => {
      section.classList.add('is-visible');
    });
    return;
  }

  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add staggered delay for children
        const revealItems = entry.target.querySelectorAll('.reveal-item');
        revealItems.forEach((item, index) => {
          item.style.animationDelay = `${index * 0.1 + 0.1}s`;
        });

        entry.target.classList.add('is-visible');

        // Stop observing after reveal
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealSections.forEach(section => {
    observer.observe(section);
  });
}

/* ==================== HOVER EFFECTS ==================== */

/**
 * Enhanced hover effects for cards
 */
function initHoverEffects() {
  // Card tilt effect on hover (subtle)
  const cards = document.querySelectorAll('.feature-card, .card, .testimonial-card, .kontakt-card');

  cards.forEach(card => {
    card.addEventListener('mouseenter', function(e) {
      this.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });

    card.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Very subtle rotation (max 2 degrees)
      const rotateX = (y - centerY) / centerY * -1.5;
      const rotateY = (x - centerX) / centerX * 1.5;

      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // Button hover sound feedback (visual only - pulse)
  const buttons = document.querySelectorAll('.btn-primary, .btn-accent, .email-btn');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
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
 * Throttle function for performance
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
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

/**
 * Get CSS variable value
 */
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

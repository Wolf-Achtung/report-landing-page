/**
 * KI-Sicherheit.jetzt - Report Landing Page
 * Main JavaScript - Premium Version with Soft Motion Design
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
  // initFloatingShapes(); // V3: Deaktiviert - Performance
  initReportMockupTilt();
  initMicroInteractions();
  initAmbientBackground();
  // initScrollParallax(); // V3: Deaktiviert - verursacht Scroll-Ruckler
  // initSectionCrossfade(); // V3: Deaktiviert - zu viel DOM-Manipulation
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

/* ==================== SCROLL REVEAL 2.0 ==================== */

/**
 * Premium Scroll Reveal mit Scale-In + Soft Fade
 * Transformation: 98% → 100%, Dauer ~300ms, ease-out
 */
function initScrollReveal() {
  const revealSections = document.querySelectorAll('.reveal-section');
  const revealItems = document.querySelectorAll('.reveal-item');

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Show all sections immediately for users who prefer reduced motion
    revealSections.forEach(section => {
      section.classList.add('is-visible');
    });
    revealItems.forEach(item => {
      item.classList.add('is-visible');
    });
    return;
  }

  // Set initial state for reveal items (scale-in effect)
  revealItems.forEach(item => {
    if (!item.classList.contains('is-visible')) {
      item.style.opacity = '0';
      item.style.transform = 'scale(0.98)';
      item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    }
  });

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  // Observer for sections
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        sectionObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observer for individual items with staggered animation
  const itemObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Calculate stagger delay based on sibling index
        const parent = entry.target.parentElement;
        const siblings = parent ? Array.from(parent.querySelectorAll('.reveal-item')) : [];
        const itemIndex = siblings.indexOf(entry.target);
        const delay = itemIndex * 80; // 80ms stagger

        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'scale(1)';
          entry.target.classList.add('is-visible');
        }, delay);

        itemObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  revealSections.forEach(section => {
    sectionObserver.observe(section);
  });

  revealItems.forEach(item => {
    itemObserver.observe(item);
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

/* ==================== FLOATING SHAPES ==================== */
/* V3: Diese Funktionen wurden deaktiviert für bessere Scroll-Performance.
 * Shapes sind jetzt statisch via CSS positioniert.
 * Code bleibt als Referenz erhalten, wird aber nicht aufgerufen.
 */

// function initFloatingShapes() { /* V3: Deaktiviert */ }
// function animateFloatingShape() { /* V3: Deaktiviert */ }

/* ==================== REPORT MOCKUP TILT ==================== */

/**
 * Report Mockup 3D Tilt Effect
 * V3: Deaktiviert - Tilt-Effekt entfernt für statischen, hochwertigen Look
 * Hover-Shadow wird jetzt nur über CSS gesteuert
 */
function initReportMockupTilt() {
  // V3: Tilt-Animation komplett deaktiviert
  // Hover-Effekt (Schatten verstärken) läuft jetzt rein über CSS
  // Siehe .report-mockup:hover .report-cover in main.css
  return;
}

/* ==================== MICRO INTERACTIONS ==================== */

/**
 * Micro Interactions für Icons, Cards und Buttons
 * Icons: Farbe füllen bei Hover
 * Cards: Minimaler Lift
 * Buttons: Sanfte Skalierung
 */
function initMicroInteractions() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Icon hover effects
  initIconHoverEffects();

  // Enhanced card interactions
  initCardMicroInteractions();

  // Timeline item interactions
  initTimelineInteractions();

  // Badge pulse effect
  initBadgePulse();
}

/**
 * Icon hover - sanftes Füllen der Farbe
 */
function initIconHoverEffects() {
  const iconContainers = document.querySelectorAll('.feature-card, .prozess-step, .card');

  iconContainers.forEach(container => {
    const icon = container.querySelector('svg, .icon, [class*="icon"]');
    if (!icon) return;

    container.addEventListener('mouseenter', () => {
      icon.style.transition = 'transform 0.3s ease-out, color 0.3s ease-out';
      icon.style.transform = 'scale(1.1)';
    });

    container.addEventListener('mouseleave', () => {
      icon.style.transform = 'scale(1)';
    });
  });
}

/**
 * Card micro interactions - sanfter Lift mit Schatten
 */
function initCardMicroInteractions() {
  const cards = document.querySelectorAll('.feature-card, .testimonial-card, .card, .kontakt-card, .prozess-step');

  cards.forEach(card => {
    // Smooth transition setup
    card.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Timeline interactions - Highlight bei Hover
 */
function initTimelineInteractions() {
  const timelineItems = document.querySelectorAll('.timeline-item, .timeline-h-item');

  timelineItems.forEach(item => {
    item.style.transition = 'transform 0.3s ease-out';

    item.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.02)';

      // Highlight the icon/number
      const marker = this.querySelector('.timeline-icon, .timeline-h-icon');
      if (marker) {
        marker.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
        marker.style.transform = 'scale(1.1)';
        marker.style.boxShadow = '0 0 20px rgba(244, 196, 125, 0.5)';
      }
    });

    item.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';

      const marker = this.querySelector('.timeline-icon, .timeline-h-icon');
      if (marker) {
        marker.style.transform = 'scale(1)';
        marker.style.boxShadow = '';
      }
    });
  });
}

/**
 * Badge pulse effect - sanftes Pulsieren
 */
function initBadgePulse() {
  const badges = document.querySelectorAll('.badge, .trust-badge');

  badges.forEach((badge, index) => {
    // Stagger the pulse animation
    badge.style.animationDelay = `${index * 0.5}s`;
  });
}

/* ==================== DATA SHAPES ANIMATION ==================== */

/**
 * Animate data shapes (dots and lines)
 */
function initDataShapesAnimation() {
  const dots = document.querySelectorAll('.shape-dots');
  const lines = document.querySelectorAll('.shape-lines');

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Dots get a subtle floating animation
  dots.forEach((dot, index) => {
    dot.style.animation = `floatDots ${10 + index * 2}s ease-in-out infinite`;
    dot.style.animationDelay = `${index * 0.5}s`;
  });

  // Lines get a subtle pulse animation
  lines.forEach((line, index) => {
    line.style.animation = `pulseLine ${8 + index * 2}s ease-in-out infinite`;
    line.style.animationDelay = `${index * 0.3}s`;
  });
}

// Initialize data shapes animation
document.addEventListener('DOMContentLoaded', initDataShapesAnimation);

/* ==================== AMBIENT BACKGROUND ENGINE ==================== */

/**
 * Initialize the ambient background with dot matrix and organic shapes
 * Creates a living, breathing background texture
 */
function initAmbientBackground() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  // Create ambient background container if it doesn't exist
  let ambientBg = document.querySelector('.ambient-bg');
  if (!ambientBg) {
    ambientBg = document.createElement('div');
    ambientBg.className = 'ambient-bg';
    ambientBg.innerHTML = `
      <div class="dot-matrix" id="dot-matrix"></div>
      <div class="ambient-shape ambient-shape-warm ambient-shape-1"></div>
      <div class="ambient-shape ambient-shape-blue ambient-shape-2"></div>
      <div class="ambient-shape ambient-shape-warm ambient-shape-3"></div>
    `;
    document.body.insertBefore(ambientBg, document.body.firstChild);
  }

  // V3: initAmbientDrift() entfernt - requestAnimationFrame-Loop verursachte Scroll-Ruckler
  // Dot-Matrix ist jetzt statisch - sieht genauso gut aus, performt besser
}

/* ==================== V3: DEAKTIVIERTE ANIMATIONEN ==================== */
/*
 * Die folgenden Funktionen wurden in V3 deaktiviert, um Scroll-Performance zu verbessern:
 * - initAmbientDrift() - Kontinuierlicher requestAnimationFrame-Loop
 * - initScrollParallax() - Scroll-Event mit requestAnimationFrame
 * - initSectionCrossfade() - IntersectionObserver mit DOM-Manipulationen
 * - initAmbientShapeFloating() - Lissajous-Animation mit requestAnimationFrame
 *
 * Ersetzt durch:
 * - Statische CSS-Positionierung für alle dekorativen Elemente
 * - Langsame CSS-only Animationen (12-30s Loops) für dezente Bewegung
 * - Hover-Effekte rein über CSS gesteuert
 */

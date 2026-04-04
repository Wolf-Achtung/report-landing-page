/**
 * KI-Potenzial-Check — Frontend Logic
 * Step form, API call, result rendering, share functions
 */

const API_URL = 'https://api-ki-backend-neu-production.up.railway.app/api/appetizer/generate';
const CTA_BASE_URL = 'https://make.ki-sicherheit.jetzt';

let currentStep = 1;
const totalSteps = 6;

// Display name maps
const BRANCHEN_DISPLAY = {
  marketing: 'Marketing & Werbung',
  beratung: 'Beratung & Dienstleistungen',
  it: 'IT & Software',
  finanzen: 'Finanzen & Versicherung',
  handel: 'Handel & E-Commerce',
  bildung: 'Bildung & Weiterbildung',
  verwaltung: 'Öffentliche Verwaltung',
  gesundheit: 'Gesundheit & Pflege',
  bau: 'Bau & Handwerk',
  medien: 'Medien & Produktion',
  industrie: 'Industrie & Fertigung',
  logistik: 'Logistik & Transport',
  gastronomie: 'Gastronomie & Hotellerie',
};

const SEGMENT_DISPLAY = {
  '1': 'Soloselbständig',
  '2-10': 'Kleinunternehmen (2–10 MA)',
  '11-100': 'Mittelstand (11–100 MA)',
};

// Store last result for share functions
let lastResult = null;
let lastFormData = null;

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function nextStep(step) {
  if (!validateStep(step)) return;
  showStep(step + 1);
}

function prevStep(step) {
  showStep(step - 1);
}

function showStep(step) {
  currentStep = step;
  // Hide hero when advancing past step 1
  const hero = document.querySelector('.hero-block');
  if (hero) hero.style.display = step > 1 ? 'none' : '';

  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  const target = document.querySelector(`.step[data-step="${step}"]`);
  if (target) target.classList.add('active');
  document.getElementById('progressFill').style.width = `${(step / totalSteps) * 100}%`;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Track analytics
  if (step > 1 && window.plausible) {
    plausible('check_step_' + step);
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep(step) {
  clearErrors();

  switch (step) {
    case 1: {
      const branche = document.getElementById('branche');
      if (!branche.value) { branche.classList.add('error'); return false; }
      if (window.plausible) plausible('check_started');
      return true;
    }
    case 2: {
      const mitarbeiter = document.querySelector('input[name="mitarbeiter"]:checked');
      const hauptleistung = document.getElementById('hauptleistung');
      let valid = true;
      if (!mitarbeiter) {
        document.querySelectorAll('.step[data-step="2"] .radio-card').forEach(c => c.classList.add('error'));
        valid = false;
      }
      if (hauptleistung.value.trim().length < 10) {
        hauptleistung.classList.add('error');
        showFieldHint(hauptleistung, 'Bitte beschreiben Sie Ihre Leistung etwas genauer.');
        valid = false;
      }
      return valid;
    }
    case 3: {
      const selected = document.querySelector('input[name="zeitaufwand_repetitiv"]:checked');
      if (!selected) {
        document.querySelectorAll('.step[data-step="3"] .radio-card').forEach(c => c.classList.add('error'));
        return false;
      }
      return true;
    }
    case 4: {
      const selected = document.querySelector('input[name="ki_erfahrung"]:checked');
      if (!selected) {
        document.querySelectorAll('.step[data-step="4"] .radio-card').forEach(c => c.classList.add('error'));
        return false;
      }
      return true;
    }
    case 5: {
      const herausforderung = document.getElementById('groesste_herausforderung');
      if (herausforderung.value.trim().length < 10) {
        herausforderung.classList.add('error');
        showFieldHint(herausforderung, 'Ein paar Worte mehr helfen uns, Ihnen bessere Ergebnisse zu liefern.');
        return false;
      }
      return true;
    }
    default:
      return true;
  }
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.field-hint-dynamic').forEach(el => el.remove());
}

function showFieldHint(el, msg) {
  const existing = el.parentElement.querySelector('.field-hint-dynamic');
  if (existing) return;
  const hint = document.createElement('p');
  hint.className = 'field-hint-dynamic';
  hint.textContent = msg;
  el.parentElement.appendChild(hint);
}

// ---------------------------------------------------------------------------
// Form Submission
// ---------------------------------------------------------------------------

function getFormData() {
  return {
    firma: 'Unternehmen',
    branche: document.getElementById('branche').value,
    mitarbeiter: document.querySelector('input[name="mitarbeiter"]:checked')?.value || '',
    hauptleistung: document.getElementById('hauptleistung').value.trim(),
    zeitaufwand_repetitiv: document.querySelector('input[name="zeitaufwand_repetitiv"]:checked')?.value || '',
    ki_erfahrung: document.querySelector('input[name="ki_erfahrung"]:checked')?.value || '',
    groesste_herausforderung: document.getElementById('groesste_herausforderung').value.trim(),
    email: document.getElementById('email').value.trim() || null,
    newsletter_optin: document.getElementById('newsletter_optin').checked,
  };
}

async function submitForm() {
  // Validate email if provided
  const emailField = document.getElementById('email');
  if (emailField.value.trim()) {
    const emailVal = emailField.value.trim();
    if (!emailVal.includes('@') || !emailVal.split('@')[1].includes('.')) {
      emailField.classList.add('error');
      return;
    }
    if (window.plausible) plausible('check_email_provided');
  }

  const data = getFormData();

  // Show loading, hide hero + form
  const hero = document.querySelector('.hero-block');
  if (hero) hero.style.display = 'none';
  document.getElementById('formContainer').style.display = 'none';
  document.getElementById('loadingScreen').classList.add('active');
  document.getElementById('errorScreen').classList.remove('active');
  document.getElementById('resultScreen').classList.remove('active');

  if (window.plausible) plausible('check_completed');

  animateLoadingSteps();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `Fehler ${response.status}`);
    }

    const result = await response.json();

    // Minimum loading time for UX
    await new Promise(resolve => setTimeout(resolve, 1500));

    document.getElementById('loadingScreen').classList.remove('active');
    renderResult(data, result.result);
    document.getElementById('resultScreen').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.plausible) plausible('check_result_shown');
  } catch (err) {
    document.getElementById('loadingScreen').classList.remove('active');
    document.getElementById('errorMessage').textContent =
      err.message || 'Unsere Server sind gerade ausgelastet. Bitte versuchen Sie es in einer Minute erneut.';
    document.getElementById('errorScreen').classList.add('active');
    if (window.plausible) plausible('check_error');
  }
}

function retrySubmit() {
  document.getElementById('errorScreen').classList.remove('active');
  document.getElementById('formContainer').style.display = 'block';
  showStep(6);
}

// ---------------------------------------------------------------------------
// Loading Animation
// ---------------------------------------------------------------------------

function animateLoadingSteps() {
  const steps = ['ls1', 'ls2', 'ls3', 'ls4'];
  const texts = [
    'Branchendaten werden analysiert',
    'KI-Hebel werden identifiziert',
    'Monetarisierungschancen werden berechnet',
    'Handlungsempfehlungen werden erstellt',
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) {
      document.getElementById(steps[i - 1]).classList.remove('active');
      document.getElementById(steps[i - 1]).classList.add('done');
    }
    if (i < steps.length) {
      document.getElementById(steps[i]).classList.add('active');
      document.getElementById('loadingText').textContent = texts[i];
      i++;
    } else {
      clearInterval(interval);
    }
  }, 3000);
}

// ---------------------------------------------------------------------------
// Result Rendering
// ---------------------------------------------------------------------------

function renderResult(formData, result) {
  lastResult = result;
  lastFormData = formData;

  // Result header meta
  const brancheDisplay = BRANCHEN_DISPLAY[formData.branche] || formData.branche;
  const segmentDisplay = SEGMENT_DISPLAY[formData.mitarbeiter] || formData.mitarbeiter;
  document.getElementById('resultMeta').textContent = `${brancheDisplay} · ${segmentDisplay}`;

  // Score
  const score = result.score;
  animateScore(score.wert, score.einordnung);
  document.getElementById('scoreText').textContent = score.einordnung_text;

  // Hebel
  const hebelGrid = document.getElementById('hebelGrid');
  let totalZeitersparnis = 0;
  hebelGrid.innerHTML = result.hebel.map(h => {
    totalZeitersparnis += h.zeitersparnis_pro_woche_stunden || 0;
    return `
    <div class="hebel-card">
      <div class="hebel-header">
        <span class="hebel-title">${escapeHtml(h.titel)}</span>
        <span class="hebel-badge ${h.kategorie.toLowerCase()}">${h.kategorie}</span>
      </div>
      <p class="hebel-desc">${escapeHtml(h.beschreibung)}</p>
      <div class="hebel-meta">
        <span class="hebel-meta-item">Aufwand: <strong>${h.aufwand}</strong></span>
        <span class="hebel-meta-item">Wirkung: <strong>${h.wirkung}</strong></span>
        <span class="hebel-meta-item">~${h.zeitersparnis_pro_woche_stunden}h/Woche</span>
        <span class="hebel-meta-item">${formatPrioritaet(h.prioritaet)}</span>
      </div>
    </div>
  `;
  }).join('');

  // Hebel summary — segment-specific wording
  const potenzialLabel = formData.mitarbeiter === '1' ? 'Ihr Potenzial' : 'Potenzial im Team';
  document.getElementById('hebelSummary').textContent =
    `Gesamt: ~${totalZeitersparnis}h/Woche ${potenzialLabel}`;

  // Monetarisierung
  const monetGrid = document.getElementById('monetGrid');
  monetGrid.innerHTML = result.monetarisierung.map(m => {
    const teaserText = m.teaser && m.teaser.toLowerCase().includes('bericht')
      ? m.teaser
      : (m.teaser || 'Umsatzpotenzial: Details im vollständigen KI-Strategiebericht');
    return `
    <div class="monet-card stufe-${m.stufe.split('_')[1]}">
      <div class="monet-header">
        <span class="monet-title">${escapeHtml(m.titel)}</span>
        <span class="monet-stufe">${formatStufe(m.stufe)}</span>
      </div>
      <p class="monet-desc">${escapeHtml(m.beschreibung)}</p>
      <p class="monet-teaser">${escapeHtml(teaserText)}</p>
    </div>
  `;
  }).join('');

  // Positionierung
  document.getElementById('positionierungText').textContent = result.positionierung;

  // CTA — replace any hour figure in the LLM headline with the actual sum
  const ctaHeadline = result.cta.headline.replace(/\d+\s*h\b/i, `${totalZeitersparnis}h`);
  document.getElementById('ctaHeadline').textContent = ctaHeadline;
  document.getElementById('ctaSubline').textContent = result.cta.subline;

  const ctaParams = new URLSearchParams({
    ref: 'potenzial-check',
    branche: formData.branche,
    mitarbeiter: formData.mitarbeiter,
    hauptleistung: formData.hauptleistung,
  });
  const ctaLink = document.getElementById('ctaLink');
  ctaLink.href = `${CTA_BASE_URL}?${ctaParams.toString()}`;
  ctaLink.addEventListener('click', () => {
    if (window.plausible) plausible('check_cta_clicked');
  }, { once: true });
}

// ---------------------------------------------------------------------------
// Score Gauge Animation
// ---------------------------------------------------------------------------

function animateScore(targetScore, einordnung) {
  const scoreValue = document.getElementById('scoreValue');
  const scoreLabel = document.getElementById('scoreLabel');
  const gaugeArc = document.getElementById('gaugeArc');
  const gaugeNeedle = document.getElementById('gaugeNeedle');

  scoreLabel.textContent = einordnung;
  scoreLabel.className = 'score-label ' + einordnung.toLowerCase();

  // Score range: 37–98, map to 0–100%
  const minScore = 37;
  const maxScore = 98;
  const pct = Math.max(0, Math.min(1, (targetScore - minScore) / (maxScore - minScore)));

  const totalArcLength = 251.2;
  const targetAngle = -90 + (pct * 180);

  let current = 0;
  const duration = 1500;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    current = Math.round(eased * targetScore);
    scoreValue.textContent = current;

    gaugeArc.setAttribute('stroke-dashoffset', totalArcLength * (1 - eased * pct));
    gaugeNeedle.setAttribute('transform', `rotate(${-90 + eased * (targetAngle + 90)}, 100, 110)`);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

// ---------------------------------------------------------------------------
// Share Functions
// ---------------------------------------------------------------------------

function initShareButtons() {
  document.getElementById('shareLinkedIn')?.addEventListener('click', () => {
    if (!lastResult || !lastFormData) return;
    const score = lastResult.score.wert;
    const text = `Ich habe gerade meinen KI-Potenzial-Check gemacht: Score ${score}/100. Wo steht Ihr Unternehmen?`;
    const url = 'https://report.ki-sicherheit.jetzt/potenzial-check';
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
      '_blank', 'width=600,height=500'
    );
    if (window.plausible) plausible('check_shared', { props: { method: 'linkedin' } });
  });

  document.getElementById('shareEmail')?.addEventListener('click', () => {
    if (!lastResult) return;
    const score = lastResult.score.wert;
    const subject = 'Mein KI-Potenzial-Check Ergebnis';
    const body = `Ich habe gerade meinen KI-Potenzial-Check gemacht und einen Score von ${score}/100 erreicht.\n\nMach den kostenlosen Check: https://report.ki-sicherheit.jetzt/potenzial-check`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (window.plausible) plausible('check_shared', { props: { method: 'email' } });
  });

  document.getElementById('shareCopy')?.addEventListener('click', () => {
    const url = 'https://report.ki-sicherheit.jetzt/potenzial-check';
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('shareCopy');
      const original = btn.innerHTML;
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Kopiert!';
      setTimeout(() => { btn.innerHTML = original; }, 2000);
    });
    if (window.plausible) plausible('check_shared', { props: { method: 'link' } });
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatCurrency(num) {
  return new Intl.NumberFormat('de-DE').format(num);
}

function formatPrioritaet(p) {
  const map = { SOFORT: 'Sofort umsetzbar', QUARTAL_1: 'In Q1 umsetzbar', QUARTAL_2: 'In Q2 umsetzbar' };
  return map[p] || p;
}

function formatStufe(s) {
  const map = { STUFE_1: 'Einstieg', STUFE_2: 'Ausbau', STUFE_3: 'Skalierung' };
  return map[s] || s;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Character counter for textarea
  const textarea = document.getElementById('groesste_herausforderung');
  const charCount = document.getElementById('charCount');
  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      charCount.textContent = textarea.value.length;
    });
  }

  // Clear error on input
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const hint = el.parentElement?.querySelector('.field-hint-dynamic');
      if (hint) hint.remove();
    });
    el.addEventListener('change', () => {
      el.classList.remove('error');
      const card = el.closest('.radio-card');
      if (card) card.classList.remove('error');
    });
  });

  // Keyboard: Enter = Weiter
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      const active = document.querySelector('.step.active');
      if (!active) return;
      const step = parseInt(active.dataset.step);
      if (step === 6) {
        e.preventDefault();
        submitForm();
      } else if (step >= 1 && step <= 5) {
        // Don't trigger on textarea
        if (e.target.tagName === 'TEXTAREA') return;
        e.preventDefault();
        nextStep(step);
      }
    }
  });

  // Radio auto-advance: click on radio card auto-advances after 300ms
  document.querySelectorAll('.radio-group-vertical .radio-card input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const step = parseInt(radio.closest('.step')?.dataset.step);
      if (step && step >= 3 && step <= 4) {
        setTimeout(() => nextStep(step), 300);
      }
    });
  });

  // Init share buttons
  initShareButtons();
});

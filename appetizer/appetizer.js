/**
 * KI-Business-Appetizer — Frontend Logic
 * Step form, API call, result rendering
 */

const API_URL = 'https://api-ki-backend-neu-production.up.railway.app/api/appetizer/generate';
const CTA_BASE_URL = 'https://make.ki-sicherheit.jetzt/fragebogen';

let currentStep = 1;
const totalSteps = 6;

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
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active'));
  const target = document.querySelector(`.step[data-step="${step}"]`);
  if (target) target.classList.add('active');
  document.getElementById('progressFill').style.width = `${(step / totalSteps) * 100}%`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep(step) {
  clearErrors();

  switch (step) {
    case 1: {
      const firma = document.getElementById('firma');
      const branche = document.getElementById('branche');
      let valid = true;
      if (!firma.value.trim()) { firma.classList.add('error'); valid = false; }
      if (!branche.value) { branche.classList.add('error'); valid = false; }
      return valid;
    }
    case 2: {
      const mitarbeiter = document.querySelector('input[name="mitarbeiter"]:checked');
      const hauptleistung = document.getElementById('hauptleistung');
      let valid = true;
      if (!mitarbeiter) {
        document.querySelectorAll('.step[data-step="2"] .radio-card').forEach(c => c.classList.add('error'));
        valid = false;
      }
      if (!hauptleistung.value.trim()) { hauptleistung.classList.add('error'); valid = false; }
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
      if (!herausforderung.value.trim()) { herausforderung.classList.add('error'); return false; }
      return true;
    }
    default:
      return true;
  }
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// ---------------------------------------------------------------------------
// Form Submission
// ---------------------------------------------------------------------------

function getFormData() {
  return {
    firma: document.getElementById('firma').value.trim(),
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
  if (!validateStep(5)) {
    showStep(5);
    return;
  }

  const data = getFormData();

  // Show loading
  document.getElementById('formContainer').style.display = 'none';
  document.getElementById('loadingScreen').classList.add('active');
  document.getElementById('errorScreen').classList.remove('active');
  document.getElementById('resultScreen').classList.remove('active');

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
  } catch (err) {
    document.getElementById('loadingScreen').classList.remove('active');
    document.getElementById('errorMessage').textContent = err.message || 'Bitte versuchen Sie es erneut.';
    document.getElementById('errorScreen').classList.add('active');
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
  // Company name
  document.getElementById('resultFirma').textContent = `KI-Potenzial: ${formData.firma}`;

  // Score
  const score = result.score;
  animateScore(score.wert, score.einordnung);
  document.getElementById('scoreText').textContent = score.einordnung_text;

  // Hebel
  const hebelGrid = document.getElementById('hebelGrid');
  hebelGrid.innerHTML = result.hebel.map(h => `
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
  `).join('');

  // Monetarisierung
  const monetGrid = document.getElementById('monetGrid');
  monetGrid.innerHTML = result.monetarisierung.map(m => `
    <div class="monet-card stufe-${m.stufe.split('_')[1]}">
      <div class="monet-header">
        <span class="monet-title">${escapeHtml(m.titel)}</span>
        <span class="monet-stufe">${formatStufe(m.stufe)}</span>
      </div>
      <p class="monet-desc">${escapeHtml(m.beschreibung)}</p>
      <div class="monet-value">+${formatCurrency(m.umsatzpotenzial_monat_eur)} €/Monat</div>
      <p class="monet-teaser">${escapeHtml(m.teaser)}</p>
    </div>
  `).join('');

  // Positionierung
  document.getElementById('positionierungText').textContent = result.positionierung;

  // CTA
  document.getElementById('ctaHeadline').textContent = result.cta.headline;
  document.getElementById('ctaSubline').textContent = result.cta.subline;

  const ctaParams = new URLSearchParams({
    ref: 'appetizer',
    firma: formData.firma,
    branche: formData.branche,
    mitarbeiter: formData.mitarbeiter,
    hauptleistung: formData.hauptleistung,
  });
  document.getElementById('ctaLink').href = `${CTA_BASE_URL}?${ctaParams.toString()}`;
}

// ---------------------------------------------------------------------------
// Score Gauge Animation
// ---------------------------------------------------------------------------

function animateScore(targetScore, einordnung) {
  const scoreValue = document.getElementById('scoreValue');
  const scoreLabel = document.getElementById('scoreLabel');
  const gaugeArc = document.getElementById('gaugeArc');
  const gaugeNeedle = document.getElementById('gaugeNeedle');

  // Set label
  scoreLabel.textContent = einordnung;
  scoreLabel.className = 'score-label ' + einordnung.toLowerCase();

  // Calculate arc and needle position
  // Score range: 37–98, map to 0–100%
  const minScore = 37;
  const maxScore = 98;
  const pct = Math.max(0, Math.min(1, (targetScore - minScore) / (maxScore - minScore)));

  const totalArcLength = 251.2;
  const targetOffset = totalArcLength * (1 - pct);

  // Needle rotation: -90 (left) to +90 (right)
  const targetAngle = -90 + (pct * 180);

  // Animate counter
  let current = 0;
  const duration = 1500;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

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
    el.addEventListener('input', () => el.classList.remove('error'));
    el.addEventListener('change', () => {
      el.classList.remove('error');
      // Also clear radio card errors
      const card = el.closest('.radio-card');
      if (card) card.classList.remove('error');
    });
  });
});

# Landing Page Analyse — Ergebnis

**Datum:** 09.03.2026
**Repo:** `Wolf-Achtung/report-landing-page`
**Analysiert von:** Claude Code

---

## 1. Repo-Übersicht

### Gefundene Repositories

| Repo | Vermutete URL | Stack | Build | package.json |
|------|--------------|-------|-------|--------------|
| `report-landing-page` | `report.ki-sicherheit.jetzt` | **Vanilla JS + HTML + CSS** (kein React, kein Bundler) | **Statisch** (kein Build-Prozess) | **Nein** |

**Nur ein einziges Repo gefunden.** Kein `make-ki-frontend`-Repo im Dateisystem. `gh` CLI ist nicht verfügbar, daher konnte keine Repo-Liste vom GitHub-Account abgerufen werden.

### Verzeichnisstruktur (Top-Level)

```
report-landing-page/
├── index.html                    # Hauptseite (Landing Page DE)
├── kontakt.html                  # Kontaktformular
├── impressum.html                # Impressum (Tailwind CDN!)
├── datenschutz.html              # Datenschutz (Tailwind CDN!)
├── 404.html                      # Fehlerseite
├── netzstruktur.svg              # SVG-Grafik
├── aktuell/                      # News-Bereich DE
│   ├── index.html                # News-Hub
│   ├── nis2-dezember-2025.html   # Artikel NIS2
│   ├── foerderung-ki-digital-2026.html  # Artikel Förderung
│   └── termine-2026.html         # Termine-Übersicht
├── en/                           # Englische Version
│   ├── index.html                # Landing Page EN
│   ├── contact.html              # Kontakt EN
│   └── news/                     # News EN
│       ├── index.html
│       ├── nis2-december-2025.html
│       ├── funding-ai-digital-2026.html
│       └── calendar-2026.html
├── make/                         # App-Einstiegspunkt (make.ki-sicherheit.jetzt)
│   ├── index.html                # KI-Check Startseite
│   ├── login.html                # Login-Seite
│   └── styles/
│       └── make.css              # Eigenes Design-System
├── scripts/
│   └── main.js                   # Minimal JS (82 Zeilen)
├── styles/
│   └── main.css                  # Haupt-CSS (2.922 Zeilen)
└── visuals/
    ├── tuev-austria-logo.svg
    ├── dsgvo-badge.svg
    ├── eu-ai-act-badge.svg
    ├── process-images.sh
    ├── desktop/  (7x .webp)
    ├── mobile/   (7x .webp)
    └── tablet/   (7x .webp)
```

### Netlify-Konfiguration

**Keine Netlify-Konfiguration gefunden:**
- Kein `netlify.toml`
- Keine `_redirects`
- Keine `_headers`

---

## 2. Seiten-Inventar — Alle HTML-Dateien

### Hauptseiten (DE)

| Datei | Titel | Zeilen | Zweck | viewport | Externe Deps |
|-------|-------|--------|-------|----------|-------------|
| `index.html` | KI-Readiness-Report | 414 | **Landing Page** — Hero, Benefits, Examples, Trust, CTA | ✅ | Google Fonts (Inter, Playfair Display, Share Tech Mono) |
| `kontakt.html` | Kontakt | 282 | **Kontaktformular** — mailto-basiert | ✅ | Google Fonts |
| `impressum.html` | Impressum | 119 | **Impressum** — rechtliche Pflichtseite | ✅ | **Tailwind CSS CDN** + Google Fonts |
| `datenschutz.html` | Datenschutzerklärung | 105 | **Datenschutz** — DSGVO-Info | ✅ | **Tailwind CSS CDN** + Google Fonts |
| `404.html` | Seite nicht gefunden | 102 | **Fehlerseite** — custom 404 | ✅ | Keine externen (nur main.css) |

### News-Bereich (DE)

| Datei | Titel | Zeilen | Zweck |
|-------|-------|--------|-------|
| `aktuell/index.html` | Aktuell | 348 | **News-Hub** — Dashboard mit News, Termine, Events |
| `aktuell/nis2-dezember-2025.html` | NIS2 | 296 | **Artikel** — NIS2 Umsetzungsgesetz |
| `aktuell/foerderung-ki-digital-2026.html` | Förderung | 312 | **Artikel** — EU & Bundesförderung |
| `aktuell/termine-2026.html` | Termine 2026 | 425 | **Termine** — Fristen & Deadlines |

### Englische Version

| Datei | Titel | Zeilen | Zweck |
|-------|-------|--------|-------|
| `en/index.html` | AI Check Report | 365 | Landing Page EN (Spiegelung von index.html) |
| `en/contact.html` | Contact | 254 | Kontakt EN |
| `en/news/index.html` | News | 348 | News-Hub EN |
| `en/news/nis2-december-2025.html` | NIS2 | 296 | Artikel EN |
| `en/news/funding-ai-digital-2026.html` | Funding | 312 | Artikel EN |
| `en/news/calendar-2026.html` | Calendar 2026 | 425 | Termine EN |

### Make-Bereich (App-Einstieg)

| Datei | Titel | Zeilen | Zweck | Dark Mode |
|-------|-------|--------|-------|-----------|
| `make/index.html` | KI-Check starten | 166 | **App-Startseite** — CTA zum KI-Check starten | ✅ Ja |
| `make/login.html` | Anmelden | 238 | **Login** — E-Mail + 6-stelliger Code | ✅ Ja |

**Gesamt: 17 HTML-Dateien**

---

## 3. Architektur-Klarstellung: Was lebt wo?

### Domain-Mapping (aus den OG-Tags und internen Links abgeleitet)

| Domain | Inhalt im Repo | Verzeichnis |
|--------|---------------|-------------|
| `report.ki-sicherheit.jetzt` | Landing Page + News + Kontakt + Legal | Root (`/`) |
| `make.ki-sicherheit.jetzt` | KI-Check Start + Login | `/make/` |

**Wichtige Erkenntnis:** Beide Domains werden aus **demselben Repo** bedient. Die `make/`-Seiten haben:
- Ein **eigenes CSS** (`make/styles/make.css`, 810 Zeilen)
- **Dark Mode** Support (fehlt bei den Hauptseiten!)
- Ein **eigenes Design-System** (andere CSS-Variablen-Namenskonvention)

### Es gibt KEIN separates React-Repo

- **Kein `package.json`** im gesamten Repo
- **Keine JSX/TSX-Dateien**
- **Kein Bundler** (kein webpack, vite, etc.)
- **Alles ist reines statisches HTML + CSS + Vanilla JS**
- Die `make/`-Seiten sind **reine Frontends** — kein API-Call, kein fetch(), kein Backend

### Externe Links

- Login-Link verweist auf `https://make.ki-sicherheit.jetzt` (extern)
- CTA-Buttons verweisen ebenfalls dorthin
- **Frage:** Wo liegt die eigentliche App-Logik? Die `make/` Seiten hier sind nur der Einstieg/Login. Das Backend/die App muss anderswo sein.

---

## 4. Design-System

### Zwei parallele Design-Systeme!

#### A) Haupt-CSS (`styles/main.css`, 2.922 Zeilen)

**CSS-Variablen-Prefix:** `--mk-*`

| Kategorie | Werte |
|-----------|-------|
| **Navy Palette** | `#0a1628` (900) bis `#e8f2fa` (50) — 10 Abstufungen |
| **Warm Gold** | `#a68921` (600) bis `#faf4dc` (100) — 6 Abstufungen |
| **Text** | Primary `#0e1525`, Secondary `#3d4f63`, Muted `#6b7a8c` |
| **Background** | `linear-gradient(135deg, #f0f5fa, #faf8f5, #f5f8fc)` |
| **Fonts** | `Inter` (Body), `Playfair Display` (Headings), `Share Tech Mono` (Brand) |
| **Dot Matrix** | Subtiler Hintergrund-Effekt mit `radial-gradient` |
| **Dark Mode** | **NEIN — nicht implementiert** |

#### B) Make-CSS (`make/styles/make.css`, 810 Zeilen)

**CSS-Variablen-Prefix:** `--color-*`, `--radius-*`, `--shadow-*`, `--transition-*`

| Kategorie | Werte |
|-----------|-------|
| **Primary** | `#003087` (dark navy), `#0070ba` (light) |
| **Warm Accent** | Apricot `#FFD7B3`, Peach `#F8CDA2`, Gold `#F4C47D`, Amber `#E8A849` |
| **Text** | `#0e1525`, `#151d2e`, `#475569`, `#64748b` |
| **Background** | `linear-gradient(165deg, ...)` mit Ambient Blue/Warm |
| **Fonts** | `Inter` (Body), `Playfair Display` (H1 Login), `Share Tech Mono` (Header) |
| **Dark Mode** | **JA — vollständig implementiert** |

### Framework-Nutzung

| Framework | Wo? |
|-----------|-----|
| **Tailwind CSS CDN** | `impressum.html`, `datenschutz.html` — **nur diese 2 Seiten!** |
| **Bootstrap** | Nirgends |
| **Custom CSS** | Alle anderen Seiten |

**Problem:** Die Impressum/Datenschutz-Seiten nutzen Tailwind CDN + eigene CSS-Klassen, während alle anderen Seiten Custom CSS verwenden. Inkonsistenz!

### Fonts (Google Fonts CDN)

- **Inter** (400, 500, 600, 700, 800) — überall
- **Playfair Display** (700, italic 700) — Headings
- **Share Tech Mono** — Brand-Elemente, Topbar

---

## 5. JavaScript-Analyse

### `scripts/main.js` (82 Zeilen)

Minimal und sauber:
- `initSmoothScroll()` — Smooth Scroll für Anchor-Links
- `initMobileNav()` — Hamburger-Menü Toggle
- `schicken()` / `schickenMitBetreff()` — E-Mail-Obfuscation (mailto)

### Inline Scripts

- `kontakt.html` — `sendContactForm()` erstellt mailto-Link aus Formular
- `make/index.html` — Dark Mode Toggle (localStorage)
- `make/login.html` — Dark Mode + Code-Input Auto-Focus (UX)

### API-Calls

**Keine.** Kein `fetch()`, kein `axios`, kein `XMLHttpRequest`.

**Alle Formulare** arbeiten mit `mailto:` — kein Server-seitiges Processing in diesem Repo.

---

## 6. Netlify-Konfiguration

**Nicht vorhanden.** Es gibt weder `netlify.toml`, `_redirects` noch `_headers`.

**Fragen:**
- Wo wird deployed? Netlify? GitHub Pages? Anderer Hoster?
- Wie wird das Domain-Mapping `report.ki-sicherheit.jetzt` ↔ `make.ki-sicherheit.jetzt` gehandhabt?
- Ohne `_redirects`: Werden die `make/`-Seiten unter `report.ki-sicherheit.jetzt/make/` ausgeliefert? Oder unter `make.ki-sicherheit.jetzt`?

---

## 7. Architektur-Entscheidung

### Status Quo: Vanilla JS

| Aspekt | Bewertung |
|--------|-----------|
| **Komplexität** | Niedrig — 17 statische HTML-Seiten |
| **Interaktivität** | Minimal — nur Menü-Toggle, Smooth Scroll, Dark Mode |
| **Dependencies** | Keine npm — nur Google Fonts CDN + Tailwind CDN (2 Seiten) |
| **Build** | Keiner nötig — direkt deployen |
| **Performance** | Exzellent — kein JS-Bundle, kein Framework-Overhead |

### React wäre Overkill

Für diese Seite ist React **nicht empfehlenswert**:
- Kein Client-Side-Routing nötig
- Kein State-Management nötig
- Kein API-Fetching
- Die Seiten sind rein informativ/statisch
- React würde nur Komplexität + Bundle-Size ohne Nutzen hinzufügen

### Empfehlung

1. **Vanilla JS beibehalten** für die Landing Page / Marketing-Seiten
2. **Design-Systeme vereinheitlichen** — zwei verschiedene CSS-Variablen-Systeme (`--mk-*` vs `--color-*`) sind problematisch
3. **Tailwind CDN entfernen** aus Impressum/Datenschutz — stattdessen `main.css` konsistent nutzen
4. **Dark Mode** in die Hauptseiten übernehmen (aktuell nur in `/make/`)
5. **`netlify.toml`** hinzufügen für saubere Konfiguration
6. **Monorepo beibehalten** — alles in einem Repo ist hier richtig

---

## 8. Kritische Fragen an Wolf

### Deployment & Hosting

1. **Wo wird dieses Repo deployed?** Netlify? GitHub Pages? Anderer Hoster?
2. **Domain-Setup:** Wie funktioniert das Mapping zwischen `report.ki-sicherheit.jetzt` und `make.ki-sicherheit.jetzt`? Sind das zwei Netlify-Sites mit demselben Repo oder ein Proxy/Redirect?
3. **Gibt es `ki-sicherheit.jetzt` (ohne Subdomain)?** Wohin zeigt die Hauptdomain? Ist das eine separate Seite?

### Andere Repos

4. **Gibt es ein `make-ki-frontend`-Repo?** Im Briefing erwähnt, aber hier nicht gefunden. Wo lebt die eigentliche Report-App-Logik (Fragebogen, KI-Analyse, Report-Generierung)?
5. **Gibt es ein Backend-Repo?** Die Login-Seite hat ein 6-stelliger-Code-Formular aber keinen API-Call. Wo wird die Auth-Logik verarbeitet?
6. **Gibt es ein Railway-Deployment?** (im Briefing erwähnt)

### Design & Content

7. **Sollen Impressum/Datenschutz von Tailwind CDN auf Custom CSS migriert werden?** (Inkonsistenz)
8. **Soll Dark Mode auf alle Seiten ausgeweitet werden?** (aktuell nur `make/`-Bereich)
9. **Was ist der Plan für die "In Vorbereitung"-Artikel?** (EU AI Act, ChatGPT DSGVO)
10. **Die Responsive-Bilder (desktop/mobile/tablet .webp) werden nirgends referenziert** — sind die für eine geplante Galerie/Showcase?

### Migration

11. **Was genau soll migriert werden?** Content von einer bestehenden `ki-sicherheit.jetzt`-Seite hierher? Oder umgekehrt?
12. **Was ist die gewünschte Ziel-Architektur?** Ein Repo für alles? Oder Landing Page und App getrennt?

---

## 9. Zusammenfassung

| Metrik | Wert |
|--------|------|
| **HTML-Dateien** | 17 |
| **CSS-Dateien** | 2 (main.css: 2.922 Zeilen, make.css: 810 Zeilen) |
| **JS-Dateien** | 1 (main.js: 82 Zeilen) + 3 Inline-Scripts |
| **Bilder/SVGs** | 25 (21 .webp + 4 .svg) |
| **Sprachen** | DE + EN |
| **Framework** | Vanilla JS (+ Tailwind CDN auf 2 Seiten) |
| **Build-Prozess** | Keiner |
| **Dark Mode** | Nur /make/ Bereich |
| **API-Calls** | Keine |
| **Netlify-Config** | Keine |

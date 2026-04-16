# Design Skill - Professional Presentation Design System

A skill for designing HTML slides for top-tier business presentations.
Delivers minimal, refined design with professional typography and precise layouts.

---

## Core Design Philosophy

### 1. Less is More
- Remove unnecessary decorative elements
- Content takes center stage
- Leverage whitespace aggressively
- Clear visual hierarchy

### 2. Typography-Driven Design
- Pretendard as the default font
- Font size contrast creates visual impact
- Fine-tuned letter-spacing and line-height
- Weight variations for emphasis

### 3. Strategic Color Usage
- Limited color palette (2-3 colors)
- Monotone base + accent color
- Background color sets the mood
- High contrast for readability

---

## Base Settings

### Slide Size (16:9 default)
```html
<div class="w-[720pt] h-[405pt] ...">
```

### Supported Aspect Ratios
| Ratio | Size | Use Case |
|-------|------|----------|
| 16:9 | 720pt x 405pt | Default, monitors/screens |
| 4:3 | 720pt x 540pt | Legacy projectors |
| 16:10 | 720pt x 450pt | MacBook |

### Default Font Stack
```html
<!-- Via Tailwind config or arbitrary value -->
<div class="font-['Pretendard']">
```

### Pretendard Webfont CDN
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
```

---

## Typography System

### Font Size Scale
| Purpose | Size | Weight | Tailwind Class |
|---------|------|--------|----------------|
| Hero Title | 72-96pt | 800 | `text-[72pt] font-extrabold` |
| Section Title | 48-60pt | 700 | `text-[48pt] font-bold` |
| Slide Title | 32-40pt | 700 | `text-[32pt] font-bold` |
| Subtitle | 20-24pt | 500 | `text-[20pt] font-medium` |
| Body | 16-20pt | 400 | `text-[16pt] font-normal` |
| Caption | 12-14pt | 400 | `text-[12pt] font-normal` |
| Label | 10-12pt | 600 | `text-[10pt] font-semibold` |

### Letter Spacing
```html
<!-- Large titles: tight -->
<h1 class="tracking-[-0.02em] ...">

<!-- Medium titles -->
<h2 class="tracking-[-0.01em] ...">

<!-- Body: default -->
<p class="tracking-normal ...">

<!-- Captions, labels: slightly wider -->
<p class="tracking-[0.02em] ...">
```

### Line Height
```html
<!-- Titles -->
<h1 class="leading-[1.2] ...">

<!-- Body text -->
<p class="leading-[1.6] ...">

<!-- Single-line text -->
<p class="leading-none ...">
```

---

## Color Palette System

All color palettes are now bundled as design styles accessible via `slides-grab list-styles`. The five original palettes are styles 31–35:

- **executive-minimal** — Refined business (warm white + black accent)
- **sage-professional** — Calm and trustworthy (sage green tones)
- **modern-dark** — High-impact dark (pure dark + white text)
- **corporate-blue** — Traditional business (white + blue accent)
- **warm-neutral** — Warm and approachable (cream + terracotta)

Run `slides-grab list-styles` to browse all 35 bundled styles, or design a fully custom palette when none fit.

---

## Layout System

### Spacing Standards (padding/margin)
```html
<!-- Full slide padding -->
<div class="p-[48pt] ...">

<!-- Section spacing -->
<div class="gap-[32pt] ...">

<!-- Element spacing -->
<div class="gap-[16pt] ...">

<!-- Text block internal spacing -->
<div class="gap-[8pt] ...">
```

### Grid System
```html
<!-- 2-column layout -->
<div class="grid grid-cols-2 gap-[32pt] ...">

<!-- 3-column layout -->
<div class="grid grid-cols-3 gap-[32pt] ...">

<!-- Asymmetric layout (40:60) -->
<div class="grid grid-cols-[2fr_3fr] gap-[32pt] ...">

<!-- Asymmetric layout (30:70) -->
<div class="grid grid-cols-[1fr_2.3fr] gap-[32pt] ...">
```

---

## Design Components

### 1. Badge/Tag
```html
<p class="inline-block px-[14pt] py-[6pt] border border-[#1a1a1a] rounded-[20pt] text-[10pt] font-medium tracking-[0.02em] uppercase">
  PRESENTATION
</p>
```

### 2. Section Number
```html
<p class="inline-block px-[12pt] py-[4pt] bg-[#1a1a1a] text-white rounded-[4pt] text-[10pt] font-semibold">
  SECTION 1
</p>
```

### 3. Logo Area
```html
<div class="flex items-center gap-[8pt]">
  <div class="w-[20pt] h-[20pt] bg-[#1a1a1a] rounded-[4pt] flex items-center justify-center">
    <p class="text-white text-[12pt] leading-none">*</p>
  </div>
  <p class="text-[12pt] font-semibold">LogoName</p>
</div>
```

### 4. Icon Button
```html
<div class="w-[32pt] h-[32pt] border border-[#1a1a1a] rounded-full flex items-center justify-center">
  <p class="text-[14pt] leading-none">&#x2197;</p>
</div>
```

### 5. Divider Line
```html
<div class="w-full h-[1pt] bg-[#d4d4d0]"></div>
```

### 6. Info Grid
```html
<div class="flex gap-[48pt]">
  <div>
    <p class="text-[10pt] text-[#999] mb-[4pt]">Contact</p>
    <p class="text-[12pt] font-medium">334556774</p>
  </div>
  <div>
    <p class="text-[10pt] text-[#999] mb-[4pt]">Date</p>
    <p class="text-[12pt] font-medium">March 2025</p>
  </div>
</div>
```

---

## Slide Templates

### 1. Cover Slide
- Template file: `templates/cover.html`

### 2. Table of Contents (Contents)
- Template file: `templates/contents.html`

### 3. Section Divider
- Template file: `templates/section-divider.html`

### 4. Content Slide
- Template file: `templates/content.html`

### 5. Statistics/Data Slide
- Template file: `templates/statistics.html`

### 6. Image + Text (Split Layout)
- Template file: `templates/split-layout.html`

### 7. Team Introduction
- Template file: `templates/team.html`

### 8. Quote Slide
- Template file: `templates/quote.html`

### 9. Timeline Slide
- Template file: `templates/timeline.html`

### 10. Closing Slide
- Template file: `templates/closing.html`

### 11. Chart Slide
- Template file: `templates/chart.html`

### 12. Diagram Slide
- Template file: `templates/diagram.html`

### 13. Tldraw Diagram Slide
- Template file: `templates/diagram-tldraw.html`
- Use this when the slide needs a complex diagram that will be easier to author in `tldraw` and safer to export as a local image asset.

### Custom Templates
- Custom template directory: `templates/custom/`
- Users can add template files as drop-in for reuse.

---

## Advanced Design Patterns

### Asymmetric Layout
```html
<!-- Golden ratio -->
<div class="grid grid-cols-[1fr_1.618fr] ...">

<!-- Extreme asymmetry -->
<div class="grid grid-cols-[1fr_3fr] ...">
```

### Overlay Text
```html
<div class="relative">
  <div class="absolute inset-0 bg-black/50"></div>
  <div class="relative z-10">
    <h2 class="text-white ...">Overlay Text</h2>
  </div>
</div>
```

### Gradient Overlay
```html
<div class="absolute inset-0 bg-gradient-to-r from-[#1a1a1a] to-transparent opacity-60"></div>
```

### Card Style
```html
<div class="bg-white rounded-[12pt] p-[24pt] shadow-[0_2pt_8pt_rgba(0,0,0,0.08)]"></div>
```

---

## Chart / Diagram / Image Library Guide

### 1. Chart.js (Bar / Line / Pie)

#### CDN Link
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

#### Usage Example
```html
<div class="grid grid-cols-3 gap-[16pt]">
  <div class="border border-[#e5e5e0] rounded-[10pt] p-[10pt]">
    <p class="text-[10pt] mb-[6pt]">Bar Chart</p>
    <canvas id="barChart" class="w-full h-[120pt]"></canvas>
  </div>
  <div class="border border-[#e5e5e0] rounded-[10pt] p-[10pt]">
    <p class="text-[10pt] mb-[6pt]">Line Chart</p>
    <canvas id="lineChart" class="w-full h-[120pt]"></canvas>
  </div>
  <div class="border border-[#e5e5e0] rounded-[10pt] p-[10pt]">
    <p class="text-[10pt] mb-[6pt]">Pie Chart</p>
    <canvas id="pieChart" class="w-full h-[120pt]"></canvas>
  </div>
</div>

<script>
  const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
  const values = [12, 19, 15, 23];

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: { labels, datasets: [{ data: values, backgroundColor: ['#1f2937', '#2563eb', '#10b981', '#f59e0b'] }] },
    options: { animation: false, responsive: true, maintainAspectRatio: false }
  });

  new Chart(document.getElementById('lineChart'), {
    type: 'line',
    data: { labels, datasets: [{ data: values, borderColor: '#2563eb', backgroundColor: '#93c5fd', fill: true }] },
    options: { animation: false, responsive: true, maintainAspectRatio: false }
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: { labels, datasets: [{ data: [35, 28, 22, 15], backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'] }] },
    options: { animation: false, responsive: true, maintainAspectRatio: false }
  });
</script>
```

Recommendations:
- Use `options.animation: false` for stable PPTX conversion.
- Set explicit width/height on `canvas` elements.

### 2. Mermaid (Flowchart / Sequence Diagram)

#### CDN Link
```html
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
```

#### Usage Example
```html
<div class="grid grid-cols-2 gap-[20pt]">
  <div class="border border-[#e5e5e0] rounded-[10pt] p-[10pt]">
    <p class="text-[10pt] mb-[6pt]">Flowchart</p>
    <pre class="mermaid">
flowchart LR
  A[Plan] --> B[Design]
  B --> C[Review]
  C --> D[Convert]
    </pre>
  </div>
  <div class="border border-[#e5e5e0] rounded-[10pt] p-[10pt]">
    <p class="text-[10pt] mb-[6pt]">Sequence Diagram</p>
    <pre class="mermaid">
sequenceDiagram
  participant U as User
  participant A as Agent
  U->>A: Request slide
  A->>U: Return HTML
    </pre>
  </div>
</div>

<script>
  mermaid.initialize({ startOnLoad: true, securityLevel: 'loose' });
</script>
```

Recommendations:
- Write Mermaid DSL inside `<pre class="mermaid">`.
- Fix the diagram container size for stable layout.

### 3. Inline SVG Icon Guide
```html
<div class="flex items-center gap-[8pt]">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7" stroke="#1f2937" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
  <p class="text-[12pt] text-[#1f2937]">Next step</p>
</div>
```

Rules:
- Always specify `viewBox`.
- Set explicit size via `width`/`height`.
- Use HEX values with `#` prefix for `stroke`/`fill` colors.
- Place text outside SVG using `<p>`, `<h1>`-`<h6>` tags.

### 4. Image Usage Rules (Local Asset / Data URL / Remote URL / Placeholder)

#### Canonical Local Asset Image
```html
<img src="./assets/team-photo.png" alt="Team photo" class="w-[220pt] h-[140pt] object-cover">
```

Store the image at `<slides-dir>/assets/team-photo.png`.

#### Self-Contained Fallback (`data:` URL)
```html
<img src="data:image/svg+xml;base64,..." alt="Illustration" class="w-[220pt] h-[140pt] object-cover">
```

#### Remote URL Source (Download Before Saving)
```html
<img src="https://images.example.com/hero.png" alt="Hero image" class="w-[220pt] h-[140pt] object-cover">
```

If the image source starts on the web, download it into `<slides-dir>/assets/` and change the saved slide HTML to `./assets/<file>`.

#### Placeholder (Image Stand-In)
```html
<div data-image-placeholder class="w-[220pt] h-[140pt] border border-dashed border-[#c7c7c7] bg-[#f3f4f6] flex items-center justify-center">
  <p class="text-[10pt] text-[#6b7280] font-semibold tracking-[0.04em] uppercase">Image Placeholder</p>
</div>
```

Rules:
- Always include `alt` on `img` tags.
- Use `./assets/<file>` as the default image contract for slide HTML.
- Keep slide assets in `<slides-dir>/assets/`.
- `data:` URLs are allowed for fully self-contained slides.
- Do not leave remote `http(s)://` image URLs in saved slide HTML; download source images into `<slides-dir>/assets/` and reference them as `./assets/<file>`.
- Do not use absolute filesystem paths in slide HTML.
- Do not use non-body `background-image` for content imagery; use `<img>` instead.
- Use `data-image-placeholder` to reserve space when no image is available yet.
- Use high-resolution originals and fit with `object-cover`.

---

## Text Usage Rules

### Required Tags
```html
<!-- All text MUST be inside these tags -->
<p>, <h1>-<h6>, <ul>, <ol>, <li>

<!-- Forbidden - ignored in PowerPoint conversion -->
<div>text here</div>
<span>text here</span>
```

### Recommended Usage
```html
<!-- Good -->
<h1 class="text-[36pt] ...">Title</h1>
<p class="text-[16pt] ...">Body text</p>

<!-- Bad -->
<div class="text-[16pt] ...">Text directly in div</div>
```

---

## Output and File Structure

### File Save Rules
```
<slides-dir>/   (default: slides/)
├── slide-01.html  (Cover)
├── slide-02.html  (Contents)
├── slide-03.html  (Section Divider)
├── slide-04.html  (Content)
├── ...
└── slide-XX.html  (Closing)
```

### File Naming Rules
- Use 2-digit numbers: `slide-01.html`, `slide-02.html`
- Name sequentially
- No special characters or spaces

---

## Workflow (Stage 2: Design + Human Review)

This skill is **Stage 2**. It works from the `slide-outline.md` approved by the user in Stage 1 (plan-skill).

### Prerequisites
- `slide-outline.md` must exist and be approved by the user.

### Steps

1. **Analyze + Design**: Read `slide-outline.md`, decide theme/layout, generate HTML slides
2. **Diagram choice**: If a slide needs a complex diagram (architecture, workflows, relationship maps, multi-node concepts), prefer `tldraw`. Export the diagram with `slides-grab tldraw` and reference the generated local asset from the slide HTML.
3. **Validate slides**: After slide generation or edits, automatically run:
   ```bash
   slides-grab validate --slides-dir <path>
   ```
4. **Auto-fix validation issues**: If validation fails, fix the source HTML/CSS and re-run validation until it passes
5. **Auto-build viewer**: After validation passes, automatically run:
   ```bash
   node scripts/build-viewer.js --slides-dir <path>
   ```
6. **Guide user to review**: Tell the user to check slides in the browser:
   ```
   open <slides-dir>/viewer.html
   ```
7. **Revision loop**: When the user requests changes to specific slides:
   - Edit only the relevant HTML file
   - Re-run `slides-grab validate --slides-dir <path>` and fix any failures
   - Re-run `node scripts/build-viewer.js --slides-dir <path>` to rebuild the viewer
   - Guide user to review again
8. **Completion**: Repeat the revision loop until the user signals approval for PPTX conversion

### Absolute Rules
- **Never start PPTX conversion without approval** — PPTX conversion is the responsibility of `pptx-skill` and requires explicit user approval.
- **Prefer tldraw for complex diagrams** — Use `slides-grab tldraw` when the slide needs a non-trivial diagram instead of forcing dense diagram geometry into HTML/CSS.
- **Never skip validation** — Run `slides-grab validate --slides-dir <path>` after generation or edits and fix failures before review.
- **Never forget to build the viewer** — Run `node scripts/build-viewer.js --slides-dir <path>` every time slides are generated or modified.

---

## Important Notes

1. **Tailwind Play CDN**: Every slide must include `<script src="https://cdn.tailwindcss.com"></script>`.
2. **pt Units**: Use pt units for all dimensions and spacing via Tailwind arbitrary values: `w-[720pt]`, `p-[48pt]`, `gap-[16pt]`.
3. **CSS gradients**: Avoid CSS gradients for major backgrounds due to PPTX export instability; prefer solid colors or images.
4. **Webfonts**: Always include the Pretendard CDN link.
5. **Image paths**: Use `./assets/<file>` from each `slide-XX.html`; avoid absolute filesystem paths.
6. **Colors**: Prefer Tailwind utility classes. For arbitrary colors, use `#` prefix: `bg-[#FF0000]`.
7. **Text rules**: Never place text directly in `div`/`span`.

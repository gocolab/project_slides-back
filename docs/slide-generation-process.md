# Slide Generation Process Analysis

This document provides a detailed analysis of the slide generation process within the `slides-grab` framework. The framework follows an agent-first philosophy where AI agents interact with HTML/CSS directly through a structured 3-stage pipeline.

---

## 1. Pipeline Overview

The production of high-quality presentations is divided into three distinct stages:

1.  **Planning (Stage 1)**: Structure and narrative development.
2.  **Design (Stage 2)**: Visual implementation and iteration.
3.  **Export (Stage 3)**: Conversion to final formats (PDF, PPTX, Figma).

---

## 2. Stage 1: Planning (Detailed)

**Goal**: Establish the structural and visual foundation of the presentation.

### A. Style Selection (Mandatory First Step)
Before any outline is written, a visual direction must be established.
- **Workflow**: 
    1. Run `slides-grab list-styles` to see available design systems.
    2. (Optional) Run `slides-grab preview-styles` to open the visual gallery in the browser.
    3. Present a shortlist (2-3 styles) to the user with reasoning.
    4. **Approval**: Obtain explicit user approval for a specific Style ID (e.g., `glassmorphism`, `neo-brutalism`).
- **Rule**: Do not write the outline before the style is approved.

### B. Outline Development (`slide-outline.md`)
The agent produces a structured outline adhering to specific metadata and composition rules.

#### Meta Section Requirements
- **Topic**: Clear definition of the subject.
- **Target Audience**: Who the presentation is for.
- **Tone/Mood**: Matches the selected style.
- **Style**: The approved **Style ID** (This is crucial for grounding Stage 2).
- **Slide Count & Aspect Ratio**: Default is 16:9.

#### Slide Composition Format
Each slide must be defined with:
- **Type**: (e.g., Cover, Section Divider, Content, Statistics, Closing).
- **Title & Key Message**: The core takeaway.
- **Details**: Bullet points for the actual content.

### Relevant Files
- [slide-outline.md](file:///Users/sanghunoh/Develops/repository/slides-grab/slide-outline.md): The definitive structure for the deck.
- [skills/slides-grab-plan/SKILL.md](file:///Users/sanghunoh/Develops/repository/slides-grab/skills/slides-grab-plan/SKILL.md): Workflow rules for planners.

---

## 3. Stage 2: Design (Detailed)

**Goal**: Implement the approved outline as a series of high-quality, valid HTML slides.

### A. Preparation & Anchoring
Before writing HTML, the agent must define:
- **Visual Thesis**: A single sentence describing the mood, material, energy, and imagery treatment.
- **Content Plan**: The narrative rhythm (Opener → Support → Detail → Close).
- **Design Tokens Mapping**: Mapping the chosen Style ID tokens (Background, Surface, Text, Muted, Accent) to Tailwind colors.

### B. Technical Implementation Rules
- **Coordinate System**: All sizing, spacing, and fonts MUST use `pt` units via Tailwind arbitrary values (e.g., `w-[720pt]`, `p-[48pt]`, `text-[36pt]`).
- **Standard Canvas**: Fixed at `w-[720pt] h-[405pt]`.
- **Pretendard Font**: Always included via CDN and applied using `font-['Pretendard']`.
- **Semantic HTML**: Text must strictly reside in `<h1>`-`<h6>`, `<p>`, `<ul>`, `<ol>`, or `<li>` tags. Never place text directly in `<div>` or `<span>`.
- **Tailwind Only**: No inline `style="..."` attributes; all styling must be through Tailwind utility classes.
- **No CSS Gradients**: Backgrounds should be solid colors or rasterized images (to ensure PPTX export stability).

### C. Asset Workflow
Assets must be local to ensure stability and exportability.
- **Images**: Prefer `slides-grab image --prompt "<prompt>"` (Nano Banana Pro) for bespoke imagery. Web images must be downloaded to `assets/`.
- **Videos**: Use `slides-grab fetch-video --url <url>` to download videos locally. Videos should include a `poster` thumbnail.
- **Diagrams**: Use `slides-grab tldraw` for complex relationship maps or architectures instead of hand-coding geometry.
- **Rule**: No remote `http(s)://` URLs are allowed in the final saved HTML.

### D. Validation & Review
- **Validation**: Run `slides-grab validate` after every edit. This uses Playwright to check for rule violations (e.g., remote assets, non-semantic text).
- **Litmus Check**: Can the viewer grasp the main point in 3–5 seconds? Is there one dominant visual anchor?
- **Interactive Review**: Use `slides-grab edit` for visual iterations with the user.

### Relevant Files
- `slides/slide-XX.html`: Individual slide files implementation.
- `slides/assets/`: Local storage for all visual dependencies.
- [src/design-styles-data.js](file:///Users/sanghunoh/Develops/repository/slides-grab/src/design-styles-data.js): Full specs for all 35 design systems.
- [skills/slides-grab-design/SKILL.md](file:///Users/sanghunoh/Develops/repository/slides-grab/skills/slides-grab-design/SKILL.md): Behavioral laws for designers.
- [references/beautiful-slide-defaults.md](file:///Users/sanghunoh/Develops/repository/slides-grab/skills/slides-grab-design/references/beautiful-slide-defaults.md): Art direction guidance.

---

## 4. Stage 3: Export

**Goal**: Convert the approved HTML slides into distributable formats.

### Workflow
1.  **Approval**: Ensure the design stage is fully complete and approved.
2.  **Conversion**:
    - **PDF**: Run `slides-grab pdf` for reliable, high-fidelity output.
    - **PPTX**: Run `slides-grab convert` (Experimental).
    - **Figma**: Run `slides-grab figma` (Experimental).

### Relevant Files
- [convert.cjs](file:///Users/sanghunoh/Develops/repository/slides-grab/convert.cjs): Entry point for PPTX conversion.
- [scripts/html2pdf.js](file:///Users/sanghunoh/Develops/repository/slides-grab/scripts/html2pdf.js): PDF generation logic.
- [scripts/html2pptx.js](file:///Users/sanghunoh/Develops/repository/slides-grab/scripts/html2pptx.js): HTML to OOXML mapping logic.
- [skills/slides-grab-export/SKILL.md](file:///Users/sanghunoh/Develops/repository/slides-grab/skills/slides-grab-export/SKILL.md): Defines the export labels and rules.

---

## 5. Tooling Reference Summary

| Command | Script | Purpose |
| :--- | :--- | :--- |
| `slides-grab build-viewer` | `scripts/build-viewer.js` | Generates the `viewer.html` preview. |
| `slides-grab validate` | `scripts/validate-slides.js` | Checks HTML slides for rule compliance. |
| `slides-grab image` | `scripts/generate-image.js` | Generates AI images for slides. |
| `slides-grab fetch-video` | `scripts/download-video.js` | Downloads web videos for local use. |
| `slides-grab tldraw` | `scripts/render-tldraw.js` | Exports tldraw JSON/files to SVG. |
| `slides-grab pdf` | `scripts/html2pdf.js` | Direct HTML to PDF conversion. |
| `slides-grab convert` | `convert.cjs` | HTML to rasterized PPTX conversion. |
| `slides-grab list-styles` | `src/design-styles.js` | Lists bundled design systems. |

---

## 6. Directory Structure Mapping

```text
repository-root/
├── bin/
│   └── ppt-agent.js         # CLI Entry Point (slides-grab)
├── scripts/                 # Core logic for each tool
├── skills/                  # Codex skill definitions (Rules)
├── src/                     # Shared logic and style data
├── templates/               # Reusable slide HTML templates
└── slides/                  # Default workspace (Work-in-progress)
    ├── assets/             # Images/Videos
    ├── slide-01.html       # Individual slide
    └── viewer.html         # Full deck preview
```

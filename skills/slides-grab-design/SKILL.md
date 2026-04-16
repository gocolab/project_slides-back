---
name: slides-grab-design
description: Stage 2 design skill for Codex. Generate and iterate slide-XX.html files in the selected slides workspace.
metadata:
  short-description: Build HTML slides and viewer for review loop
---

# slides-grab Design Skill (Codex)

Use this after `slide-outline.md` is approved.

## Goal
Generate high-quality `slide-XX.html` files in the selected slides workspace (`slides/` by default) and support revision loops.

## Inputs
- Approved `slide-outline.md` (must contain `style: <id>` in meta section — style was approved in Stage 1)
- Requested edits per slide

## Outputs
- `<slides-dir>/slide-01.html ... slide-XX.html`
- Updated `<slides-dir>/viewer.html` via build script

## Workflow
1. Read approved `slide-outline.md` and extract the `style` field from its meta section.
2. Load the chosen style's full spec from `src/design-styles-data.js` — colors, fonts, layout, signature elements, and things to avoid. Ground your Tailwind CSS utility class selection in this spec.
3. Before generating slides, write a quick **visual thesis** (mood/material/energy), a **content plan** (opener → support/proof → detail/story → close/CTA), and the core design tokens (background, surface, text, muted, accent + display/headline/body/caption roles). Map these tokens to Tailwind-compatible colors and sizes.
4. If you need to confirm or revisit the approved bundled style before designing, re-run `slides-grab list-styles` and open the gallery from `slides-grab preview-styles` so the Stage 2 deck stays aligned with the Stage 1 direction.
5. Generate slide HTML files using Tailwind CSS utility classes in selected `--slides-dir`. Use arbitrary values for pt-based sizing (e.g., `w-[720pt] h-[405pt]`).
6. When a slide explicitly needs bespoke imagery, when the user asks for an image, or when stronger imagery would materially improve the slide, prefer `slides-grab image --prompt "<prompt>" --slides-dir <path>` to generate a local asset with Nano Banana Pro and save it under `<slides-dir>/assets/`.
7. If the deck needs a complex diagram (architecture, workflows, relationship maps, multi-node concepts), create the diagram in `tldraw`, export it with `slides-grab tldraw`, and treat the result as a local slide asset under `<slides-dir>/assets/`.
8. If the slide needs a local video, store the video under `<slides-dir>/assets/`, reference it as `./assets/<file>`, and prefer a `poster="./assets/<file>"` thumbnail so PDF export uses a stable still image.
9. If the source video starts on YouTube or another supported page, use `slides-grab fetch-video --url <youtube-url> --slides-dir <path>` (or `yt-dlp` directly if needed) to download it into `<slides-dir>/assets/` before saving the slide HTML.
10. Run `slides-grab validate --slides-dir <path>` after generation or edits.
11. If validation fails, automatically fix the source slide HTML (Tailwind classes) and re-run validation until it passes.
12. Run the slide litmus check from `references/beautiful-slide-defaults.md` before presenting the deck for review.
13. Launch the interactive editor for visual review: `slides-grab edit --slides-dir <path>`
14. Iterate on user feedback by editing only requested slide files, then re-run validation after each edit round.
15. When the user confirms editing is complete, suggest: build the viewer (`slides-grab build-viewer --slides-dir <path>`) for a final read-only preview, or proceed to export (PDF/PPTX).
16. Keep revising until user approves conversion stage.

## Rules
- **Modern Design**: Use Tailwind CSS utility classes for all styling.
- **CDN**: Always include the Tailwind Play CDN: `<script src="https://cdn.tailwindcss.com"></script>`.
- **Slide Size**: Keep slide body at 720pt x 405pt using Tailwind arbitrary values: `w-[720pt] h-[405pt]`.
- **pt Units**: Use pt units for all spacing, sizing, and fonts via Tailwind arbitrary values: `p-[48pt]`, `mt-[24pt]`, `text-[36pt]`.
- **Font**: Use Pretendard as the default font stack (`font-['Pretendard']`).
- **Semantic Text**: Keep text in semantic tags (`p`, `h1-h6`, `ul`, `ol`, `li`). Never place text directly in `<div>` or `<span>`.
- **Local Assets**: Put local images and videos under `<slides-dir>/assets/` and reference them as `./assets/<file>`.
- **No Remote Assets**: Do not leave remote `http(s)://` image URLs in saved slide HTML; download into `<slides-dir>/assets/`.
- **Bespoke Imagery**: Prefer `slides-grab image` with Nano Banana Pro for slide imagery before reaching for remote URLs.
- **Videos**: Prefer local videos with a `poster="./assets/<file>"` thumbnail. Use `slides-grab fetch-video` to pull web videos first.
- **Gradients**: Avoid CSS gradients for major backgrounds (PPTX support is unstable); prefer solid colors or rasterized background images.
- **Layouts**: Default to one job per slide, one dominant visual anchor, and cardless layouts unless a card improves structure.
- **Validation**: Do not present slides for review until `slides-grab validate` passes.
- **Conversion**: Do not start PPTX/PDF conversion before approval.


## Reference
For full constraints and style system, follow:
- `references/design-rules.md`
- `references/detailed-design-rules.md`
- `references/beautiful-slide-defaults.md` — slide-specific art direction defaults adapted from OpenAI's frontend design guidance
- `references/design-system-full.md` — archived full design system, templates, and advanced pattern guidance

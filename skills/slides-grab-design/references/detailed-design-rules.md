## Base Settings

### Slide Size (16:9 default)
- Keep slide body at 720pt x 405pt using Tailwind arbitrary values: `<div class="w-[720pt] h-[405pt] ...">`.
- Use **Pretendard** as the default font stack (`font-['Pretendard']`).
- Always include the **Tailwind Play CDN** and **Pretendard CDN** links.

### 4. Image Usage Rules (Local Asset / Data URL / Remote URL / Placeholder)
- Always include alt on img tags.
- Use `./assets/<file>` as the default image and video contract for slide HTML.
- Keep slide assets in `<slides-dir>/assets/`.
- Use `tldraw`-generated assets for complex diagrams whenever possible.
- Use `slides-grab image --prompt "<prompt>" --slides-dir <path>` with Nano Banana Pro when a slide needs bespoke generated imagery.
- `data:` URLs are allowed for fully self-contained slides.
- Do not leave remote `http(s)://` image URLs in saved slide HTML; download source images into `<slides-dir>/assets/` and reference them as `./assets/<file>`.
- Store local videos under `<slides-dir>/assets/`, reference them as `./assets/<file>`, and prefer `poster="./assets/<file>"` for export-friendly thumbnails.
- If a video starts on YouTube or another supported page, use `slides-grab fetch-video --url <youtube-url> --slides-dir <path>` (or `yt-dlp` directly if needed) before saving the slide HTML.
- If `GOOGLE_API_KEY` or `GEMINI_API_KEY` is unavailable, or the Nano Banana API fails, ask the user for a Google API key or fall back to web search + download into `<slides-dir>/assets/`.
- Do not use absolute filesystem paths in slide HTML.
- Do not use non-body `background-image` for content imagery; use `<img>` instead.
- Use `data-image-placeholder` to reserve space when no image is available yet.

## Text Usage Rules
- All text must be inside `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, or `<li>`.
- Never place text directly in `<div>` or `<span>`.
- Use Tailwind arbitrary values for text sizes: `text-[14pt]`, `text-[36pt]`.

## Workflow (Stage 2: Design + Human Review)
- Use **Tailwind CSS utility classes** for all styling instead of inline CSS properties.
- After slide generation or edits, run `slides-grab validate --slides-dir <path>`.
- After validation passes, run `slides-grab build-viewer --slides-dir <path>`.
- Edit only the relevant HTML file during revision loops.
- Use `slides-grab image` for bespoke visuals.
- Never start PPTX conversion without explicit approval.
- Do not persist runtime-only editor/viewer injections in saved slide HTML.

## Important Notes
- **Tailwind Play CDN**: Ensure `<script src="https://cdn.tailwindcss.com"></script>` is present in every slide.
- **pt Units**: Use pt units for all dimensions and spacing via Tailwind: `p-[48pt]`, `gap-[12pt]`.
- **Gradients**: CSS gradients may not export cleanly; prefer solid colors or background images.
- **Semantic HTML**: Never place text directly in `div`/`span`.

# Editor Codex Prompt — Slide Edit Rules

This prompt is sent to Codex when the editor requests a single-slide edit.
It is intentionally separate from the full design skill (SKILL.md) because
the editor context assumes the deck design is already established.

## Primary Objective
The user's edit request is the primary objective. All rules below exist to support it, not override it. When a rule conflicts with the user's intent, follow the user.

## Edit Workflow
1. Read the target slide HTML file.
2. Apply the user's edit request using Tailwind CSS.
3. Run `slides-grab validate --slides-dir <path>` after editing.
4. If validation fails, fix the HTML/CSS and re-run until it passes.
5. Return after applying the change.

## Slide Rules
- **Modern Design**: Use Tailwind CSS for all styling.
- **CDN**: Always include the Tailwind Play CDN: `<script src="https://cdn.tailwindcss.com"></script>`.
- **Dimensions**: Keep slide size 720pt x 405pt using arbitrary values: `w-[720pt] h-[405pt]` on the outermost container.
- **Design System**: Use a consistent color palette (prefer Zinc or Slate for modern looks) and Pretendard font (`font-['Pretendard']`).
- **Semantic HTML**: Keep text in semantic tags (`p`, `h1-h6`, `ul`, `ol`, `li`). Never place text directly in `<div>` or `<span>`.
- **pt Units**: Use pt units for all spacing and sizing with Tailwind arbitrary values: `p-[48pt]`, `mt-[12pt]`, `text-[24pt]`.

## Asset Rules
- Put local images and videos under `<slides-dir>/assets/` and reference as `./assets/<file>`.
- Always include `alt` on `<img>` tags.
- Allow `data:` URLs only when the slide must be fully self-contained.
- Do not leave remote `http(s)://` image URLs in saved slide HTML; download into `./assets/`.
- Do not use absolute filesystem paths in slide HTML.
- Do not use non-body `background-image` for content imagery; use `<img>` instead.
- Use `data-image-placeholder` to reserve space when no image is available yet.
- When the request needs bespoke imagery, prefer `slides-grab image --prompt "<prompt>" --slides-dir <path>` so Nano Banana Pro saves the asset under `<slides-dir>/assets/`.
- For local videos, use `<video src="./assets/<file>">` with `poster="./assets/<file>"`.
- If a video starts on YouTube or a supported page, use `slides-grab fetch-video --url <url> --slides-dir <path>` to download it into `<slides-dir>/assets/` first.

## Art Direction Defaults
- Give each slide one job, one dominant visual anchor, one primary takeaway.
- Keep copy short enough to scan in seconds.
- Use whitespace, alignment, scale, cropping, and contrast before adding decorative chrome.
- Default to cardless layouts unless a card improves architecture.
- Limit to two typefaces max and one accent color.

## Do NOT
- Use inline `style="..."` attributes unless absolutely necessary for dynamic math (prefer Tailwind classes).
- Use CSS gradients for backgrounds (they cause PPTX export issues). Use solid colors or images.
- Re-open style selection or run `slides-grab preview-styles`.
- Modify other slide HTML files unless explicitly requested.
- Persist runtime-only editor/viewer injections (`<base>`, debug scripts, viewer wrappers).
- Start PPTX/PDF conversion.


import { readFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

import { getPackageRoot } from '../resolve.js';

export const SLIDE_SIZE = { width: 960, height: 540 };

const PPT_DESIGN_SKILL_PATH = join(getPackageRoot(), 'skills', 'slides-grab-design', 'SKILL.md');
const EDITOR_CODEX_PROMPT_PATH = join(dirname(new URL(import.meta.url).pathname), 'editor-codex-prompt.md');
const DETAILED_DESIGN_SKILL_PATH = join(getPackageRoot(), 'skills', 'slides-grab-design', 'references', 'detailed-design-rules.md');
const BEAUTIFUL_SLIDE_DEFAULTS_PATH = join(getPackageRoot(), 'skills', 'slides-grab-design', 'references', 'beautiful-slide-defaults.md');
const EDITOR_PPT_DESIGN_SECTION_HEADINGS = [
  '## Workflow',
  '## Rules',
];
const DETAILED_DESIGN_SECTION_HEADINGS = [
  '## Base Settings',
  '## Text Usage Rules',
  '## Workflow (Stage 2: Design + Human Review)',
  '## Important Notes',
];
const BEAUTIFUL_SLIDE_DEFAULTS_SECTION_HEADINGS = [
  '## Working Model',
  '## Beautiful Defaults for Slides',
  '## Narrative Sequence for Decks',
  '## Review Litmus',
];
const EDITOR_PPT_DESIGN_DUPLICATE_PATTERNS = [
  /visual thesis/i,
  /content plan/i,
  /dominant visual anchor/i,
  /cardless layouts/i,
  /whitespace, alignment, scale, cropping, and contrast/i,
  /opening slides and section dividers like posters/i,
];
const EDITOR_PPT_DESIGN_SKILL_FALLBACK = [
  '## Workflow',
  '1. Read approved `slide-outline.md` or the existing slide before editing.',
  '2. Load the chosen style from `src/design-styles-data.js` and ground your Tailwind CSS utility classes in that style.',
  '3. When a slide needs bespoke imagery, prefer `slides-grab image --prompt "<prompt>" --slides-dir <path>`.',
  '4. Run `slides-grab validate --slides-dir <path>` after generation or edits.',
  '5. If validation fails, fix the HTML/Tailwind classes and re-run until it passes.',
  '6. Run `slides-grab build-viewer --slides-dir <path>` only after validation passes.',
  '7. Run the slide litmus check from `references/beautiful-slide-defaults.md` before presentations.',
  '',
  '## Rules',
  '- Use Tailwind CSS utility classes and include the Play CDN: `<script src="https://cdn.tailwindcss.com"></script>`.',
  '- Keep slide size 720pt x 405pt using arbitrary values: `w-[720pt] h-[405pt]`.',
  '- Use pt units for all sizing/spacing: `p-[48pt]`, `text-[24pt]`.',
  '- Use Pretendard as the default font stack (`font-[\'Pretendard\']`).',
  '- Keep semantic text tags (`p`, `h1-h6`, `ul`, `ol`, `li`). No text directly in `div`/`span`.',
  '- Reference local assets as `./assets/<file>`.',
  '- Do not leave remote `http(s)://` URLs in saved slide HTML.',
  '- For local videos, use `<video src="./assets/<file>">` and prefer `poster="./assets/<file>"`.',
  '- Avoid CSS gradients for major backgrounds (use solid colors or images).',
].join('\n');
const DETAILED_DESIGN_SKILL_FALLBACK = [
  '## Base Settings',
  '',
  '### Slide Size (16:9 default)',
  '- Keep slide body at 720pt x 405pt using Tailwind arbitrary values: `w-[720pt] h-[405pt]`.',
  '- Use **Pretendard** as the default font stack (`font-[\'Pretendard\']`).',
  '- Include the Tailwind Play CDN link: `<script src="https://cdn.tailwindcss.com"></script>`.',
  '',
  '### Image Usage Rules',
  '- Always include alt on img tags.',
  '- Use `./assets/<file>` as the default contract for slide assets.',
  '- Use `slides-grab image --prompt "<prompt>"` for bespoke imagery.',
  '- Do not leave remote `http(s)://` URLs in saved slide HTML.',
  '- Store local videos under `<slides-dir>/assets/` and prefer `poster="./assets/<file>"` thumbnails.',
  '- Do not use non-body `background-image` for content imagery; use `<img>` instead.',
  '',
  '## Text Usage Rules',
  '- All text must be inside `<p>`, `<h1>`-`<h6>`, `<ul>`, `<ol>`, or `<li>`.',
  '- Never place text directly in `<div>` or `<span>`.',
  '- Use Tailwind arbitrary values for sizes: `text-[14pt]`, `text-[36pt]`.',
  '',
  '## Workflow',
  '- Use **Tailwind CSS utility classes** for all styling.',
  '- After slide edits, run `slides-grab validate --slides-dir <path>`.',
  '- Never start conversion without explicit approval.',
  '',
  '## Important Notes',
  '- CSS gradients are unstable for PPTX export; prefer solid colors or images.',
  '- Always include the Pretendard and Tailwind Play CDN links.',
  '- Never place text directly in div/span.',
].join('\n');
const BEAUTIFUL_SLIDE_DEFAULTS_FALLBACK = [
  '## Working Model',
  '',
  'Before building the deck, write two things:',
  '- **visual thesis** — one sentence describing the mood and imagery treatment.',
  '- **content plan** — opener → support/proof → detail/story → close/CTA.',
  '- Define design tokens early using a consistent Tailwind color palette.',
  '',
  '## Beautiful Defaults for Slides',
  '- Start with composition, not components.',
  '- Treat the opening slide like a poster.',
  '- Give each slide one job, one primary takeaway, and one dominant visual anchor.',
  '- Keep copy short enough to scan in seconds.',
  '- Use Tailwind whitespace, alignment, scale, and contrast before adding decorative chrome.',
  '- Limit to two typefaces max and one accent color.',
  '- Default to cardless layouts unless a card improves architecture.',
  '',
  '## Narrative Sequence for Decks',
  '- Opener → support/proof → detail/story → close/CTA.',
  '- Section dividers should reset the visual tempo.',
  '',
  '## Review Litmus',
  '- Can the audience grasp the main point in 3–5 seconds?',
  '- Does the slide have one dominant idea?',
  '- Is there one real visual anchor?',
  '- Would this still feel premium without extra chrome?',
].join('\n');


let cachedPptDesignSkillPrompt = null;
let cachedEditorPptDesignSkillPrompt = null;
let cachedStructuralDesignSkillPrompt = null;
let cachedSlideArtDirectionPrompt = null;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toFiniteNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed;
}

export function normalizeSelection(rawSelection, slideSize = SLIDE_SIZE) {
  if (!rawSelection || typeof rawSelection !== 'object') {
    throw new Error('Selection is required.');
  }

  const maxWidth = slideSize.width;
  const maxHeight = slideSize.height;

  const x1 = clamp(Math.round(toFiniteNumber(rawSelection.x, 0)), 0, maxWidth);
  const y1 = clamp(Math.round(toFiniteNumber(rawSelection.y, 0)), 0, maxHeight);
  const w = Math.max(1, Math.round(toFiniteNumber(rawSelection.width, 1)));
  const h = Math.max(1, Math.round(toFiniteNumber(rawSelection.height, 1)));

  const x2 = clamp(x1 + w, 0, maxWidth);
  const y2 = clamp(y1 + h, 0, maxHeight);

  return {
    x: x1,
    y: y1,
    width: Math.max(1, x2 - x1),
    height: Math.max(1, y2 - y1),
  };
}

export function scaleSelectionToScreenshot(selection, sourceSize, targetSize) {
  const sourceWidth = sourceSize?.width ?? SLIDE_SIZE.width;
  const sourceHeight = sourceSize?.height ?? SLIDE_SIZE.height;
  const targetWidth = targetSize?.width;
  const targetHeight = targetSize?.height;

  if (!Number.isFinite(targetWidth) || !Number.isFinite(targetHeight)) {
    throw new Error('Target size must include width and height.');
  }

  const sx = targetWidth / sourceWidth;
  const sy = targetHeight / sourceHeight;

  return {
    x: Math.max(0, Math.round(selection.x * sx)),
    y: Math.max(0, Math.round(selection.y * sy)),
    width: Math.max(1, Math.round(selection.width * sx)),
    height: Math.max(1, Math.round(selection.height * sy)),
  };
}

function formatTargets(targets) {
  if (!Array.isArray(targets) || targets.length === 0) {
    return ['  - (No XPath targets were detected for this region.)'];
  }

  return targets.slice(0, 12).flatMap((target, index) => {
    const text = typeof target.text === 'string' && target.text.trim() !== ''
      ? target.text.trim().replace(/\s+/g, ' ').slice(0, 140)
      : '(no text)';
    return [
      `  - Target ${index + 1}`,
      `    - XPath: ${target.xpath}`,
      `    - Tag: ${target.tag || 'unknown'}`,
      `    - Text: ${text}`,
    ];
  });
}

export function getPptDesignSkillPrompt() {
  if (cachedPptDesignSkillPrompt !== null) {
    return cachedPptDesignSkillPrompt;
  }

  try {
    cachedPptDesignSkillPrompt = readFileSync(PPT_DESIGN_SKILL_PATH, 'utf8').trim();
  } catch {
    cachedPptDesignSkillPrompt = '';
  }

  return cachedPptDesignSkillPrompt;
}

function getEditorPptDesignSkillPrompt() {
  if (cachedEditorPptDesignSkillPrompt !== null) {
    return cachedEditorPptDesignSkillPrompt;
  }

  try {
    cachedEditorPptDesignSkillPrompt = readFileSync(EDITOR_CODEX_PROMPT_PATH, 'utf8').trim();
  } catch {
    cachedEditorPptDesignSkillPrompt = EDITOR_PPT_DESIGN_SKILL_FALLBACK;
  }

  return cachedEditorPptDesignSkillPrompt;
}

function extractMarkdownSection(markdown, heading) {
  const lines = markdown.split('\n');
  const startIndex = lines.findIndex((line) => line.trim() === heading.trim());
  if (startIndex === -1) {
    return '';
  }

  const levelMatch = heading.match(/^(#+)\s/);
  const headingLevel = levelMatch ? levelMatch[1].length : null;
  if (!headingLevel) {
    return '';
  }

  const extracted = [lines[startIndex]];
  for (let i = startIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const nextHeadingMatch = line.match(/^(#+)\s/);
    if (nextHeadingMatch && nextHeadingMatch[1].length <= headingLevel) {
      break;
    }
    extracted.push(line);
  }

  return extracted.join('\n').trim();
}

function pruneDuplicateLines(markdown, patterns) {
  const lines = markdown.split('\n');
  const filtered = [];

  for (const line of lines) {
    if (patterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    const previousLine = filtered.at(-1) ?? '';
    if (line.trim() === '' && previousLine.trim() === '') {
      continue;
    }

    filtered.push(line);
  }

  return filtered.join('\n').trim();
}

function loadMarkdownSections(markdownPath, headings, fallback) {
  try {
    const markdown = readFileSync(markdownPath, 'utf8');
    const sections = headings
      .map((heading) => extractMarkdownSection(markdown, heading))
      .filter(Boolean);

    return sections.length > 0
      ? sections.join('\n\n')
      : fallback;
  } catch {
    return fallback;
  }
}

function getStructuralDesignSkillPrompt() {
  if (cachedStructuralDesignSkillPrompt !== null) {
    return cachedStructuralDesignSkillPrompt;
  }

  cachedStructuralDesignSkillPrompt = loadMarkdownSections(
    DETAILED_DESIGN_SKILL_PATH,
    DETAILED_DESIGN_SECTION_HEADINGS,
    DETAILED_DESIGN_SKILL_FALLBACK,
  );

  return cachedStructuralDesignSkillPrompt;
}

function getSlideArtDirectionPrompt() {
  if (cachedSlideArtDirectionPrompt !== null) {
    return cachedSlideArtDirectionPrompt;
  }

  cachedSlideArtDirectionPrompt = loadMarkdownSections(
    BEAUTIFUL_SLIDE_DEFAULTS_PATH,
    BEAUTIFUL_SLIDE_DEFAULTS_SECTION_HEADINGS,
    BEAUTIFUL_SLIDE_DEFAULTS_FALLBACK,
  );

  return cachedSlideArtDirectionPrompt;
}

export function getDetailedDesignSkillPrompt() {
  return [
    getStructuralDesignSkillPrompt(),
    getSlideArtDirectionPrompt(),
  ].filter(Boolean).join('\n\n');
}

export function buildCodexEditPrompt({ slideFile, slidePath, userPrompt, selections = [] }) {
  const sanitizedPrompt = typeof userPrompt === 'string' ? userPrompt.trim() : '';
  if (!sanitizedPrompt) {
    throw new Error('Prompt must be a non-empty string.');
  }

  const normalizedSlidePath = typeof slidePath === 'string' && slidePath.trim() !== ''
    ? slidePath.trim()
    : (typeof slideFile === 'string' && slideFile.trim() !== '' ? `slides/${slideFile.trim()}` : '');
  if (!normalizedSlidePath) throw new Error('Slide path is required.');

  if (!Array.isArray(selections) || selections.length === 0) {
    throw new Error('At least one selection is required.');
  }

  const selectionLines = selections.flatMap((selection, index) => {
    const bbox = selection.bbox ?? selection;
    return [
      `Region ${index + 1}`,
      `- Bounding box: x=${bbox.x}, y=${bbox.y}, width=${bbox.width}, height=${bbox.height}`,
      '- XPath targets:',
      ...formatTargets(selection.targets),
      '',
    ];
  });

  const editorPrompt = getEditorPptDesignSkillPrompt();
  const editorPromptLines = editorPrompt
    ? [
        'Slide edit rules (follow strictly):',
        editorPrompt,
        '',
      ]
    : [];

  return [
    `Edit ${normalizedSlidePath} only.`,
    '',
    ...editorPromptLines,
    'User edit request (this is the primary objective — follow it faithfully):',
    sanitizedPrompt,
    '',
    'Selected regions on slide (960x540 coordinate space):',
    ...selectionLines,
    'Rules:',
    '- Edit only the requested slide HTML file among slide-*.html files.',
    '- Do not modify any other slide HTML files unless explicitly requested.',
    '- Keep existing structure/content unless the request requires a change.',
    '- Keep slide dimensions at 720pt x 405pt.',
    '- Keep text in semantic tags (<p>, <h1>-<h6>, <ul>, <ol>, <li>).',
    '- You may add or update supporting files required for the requested slide, including local images and videos under <slides-dir>/assets/ and tldraw source/export files used to generate those assets.',
    '- When the request needs bespoke imagery, prefer `slides-grab image --prompt "<prompt>" --slides-dir <path>` so Nano Banana Pro saves the asset under <slides-dir>/assets/.',
    '- If GOOGLE_API_KEY or GEMINI_API_KEY is unavailable, or the Nano Banana API fails, ask the user for a Google API key or fall back to web search + download into <slides-dir>/assets/.',
    '- If you create or update a supporting asset, store it under <slides-dir>/assets/ and reference it from the requested slide as ./assets/<file>.',
    '- If you need a web-hosted video, download it into <slides-dir>/assets/ first with slides-grab fetch-video --url <youtube-url> --slides-dir <path> (or yt-dlp directly if needed), then reference only the local file.',
    '- Keep local assets under ./assets/ and preserve portable relative paths.',
    '- Do not modify unrelated assets, shared resources, or generated files that are not required for the requested slide.',
    '- Do not persist runtime-only editor/viewer injections such as <base>, debug scripts, or viewer wrapper markup into the slide file.',
    '- Return after applying the change.',
  ].join('\n');
}

export function buildCodexExecArgs({ prompt, imagePath, model }) {
  const args = [
    '--dangerously-bypass-approvals-and-sandbox',
    'exec',
    '--color',
    'never',
  ];

  if (typeof model === 'string' && model.trim() !== '') {
    args.push('--model', model.trim());
  }

  if (typeof imagePath === 'string' && imagePath.trim() !== '') {
    args.push('--image', imagePath.trim());
  }

  args.push('--', prompt);
  return args;
}

export const CLAUDE_MODELS = ['claude-opus-4-6', 'claude-sonnet-4-6'];

export function isClaudeModel(model) {
  return typeof model === 'string' && CLAUDE_MODELS.includes(model.trim());
}

export function buildClaudeExecArgs({ prompt, imagePath, model }) {
  const args = [
    '-p',
    '--dangerously-skip-permissions',
    '--model', model.trim(),
    '--max-turns', '30',
    '--verbose',
  ];

  let fullPrompt = prompt;
  if (typeof imagePath === 'string' && imagePath.trim() !== '') {
    fullPrompt = `First, read the annotated screenshot at "${imagePath.trim()}" to see the visual context of the bbox regions highlighted on the slide.\n\n${prompt}`;
  }

  args.push(fullPrompt);
  return args;
}

function buildAnnotationSvg(width, height, bbox) {
  const boxes = Array.isArray(bbox) ? bbox : [bbox];

  const overlayItems = boxes.flatMap((item, index) => {
    const x = item.x;
    const y = item.y;
    const w = item.width;
    const h = item.height;
    const labelY = Math.max(18, y - 6);
    return [
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(239,68,68,0.12)"/>`,
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#EF4444" stroke-width="4" filter="url(#shadow)"/>`,
      `<rect x="${x}" y="${Math.max(0, labelY - 16)}" width="22" height="18" fill="#EF4444"/>`,
      `<text x="${x + 11}" y="${labelY - 3}" text-anchor="middle" font-size="12" font-family="Arial, sans-serif" fill="#FFFFFF">${index + 1}</text>`,
    ];
  });

  return [
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`,
    '<defs>',
    '<filter id="shadow"><feDropShadow dx="0" dy="0" stdDeviation="2" flood-opacity="0.8"/></filter>',
    '</defs>',
    ...overlayItems,
    '</svg>',
  ].join('');
}

export async function writeAnnotatedScreenshot(inputImagePath, outputImagePath, bbox) {
  await mkdir(dirname(outputImagePath), { recursive: true });

  const image = sharp(inputImagePath);
  const metadata = await image.metadata();
  const width = metadata.width;
  const height = metadata.height;

  if (!width || !height) {
    throw new Error('Could not read screenshot dimensions.');
  }

  const svg = buildAnnotationSvg(width, height, bbox);
  const svgBuffer = Buffer.from(svg, 'utf8');

  await image
    .composite([{ input: svgBuffer, top: 0, left: 0 }])
    .png()
    .toFile(outputImagePath);
}

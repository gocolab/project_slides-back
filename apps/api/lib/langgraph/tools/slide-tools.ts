import { validateSlides } from "@root/scripts/validate-slides.js";
import { resolve } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export async function generateSlideHtml(
  slideData: any, 
  styleMetadata: any
): Promise<string> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY,
  });

  const response = await model.invoke(`
    You are a strictly HTML-only presentation slide designer.
    Return a COMPLETE HTML document (<!DOCTYPE html>, <html>, <head>, <body>).
    Do not use markdown backticks like \`\`\`html.

    CRITICAL RULES:
    1. STYLING: Use Tailwind CSS for all styling.
    2. CDN: You MUST include the Tailwind Play CDN in the <head>: <script src="https://cdn.tailwindcss.com"></script>
    3. FONT: You MUST include and use Pretendard: <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
    4. COORDINATES: All sizing, spacing, and fonts MUST use pt units via Tailwind arbitrary values (e.g., w-[720pt], p-[48pt], text-[36pt]).
    5. CANVAS: The slide body must be exactly w-[720pt] h-[405pt] with overflow-hidden.
    6. SEMANTIC HTML: Text must strictly reside in <h1>-<h6>, <p>, <ul>, <ol>, or <li> tags.
    7. IMAGES: Do NOT use online images. Use local relative paths (e.g., 'assets/image.png').

    Style Metadata: ${JSON.stringify(styleMetadata)}
    Slide content: ${JSON.stringify(slideData)}
  `);

  let html = response.content as string;
  html = html.replace(/^\`\`\`html/, '').replace(/\`\`\`$/, '').trim();
  
  return html;
}

export async function saveAndValidateSlide(
  slideIndex: number,
  html: string,
  sessionId: string
) {
  // Save to the root slides/sessions/:id directory so it can use the workspace setup
  const sessionDir = resolve(process.cwd(), `../../slides/sessions/${sessionId}`);
  await mkdir(sessionDir, { recursive: true });
  const filename = `slide-${String(slideIndex).padStart(2, '0')}.html`;
  const filepath = resolve(sessionDir, filename);
  await writeFile(filepath, html, "utf-8");
  
  // Validate this single slide
  const validationResult = await (validateSlides as any)(sessionDir, { selectedSlides: [filename] as string[] });

  return {
    filename,
    html,
    validationResult,
    filepath
  };
}

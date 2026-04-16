import { findSlideFiles, renderSlideToPdf, mergePdfBuffers } from "@root/scripts/html2pdf.js";
import { resolve } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function exportPdf(sessionId: string): Promise<string> {
  const slidesDir = resolve(process.cwd(), `../../slides/sessions/${sessionId}`);
  const slideFiles = await findSlideFiles(slidesDir);
  
  if (slideFiles.length === 0) {
    throw new Error(`No slide-*.html files found in: ${slidesDir}`);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const renderedSlides = [];
    
    for (const slideFile of slideFiles) {
      const slideResult = await renderSlideToPdf(page, slideFile, slidesDir, {
        mode: 'print'
      });
      renderedSlides.push(slideResult);
    }
    
    const mergedPdf = await mergePdfBuffers(renderedSlides.map((s) => s.pdfBytes!));
    const outputDir = resolve(process.cwd(), `../../outputs/${sessionId}`);
    await mkdir(outputDir, { recursive: true });
    
    const outputPath = resolve(outputDir, `presentation.pdf`);
    await writeFile(outputPath, mergedPdf);
    
    return outputPath;
  } finally {
    await browser.close();
  }
}

export async function exportPptx(sessionId: string): Promise<string> {
  const slidesDir = resolve(process.cwd(), `../../slides/sessions/${sessionId}`);
  const outputDir = resolve(process.cwd(), `../../outputs/${sessionId}`);
  await mkdir(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, `presentation.pptx`);
  
  await execAsync(`node ../../convert.cjs --slides-dir "${slidesDir}" --output "${outputPath}"`, {
    cwd: resolve(process.cwd(), "../../")
  });
  
  return outputPath;
}

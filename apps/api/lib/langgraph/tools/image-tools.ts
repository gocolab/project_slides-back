import { generateNanoBananaImage, saveNanoBananaImage } from "@root/src/nano-banana.js";
import { resolve } from "node:path";

export async function generateImage(prompt: string, sessionId: string, assetName?: string) {
  const slidesDir = resolve(process.cwd(), `../../slides/sessions/${sessionId}`);
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  
  const generated = await generateNanoBananaImage({
    prompt,
    apiKey,
  });

  const target = await saveNanoBananaImage({
    prompt,
    slidesDir,
    name: assetName,
    mimeType: generated.mimeType,
    bytes: generated.bytes,
  });

  return target.relativeRef;
}

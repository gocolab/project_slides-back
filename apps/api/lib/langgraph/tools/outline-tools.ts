import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SlideOutlineSchema, SlideOutline } from "@/lib/schemas/planning.schema";

export async function generateOutline(
  topic: string, 
  audience: string, 
  styleId: string, 
  slideCount: number
): Promise<SlideOutline> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.7,
    apiKey: process.env.GEMINI_API_KEY,
  }).withStructuredOutput(SlideOutlineSchema, { name: "generate_slide_outline" });
  
  const result = await model.invoke(`
    You are an expert presentation designer.
    Create an outline for a presentation about "${topic}".
    Target audience: "${audience}".
    Style ID to be used: "${styleId}".
    Requested slide count: ${slideCount}.
    
    Follow the exact JSON schema. Ensure the composition matches the style and the flow is logical.
  `);
  
  return result as SlideOutline;
}

export function validateOutline(outline: any): boolean {
  try {
    SlideOutlineSchema.parse(outline);
    return Array.isArray(outline.slides) && outline.slides.length > 0;
  } catch (e) {
    return false;
  }
}

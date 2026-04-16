import { z } from "zod";

export const SlideHtmlEntrySchema = z.object({
  slideIndex: z.number(),
  filename: z.string(),
  html: z.string(),
  validationResult: z.any().optional(), // We'll lean on the validate-slides.js format
});

export type SlideHtmlEntry = z.infer<typeof SlideHtmlEntrySchema>;

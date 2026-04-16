import { z } from "zod";

export const SlideOutlineSchema = z.object({
  meta: z.object({
    topic: z.string(),
    targetAudience: z.string(),
    toneAndMood: z.string(),
    style: z.string(),
    slideCount: z.string(),
    aspectRatio: z.string(),
  }),
  slides: z.array(
    z.object({
      slideNumber: z.number(),
      type: z.string(),
      title: z.string(),
      keyMessage: z.string(),
      details: z.array(z.string()),
    })
  ),
});

export type SlideOutline = z.infer<typeof SlideOutlineSchema>;

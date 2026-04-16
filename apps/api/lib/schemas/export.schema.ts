import { z } from "zod";

export const ExportConfigSchema = z.object({
  format: z.enum(["pdf", "pptx", "figma"]),
  resolution: z.string().optional(),
});

export type ExportConfig = z.infer<typeof ExportConfigSchema>;

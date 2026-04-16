import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";
import { SlideOutline } from "@/lib/schemas/planning.schema";
import { SlideHtmlEntry } from "@/lib/schemas/design.schema";

export const SlideSessionStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>(),
  stage: Annotation<"planning" | "design" | "export" | "completed" | "error">(),
  
  // Planning outputs
  styleId: Annotation<string>(),
  styleMetadata: Annotation<any>(),
  outline: Annotation<SlideOutline | null>(),
  
  // Design outputs
  slides: Annotation<SlideHtmlEntry[]>({
    reducer: (current, update) => {
      // Merge unique slides by index/filename
      const map = new Map(current.map(s => [s.filename, s]));
      update.forEach(s => map.set(s.filename, s));
      return Array.from(map.values()).sort((a, b) => a.slideIndex - b.slideIndex);
    },
    default: () => [],
  }),
  assetsDir: Annotation<string>(),
  
  // Export outputs
  exportFormat: Annotation<"pdf" | "pptx" | "figma" | null>({
    reducer: (current, update) => update ?? current,
    default: () => null
  }),
  exportPath: Annotation<string>(),
  exportUrl: Annotation<string>(),
  
  // Control
  humanApproval: Annotation<boolean>(),
  error: Annotation<string | null>(),
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

export type SlideSessionState = typeof SlideSessionStateAnnotation.State;

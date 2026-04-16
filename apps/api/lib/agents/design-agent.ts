import { StateGraph, END, START } from "@langchain/langgraph";
import { SlideSessionStateAnnotation } from "@/lib/langgraph/state";
import { generateSlideHtml, saveAndValidateSlide } from "@/lib/langgraph/tools/slide-tools";
import { checkpointer } from "@/lib/langgraph/checkpointer";

const slideGeneratorNode = async (state: typeof SlideSessionStateAnnotation.State) => {
  const { outline, styleMetadata, sessionId } = state;
  if (!outline) throw new Error("Outline is missing");
  
  const results = [];
  
  for (const slide of outline.slides) {
    const html = await generateSlideHtml(slide, styleMetadata);
    
    // Note: if the LLM output needs an image, generating it via Nano Banana would go here.
    
    const { filename, validationResult } = await saveAndValidateSlide(
      slide.slideNumber,
      html,
      sessionId
    );
    
    results.push({
      slideIndex: slide.slideNumber,
      filename,
      html,
      validationResult
    });
  }
  
  return {
    slides: results,
    stage: "export" // transition stage
  };
};

const builder = new StateGraph(SlideSessionStateAnnotation)
  .addNode("slide_generator", slideGeneratorNode)
  .addEdge(START, "slide_generator")
  .addEdge("slide_generator", END);

export const designAgent = builder.compile({ checkpointer });

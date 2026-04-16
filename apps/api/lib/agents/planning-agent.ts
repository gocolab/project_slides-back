import { StateGraph, END, START } from "@langchain/langgraph";
import { SlideSessionStateAnnotation } from "@/lib/langgraph/state";
import { AIMessage } from "@langchain/core/messages";
import { listStyles, getStyle } from "@/lib/langgraph/tools/style-tools";
import { generateOutline } from "@/lib/langgraph/tools/outline-tools";
import { checkpointer } from "@/lib/langgraph/checkpointer";

const styleSelectorNode = async (state: typeof SlideSessionStateAnnotation.State) => {
  const styles = listStyles();
  const summary = styles.map((s: any) => `${s.id}: ${s.title}`).join("\n");
  
  return {
    messages: [
      new AIMessage(`Available styles:\n${summary}\n\nPlease select a style ID.`)
    ]
  };
};

const outlineGeneratorNode = async (state: typeof SlideSessionStateAnnotation.State) => {
  const meta = state.outline?.meta;
  if (!meta) throw new Error("Missing initial meta input");
  
  if (!state.styleId) throw new Error("styleId must be provided before generating outline");

  const outline = await generateOutline(
    meta.topic,
    meta.targetAudience,
    state.styleId,
    parseInt(meta.slideCount, 10)
  );

  return {
    outline,
    styleMetadata: getStyle(state.styleId),
    stage: "design"
  };
};

const builder = new StateGraph(SlideSessionStateAnnotation)
  .addNode("style_selector", styleSelectorNode)
  .addNode("outline_generator", outlineGeneratorNode)
  .addEdge(START, "style_selector")
  .addEdge("style_selector", "outline_generator")
  .addEdge("outline_generator", END);

export const planningAgent = builder.compile({ 
  checkpointer,
  interruptBefore: ["outline_generator"]
});

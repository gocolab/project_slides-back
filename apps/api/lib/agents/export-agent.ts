import { StateGraph, END, START } from "@langchain/langgraph";
import { SlideSessionStateAnnotation } from "@/lib/langgraph/state";
import { exportPdf, exportPptx } from "@/lib/langgraph/tools/export-tools";
import { checkpointer } from "@/lib/langgraph/checkpointer";

const exportNode = async (state: typeof SlideSessionStateAnnotation.State) => {
  const { sessionId, exportFormat } = state;
  
  if (!exportFormat) throw new Error("exportFormat not specified");
  
  let exportPath = "";
  if (exportFormat === "pdf") {
    exportPath = await exportPdf(sessionId);
  } else if (exportFormat === "pptx") {
    exportPath = await exportPptx(sessionId);
  } else {
    throw new Error(`Unsupported export format: ${exportFormat}`);
  }
  
  return {
    exportPath,
    exportUrl: `/api/slides/export/download?path=${encodeURIComponent(exportPath)}`,
    stage: "completed"
  };
};

const builder = new StateGraph(SlideSessionStateAnnotation)
  .addNode("export_node", exportNode)
  .addEdge(START, "export_node")
  .addEdge("export_node", END);

export const exportAgent = builder.compile({ 
  checkpointer 
});

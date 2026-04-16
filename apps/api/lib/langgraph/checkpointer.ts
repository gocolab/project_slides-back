import { MemorySaver } from "@langchain/langgraph";

// We use MemorySaver initially as described in the implementation plan.
// For production with true persistence, this should be replaced with a database checkpointer.
export const checkpointer = new MemorySaver();

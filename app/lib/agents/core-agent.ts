import {
  stepCountIs,
  Experimental_Agent as Agent,
  type Experimental_InferAgentUIMessage as InferAgentUIMessage,
  type Tool
} from 'ai';
// import { z } from 'zod';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { createMem0 } from "@mem0/vercel-ai-provider";

const { openaiApiKey, mem0ApiKey } = useRuntimeConfig();
if (!openaiApiKey) throw new Error('Missing OpenAI API key');
if (!mem0ApiKey) throw new Error('Missing Mem0 API key');

const mem0 = createMem0({
  provider: "openai",
  mem0ApiKey: mem0ApiKey,
  apiKey: openaiApiKey,
});

export const CoreAgent = new Agent({
   model: mem0("gpt-5.1", { user_id: "113600246600420663190" }),
    stopWhen: stepCountIs(100),
    tools: {
      'web-search': searchTool as Tool,
      'extract': extractTool as Tool,
    },
});

// Infer the UIMessage type for UI components or persistence
export type CoreAgentUIMessage = InferAgentUIMessage<typeof CoreAgent>;
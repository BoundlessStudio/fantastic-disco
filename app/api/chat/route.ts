import { createMem0 } from "@mem0/vercel-ai-provider";
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { streamText, ToolChoice, UIMessage, convertToModelMessages, ToolSet, stepCountIs } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const mem0 = createMem0();

export async function POST(req: Request) {
  const {
    messages,
    model,
    choice,
  }: { 
    messages: UIMessage[]; 
    model: string; 
    choice: string;
  } = await req.json();

  const tools = {
    'web-search': searchTool,
    'web-extract': extractTool,
  } as ToolSet;

  const result = streamText({
    model: mem0(model, { user_id: "113600246600420663190" }),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    system: 'You are a helpful assistant that can answer questions and help with tasks',
    tools: tools,
    toolChoice: choice as ToolChoice<typeof tools>,
    abortSignal: req.signal,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
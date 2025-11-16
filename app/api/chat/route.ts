import { createMem0 } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { streamText, ToolChoice, UIMessage, convertToModelMessages, ToolSet, stepCountIs } from 'ai';
import { auth0 } from "@/lib/auth0";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const mem0 = createMem0({
  provider: "openai",                          // or "anthropic" / "google" / etc.
  mem0ApiKey: process.env.MEM0_API_KEY!,       // Mem0 platform key: m0-xxxx
  apiKey: process.env.OPENAI_API_KEY!,         // your OpenAI (or provider) key
  // optional global Mem0 config
  mem0Config: {
    enable_graph: false,                       // optional
  },
});

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

  const session = await auth0.getSession();
  
  const result = streamText({
    model: session ? mem0(model, { user_id: session?.user.sub }) : openai(model),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    system: 'You are a helpful assistant that can answer questions and help with tasks',
    tools: tools,
    toolChoice: choice as ToolChoice<typeof tools>,
    // TODO: handle Stop Button
    abortSignal: req.signal,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
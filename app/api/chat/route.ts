import { createMem0 } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { streamText, ToolChoice, UIMessage, convertToModelMessages, ToolSet, stepCountIs, tool } from 'ai';
import { auth0 } from "@/lib/auth0";
import { z } from 'zod';

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

async function getWeather(params: { city: string, unit: string }) {
  await new Promise(resolve => setTimeout(resolve, 3000));

  const temperature = 20 + Math.floor(Math.random() * 11) - 5;

  return {
    temperature,
    unit: params.unit,
    forecast: 'always sunny!',
  };
}


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
    'image_generation': openai.tools.imageGeneration({ 
      outputFormat: 'webp'
    }),
    'code_interpreter': openai.tools.codeInterpreter({
      // container: ''
    }),
    // local_shell: openai.tools.localShell({
    //   execute: async ({ action }) => {
    //     // ... your implementation, e.g. sandbox access ...
    //     return { output: stdout };
    //   },
    // }),
    'weather': tool({
      description: 'Get the current weather.',
      inputSchema: z.object({
        city: z.string().describe('The city to get the weather for'),
        unit: z
          .enum(['C', 'F'])
          .describe('The unit to display the temperature in'),
      }),
      async execute({ city, unit } /* , { abortSignal, messages }*/) {
        const weather = await getWeather({ city, unit });
        return weather;
      },
    }),
  } as ToolSet;

  const session = await auth0.getSession();
  
  const result = streamText({
    model: session ? mem0(model, { user_id: session?.user.sub }) : openai(model),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(10),
    system: 'You are a helpful assistant that can answer questions and help with tasks',
    tools: tools,
    activeTools: ['web-search', 'web-extract', 'weather', 'image_generation'],
    toolChoice: choice as ToolChoice<typeof tools>,
    abortSignal: req.signal,
    providerOptions: {
      openai: {
        reasoningEffort: 'high', 
        reasoningSummary: 'detailed', 
      },
    }
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
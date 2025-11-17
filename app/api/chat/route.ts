import { retrieveMemories, addMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { streamText, ToolChoice, UIMessage, convertToModelMessages, ToolSet, stepCountIs, tool } from 'ai';
import { convertModelToV2Prompt } from "@/lib/convertModelToV2Prompt";
import { auth0 } from "@/lib/auth0";
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

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

  const session = await auth0.getSession();

  
  const tools = {
    'web-search': searchTool,
    'web-extract': extractTool,
    'image_generation': openai.tools.imageGeneration({ 
      outputFormat: 'webp',
    }),
    'code_interpreter': openai.tools.codeInterpreter({
      // container: ''
    }),
    'local_shell': openai.tools.localShell({
      execute: async ({ action }) => {
        // ... your implementation, e.g. sandbox access ...
        return { output: "" };
      },
    }),
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
      }
    }),
  } as ToolSet;

  const modelMessages = convertToModelMessages(messages, { tools })

  let instructions = 'You are a helpful assistant that can answer questions and help with tasks';
  if(session) {
    instructions = await retrieveMemories(instructions, { user_id: session?.user.sub });
    const msg = convertModelToV2Prompt(modelMessages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addMemories(msg as any, { user_id: session?.user.sub });
  }

  const result = streamText({
    model: openai(model),
    messages: modelMessages,
    stopWhen: stepCountIs(10),
    system: instructions,
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
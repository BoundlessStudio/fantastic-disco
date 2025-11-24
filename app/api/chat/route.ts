// api/chat/route.ts
import { retrieveMemories, addMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import {
  streamText,
  ToolChoice,
  UIMessage,
  convertToModelMessages,
  ToolSet,
  stepCountIs,
  tool,
  smoothStream,
  ModelMessage,
} from 'ai';
// import { SessionData } from "@auth0/nextjs-auth0/types";
// import { convertModelToV2Prompt } from "@/lib/convertModelToV2Prompt";
// import { auth0 } from "@/lib/auth0";
import { sandboxUrlTransform } from "@/lib/urlStreamTransform";
import { getContainerId } from "@/lib/openAI";
import { z } from 'zod';

export const maxDuration = 60;

type InputDto = { 
  messages: UIMessage[]; 
  thread: string,
  model: string,
  choice: string,
  thinking: string,
}

type WeatherData = {
  temperature: number,
  unit: string,
  forecast: string
}

async function getWeather(params: { city: string, unit: string }): Promise<WeatherData> {
  await new Promise(resolve => setTimeout(resolve, 3000));

  const temperature = 20 + Math.floor(Math.random() * 11) - 5;

  return {
    temperature,
    unit: params.unit,
    forecast: 'always sunny!',
  };
}

async function getInstructions(modelMessages: ModelMessage[]) {
  return 'You are a helpful assistant that can answer questions and help with tasks.';
}

// async function getInstructions(modelMessages: ModelMessage[]) {
//   const session = await auth0.getSession();
//   let instructions = 'You are a helpful assistant that can answer questions and help with tasks.';
//   if (session) {
//     instructions = await retrieveMemories(instructions, { user_id: session?.user.sub });
//     const msg = convertModelToV2Prompt(modelMessages);
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     addMemories(msg as any, { user_id: session?.user.sub });
//   }
//   return instructions;
// }

// interface ExecResult {
//   /**
//    * Whether the command succeeded (exitCode === 0)
//    */
//   success: boolean;
//   /**
//    * Process exit code
//    */
//   exitCode: number;
//   /**
//    * Standard output content
//    */
//   stdout: string;
//   /**
//    * Standard error content
//    */
//   stderr: string;
//   /**
//    * Command that was executed
//    */
//   command: string;
//   /**
//    * Execution duration in milliseconds
//    */
//   duration: number;
//   /**
//    * ISO timestamp when command started
//    */
//   timestamp: string;
//   /**
//    * Session ID if provided
//    */
//   sessionId?: string;
// }

export async function POST(req: Request) {
  const {
    messages,
    thread,
    model,
    thinking,
    choice,
  }: InputDto = await req.json();
  
  const containerId = await getContainerId(thread);
  
  const tools = {
    'web_search': searchTool,
    'web_extract': extractTool,
    'image_generation': openai.tools.imageGeneration({ 
      outputFormat: 'webp',
    }),
    "code_interpreter": openai.tools.codeInterpreter({
      container: containerId
    }),
    // "local_shell": openai.tools.localShell({
    //   async execute({ action }) {
    //     // action.command
    //     // action.env
    //     // action.timeoutMs
    //     // action.type
    //     // action.user
    //     // action.workingDirectory
    //     return { output: "" };
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
      outputSchema: z.object({
        temperature:  z.number(),
        unit:  z.string(),
        forecast:  z.string(),
      }),
      async execute({ city, unit } /* , { abortSignal, messages }*/) {
        const weather = await getWeather({ city, unit });
        return weather;
      },
    }),
  } as ToolSet;

  const modelMessages = convertToModelMessages(messages, { tools });
  const instructions = await getInstructions(modelMessages);

  const result = streamText({
    abortSignal: req.signal,
    model: openai(model),
    stopWhen: stepCountIs(5),
    system: instructions,
    tools: tools,
    toolChoice: choice as ToolChoice<typeof tools>,
    messages: modelMessages,
    providerOptions: {
      openai: {
        reasoningEffort: thinking,
        reasoningSummary: 'auto',
      },
    },
    experimental_transform: [
      smoothStream({
        delayInMs: 20,
        chunking: 'line',
      }),
      sandboxUrlTransform<typeof tools>({
        containerId: containerId
      }),
    ],
  });


  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    sendSources: true,
    sendReasoning: true,
    messageMetadata: ({ part }) => {
       if (part.type === "finish") {
        return {
          usage: { 
            totalTokens: part.totalUsage.totalTokens,
            inputTokens: part.totalUsage.inputTokens,
            outputTokens: part.totalUsage.outputTokens,
            reasoningTokens: part.totalUsage.reasoningTokens,
            cachedInputTokens: part.totalUsage.cachedInputTokens,
          }
        };
      }

      // You can also attach metadata on "start" or other parts if you want
      return undefined;
    }
  });
}

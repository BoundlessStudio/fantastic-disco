import { retrieveMemories, addMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { perplexity } from '@ai-sdk/perplexity';
import { searchTool, extractTool } from '@parallel-web/ai-sdk-tools';
import { streamText, ToolChoice, UIMessage, convertToModelMessages, ToolSet, stepCountIs, tool, LanguageModel } from 'ai';
import { convertModelToV2Prompt } from "@/lib/convertModelToV2Prompt";
import { auth0 } from "@/lib/auth0";
import { uploadContainerClient } from "@/lib/fileStorage"
import { z } from 'zod';
import OpenAI from 'openai';
import path from 'path';

const client = new OpenAI();

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

type InputDto = { 
  messages: UIMessage[]; 
  thread: string,
  model: string; 
  provider: string;
  choice: string;
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

function getModel(provider: string, model: string) {
    switch (provider) {
    case "perplexity":
      return perplexity(model)
    case "openai":
      return openai(model);
    default:
      return openai("gpt-4.1")
  }
}

async function getContainerId(thread: string) {
 const name = `thread-${thread}`;

  // List all containers
  const containers = await client.containers.list();

  for await (const container of containers) {
    if(container.name == name)
      return container.id;
  }

  const container = await client.containers.create({
    name: name,
  });
  return container.id;
}

async function getContainerFiles(container: string, cutoff: number): Promise<string[]> {
  const files: string[] = [];
  const collection = await client.containers.files.list(container);
  for await (const file of collection) {
    if(file.created_at <= cutoff)
      continue;

    const response = await client.containers.files.content.retrieve(file.id, { container_id: container});
    const ab = await response.arrayBuffer();
    const buffer = Buffer.from(ab);

    const filename = path.basename(file.path);
    const blobName = `${crypto.randomUUID()}-${filename}`;
    const blockBlobClient = uploadContainerClient.getBlockBlobClient(blobName);
    await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: response.headers.get('content-type') ?? "application/octet-stream",
      },
    });
    
    files.push(blockBlobClient.url);
  }
  return files;
}

export async function POST(req: Request) {
  const {
    messages,
    thread,
    model,
    provider,
    choice,
  }: InputDto = await req.json();
  
  const cutoff = Date.now();

  const container = await getContainerId(thread);
  const session = await auth0.getSession();

  const tools = {
    'web_search': searchTool,
    'web_extract': extractTool,
    'image_generation': openai.tools.imageGeneration({ 
      outputFormat: 'webp',
    }),
    "code_interpreter": openai.tools.codeInterpreter({
      container: container
    }),
    "code_interpreter_file_retrieval": tool({
      description: "Get/Export files from within the code interpreter container '/mnt/data' directory",
      inputSchema: z.object({}),
      outputSchema: z.object({
        urls: z.array(z.string())
      }),
      async execute() {
        const urls = await getContainerFiles(container, cutoff);
        return { urls }
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

  const modelMessages = convertToModelMessages(messages, { tools })

  let instructions = 'You are a helpful assistant that can answer questions and help with tasks';
  if(session) {
    instructions = await retrieveMemories(instructions, { user_id: session?.user.sub });
    const msg = convertModelToV2Prompt(modelMessages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addMemories(msg as any, { user_id: session?.user.sub });
  }

  const result = streamText({
    abortSignal: req.signal,
    model: getModel(provider, model),
    stopWhen: stepCountIs(5),
    system: instructions,
    tools: tools,
    toolChoice: choice as ToolChoice<typeof tools>,
    messages: modelMessages,
    providerOptions: {
      openai: {
        reasoningEffort: 'high', 
        reasoningSummary: 'detailed', 
      },
      perplexity: {
        // return_images: true,
      },
    }
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}
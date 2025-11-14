import {
  tool,
  stepCountIs,
  Experimental_Agent as Agent,
  type Experimental_InferAgentUIMessage as InferAgentUIMessage,
} from 'ai';
import { z } from 'zod';
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
    stopWhen: stepCountIs(10),
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        inputSchema: z.object({
          location: z
            .string()
            .describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
      convertFahrenheitToCelsius: tool({
        description: 'Convert a temperature in fahrenheit to celsius',
        inputSchema: z.object({
          temperature: z
            .number()
            .describe('The temperature in fahrenheit to convert'),
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius,
          };
        },
      }),
    },
});

// Infer the UIMessage type for UI components or persistence
export type CoreAgentUIMessage = InferAgentUIMessage<typeof CoreAgent>;
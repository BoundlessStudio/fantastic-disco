// import { convertToModelMessages, UIMessage, validateUIMessages } from 'ai';
import { CoreAgent, CoreAgentUIMessage } from '@/lib/agents/core-agent';

export default defineLazyEventHandler(async () => {

  return defineEventHandler(async (event: any) => {
    const { messages }: { messages: CoreAgentUIMessage[] } = await readBody(event);
    
    return CoreAgent.respond({
      messages,
    });
  });
});
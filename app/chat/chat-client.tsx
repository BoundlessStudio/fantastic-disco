'use client';

import {
  Conversation,
  ConversationContent,
  // ConversationScrollButton, // TODO: Get this working again...
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
  MessageAttachments,
  MessageAttachment,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputHeader,
  type PromptInputMessage,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSpeechButton 
} from '@/components/ai-elements/prompt-input';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/components/ai-elements/tool';
import { Suggestions, Suggestion } from '@/components/ai-elements/suggestion';

// Extra AI Elements you asked to support:
// import {
//   ChainOfThought,
//   ChainOfThoughtContent,
//   ChainOfThoughtHeader,
// } from '@/components/ai-elements/chain-of-thought';
// import {
//   Checkpoint,
//   CheckpointIcon,
//   CheckpointTrigger,
// } from '@/components/ai-elements/checkpoint';
// import {
//   Confirmation,
//   ConfirmationRequest,
//   ConfirmationAccepted,
//   ConfirmationRejected,
//   ConfirmationActions,
//   ConfirmationAction,
//   type ConfirmationProps,
// } from '@/components/ai-elements/confirmation';
// import {
//   Context,
//   ContextContent,
//   ContextContentBody,
//   ContextContentHeader,
//   ContextContentFooter,
//   ContextTrigger,
//   ContextInputUsage,
//   ContextOutputUsage,
//   ContextReasoningUsage,
//   ContextCacheUsage,
// } from '@/components/ai-elements/context';
// import {
//   InlineCitation,
//   InlineCitationText,
//   InlineCitationCard,
//   InlineCitationCardTrigger,
//   InlineCitationCardBody,
//   InlineCitationSource,
//   InlineCitationQuote,
// } from '@/components/ai-elements/inline-citation';
// import {
//   Plan,
//   PlanContent,
//   PlanHeader,
//   PlanDescription,
//   PlanTitle,
//   PlanTrigger,
// } from '@/components/ai-elements/plan';
// import {
//   Queue,
//   QueueItem,
//   QueueItemActions,
//   QueueItemAction,
//   QueueItemDescription,
//   QueueItemContent,
//   QueueItemIndicator,
//   QueueList,
//   QueueSection,
//   QueueSectionContent,
//   QueueSectionLabel,
//   QueueSectionTrigger,
// } from '@/components/ai-elements/queue';
// import { Shimmer } from '@/components/ai-elements/shimmer';
// import {
//   Task,
//   TaskContent,
//   TaskItem,
// } from '@/components/ai-elements/task';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';

import { useState, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import type { FileUIPart, UIMessage } from 'ai';
import { CheckIcon, CopyIcon, RefreshCcwIcon, Sun  } from 'lucide-react';

type BaseMessage = UIMessage;
type BaseMessagePart = BaseMessage['parts'][number];

// You can expand this to the full multi-provider shape like in the example if you want
const models = [
  {
    id: 'gpt-5.1',
    name: 'GPT 5.1',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'gpt-5',
    name: 'GPT 5',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'gpt-4o',
    name: 'GPT 4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
  },
  {
    id: 'sonar',
    name: 'Sonar',
    chef: 'Perplexity',
    chefSlug: 'perplexity',
    providers: ['perplexity'],
  },
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    chef: 'Perplexity',
    chefSlug: 'perplexity',
    providers: ['perplexity'],
  },
];

const toolChoices = [
  {
    name: 'Auto',
    value: 'auto',
  },
  {
    name: 'None',
    value: 'none',
  },
  {
    name: 'Required',
    value: 'required',
  },
  {
    name: 'Web Search',
    value: 'web_search',
  },
  {
    name: 'Web Extract',
    value: 'web_extract',
  },
  {
    name: 'Weather',
    value: 'weather',
  },
  {
    name: 'Image Generation',
    value: 'image_generation',
  },
  {
    name: 'Code Interpreter',
    value: 'code_interpreter',
  },
];

const suggestions = [
  'find arcades where i live.',
  'what is the weather where i live?',
  'what do you see in the image?',
  'summarize the latest AI news.',
];

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return await res.blob();
}

async function uploadBlobToStorage(
  blob: Blob,
  filename?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', blob, filename ?? 'attachment');

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Upload failed');
  }

  const { url } = await res.json();
  return url as string;
}

type Weather = {
  temperature: string;
  unit: string;
  forecast: string;
};

interface WeatherCardProps {
  weather: Weather;
}

const WeatherCard = ({ weather }: WeatherCardProps) => {
  const { temperature, unit, forecast } = weather;

   return (
    <div className="relative rounded-lg border p-4 flex flex-col gap-2 bg-gradient-to-br from-sky-100 to-sky-300 overflow-hidden">
      {/* Sun Icon */}
      <Sun
        className="absolute right-3 top-3 h-10 w-10 text-yellow-500 opacity-70 pointer-events-none"
        strokeWidth={2}
      />

      <div className="text-xl font-semibold">
        {temperature}°{unit}
      </div>

      <div className="text-muted-foreground">{forecast}</div>
    </div>
  );
}

const ChatClient = () => {

  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[1].id);
  const [tool, setTool] = useState<string>(toolChoices[0].value);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, regenerate, stop } = useChat();
  //const typedMessages = messages as ExtendedMessage[];

  const selectedModel = models.find((m) => m.id === model);

  const handleSubmit = async (message: PromptInputMessage) => {
    if (status === 'streaming') {
      stop();
      return;
    }

    const hasText = Boolean(message.text && message.text.trim());
    const hasAttachments = Boolean(message.files?.length);
    if (!(hasText || hasAttachments)) {
      return;
    }

    let files: FileUIPart[] | undefined = message.files;
    if (message.files && message.files.length > 0) {
      files = await Promise.all(
        message.files.map(async (file) => {
          // Already a blob URL or external URL: keep as-is
          if (!file.url.startsWith('data:')) 
            return file;

          const blob = await dataUrlToBlob(file.url);
          const uploadedUrl = await uploadBlobToStorage(blob, file.filename ?? 'attachment');

          return {
            type: 'file',
            mediaType: file.mediaType,
            filename: file.filename,
            url: uploadedUrl,
          } as FileUIPart;
        }),
      );
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: files,
      },
      {
        body: {
          model: selectedModel?.id,
          provider: selectedModel?.chefSlug,
          choice: tool,
        },
      },
    );
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  
  
  // Helper: render one part using all AI Elements we know about
  const renderPart = (
    message: BaseMessage,
    part: BaseMessagePart,
    index: number,
  ) => {
    const isLastAssistantChunk =
      message.role === 'assistant' &&
      message.id === messages.at(-1)?.id &&
      index === message.parts.length - 1;

    switch (part.type) {
      case 'tool-code_interpreter':
          return (
            <Tool key={`${message.id}-tool-${index}`}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <ToolOutput
                  output={
                    part.output
                      ? JSON.stringify(part.output, null, 2)
                      : undefined
                  }
                  errorText={part.errorText}
                />
              </ToolContent>
            </Tool>
          );
      case 'tool-image_generation':
        return (
          <div key={`${message.id}-tool-${index}`}>
            <Tool>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <ToolOutput
                  output={part.output}
                  errorText={part.errorText}
                />
              </ToolContent>
            </Tool>
            { part.state === "output-available" && (
            <MessageAttachments>
              <MessageAttachment className='size-40' data={{
                  type: "file",
                  url: "data:image/webp;base64," + (part.output as {result: string}).result,
                  mediaType: "image/webp",
                  filename: "image.webp"
                }} />
            </MessageAttachments>
            )}
          </div>
        );
      case 'tool-weather':
        return (
          (part.state == 'output-available') ?
            <WeatherCard key={`${message.id}-tool-${index}`} weather={part.output as Weather} />
          :
          <Tool key={`${message.id}-tool-${index}`}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent className="">
                <ToolInput input={part.input} />
              </ToolContent>
            </Tool>
          );
      case 'tool-web_search':
      case 'tool-web_extract':
        return (
            <Tool key={`${message.id}-tool-${index}`}>
              <ToolHeader type={part.type} state={part.state} />
              <ToolContent>
                <ToolInput input={part.input} />
                <ToolOutput
                  output={
                    part.output
                      ? JSON.stringify(part.output, null, 2)
                      : undefined
                  }
                  errorText={part.errorText}
                />
              </ToolContent>
            </Tool>
          );
      case 'text':
        return (
          <div key={`${message.id}-text-${index}`}>
            <MessageContent>
              <MessageResponse>{part.text}</MessageResponse>
            </MessageContent>
            {isLastAssistantChunk && (
              <MessageActions>
                <MessageAction onClick={() => regenerate()} label="Retry">
                  <RefreshCcwIcon className="size-3" />
                </MessageAction>
                <MessageAction
                  onClick={() => navigator.clipboard.writeText(part.text)}
                  label="Copy"
                >
                  <CopyIcon className="size-3" />
                </MessageAction>
              </MessageActions>
            )}
          </div>
        );
      case 'file' :
        return (
            <MessageAttachment data={part} key={part.url} />
        );
      case 'reasoning':
        return (
          <Reasoning
            key={`${message.id}-reasoning-${index}`}
            className="w-full"
            isStreaming={
              status === 'streaming' &&
              index === message.parts.length - 1 &&
              message.id === messages.at(-1)?.id
            }
          >
            <ReasoningTrigger />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        );
      default: {
        return null;
      }
    }
  };


  return (
    <div className="h-full w-full flex flex-col gap-4 p-2">
      <div className="h-full overflow-auto">
        <Conversation>
          <ConversationContent>
          {messages.map((message) => {
            return (
              <div key={message.id} className="mb-2">
                <Message key={`${message.id}`} from={message.role}>
                  <MessageContent className={message.role === 'assistant' ? 'w-full': ''}>
                    
                    {message.role === 'assistant' &&
                      message.parts.filter((part) => part.type === 'source-url')
                        .length > 0 && (
                        <Sources>
                          <SourcesTrigger
                            count={
                              message.parts.filter(
                                (part) => part.type === 'source-url',
                              ).length
                            }
                          />
                          {message.parts
                            .filter((part) => part.type === 'source-url')
                            .map((part, i) => (
                              <SourcesContent key={`${message.id}-${i}`}>
                                <Source
                                  key={`${message.id}-${i}`}
                                  href={part.url}
                                  title={part.url}
                                />
                              </SourcesContent>
                            ))}
                        </Sources>
                      )}

                  {message.parts.map((part, partIndex) =>
                    renderPart(message, part, partIndex),
                  )}
                  </MessageContent>
                </Message>
              </div>
            );
          })}
          </ConversationContent>
        </Conversation>
      </div>
      <div>
       <Suggestions>
        {suggestions.map((suggestion) => (
          <Suggestion
            key={suggestion}
            suggestion={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
          />
        ))}
      </Suggestions>
      </div>
      <div className="h-48">
        <PromptInput
          onSubmit={handleSubmit}
          globalDrop
          multiple
          className="border-0 shadow-none"
        >
          <PromptInputHeader>
            <PromptInputAttachments >
              {(attachment) => (
                <PromptInputAttachment data={attachment} />
              )}
            </PromptInputAttachments>
          </PromptInputHeader>
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              ref={textareaRef}
              value={input}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments/>
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>


              <PromptInputSpeechButton
                onTranscriptionChange={setInput}
                textareaRef={textareaRef}
              />

              {/* Model Selector (AI Elements) */}
              <ModelSelector
                onOpenChange={setModelSelectorOpen}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModel?.chefSlug && (
                      <ModelSelectorLogo provider={selectedModel.chefSlug} />
                    )}
                    {selectedModel?.name && (
                      <ModelSelectorName>
                        {selectedModel.name}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {['OpenAI', 'Perplexity'].map((chef) => (
                      <ModelSelectorGroup key={chef} heading={chef}>
                        {models
                          .filter((m) => m.chef === chef)
                          .map((m) => (
                            <ModelSelectorItem
                              key={m.id}
                              onSelect={() => {
                                setModel(m.id);
                                setModelSelectorOpen(false);
                              }}
                              value={m.id}
                            >
                              <ModelSelectorLogo provider={m.chefSlug} />
                              <ModelSelectorName>{m.name}</ModelSelectorName>
                              <ModelSelectorLogoGroup>
                                {m.providers.map((provider) => (
                                  <ModelSelectorLogo
                                    key={provider}
                                    provider={provider}
                                  />
                                ))}
                              </ModelSelectorLogoGroup>
                              {model === m.id ? (
                                <CheckIcon className="ml-auto size-4" />
                              ) : (
                                <div className="ml-auto size-4" />
                              )}
                            </ModelSelectorItem>
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>

              {/* Tool-choice dropdown (kept from your original) */}
              <PromptInputSelect
                onValueChange={(value) => {
                  setTool(value);
                }}
                value={tool}
              >
                <PromptInputSelectTrigger>
                  Tool: <PromptInputSelectValue />
                </PromptInputSelectTrigger>
                <PromptInputSelectContent>
                  {toolChoices.map((t) => (
                    <PromptInputSelectItem
                      key={t.value}
                      value={t.value}
                    >
                      {t.name}
                    </PromptInputSelectItem>
                  ))}
                </PromptInputSelectContent>
              </PromptInputSelect>
            </PromptInputTools>

            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatClient;



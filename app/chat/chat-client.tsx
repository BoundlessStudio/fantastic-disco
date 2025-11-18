'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
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
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from '@/components/ai-elements/chain-of-thought';
import {
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
} from '@/components/ai-elements/checkpoint';
import {
  Confirmation,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
  type ConfirmationProps,
} from '@/components/ai-elements/confirmation';
import {
  Context,
  ContextContent,
  ContextContentBody,
  ContextContentHeader,
  ContextContentFooter,
  ContextTrigger,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextCacheUsage,
} from '@/components/ai-elements/context';
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
  InlineCitationQuote,
} from '@/components/ai-elements/inline-citation';
import {
  Plan,
  PlanContent,
  PlanHeader,
  PlanDescription,
  PlanTitle,
  PlanTrigger,
} from '@/components/ai-elements/plan';
import {
  Queue,
  QueueItem,
  QueueItemActions,
  QueueItemAction,
  QueueItemDescription,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from '@/components/ai-elements/queue';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  Task,
  TaskContent,
  TaskItem,
} from '@/components/ai-elements/task';
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
import { CheckIcon, CopyIcon, MicIcon, RefreshCcwIcon, Sun  } from 'lucide-react';


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

type BaseMessage = UIMessage;
type BaseMessagePart = BaseMessage['parts'][number];

type ChainOfThoughtStep = {
  label?: string;
  description?: string;
};

type ChainOfThoughtPart = {
  type: 'chain-of-thought';
  title?: string;
  steps?: ChainOfThoughtStep[];
};

type CheckpointPart = {
  type: 'checkpoint';
  id?: string;
  label?: string;
};

type ConfirmationState = 'request' | 'accepted' | 'rejected';

type ConfirmationPart = {
  type: 'confirmation';
  state?: ConfirmationState;
  message?: string;
  toolCallId?: string;
  approval?: ConfirmationProps['approval'];
};

type ContextPart = {
  type: 'context';
  title?: string;
  currentTokens?: number;
  maxTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cacheReads?: number;
  cacheWrites?: number;
  modelId?: string;
};

type PlanStep = {
  title?: string;
  description?: string;
};

type PlanPart = {
  type: 'plan';
  title?: string;
  description?: string;
  isStreaming?: boolean;
  items?: PlanStep[];
};

type QueueAction = {
  id?: string;
  label: string;
};

type QueueEntry = {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
  actions?: QueueAction[];
};

type QueueSectionData = {
  title?: string;
  items?: QueueEntry[];
};

type QueuePart = {
  type: 'queue';
  title?: string;
  items?: QueueEntry[];
  sections?: QueueSectionData[];
};

type TaskEntry = {
  title?: string;
  description?: string;
};

type TaskPart = TaskEntry & {
  type: 'task';
  items?: TaskEntry[];
};

type InlineCitationPart = {
  type: 'inline-citation';
  label?: string;
  index?: number;
  source?: {
    url?: string;
    title?: string;
    quote?: string;
  };
};

type ShimmerPart = {
  type: 'shimmer';
  text?: string;
};

type ExtendedPart =
  | BaseMessagePart
  | ChainOfThoughtPart
  | CheckpointPart
  | ConfirmationPart
  | ContextPart
  | PlanPart
  | QueuePart
  | TaskPart
  | InlineCitationPart
  | ShimmerPart
  | FileUIPart;

type ExtendedMessage = Omit<BaseMessage, 'parts'> & {
  parts: ExtendedPart[];
};


const mapConfirmationState = (
  state?: ConfirmationState,
): ConfirmationProps['state'] => {
  switch (state) {
    case 'accepted':
      return 'output-available';
    case 'rejected':
      return 'output-denied';
    default:
      return 'approval-requested';
  }
};

const buildConfirmationApproval = (
  part: ConfirmationPart,
  fallbackState: ConfirmationState,
  messageId: string,
): ConfirmationProps['approval'] => {
  if (part.approval) {
    return part.approval;
  }

  const approvalId = part.toolCallId ?? `${messageId}-confirmation`;

  if (fallbackState === 'accepted') {
    return { id: approvalId, approved: true };
  }

  if (fallbackState === 'rejected') {
    return { id: approvalId, approved: false };
  }

  return { id: approvalId };
};

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
  const typedMessages = messages as ExtendedMessage[];

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
    message: ExtendedMessage,
    part: ExtendedPart,
    index: number,
  ) => {
    const isLastAssistantChunk =
      message.role === 'assistant' &&
      message.id === typedMessages.at(-1)?.id &&
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
              message.id === typedMessages.at(-1)?.id
            }
          >
            <ReasoningTrigger />
            <ReasoningContent>{part.text}</ReasoningContent>
          </Reasoning>
        );
      case 'chain-of-thought': {
        const steps = part.steps ?? [];
        return (
          <ChainOfThought
            key={`${message.id}-cot-${index}`}
            defaultOpen={false}
            className="my-2"
          >
            <ChainOfThoughtHeader>
              {part.title ?? 'Chain of thought'}
            </ChainOfThoughtHeader>
            <ChainOfThoughtContent>
              {steps.map((step, stepIndex) => (
                <div
                  key={`${message.id}-cot-step-${stepIndex}`}
                  className="mb-2"
                >
                  <div className="text-sm font-medium">
                    {step.label ?? `Step ${stepIndex + 1}`}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  )}
                </div>
              ))}
            </ChainOfThoughtContent>
          </ChainOfThought>
        );
      }
      case 'checkpoint':
        return (
          <Checkpoint
            key={`${message.id}-checkpoint-${index}`}
            className="my-3"
          >
            <CheckpointIcon />
            <CheckpointTrigger
              onClick={() => {
                // Wire this up to your restore logic (e.g., send a special message or reset local state)
                console.log('Restore to checkpoint', part.id || index);
              }}
            >
              {part.label ?? 'Restore to this point'}
            </CheckpointTrigger>
          </Checkpoint>
        );

      case 'confirmation': {
        const confirmationState = part.state ?? 'request';
        const uiState = mapConfirmationState(confirmationState);
        const approval = buildConfirmationApproval(
          part,
          confirmationState,
          message.id,
        );

        return (
          <Confirmation
            key={`${message.id}-confirmation-${index}`}
            className="my-2"
            approval={approval}
            state={uiState}
          >
            <ConfirmationAccepted>
              {part.message ?? 'Request approved.'}
            </ConfirmationAccepted>
            <ConfirmationRejected>
              {part.message ?? 'Request rejected.'}
            </ConfirmationRejected>
            <ConfirmationRequest>
              {part.message ?? 'Approve this action?'}
            </ConfirmationRequest>
            {confirmationState === 'request' && (
              <ConfirmationActions>
                <ConfirmationAction
                  onClick={() => {
                    console.log('Approve tool', part.toolCallId);
                  }}
                >
                  Approve
                </ConfirmationAction>
                <ConfirmationAction
                  variant="outline"
                  onClick={() => {
                    console.log('Reject tool', part.toolCallId);
                  }}
                >
                  Reject
                </ConfirmationAction>
              </ConfirmationActions>
            )}
          </Confirmation>
        );
      }

      case 'context': {
        const usedTokens = part.currentTokens ?? 0;
        const maxTokens =
          part.maxTokens && part.maxTokens > 0
            ? part.maxTokens
            : Math.max(usedTokens, 1);

        return (
          <Context
            key={`${message.id}-context-${index}`}
            maxTokens={maxTokens}
            modelId={part.modelId}
            open
            usedTokens={usedTokens}
            usage={{
              inputTokens: part.inputTokens ?? 0,
              outputTokens: part.outputTokens ?? 0,
              reasoningTokens: part.reasoningTokens ?? 0,
              cachedInputTokens: part.cacheReads ?? 0,
              totalTokens: part.maxTokens ?? 0,
            }}
          >
            <div className="mb-1 text-sm font-medium">
              {part.title ?? 'Context usage'}
            </div>
            <ContextTrigger className="sr-only" />
            <ContextContent>
              <ContextContentHeader />
              <ContextContentBody className="space-y-2">
                <ContextInputUsage />
                <ContextOutputUsage />
                <ContextReasoningUsage />
                <ContextCacheUsage />
              </ContextContentBody>
              <ContextContentFooter />
            </ContextContent>
          </Context>
        );
      }

      case 'plan': {
        const items = part.items ?? [];
        return (
          <Plan
            key={`${message.id}-plan-${index}`}
            className="my-2"
            isStreaming={part.isStreaming}
          >
            <PlanHeader>
              <div>
                <PlanTitle>{part.title ?? 'Plan'}</PlanTitle>
                {part.description ? (
                  <PlanDescription>{part.description}</PlanDescription>
                ) : null}
              </div>
              <PlanTrigger />
            </PlanHeader>
            <PlanContent>
              <ol className="space-y-3">
                {items.map((item, itemIndex) => (
                  <li key={`${message.id}-plan-item-${itemIndex}`}>
                    <p className="text-sm font-medium">
                      {item.title ?? `Step ${itemIndex + 1}`}
                    </p>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </PlanContent>
          </Plan>
        );
      }

      case 'queue': {
        const sections =
          part.sections ??
          [
            {
              title: part.title ?? 'Queue',
              items: part.items ?? [],
            },
          ];

        return (
          <Queue key={`${message.id}-queue-${index}`} className="my-2">
            {sections.map((section, sectionIndex) => {
              const sectionItems = section.items ?? [];
              return (
                <QueueSection
                  key={`${message.id}-queue-section-${sectionIndex}`}
                  defaultOpen
                >
                  <QueueSectionTrigger>
                    <QueueSectionLabel
                      count={sectionItems.length}
                      label={section.title ?? `Section ${sectionIndex + 1}`}
                    />
                  </QueueSectionTrigger>
                  <QueueSectionContent>
                    <QueueList>
                      {sectionItems.length === 0 ? (
                        <QueueItem
                          key={`${message.id}-queue-empty-${sectionIndex}`}
                          className="text-xs text-muted-foreground"
                        >
                          No queued items.
                        </QueueItem>
                      ) : (
                        sectionItems.map((item, itemIndex) => {
                          const completed = item.status === 'completed';
                          return (
                            <QueueItem
                              key={`${message.id}-queue-item-${sectionIndex}-${itemIndex}`}
                            >
                              <div className="flex items-start gap-2">
                                <QueueItemIndicator completed={completed} />
                                <QueueItemContent completed={completed}>
                                  {item.title ?? `Item ${itemIndex + 1}`}
                                </QueueItemContent>
                              </div>
                              {item.description ? (
                                <QueueItemDescription completed={completed}>
                                  {item.description}
                                </QueueItemDescription>
                              ) : null}
                              {item.actions?.length ? (
                                <QueueItemActions>
                                  {item.actions.map(
                                    (action, actionIndex) => (
                                      <QueueItemAction
                                        key={`${message.id}-queue-item-action-${sectionIndex}-${itemIndex}-${actionIndex}`}
                                        onClick={() => {
                                          console.log(
                                            'Queue action',
                                            action.id,
                                          );
                                        }}
                                      >
                                        {action.label}
                                      </QueueItemAction>
                                    ),
                                  )}
                                </QueueItemActions>
                              ) : null}
                            </QueueItem>
                          );
                        })
                      )}
                    </QueueList>
                  </QueueSectionContent>
                </QueueSection>
              );
            })}
          </Queue>
        );
      }

      case 'task': {
        const tasks = part.items ?? [part];
        return (
          <Task key={`${message.id}-task-${index}`} className="my-2">
            <TaskContent>
              {tasks.map((task, taskIndex) => (
                <TaskItem key={`${message.id}-task-item-${taskIndex}`}>
                  <p className="text-sm font-medium">
                    {task.title ?? `Task ${taskIndex + 1}`}
                  </p>
                  {task.description ? (
                    <p className="text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  ) : null}
                </TaskItem>
              ))}
            </TaskContent>
          </Task>
        );
      }

      case 'inline-citation': {
        const source: InlineCitationPart['source'] = part.source ?? {};
        return (
          <InlineCitation key={`${message.id}-citation-${index}`}>
            <InlineCitationText>
              {part.label ?? `Source ${part.index ?? ''}`}
            </InlineCitationText>
            <InlineCitationCard>
              <InlineCitationCardBody>
                <InlineCitationSource
                  url={source.url}
                  title={source.title}
                />
                {source.quote && (
                  <InlineCitationQuote>{source.quote}</InlineCitationQuote>
                )}
              </InlineCitationCardBody>
            </InlineCitationCard>
          </InlineCitation>
        );
      }

      case 'shimmer':
        return (
          <Shimmer key={`${message.id}-shimmer-${index}`} className="my-1">
            {part.text ?? ''}
          </Shimmer>
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
          {typedMessages.map((message) => {
            return (
              <div key={message.id} className="mb-2">
                <Message key={`${message.id}`} from={message.role}  >
                  
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



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

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import type { FileUIPart, UIMessage } from 'ai';
import { CheckIcon, CopyIcon, MicIcon, RefreshCcwIcon } from 'lucide-react';

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
    id: 'gpt-4o',
    name: 'GPT 4o',
    chef: 'OpenAI',
    chefSlug: 'openai',
    providers: ['openai'],
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
    value: 'web-search',
  },
  {
    name: 'Web Extract',
    value: 'web-extract',
  },
];

const suggestions = [
  'find arcades where i live.',
  'what are some rainy-day date ideas?',
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

type SourceUrlPart = Extract<BaseMessagePart, { type: 'source-url' }>;

const isSourceUrlPart = (part: ExtendedPart): part is SourceUrlPart =>
  part.type === 'source-url';


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

const ChatBotDemo = () => {
  const [input, setInput] = useState('find arcades where i live.');
  const [model, setModel] = useState<string>(models[0].id);
  const [tool, setTool] = useState<string>(toolChoices[0].value);
  const [useMicrophone, setUseMicrophone] = useState<boolean>(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const { messages, sendMessage, status, regenerate } = useChat();
  const typedMessages = messages as ExtendedMessage[];

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text && message.text.trim());
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(
      {
        text: message.text || 'Sent with attachments',
        files: message.files,
      },
      {
        body: {
          model,
          choice: tool,
          // Optionally expose toggle state to your API if you want:
          // useWebSearch: true,
          // useMicrophone,
        },
      },
    );
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(
      {
        text: suggestion,
      },
      {
        body: {
          model,
          choice: tool,
        },
      },
    );
    setInput('');
  };

  const selectedModel = models.find((m) => m.id === model);

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
      case 'file' :
        return (
          <Message key={`${message.id}-file-${index}`} from={message.role}>
            <MessageContent>
              <MessageAttachment data={part} key={part.url} />
            </MessageContent>
          </Message>
        );
      case 'text':
        return (
          <Message key={`${message.id}-text-${index}`} from={message.role}>
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
          </Message>
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

      // Generic tool parts (web-search, web-extract, or any other tool-*)
      case 'tool-web-search':
      case 'tool-web-extract':
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
    <div className="relative mx-auto flex h-screen max-w-4xl flex-col">
      <Conversation className="h-full overflow-hidden pb-50">
        <ConversationContent>
          {typedMessages.map((message) => {
            const sourceParts =
              message.role === 'assistant'
                ? message.parts.filter(isSourceUrlPart)
                : [];

            return (
              <div key={message.id} className="mb-2">
                {sourceParts.length > 0 && (
                  <Sources className="mb-1">
                    <SourcesTrigger count={sourceParts.length} />
                    {sourceParts.map((part, sourceIndex) => (
                      <SourcesContent key={`${message.id}-source-${sourceIndex}`}>
                        <Source
                          href={part.url}
                          title={part.title ?? part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}

                {/* Main message parts */}
                {message.parts.map((part, partIndex) =>
                  renderPart(message, part, partIndex),
                )}
              </div>
            );
          })}
        </ConversationContent>
        <ConversationScrollButton className="mb-40" />
      </Conversation>

      {/* Bottom overlay: suggestions + prompt input + selectors */}
      <div className="pointer-events-auto absolute bottom-0 left-0 w-full bg-background/80 pb-4 pt-2 backdrop-blur">
        {/* Suggestions bar */}
        <div className="mb-2 px-4">
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

        {/* Prompt input */}
        <div className="px-4">
          <PromptInput
            onSubmit={handleSubmit}
            globalDrop
            multiple
            className="border-0 shadow-none"
          >
            <PromptInputHeader>
              <PromptInputAttachments>
                {(attachment) => (
                  <PromptInputAttachment data={attachment} />
                )}
              </PromptInputAttachments>
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                {/* Microphone toggle (UI only) */}
                <PromptInputButton
                  onClick={() => setUseMicrophone(!useMicrophone)}
                  variant={useMicrophone ? 'default' : 'ghost'}
                >
                  <MicIcon size={16} />
                  <span className="sr-only">Microphone</span>
                </PromptInputButton>


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
                      {['OpenAI'].map((chef) => (
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

              <PromptInputSubmit
                disabled={
                  !(input.trim() || status) || status === 'streaming'
                }
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
};

export default ChatBotDemo;

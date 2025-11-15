<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import MarkdownIt from "markdown-it";
import createDOMPurify from "isomorphic-dompurify";
import { cn } from "@/lib/utils";
import type { CoreAgentUIMessage } from "@/lib/agents/core-agent";
import type { BadgeVariants } from "@/components/ui/badge";
import {
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  PlugZap,
} from "lucide-vue-next";

const input = ref("");
const chat = new Chat<CoreAgentUIMessage>({});
const scrollParent = ref<HTMLElement | null>(null);

type RoleStyle = {
  label: string;
  bubble: string;
  avatar: string;
};

const roleStyles: Record<string, RoleStyle> = {
  user: {
    label: "You",
    bubble:
      "bg-primary text-primary-foreground border border-primary/40 shadow-lg shadow-primary/10",
    avatar: "bg-primary/10 text-primary ring-1 ring-primary/30",
  },
  assistant: {
    label: "Core Agent",
    bubble: "bg-muted text-foreground border border-border/60",
    avatar: "bg-secondary text-secondary-foreground",
  },
  tool: {
    label: "Tool",
    bubble:
      "bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-50 dark:border-amber-500/40",
    avatar: "bg-amber-500/15 text-amber-700 dark:text-amber-100",
  },
  system: {
    label: "System",
    bubble:
      "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-50 dark:border-slate-700",
    avatar: "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100",
  },
};

const getRoleStyle = (role: string) : RoleStyle =>  {
  return roleStyles[role] ?? {
    label: "Core Agent",
    bubble: "bg-muted text-foreground border border-border/60",
    avatar: "bg-secondary text-secondary-foreground",
  } as RoleStyle;
};
const getAvatarFallback = (role: string) => {
  if (role === "user") return "You";
  if (role === "assistant") return "AI";
  return role.slice(0, 2).toUpperCase() || "AI";
};

const formatPartType = (type: string) =>
  type
    .replace(/^tool-/, "")
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const isToolPart = (type?: string) =>
  typeof type === "string" && type.startsWith("tool-");

const markdownRenderer = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

const DOMPurify = createDOMPurify(
  typeof window === "undefined" ? undefined : window,
);

const renderMarkdown = (content?: string) => {
  if (!content) return "";
  return DOMPurify.sanitize(markdownRenderer.render(content));
};

const isStreaming = computed(() =>
  ["submitted", "streaming"].includes(chat.status),
);
const trimmedInput = computed(() => input.value.trim());
const canSend = computed(
  () => trimmedInput.value.length > 0 && !isStreaming.value,
);
const hasMessages = computed(() => chat.messages.length > 0);

const statusLabel = computed(() => {
  switch (chat.status) {
    case "submitted":
      return "Sending";
    case "streaming":
      return "Responding";
    case "error":
      return "Needs attention";
    default:
      return "Ready";
  }
});

const statusVariant = computed<BadgeVariants["variant"]>(() => {
  switch (chat.status) {
    case "submitted":
    case "streaming":
      return "default";
    case "error":
      return "destructive";
    default:
      return "secondary";
  }
});

const handleSubmit = async (event?: Event) => {
  event?.preventDefault();
  if (!canSend.value) return;

  const message = trimmedInput.value;
  input.value = "";

  try {
    await chat.sendMessage({ text: message });
  } catch (error) {
    console.error(error);
    input.value = message;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

const resetConversation = () => {
  chat.messages = [];
  chat.clearError();
  input.value = "";
};

const scrollToBottom = () => {
  const viewport = scrollParent.value?.querySelector<HTMLElement>(
    '[data-slot="scroll-area-viewport"]',
  );

  if (viewport) {
    viewport.scrollTop = viewport.scrollHeight;
  }
};

onMounted(scrollToBottom);
watch(
  () => chat.messages.length,
  async () => {
    await nextTick();
    scrollToBottom();
  },
);
</script>

<template>
  <main class="relative min-h-screen bg-background">
    <div
      class="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-10 md:px-8"
    >
      <Card class="flex min-h-[75vh] flex-1 flex-col overflow-hidden">
        <CardHeader>
          <div class="flex flex-col gap-2">
            <CardTitle class="flex items-center gap-2 text-2xl">
              <Sparkles class="size-5 text-primary" />
              Agent Chat
            </CardTitle>
          </div>

          <CardAction class="flex items-center gap-2">
            <Badge
              :variant="statusVariant"
              class="flex items-center gap-1 text-xs font-medium"
            >
              <Loader2 v-if="isStreaming" class="size-3 animate-spin" />
              {{ statusLabel }}
            </Badge>
          </CardAction>
        </CardHeader>

        <Separator />

        <CardContent class="flex flex-1 flex-col gap-4 overflow-hidden py-6">
          <div
            v-if="chat.error"
            class="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <div class="flex items-start justify-between gap-4">
              <p class="font-medium leading-6">
                {{ chat.error.message }}
              </p>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                class="text-destructive hover:text-destructive"
                @click="chat.clearError()"
              >
                Dismiss
              </Button>
            </div>
          </div>

          <div class="relative flex-1 overflow-hidden" ref="scrollParent">
            <ScrollArea class="h-full">
              <div class="space-y-6 pr-6 pb-44">
                <div
                  v-if="!hasMessages"
                  class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-muted/40 px-6 py-12 text-center text-muted-foreground"
                >
                  <MessageCircle class="size-10 text-muted-foreground/70" />
                  <div class="space-y-1">
                    <p class="text-lg font-semibold text-foreground">
                      Start a conversation
                    </p>
                    <p class="text-sm">
                      The agent chats naturally and taps tools when your prompt requires it.
                    </p>
                  </div>
                </div>

                <template v-else>
                  <div
                    v-for="(message, index) in chat.messages"
                    :key="message.id ?? index"
                    :class="cn(
                      'flex w-full gap-3',
                      message.role === 'user'
                        ? 'flex-row-reverse'
                        : 'flex-row',
                    )"
                  >
                    <Avatar
                      :class="cn('shadow-sm', getRoleStyle(message.role).avatar)"
                    >
                      <AvatarFallback
                        class="text-[11px] font-semibold uppercase"
                      >
                        {{ getAvatarFallback(message.role) }}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      :class="cn(
                        'flex max-w-[85%] flex-col gap-2',
                        message.role === 'user'
                          ? 'items-end text-right'
                          : 'items-start text-left',
                      )"
                    >
                      <div
                        class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                        :class="message.role === 'user' ? 'flex-row-reverse' : ''"
                      >
                        <span>{{ getRoleStyle(message.role).label }}</span>
                      </div>

                      <div
                        class="w-full space-y-3 rounded-2xl border px-4 py-3 text-sm leading-7"
                        :class="getRoleStyle(message.role).bubble"
                      >
                        <div
                          v-for="(part, partIndex) in message.parts"
                          :key="`${message.id ?? index}-${part.type}-${partIndex}`"
                          class="space-y-2"
                        >
                          <div
                            v-if="part.type === 'text'"
                            class="markdown-body space-y-4 text-base leading-7 [&>pre]:rounded-lg [&>pre]:bg-muted/50 [&>pre]:p-3 [&>pre]:text-xs [&>pre]:font-mono [&>code]:rounded-md [&>code]:bg-muted/60 [&>code]:px-1.5 [&>code]:py-0.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5"
                            v-html="renderMarkdown(part.text)"
                          />
                          <div v-else-if="part.type === 'step-start'"></div>
                          <div v-else-if="isToolPart(part.type)" class="w-full">
                            <Dialog>
                              <DialogTrigger
                                class="group inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 transition hover:-translate-y-0.5 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 dark:border-amber-500/60 dark:bg-amber-500/15 dark:text-amber-50"
                              >
                                <PlugZap
                                  class="size-4 text-amber-700 transition group-hover:text-amber-900 dark:text-amber-200 dark:group-hover:text-amber-50"
                                />
                                <span>{{ formatPartType(part.type) }}</span>
                                <span
                                  class="text-[10px] font-medium uppercase tracking-normal text-amber-700/80 dark:text-amber-100/80"
                                >
                                  View details
                                </span>
                              </DialogTrigger>
                              <DialogContent class="max-w-2xl space-y-4">
                                <DialogHeader class="space-y-1">
                                  <DialogTitle>
                                    {{ formatPartType(part.type) }}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Full payload shared with the tool.
                                  </DialogDescription>
                                </DialogHeader>
                                <pre
                                  class="max-h-[65vh] overflow-auto rounded-lg border border-border/50 bg-muted/40 p-4 text-xs leading-relaxed"
                                >{{ JSON.stringify(part, null, 2) }}</pre>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <div v-else class="space-y-1 text-sm">
                            <p
                              class="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80"
                            >
                              {{ formatPartType(part.type) }}
                            </p>
                            <pre
                              class="rounded-lg border border-border/50 bg-background/70 p-3 text-xs leading-relaxed"
                            >{{ JSON.stringify(part, null, 2) }}</pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-50">
      <div class="mx-auto w-full max-w-5xl px-4 pb-6 md:px-8">
        <div
          class="pointer-events-auto w-full rounded-3xl border border-border/60 bg-background/95 p-4 shadow-2xl backdrop-blur"
        >
          <form class="flex w-full flex-col gap-3" @submit="handleSubmit">
            <Textarea
              v-model="input"
              class="resize-none text-base"
              placeholder=""
              @keydown="handleKeydown"
            />
            <div
              class="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground"
            >
              <p>
                Shift + Enter adds a newline. The agent automatically decides
                when to call tools.
              </p>
              <div class="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  class="text-muted-foreground hover:text-foreground"
                  :disabled="isStreaming"
                  @click="resetConversation"
                >
                  <RotateCcw class="size-4" />
                  <span class="sr-only">Reset conversation</span>
                </Button>
                <Button type="submit" class="gap-2" :disabled="!canSend">
                  <Loader2 v-if="isStreaming" class="size-4 animate-spin" />
                  <Send v-else class="size-4" />
                  {{ isStreaming ? "Sending" : "Send" }}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

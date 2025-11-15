<script setup lang="ts">
import { computed } from 'vue';
import {
  ArrowRight,
  Bot,
  Layers,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from 'lucide-vue-next';
import { useOptionalAuth0 } from '@/composables/useOptionalAuth0';

definePageMeta({
  middleware: 'auth',
});

const router = useRouter();
const auth0 = useOptionalAuth0();

const agents = [
  {
    id: 'core-researcher',
    name: 'Core Research Agent',
    summary: 'Long-form research with Mem0 recall and web search + extract tools.',
    badges: ['Mem0 context', 'Web search', 'Extraction'],
  },
  {
    id: 'ops-desk',
    name: 'Ops Desk Agent',
    summary: 'Triages inbound issues, drafts replies, and files updates across tools.',
    badges: ['Realtime chat', 'Workspace sync', 'Autonomous drafts'],
  },
  {
    id: 'executive-brief',
    name: 'Executive Briefing Agent',
    summary: 'Synthesizes meetings, action items, and blockers into leadership-ready summaries.',
    badges: ['Meeting notes', 'Action register', 'Signals'],
  },
];

const userName = computed(() => auth0?.user.value?.name ?? 'Agent Builder');
const userEmail = computed(() => auth0?.user.value?.email ?? 'you@company.com');

const handleOpenChat = async (agentId: string) => {
  await router.push({
    path: '/chat',
    query: { agent: agentId },
  });
};

const handleLogout = async () => {
  if (!auth0) return;

  await auth0.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b bg-background/80 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-1 ring-primary/30"
          >
            B∞
          </div>
          <div>
            <p class="text-lg font-semibold">Boundless Workspace</p>
            <p class="text-sm text-muted-foreground">Hi {{ userName }} · {{ userEmail }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
            type="button"
            @click="handleOpenChat('core-researcher')"
          >
            Jump to chat
            <ArrowRight class="h-4 w-4" />
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground"
            type="button"
            @click="handleLogout"
          >
            <LogOut class="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-6 py-10 space-y-12">
      <section class="rounded-3xl border bg-card/60 p-8">
        <p class="text-sm font-semibold text-primary">Agent Control Center</p>
        <h1 class="mt-2 text-3xl font-bold">Choose your specialist.</h1>
        <p class="mt-3 text-sm text-muted-foreground">
          Each agent inherits your Auth0 identity and workspace memory. Spin them up fast,
          pass a brief, and route to chat when you are ready.
        </p>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border bg-background/80 p-4">
            <ShieldCheck class="h-8 w-8 text-primary" />
            <h3 class="mt-3 text-base font-semibold">SSO + permissions</h3>
            <p class="text-sm text-muted-foreground">
              Auth0 secures every workspace so auditors stay happy.
            </p>
          </div>
          <div class="rounded-2xl border bg-background/80 p-4">
            <Layers class="h-8 w-8 text-primary" />
            <h3 class="mt-3 text-base font-semibold">Composable tools</h3>
            <p class="text-sm text-muted-foreground">
              Mix search, extraction, and proprietary workflows.
            </p>
          </div>
          <div class="rounded-2xl border bg-background/80 p-4">
            <MessageCircle class="h-8 w-8 text-primary" />
            <h3 class="mt-3 text-base font-semibold">Live collaboration</h3>
            <p class="text-sm text-muted-foreground">
              Drop into any agent session and pick up the thread instantly.
            </p>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold text-muted-foreground">Agents</p>
            <h2 class="text-2xl font-bold">Your live configurations</h2>
          </div>
          <p class="text-sm text-muted-foreground">
            Select an agent to jump straight into chat.
          </p>
        </div>

        <div class="space-y-3">
          <article
            v-for="agent in agents"
            :key="agent.id"
            class="flex flex-col gap-4 rounded-2xl border bg-card/70 p-6 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <Bot class="h-5 w-5 text-primary" />
                <h3 class="text-xl font-semibold">{{ agent.name }}</h3>
              </div>
              <p class="text-sm text-muted-foreground">
                {{ agent.summary }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="badge in agent.badges"
                  :key="badge"
                  class="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {{ badge }}
                </span>
              </div>
            </div>

            <button
              class="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground"
              type="button"
              @click="handleOpenChat(agent.id)"
            >
              Open chat
              <ArrowRight class="h-4 w-4" />
            </button>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

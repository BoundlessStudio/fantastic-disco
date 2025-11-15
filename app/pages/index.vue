<script setup lang="ts">
import { computed, type Component, watch } from 'vue';
import {
  ArrowRight,
  Bot,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next';
import { useOptionalAuth0 } from '@/composables/useOptionalAuth0';

type Feature = {
  title: string;
  description: string;
  icon: Component;
};

const auth0 = useOptionalAuth0();
const router = useRouter();

const initialLoadingState = import.meta.server ? true : false;
const isAuthenticated = computed(() => auth0?.isAuthenticated.value ?? false);
const isLoading = computed(
  () => auth0?.isLoading.value ?? initialLoadingState,
);

const highlights = [
  {
    title: 'Context that compounds',
    description:
      'Mem0-powered recall keeps every conversation grounded in what your team cares about.',
  },
  {
    title: 'Deployable specialists',
    description:
      'Launch research, ops, and support agents from a single canvas with zero ceremony.',
  },
  {
    title: 'Safe by design',
    description:
      'Granular Auth0 controls and workspace isolation mean enterprise readiness from day one.',
  },
];

const features: Feature[] = [
  {
    title: 'Conversational intelligence',
    description:
      'Bring natural, markdown-ready conversations to every workflow with streaming responses.',
    icon: MessageCircle,
  },
  {
    title: 'Composable agents',
    description:
      'Wire core reasoning to web search, extraction tools, or your own APIs in minutes.',
    icon: Bot,
  },
  {
    title: 'Enterprise security',
    description:
      'Backed by Auth0, audit trails, and least-privilege policies so buyers can say yes faster.',
    icon: ShieldCheck,
  },
];

const stats = [
  { label: 'Agent configs deployed', value: '120+' },
  { label: 'Avg. research speedup', value: '6x' },
  { label: 'Live customer pilots', value: '18' },
];

const handlePrimaryAction = async () => {
  if (isAuthenticated.value) {
    await router.push('/home');
    return;
  }

  await auth0?.loginWithRedirect({
    appState: { target: '/home' },
  });
};

const handleSecondaryAction = async () => {
  await router.push('/chat');
};

const handleLogout = async () => {
  if (!auth0) return;

  await auth0.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};

if (import.meta.client) {
  watch(
    () => [isLoading.value, isAuthenticated.value],
    ([loading, authed]) => {
      if (!loading && authed && router.currentRoute.value.path === '/') {
        router.replace('/home');
      }
    },
    { immediate: true },
  );
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <header class="border-b bg-background/80 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary ring-1 ring-primary/30"
          >
            B∞
          </div>
          <div>
            <p class="text-lg font-semibold">Boundless Agents Cloud</p>
            <p class="text-sm text-muted-foreground">
              Launch AI teammates that feel alive.
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button
            class="text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
            type="button"
            @click="handleSecondaryAction"
          >
            Peek inside
          </button>

          <button
            v-if="isAuthenticated"
            class="rounded-full border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:-translate-y-0.5"
            type="button"
            @click="handleLogout"
          >
            Logout
          </button>

          <button
            class="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:-translate-y-0.5"
            type="button"
            :disabled="isLoading"
            @click="handlePrimaryAction"
          >
            {{ isAuthenticated ? 'Open workspace' : 'Sign in with Auth0' }}
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-16">
      <section class="grid gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div class="space-y-8">
          <p
            class="inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium text-muted-foreground"
          >
            <Sparkles class="h-4 w-4 text-primary" />
            AI agents that remember, reason, and report.
          </p>
          <div class="space-y-6">
            <h1 class="text-4xl font-bold leading-tight tracking-tight lg:text-6xl">
              Tell the Boundless Core what you need. Get a team of agents on it.
            </h1>
            <p class="text-lg text-muted-foreground lg:text-xl">
              Fantastic Disco pairs Auth0-secured workspaces with Mem0-contextualized
              reasoning so your operators, analysts, and support reps work beside AI
              teammates you can audit and trust.
            </p>
          </div>
          <div class="flex flex-wrap gap-4">
            <button
              class="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition hover:-translate-y-0.5 disabled:opacity-50"
              type="button"
              :disabled="isLoading"
              @click="handlePrimaryAction"
            >
              {{ isAuthenticated ? 'Go to dashboard' : 'Launch with Auth0' }}
              <ArrowRight class="h-4 w-4" />
            </button>
            <button
              class="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-base font-semibold text-foreground transition hover:-translate-y-0.5"
              type="button"
              @click="handleSecondaryAction"
            >
              See live chat
            </button>
            <button
              v-if="isAuthenticated"
              class="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-base font-semibold text-muted-foreground transition hover:-translate-y-0.5"
              type="button"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="rounded-2xl border bg-card/40 p-4"
            >
              <p class="text-3xl font-semibold">{{ stat.value }}</p>
              <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-3xl border bg-gradient-to-b from-background to-muted/40 p-8 shadow-xl shadow-primary/10">
          <div class="space-y-6">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-primary">Why teams switch</p>
              <h2 class="text-2xl font-bold">A marketing site that sells itself.</h2>
            </div>

            <ul class="space-y-6">
              <li
                v-for="highlight in highlights"
                :key="highlight.title"
                class="rounded-2xl border bg-background/80 p-5"
              >
                <p class="text-base font-semibold">{{ highlight.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ highlight.description }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="mt-24 space-y-8">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-primary">Build the stack</p>
            <h2 class="text-3xl font-bold">Everything a modern agent team needs.</h2>
          </div>
          <p class="max-w-xl text-sm text-muted-foreground">
            Mix and match internal tools with the Boundless Core Agent. Use Auth0 to
            manage SSO, while Mem0 enriched reasoning keeps results on-brand.
          </p>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <article
            v-for="feature in features"
            :key="feature.title"
            class="flex flex-col gap-4 rounded-2xl border bg-card/60 p-6 shadow-sm"
          >
            <component
              :is="feature.icon"
              class="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary"
            />
            <div class="space-y-2">
              <h3 class="text-xl font-semibold">{{ feature.title }}</h3>
              <p class="text-sm text-muted-foreground">
                {{ feature.description }}
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import ChatClient from "@/app/chat/chat-client";
import { generateId } from "@/lib/threads";

export default async function Page() {
  const session = await auth0.getSession();
  const isAuthenticated = Boolean(session?.user);
  const id = generateId();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 pb-12">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 px-6 pt-16">
        {/* Hero */}
        <div className="space-y-6">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
            Hero section placeholder
          </p>

          <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-6xl">
            Add your product headline here.
          </h1>

          <p className="max-w-2xl text-sm text-slate-500 sm:text-base">
            Use this area later to describe your AI workspace in your own words.
            Keep it short and focused on what matters to your users.
          </p>

          {/* Button + inline preview notice */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/chat"
              prefetch={false}
              className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
            >
              {isAuthenticated ? "Open the chat" : "Sign in"}
            </Link>

            {/* Inline notice (only for guests) */}
            <p className="text-xs text-slate-500">
              Or try the live preview below with some features disabled.
            </p>
          </div>
        </div>

        {/* Live preview */}
        <div className="w-full rounded-xl border border-dashed border-black/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-12 text-left text-white shadow-2xl">
          <p className="text-sm uppercase tracking-wide text-white/70"> Live preview</p>
          <h2 className="mt-2 text-3xl font-semibold">Chat workspace</h2>
          <div className="mt-6 h-[600px] rounded-xl border border-white/20 bg-white text-black">
            <ChatClient thread={id} />
          </div>
        </div>

        {/* Features */}
        <section className="space-y-6">
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Features
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              What this workspace is built to handle
            </h2>
          </header>

          <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">Latest OpenAI models</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">
                Tools for DB, web search, computer control, files & images
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">Modern UI/UX with ai-sdk & ai-elements</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">User & agent memories</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">Universal chat/mail threads</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="font-medium">Agent mailbox</p>
            </div>
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Boundless AI. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/chat" prefetch={false} className="hover:text-slate-700">
              Open chat
            </Link>
            <Link href="#" className="hover:text-slate-700">
              Docs (coming soon)
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

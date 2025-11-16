import Link from "next/link";
import { auth0 } from "@/lib/auth0";
import ChatClient from "@/app/chat/chat-client";

const stats = [
  { label: "Requests automated / day", value: "45K+" },
  { label: "Global teams onboarded", value: "180+" },
  { label: "Average time saved / week", value: "12 hrs" },
];

const features = [
  {
    title: "Enterprise grade identity",
    body: "Auth0 backed sign-in keeps every workspace in sync while enforcing SSO and MFA policies.",
  },
  {
    title: "Secure AI workspace",
    body: "Route prompts through policy-aware guardrails so teams can safely collaborate with their models.",
  },
  {
    title: "Realtime visibility",
    body: "Streamlined auditing, retention controls, and rich analytics ship out-of-the-box.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for piloting a single workspace.",
    items: ["Unlimited marketing visitors", "Preview the chat sandbox", "Community support"],
  },
  {
    name: "Scale",
    price: "$199",
    description: "Unlock collaboration across every team.",
    items: [
      "Role-based seats",
      "Bring-your-own LLM credentials",
      "Priority success manager",
    ],
    highlighted: true,
  },
];

export default async function Page() {
  const session = await auth0.getSession();
  const isAuthenticated = Boolean(session?.user);

  return (
    <div className="space-y-24 bg-gradient-to-b from-white via-white to-slate-50 pb-24">
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 pt-16 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold leading-tight text-balance sm:text-6xl">
            The fastest path to a <span className="text-primary">Boundless</span> AI workflow.
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl">
            Give your team a single conversational hub that feels like your product marketing site on the outside,
            and an authenticated AI cockpit on the inside.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/chat"
            prefetch={false}
            className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            {isAuthenticated ? "Open the chat" : "Launch secure chat"}
          </Link>
          <Link
            href="#features"
            className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium transition hover:border-black"
          >
            Explore the platform
          </Link>
        </div>
        <div className="grid w-full grid-cols-1 gap-4 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="text-2xl font-semibold">{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="w-full rounded-xl border border-dashed border-black/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-12 text-left text-white shadow-2xl">
          <p className="text-sm uppercase tracking-wide text-white/70">Live preview</p>
          <h2 className="mt-2 text-3xl font-semibold">BoundlessAI Copilot</h2>
          <div className="mt-6 h-[600px] rounded-xl border border-white/20 text-black bg-white">
             <ChatClient />
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Why teams switch</p>
          <h2 className="mt-3 text-3xl font-semibold">Designed for public-to-private handoffs</h2>
          <p className="mt-2 text-muted-foreground">
            Welcome visitors with a marketing-grade experience, then authenticate them directly into your secure chat workflows.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">{feature.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Flexible plans</p>
          <h2 className="mt-3 text-3xl font-semibold">Start free, scale with confidence</h2>
          <p className="mt-2 text-muted-foreground">
            Pick the package that matches your launch motion. Upgrade once your chat workspace becomes business critical.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-3xl border border-black/10 bg-white p-6 text-left shadow-sm ${
                plan.highlighted ? "ring-2 ring-black" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{plan.name}</p>
                  <div className="mt-2 text-3xl font-semibold">{plan.price}</div>
                </div>
                {plan.highlighted && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">Most popular</span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-foreground">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/chat"
                prefetch={false}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-black/15 px-4 py-2 text-sm font-semibold transition hover:border-black"
              >
                {isAuthenticated ? "Jump back into chat" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

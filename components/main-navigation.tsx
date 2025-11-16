import Link from "next/link";
import { auth0 } from "@/lib/auth0";

export async function MainNavigation() {
  const session = await auth0.getSession();
  const isAuthenticated = Boolean(session?.user);
  const loginHref = `/auth/login?returnTo=${encodeURIComponent("/chat")}`;
  const logoutHref = `/auth/logout`; // ?returnTo=${encodeURIComponent("/")}

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          BoundlessAI
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/chat"
                className="rounded-full border border-black/10 px-4 py-2 text-foreground transition hover:bg-black hover:text-white"
              >
                Open Chat
              </Link>
              <Link
                prefetch={false}
                href={logoutHref}
                className="text-muted-foreground hover:text-foreground"
              >
                Log out
              </Link>
            </>
          ) : (
            <Link
              prefetch={false}
              href={loginHref}
              className="rounded-full bg-black px-4 py-2 text-white transition hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}


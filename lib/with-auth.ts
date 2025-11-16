// lib/with-auth.ts
//import { getSession } from "@auth0/nextjs-auth0";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

type AppPage<P = {}> = (props: P) => ReactNode | Promise<ReactNode>;

export function withAuth<P = {}>(
  Page: AppPage<P>,
  { returnTo = "/" }: { returnTo?: string } = {}
): (props: P) => Promise<ReactNode> {
  return async function AuthenticatedPage(props: P) {
    const session = await auth0.getSession();

    if (!session) {
      redirect(
        `/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`
      );
    }

    return Page(props);
  };
}

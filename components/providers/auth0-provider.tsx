"use client";

import { Auth0Provider as BaseAuth0Provider } from "@auth0/nextjs-auth0/client";

type Auth0ProviderProps = {
  children: React.ReactNode;
};

export function Auth0Provider({ children }: Auth0ProviderProps) {
  return <BaseAuth0Provider>{children}</BaseAuth0Provider>;
}


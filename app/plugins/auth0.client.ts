import { createAuth0, type RedirectLoginOptions } from '@auth0/auth0-vue';
import type { Router } from 'vue-router';

const REDIRECT_STORAGE_KEY = 'auth0:return-target';

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  const { auth0Domain, auth0ClientId, auth0Audience } = config.public;

  if (!auth0Domain || !auth0ClientId) {
    console.warn(
      '[auth0] Missing AUTH0_DOMAIN or AUTH0_CLIENT_ID; Auth0 plugin not initialized.',
    );
    return;
  }

  const defaultRedirect = '/home';
  const redirectUri = window.location.origin;
  const searchParams = new URLSearchParams(window.location.search);
  const cameFromAuth0 =
    searchParams.has('code') && searchParams.has('state');

  const normalizeTarget = (target?: string | null) => {
    if (!target) return defaultRedirect;
    return target.startsWith('/') ? target : `/${target}`;
  };

  const persistRedirectTarget = (target: string) => {
    try {
      window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, target);
    } catch (error) {
      console.warn('[auth0] Failed to persist redirect target', error);
    }
  };

  const consumeRedirectTarget = (): string | null => {
    try {
      const stored = window.sessionStorage.getItem(REDIRECT_STORAGE_KEY);
      if (stored) {
        window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
        return stored;
      }
    } catch (error) {
      console.warn('[auth0] Failed to read redirect target', error);
    }
    return null;
  };

  const getRouter = (): Router | undefined =>
    nuxtApp.$router as Router | undefined;

  const waitForRouterReady = async () => {
    const router = getRouter();
    if (router && typeof router.isReady === 'function') {
      await router.isReady();
    }
  };

  const navigateToTarget = async (target: string) => {
    const normalized = normalizeTarget(target);
    const router = getRouter();
    const currentPath = router?.currentRoute?.value?.fullPath;

    if (router) {
      await waitForRouterReady();
      if (currentPath !== normalized) {
        await router.replace(normalized);
      }
    } else {
      window.location.assign(normalized);
    }
  };

  const auth0Client = createAuth0({
    domain: auth0Domain,
    clientId: auth0ClientId,
    authorizationParams: {
      redirect_uri: redirectUri,
      audience: auth0Audience || undefined,
    },
    cacheLocation: 'localstorage',
    useRefreshTokens: true,
  }, {
    skipRedirectCallback: true,
  });

  const originalLoginWithRedirect = auth0Client.loginWithRedirect.bind(auth0Client);

  auth0Client.loginWithRedirect = async (
    options?: RedirectLoginOptions<{ target?: string }>,
  ) => {
    const router = getRouter();
    const target =
      options?.appState?.target ||
      router?.currentRoute?.value?.fullPath ||
      defaultRedirect;

    const normalizedTarget = normalizeTarget(target);
    persistRedirectTarget(normalizedTarget);

    const nextOptions: RedirectLoginOptions<{ target?: string }> = {
      ...options,
      appState: {
        ...(options?.appState ?? {}),
        target: normalizedTarget,
      },
    };

    return originalLoginWithRedirect(nextOptions);
  };

  nuxtApp.vueApp.use(auth0Client);

  const handleAuth0Redirect = async () => {
    if (!cameFromAuth0) return;

    try {
      const result = await auth0Client.handleRedirectCallback();
      const storedTarget = consumeRedirectTarget();
      const target =
        storedTarget || result?.appState?.target || defaultRedirect;

      window.history.replaceState({}, '', window.location.pathname);
      await navigateToTarget(target);
    } catch (error) {
      console.error('[auth0] Failed to process login redirect', error);
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const hydrateSession = async () => {
    try {
      await auth0Client.checkSession();
    } catch (error) {
      console.warn('[auth0] Silent session refresh failed', error);
    }
  };

  handleAuth0Redirect().then(hydrateSession);
});

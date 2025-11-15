import { abortNavigation } from '#app';
import { useAuth0 } from '@auth0/auth0-vue';

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const waitForAuthState = async (
  auth0: ReturnType<typeof useAuth0>,
  timeoutMs = 10000,
) => {
  const started = Date.now();
  while (auth0.isLoading.value && Date.now() - started < timeoutMs) {
    await sleep(50);
  }
};

const restoreSession = async (auth0: ReturnType<typeof useAuth0>) => {
  if (typeof auth0.checkSession !== 'function') return;

  try {
    await auth0.checkSession();
  } catch (error) {
    console.warn('[auth0] Silent session refresh failed', error);
  }
};

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const auth0 = useAuth0();

  await waitForAuthState(auth0);

  if (!auth0.isAuthenticated.value) {
    await restoreSession(auth0);
    await waitForAuthState(auth0, 3000);
  }

  if (!auth0.isAuthenticated.value) {
    await auth0.loginWithRedirect({
      appState: {
        target: to.fullPath,
      },
    });

    return abortNavigation();
  }
});

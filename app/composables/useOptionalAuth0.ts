import { useAuth0 } from '@auth0/auth0-vue';

type UseAuth0Return = ReturnType<typeof useAuth0>;

export const useOptionalAuth0 = (): UseAuth0Return | null => {
  if (import.meta.server) {
    return null;
  }

  return useAuth0();
};

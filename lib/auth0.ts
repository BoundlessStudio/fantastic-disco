import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();

// export const auth0 = new Auth0Client({
//   routes: {
//     login: "/api/auth/login",
//     logout: "/api/auth/logout",
//     callback: "/api/auth/callback",
//     backChannelLogout: "/api/auth/backchannel-logout",
//     profile: "/api/auth/profile",
//     accessToken: "/api/auth/access-token",
//     connectAccount: "/api/auth/connect",
//   },
// });
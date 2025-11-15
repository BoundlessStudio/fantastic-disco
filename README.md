# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Auth0 configuration

Authentication is now powered by Auth0. Provide the following environment variables in `.env` (see `.env.example` for placeholders):

- `NUXT_PUBLIC_AUTH0_DOMAIN`
- `NUXT_PUBLIC_AUTH0_CLIENT_ID`
- `NUXT_PUBLIC_AUTH0_AUDIENCE` (optional, used when hitting custom APIs)

After configuring Auth0, start the dev server and click **Sign in with Auth0** on the marketing page to reach the protected workspace.

## Application routes

- `/` &mdash; Public marketing/landing page with CTA buttons.
- `/home` &mdash; Auth0-protected home dashboard that lists available agents.
- `/chat` &mdash; Auth0-protected chat workspace (supports `?agent=<id>` to preselect an agent).

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

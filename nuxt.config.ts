import mkcert from 'vite-plugin-mkcert'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/tailwindcss'
  ],
  devServer: {
    https: true,          // let Vite handle certs via mkcert
    host: '127.0.0.1',    // avoids some Windows weirdness
    port: 3000,
  },
  runtimeConfig: {
    openaiApiKey: '',
    mem0ApiKey: '',
    public: {
      auth0Domain: '',
      auth0ClientId: '',
      auth0Audience: '',
    },
  },
  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
      extensions: ['vue'], // only auto-register .vue files
    },
  ],
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui',
  },
  vite: {
    plugins: [
      mkcert(),
    ],
  },
})

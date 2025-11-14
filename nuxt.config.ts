// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    'shadcn-nuxt',
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    openaiApiKey: '',
    mem0ApiKey: ''
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
})
export default defineNuxtConfig({
  modules: ["@nuxt/ui", "@nuxt/eslint", "@pinia/nuxt", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  ui: {
    fonts: false,
  },
  devtools: { enabled: true },
  nitro: { preset: "bun" },
  app: {
    baseURL: "/auth/",
  },
  compatibilityDate: "2025-08-09",
});

<script setup lang="ts">
import "@fontsource-variable/fira-code";
import "~/assets/MiSans/mi-sans.css";
import "~/assets/css/reset.css";
import favicon from "@/assets/icon/favicon.svg";

useHead({
  title: "认证中心",
  link: [{ rel: "icon", type: "image/svg+xml", href: favicon }],
});
</script>

<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>

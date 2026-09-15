<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
const baseURL = runtimeConfig.app.baseURL.replace(/\/$/, '')
const withBase = (path: string) => `${baseURL}${path}`
</script>

<template>
  <div class="site-shell">
    <header class="site-header">
      <NuxtLink class="site-brand" to="/" aria-label="FindMyPub API documentation">
        <span class="site-brand-mark" aria-hidden="true">
          <img class="site-logo site-logo-light" :src="withBase('/assets/fmp-logo.png')" alt="">
          <img class="site-logo site-logo-dark" :src="withBase('/assets/fmp-logo-dark.png')" alt="">
        </span>
        <span class="site-brand-text">API Docs</span>
      </NuxtLink>
    </header>
    <main class="site-main">
      <slot />
    </main>
  </div>
</template>

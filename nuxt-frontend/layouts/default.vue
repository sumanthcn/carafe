<script setup lang="ts">
const { getGlobalSettings } = useStrapi();
const { data: globalSettings } = await useAsyncData(
  "global-settings",
  getGlobalSettings
);

// Provide global settings to all components
provide("globalSettings", globalSettings);

// Initialize cart on client
const cartStore = useCartStore();
onMounted(() => {
  cartStore.loadCart();
});
</script>

<template>
  <div class="app">
    <TheHeader :settings="globalSettings" />

    <main class="main-content">
      <slot />
    </main>

    <TheFooter :settings="globalSettings" />

    <!-- Cart sidebar -->
    <CartSidebar />
  </div>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>

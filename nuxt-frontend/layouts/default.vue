<script setup lang="ts">
// Initialize global settings using the composable (fetched once, cached globally)
const {
  fetchSettings,
  globalSettings,
  error: settingsError,
} = useGlobalSettings();

// Fetch settings but don't block render if it fails
try {
  await fetchSettings();
} catch (e) {
  console.error("Failed to load global settings:", e);
}

// Log any settings errors for debugging
if (settingsError.value) {
  console.warn("Global settings error:", settingsError.value);
}

// Provide global settings to components that may need them via provide/inject
provide("globalSettings", globalSettings);

// Initialize cart on client
const cartStore = useCartStore();
const isCartOpen = ref(false);

onMounted(() => {
  cartStore.loadCart();
});

function toggleCart() {
  isCartOpen.value = !isCartOpen.value;
}
</script>

<template>
  <div class="app">
    <TheHeader @toggle-cart="toggleCart" />

    <main class="main-content">
      <slot />
    </main>

    <TheFooter />

    <!-- Cart sidebar -->
    <CartSidebar v-model:is-open="isCartOpen" />

    <!-- Toast notifications -->
    <UNotifications class="toast-container" :timeout="0" />
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

.toast-container {
  position: fixed;
  top: 70px !important; // Just below header
  right: 0;
  bottom: unset !important;
  // transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  max-width: 500px;
  padding: 0 1rem;
}
</style>

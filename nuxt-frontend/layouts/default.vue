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

    <!-- Floating Book a Table button -->
    <NuxtLink to="/contact" class="fab-book-table" aria-label="Book a table">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>Book a Table</span>
    </NuxtLink>

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

// Floating Book a Table button
.fab-book-table {
  position: fixed;
  bottom: 6rem;
  right: 2rem;
  z-index: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: $color-primary;
  color: white;
  text-decoration: none;
  font-family: $font-heading;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 123, 167, 0.45);
  transition: background 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0, 123, 167, 0.55);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    bottom: 1.25rem;
    right: 1.25rem;
    padding: 0.7rem 1rem;
    font-size: 0.75rem;

    span {
      display: none;
    }

    padding: 0.85rem;
    border-radius: 50%;

    svg {
      width: 22px;
      height: 22px;
    }
  }
}
</style>

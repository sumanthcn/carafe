import { useAuth } from '~/composables/useAuth';

export default defineNuxtPlugin(async () => {
  const { initAuth } = useAuth();
  const cartStore = useCartStore();

  // Initialize auth state from localStorage
  initAuth();

  // Load cart from localStorage
  if (import.meta.client) {
    await cartStore.loadCart();
  }
});

import type { ShopSettings } from '~/types/strapi';

export const useShopSettings = () => {
  const config = useRuntimeConfig();
  const settings = ref<ShopSettings | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchShopSettings = async () => {
    if (settings.value) return; // Already fetched

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch<{ data: ShopSettings }>(`${config.public.strapiUrl}/api/shop-setting`, {
        // Prevent fetch from throwing on 404
        onResponseError({ response }) {
          if (response.status === 404) {
            // Silently ignore 404 - shop settings are optional
            return;
          }
        }
      });
      
      if (response && response.data) {
        settings.value = response.data;
      }
    } catch (e: any) {
      // Only log non-404 errors
      if (e.statusCode !== 404) {
        console.error('Error fetching shop settings:', e);
      }
      settings.value = null;
    } finally {
      loading.value = false;
      error.value = null;
    }
  };

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    error: readonly(error),
    fetchShopSettings,
  };
};

import type { ShopSettings } from '~/types/strapi';

export const useShopSettings = () => {
  const config = useRuntimeConfig();
  const settings = ref<ShopSettings | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchShopSettings = async () => {
    if (settings.value) return; // Already fetched

    try {
      loading.value = true;
      error.value = null;

      const response = await $fetch<{ data: ShopSettings }>(`${config.public.strapiUrl}/api/shop-setting`);
      
      if (response && response.data) {
        settings.value = response.data;
      }
    } catch (e: any) {
      console.error('Error fetching shop settings:', e);
      error.value = e.message || 'Failed to fetch shop settings';
    } finally {
      loading.value = false;
    }
  };

  return {
    settings: readonly(settings),
    loading: readonly(loading),
    error: readonly(error),
    fetchShopSettings,
  };
};

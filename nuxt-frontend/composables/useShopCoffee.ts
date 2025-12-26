import type { ShopCoffee, StrapiResponse } from "~/types/strapi";

export const useShopCoffee = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch shop-coffee Single Type data
   */
  async function fetchShopCoffeeData(): Promise<ShopCoffee | null> {
    try {
      const params: Record<string, string> = {
        "populate[visitCafeSection][populate][cards][populate][cta][populate][icon]":
          "true",
        "populate[seo][populate][ogImage]": "true",
      };

      const response = await $fetch<StrapiResponse<ShopCoffee>>(
        `${strapiUrl}/api/shop-coffee`,
        {
          params,
        }
      );

      return response.data;
    } catch (error) {
      console.error("Failed to fetch shop-coffee data:", error);
      return null;
    }
  }

  return {
    fetchShopCoffeeData,
  };
};

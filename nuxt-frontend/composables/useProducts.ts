import type { Product, ProductCategory } from "~/types/strapi";

/**
 * Composable for fetching products with pagination and filtering
 */
export function useProducts() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch products with pagination and filters
   */
  async function fetchProducts(
    options: {
      page?: number;
      pageSize?: number;
      category?: string;
      isTopSeller?: boolean;
      isWhatsNew?: boolean;
    } = {}
  ) {
    const {
      page = 1,
      pageSize = 3,
      category,
      isTopSeller,
      isWhatsNew,
    } = options;

    try {
      // Build query params for Strapi v5
      const params: any = {
        "filters[publishedAt][$notNull]": "true",
        "populate[images]": "true",
        "populate[category]": "true",
        "populate[variants]": "true",
        "populate[attributes]": "true",
        "populate[subscriptionOptions]": "true",
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "displayOrder:asc",
        "sort[1]": "createdAt:desc",
      };

      if (category) {
        params["filters[category][slug][$eq]"] = category;
      }

      if (isTopSeller !== undefined) {
        params["filters[isTopSeller][$eq]"] = isTopSeller;
      }

      if (isWhatsNew !== undefined) {
        params["filters[isWhatsNew][$eq]"] = isWhatsNew;
      }

      const response = await $fetch<{
        data: Array<{
          id: number;
          documentId: string;
          [key: string]: any;
        }>;
        meta: {
          pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
          };
        };
      }>(`${strapiUrl}/api/products`, {
        params,
      });

      console.log("Fetched products response:", response);

      // Transform to Product type - data is flat, no attributes wrapper
      const products: Product[] = response.data.map(
        (item: any) =>
          ({
            ...item,
            images:
              (item.images as any[])?.map((img: any) => ({
                ...img,
              })) || [],
            category: item.category || null,
            variants: item.variants || [],
            attributes: item.attributes || null,
          } as Product)
      );

      return {
        products,
        pagination: response.meta.pagination,
      };
    } catch (error) {
      console.error("Failed to fetch products:", error);
      throw error;
    }
  }

  /**
   * Fetch a single product by slug
   */
  async function fetchProductBySlug(slug: string) {
    try {
      const params: any = {
        "filters[slug][$eq]": slug,
        "filters[publishedAt][$notNull]": "true",
        "populate[images]": "true",
        "populate[category]": "true",
        "populate[variants]": "true",
        "populate[attributes]": "true",
        "populate[subscriptionOptions]": "true",
        "populate[relatedProducts][populate][images]": "true",
        "populate[relatedProducts][populate][variants]": "true",
        "populate[seo]": "true",
      };

      const response = await $fetch<{
        data: Array<{
          id: number;
          documentId: string;
          [key: string]: any;
        }>;
      }>(`${strapiUrl}/api/products`, {
        params,
      });

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const item = response.data[0];
      const product: Product = {
        ...item,
        images:
          (item.images as any[])?.map((img: any) => ({
            ...img,
          })) || [],
        category: item.category || null,
        variants: item.variants || [],
        attributes: item.attributes || null,
        relatedProducts:
          (item.relatedProducts as any[])?.map((rel: any) => ({
            ...rel,
            images:
              (rel.images as any[])?.map((img: any) => ({
                ...img,
              })) || [],
            variants: rel.variants || [],
          })) || [],
      } as Product;

      return product;
    } catch (error) {
      console.error("Failed to fetch product:", error);
      throw error;
    }
  }

  /**
   * Fetch all categories
   */
  async function fetchCategories() {
    try {
      const params: any = {
        "filters[publishedAt][$notNull]": "true",
        "filters[isActive][$eq]": "true",
        "populate[icon][fields][0]": "url",
        "populate[icon][fields][1]": "alternativeText",
        "sort[0]": "displayOrder:asc",
      };

      const response = await $fetch<{
        data: Array<{
          id: number;
          documentId: string;
          attributes: any;
        }>;
      }>(`${strapiUrl}/api/product-categories`, {
        params,
      });

      const categories: ProductCategory[] = response.data.map((item) => ({
        id: item.id,
        documentId: item.documentId,
        ...item.attributes,
        icon: item.attributes?.icon?.data
          ? {
              id: item.attributes.icon.data.id,
              documentId: item.attributes.icon.data.documentId,
              ...item.attributes.icon.data.attributes,
            }
          : null,
      }));

      return categories;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  }

  return {
    fetchProducts,
    fetchProductBySlug,
    fetchCategories,
  };
}

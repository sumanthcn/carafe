import type {
  StrapiMedia,
  StrapiSeo,
  GlobalSettings,
  Product,
  ProductCategory,
  Subscription,
  Page,
} from "~/types/strapi";

/**
 * Composable for fetching data from Strapi CMS
 */
export function useStrapi() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Build the full URL for a Strapi media asset
   */
  function getStrapiMediaUrl(media: StrapiMedia | undefined): string {
    if (!media?.url) return "/images/placeholder.jpg";

    // Check if URL is already absolute
    if (media.url.startsWith("http")) {
      return media.url;
    }

    return `${strapiUrl}${media.url}`;
  }

  /**
   * Generic fetch function for Strapi API
   */
  async function fetchApi<T>(
    endpoint: string,
    options: {
      populate?: string | string[] | Record<string, unknown>;
      filters?: Record<string, unknown>;
      sort?: string[];
      pagination?: {
        page?: number;
        pageSize?: number;
      };
    } = {}
  ): Promise<T> {
    const { populate, filters, sort, pagination } = options;

    const params = new URLSearchParams();

    // Handle populate - convert complex objects to nested query params
    if (populate) {
      if (typeof populate === "string") {
        params.append("populate", populate);
      } else if (Array.isArray(populate)) {
        populate.forEach((field) => {
          params.append("populate", field);
        });
      } else {
        // For complex nested populate, convert to query string format
        const flattenPopulate = (
          obj: Record<string, unknown>,
          prefix = ""
        ): void => {
          Object.entries(obj).forEach(([key, value]) => {
            const paramKey = prefix ? `${prefix}[${key}]` : key;

            if (value === true || value === "*") {
              params.append(`populate[${paramKey}]`, "*");
            } else if (typeof value === "object" && value !== null) {
              if (Array.isArray(value)) {
                value.forEach((item, index) => {
                  if (typeof item === "string") {
                    params.append(`populate[${paramKey}][${index}]`, item);
                  }
                });
              } else {
                flattenPopulate(value as Record<string, unknown>, paramKey);
              }
            }
          });
        };

        flattenPopulate(populate);
      }
    }

    // Handle filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(`filters${key}`, String(value));
      });
    }

    // Handle sort
    if (sort) {
      sort.forEach((s, i) => {
        params.append(`sort[${i}]`, s);
      });
    }

    // Handle pagination
    if (pagination) {
      if (pagination.page)
        params.append("pagination[page]", String(pagination.page));
      if (pagination.pageSize)
        params.append("pagination[pageSize]", String(pagination.pageSize));
    }

    const url = `${strapiUrl}/api/${endpoint}${
      params.toString() ? `?${params.toString()}` : ""
    }`;

    const { data, error } = await useFetch<T>(url, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error.value) {
      console.error(`Strapi API Error (${endpoint}):`, error.value);
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to fetch from Strapi: ${endpoint}`,
      });
    }

    return data.value as T;
  }

  /**
   * Fetch homepage data
   */
  async function getHomepage() {
    const params = new URLSearchParams();

    // Populate hero carousel components
    params.append(
      "populate[heroCarousel][populate][buttons][populate][icon]",
      "true"
    );
    params.append("populate[heroCarousel][populate][backgroundImage]", "true");
    params.append("populate[carouselSettings]", "*");
    params.append(
      "populate[tasteTheCraft][populate][categories][populate][icon]",
      "true"
    );
    params.append("populate[brandStory][populate][image]", "true");
    params.append(
      "populate[brandStory][populate][cta][populate][icon]",
      "true"
    );
    params.append("populate[cafeLocation][populate][backgroundImage]", "true");
    params.append(
      "populate[cafeLocation][populate][cta][populate][icon]",
      "true"
    );
    params.append("populate[cultureSection][populate][image]", "true");
    params.append(
      "populate[cultureSection][populate][cta][populate][icon]",
      "true"
    );
    params.append("populate[wholesaleSection][populate][image]", "true");
    params.append(
      "populate[wholesaleSection][populate][cta][populate][icon]",
      "true"
    );
    // params.append("populate[newsletter]", "*");
    // params.append("populate[seo][populate]", "*");

    return fetchApi(`homepage?${params.toString()}`);
  }

  /**
   * Fetch global settings
   */
  async function getGlobalSettings(): Promise<GlobalSettings> {
    const response = await fetchApi<{ data: GlobalSettings }>(
      "global-setting",
      {
        // Use wildcard to populate all first-level relations
        populate: "*",
      }
    );
    return response.data;
  }

  /**
   * Fetch all products
   */
  async function getProducts(options?: {
    category?: string;
    featured?: boolean;
    topSeller?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const filters: Record<string, unknown> = {};

    if (options?.category) {
      filters["[category][slug][$eq]"] = options.category;
    }
    if (options?.topSeller) {
      filters["[isTopSeller][$eq]"] = true;
    }

    return fetchApi<{
      data: Product[];
      meta: { pagination: { total: number } };
    }>("products", {
      populate: {
        images: true,
        category: true,
        variants: true,
        attributes: true,
        seo: {
          populate: ["ogImage"],
        },
      },
      filters,
      sort: ["createdAt:desc"],
      pagination: {
        page: options?.page || 1,
        pageSize: options?.pageSize || 12,
      },
    });
  }

  /**
   * Fetch single product by slug
   */
  async function getProductBySlug(slug: string): Promise<Product | null> {
    const response = await fetchApi<{ data: Product[] }>("products", {
      populate: {
        images: true,
        category: true,
        variants: true,
        attributes: true,
        relatedProducts: {
          populate: ["images", "category", "variants"],
        },
        seo: {
          populate: ["ogImage"],
        },
      },
      filters: {
        "[slug][$eq]": slug,
      },
    });

    return response.data?.[0] || null;
  }

  /**
   * Fetch product categories
   */
  async function getProductCategories() {
    return fetchApi<{ data: ProductCategory[] }>("product-categories", {
      populate: {
        icon: true,
        image: true,
        seo: {
          populate: ["ogImage"],
        },
      },
      filters: {
        "[isActive][$eq]": true,
      },
      sort: ["displayOrder:asc"],
    });
  }

  /**
   * Fetch subscriptions
   */
  async function getSubscriptions() {
    return fetchApi<{ data: Subscription[] }>("subscriptions", {
      populate: {
        image: true,
        features: {
          populate: ["icon"],
        },
        seo: {
          populate: ["ogImage"],
        },
      },
      filters: {
        "[isActive][$eq]": true,
      },
      sort: ["displayOrder:asc"],
    });
  }

  /**
   * Fetch page by slug
   */
  async function getPageBySlug(slug: string) {
    const response = await fetchApi<{ data: Page[] }>("pages", {
      populate: {
        content: {
          populate: "*",
        },
        featuredImage: true,
        seo: {
          populate: ["ogImage"],
        },
      },
      filters: {
        "[slug][$eq]": slug,
      },
    });

    return response.data?.[0] || null;
  }

  return {
    strapiUrl,
    getStrapiMediaUrl,
    fetchApi,
    getHomepage,
    getGlobalSettings,
    getProducts,
    getProductBySlug,
    getProductCategories,
    getSubscriptions,
    getPageBySlug,
  };
}

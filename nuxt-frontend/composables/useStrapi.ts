import type {
  StrapiMedia,
  StrapiSeo,
  GlobalSettings,
  Product,
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
      populate?: string | Record<string, unknown>;
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

    // Handle populate
    if (populate) {
      if (typeof populate === "string") {
        params.append("populate", populate);
      } else {
        params.append("populate", JSON.stringify(populate));
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
    return fetchApi("homepage", {
      populate: {
        hero: {
          populate: [
            "backgroundImage",
            "overlayImage",
            "primaryCta",
            "secondaryCta",
          ],
        },
        productCategories: {
          populate: {
            categories: {
              populate: ["icon", "image"],
            },
          },
        },
        brandStory: {
          populate: ["image", "cta"],
        },
        cafeLocation: {
          populate: ["backgroundImage", "cta", "features.icon"],
        },
        cultureSection: {
          populate: ["image", "cta"],
        },
        wholesaleSection: {
          populate: ["image", "cta", "benefits.icon"],
        },
        newsletter: true,
        seo: {
          populate: ["ogImage"],
        },
      },
    });
  }

  /**
   * Fetch global settings
   */
  async function getGlobalSettings(): Promise<GlobalSettings> {
    const response = await fetchApi<{ data: GlobalSettings }>(
      "global-setting",
      {
        populate: {
          logo: true,
          favicon: true,
          defaultOgImage: true,
          address: true,
          openingHours: true,
          socialLinks: true,
          navigation: {
            populate: ["children"],
          },
          footer: {
            populate: {
              footerLinks: {
                populate: ["links"],
              },
            },
          },
          defaultSeo: {
            populate: ["ogImage"],
          },
        },
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
    if (options?.featured) {
      filters["[isFeatured][$eq]"] = true;
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
        relatedProducts: {
          populate: ["images", "category"],
        },
        seo: {
          populate: ["ogImage"],
        },
        productSchema: true,
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

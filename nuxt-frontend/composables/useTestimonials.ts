import type { CustomerTestimonial } from "~/types/strapi";

export const useTestimonials = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch featured testimonials for display
   */
  async function fetchFeaturedTestimonials(limit: number = 3) {
    try {
      const params: Record<string, string> = {
        "filters[publishedAt][$notNull]": "true",
        "filters[isActive][$eq]": "true",
        "filters[isFeatured][$eq]": "true",
        "populate[reviewerImage]": "true",
        "sort[0]": "displayOrder:asc",
        "pagination[pageSize]": limit.toString(),
      };

      const response = await $fetch<{
        data: any[];
        meta: {
          pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
          };
        };
      }>(`${strapiUrl}/api/customer-testimonials`, {
        params,
      });

      // Transform to flat structure matching our types
      const testimonials: CustomerTestimonial[] = response.data.map(
        (item: any) =>
          ({
            ...item,
            reviewerImage: item.reviewerImage
              ? {
                  ...item.reviewerImage,
                }
              : null,
          } as CustomerTestimonial)
      );

      return {
        testimonials,
        pagination: response.meta.pagination,
      };
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
      throw error;
    }
  }

  /**
   * Calculate average rating from all featured testimonials
   */
  async function getAverageRating() {
    try {
      const { testimonials } = await fetchFeaturedTestimonials(100); // Fetch all
      if (testimonials.length === 0) return 0;

      const total = testimonials.reduce((sum, t) => sum + (t.rating || 0), 0);
      return Number((total / testimonials.length).toFixed(1));
    } catch (error) {
      console.error("Failed to calculate average rating:", error);
      return 0;
    }
  }

  return {
    fetchFeaturedTestimonials,
    getAverageRating,
  };
};

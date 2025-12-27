export interface ProductReview {
  id: number;
  documentId: string;
  rating: number;
  reviewTitle?: string;
  reviewText?: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  isHelpful?: number;
  isReported?: boolean;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function useProductReviews() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch reviews for a specific product
   */
  async function fetchReviewsByProduct(productId: number | string) {
    try {
      const response = await $fetch<{
        data: ProductReview[];
        meta: {
          averageRating: number;
          totalReviews: number;
          ratingDistribution: Record<string, number>;
        };
      }>(`${strapiUrl}/api/product-reviews/product/${productId}`);

      return {
        reviews: response.data || [],
        stats: {
          averageRating: response.meta?.averageRating || 0,
          totalReviews: response.meta?.totalReviews || 0,
          ratingDistribution: response.meta?.ratingDistribution || {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
          },
        },
      };
    } catch (error) {
      console.error("Failed to fetch product reviews:", error);
      return {
        reviews: [],
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }
  }

  /**
   * Calculate rating percentage for progress bars
   */
  function getRatingPercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

  return {
    fetchReviewsByProduct,
    getRatingPercentage,
  };
}

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
   * Fetch reviews for a specific product by documentId
   */
  async function fetchReviewsByProduct(productId: number | string) {
    try {
      // Fetch product to get documentId if numeric ID is provided
      let documentId = productId;
      if (typeof productId === 'number') {
        const productResponse = await $fetch<{ data: any }>(`${strapiUrl}/api/products/${productId}`);
        documentId = productResponse.data?.documentId || productId;
      }

      // Fetch customer reviews by product documentId
      const response = await $fetch<{ data: any[] }>(`${strapiUrl}/api/customer-reviews`, {
        params: {
          'filters[product][documentId][$eq]': documentId,
          'filters[status][$eq]': 'approved',
          'pagination[pageSize]': 100,
        }
      });

      const reviews = response.data || [];
      
      // Calculate stats
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0
        ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
        : 0;
      
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach((r: any) => {
        const rating = r.rating as keyof typeof ratingDistribution;
        if (rating >= 1 && rating <= 5) {
          ratingDistribution[rating]++;
        }
      });

      return {
        reviews: reviews.map((r: any) => ({
          id: r.id,
          documentId: r.documentId || String(r.id),
          rating: r.rating || 5,
          reviewTitle: r.reviewTitle || '',
          reviewText: r.reviewDescription || '',
          isVerifiedPurchase: r.isVerifiedPurchase || false,
          createdAt: r.createdAt || new Date().toISOString(),
          customerName: r.name || 'Anonymous',
          customerEmail: r.email || '',
          isHelpful: r.helpfulCount || 0,
        })),
        stats: {
          averageRating: Number(averageRating.toFixed(1)),
          totalReviews,
          ratingDistribution,
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

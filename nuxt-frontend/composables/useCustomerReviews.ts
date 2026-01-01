import type { CustomerReview } from "~/types/strapi";

interface ReviewSubmission {
  name: string;
  email: string;
  rating: number;
  reviewTitle: string;
  reviewDescription: string;
  productId: string;
}

interface FileValidationError {
  file: string;
  error: string;
}

export const useCustomerReviews = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Validate image files
   */
  const validateImages = (files: File[]): FileValidationError[] => {
    const errors: FileValidationError[] = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (files.length > 5) {
      errors.push({
        file: "general",
        error: "Maximum 5 images allowed",
      });
      return errors;
    }

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push({
          file: file.name,
          error: "Only JPG, PNG, and WebP images are allowed",
        });
      }
      if (file.size > maxSize) {
        errors.push({
          file: file.name,
          error: `File size must be less than 5MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        });
      }
    });

    return errors;
  };

  /**
   * Validate video file
   */
  const validateVideo = (file: File): FileValidationError[] => {
    const errors: FileValidationError[] = [];
    const maxSize = 25 * 1024 * 1024; // 25MB
    const allowedTypes = ["video/mp4", "video/quicktime", "video/webm"];

    if (!allowedTypes.includes(file.type)) {
      errors.push({
        file: file.name,
        error: "Only MP4, MOV, and WebM videos are allowed",
      });
    }

    if (file.size > maxSize) {
      errors.push({
        file: file.name,
        error: `Video size must be less than 25MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      });
    }

    return errors;
  };

  /**
   * Upload media files to Strapi
   */
  const uploadMedia = async (files: File[]): Promise<number[]> => {
    const uploadedIds: number[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("files", file);

      try {
        const response = await fetch(`${strapiUrl}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 403) {
            console.warn(`Upload permission denied for ${file.name}. Please enable upload permissions in Strapi Admin (Settings → Users & Permissions → Roles → Public → Upload).`);
            // Return empty array instead of throwing error so review can still be submitted
            continue;
          }
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        if (data && data[0] && data[0].id) {
          uploadedIds.push(data[0].id);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        // Don't throw error for upload failures, just log and continue
        console.warn(`Skipping file ${file.name} due to upload error. Review will be submitted without this file.`);
      }
    }

    return uploadedIds;
  };

  /**
   * Check if a user has made a verified purchase of a product
   */
  const checkVerifiedPurchase = async (
    email: string,
    productId: string
  ): Promise<boolean> => {
    try {
      // Get product numeric ID from documentId
      const productResponse = await $fetch<{ data: any[] }>(`${strapiUrl}/api/products`, {
        params: {
          "filters[documentId][$eq]": productId,
        },
      });

      if (!productResponse.data || productResponse.data.length === 0) {
        return false;
      }

      const productNumericId = productResponse.data[0].id;

      const result = await $fetch<{ isVerifiedPurchase: boolean }>(
        `${strapiUrl}/api/customer-reviews/check-verified-purchase`,
        {
          params: {
            email,
            productId: productNumericId,
          },
        }
      );

      return result.isVerifiedPurchase;
    } catch (error) {
      console.error("Error checking verified purchase:", error);
      return false;
    }
  };

  /**
   * Submit a customer review
   */
  const submitReview = async (
    reviewData: ReviewSubmission,
    images?: File[],
    video?: File
  ): Promise<{ success: boolean; error?: string; review?: CustomerReview }> => {
    try {
      // Validate images if provided
      if (images && images.length > 0) {
        const imageErrors = validateImages(images);
        if (imageErrors.length > 0) {
          return {
            success: false,
            error: imageErrors.map((e) => `${e.file}: ${e.error}`).join(", "),
          };
        }
      }

      // Validate video if provided
      if (video) {
        const videoErrors = validateVideo(video);
        if (videoErrors.length > 0) {
          return {
            success: false,
            error: videoErrors.map((e) => `${e.file}: ${e.error}`).join(", "),
          };
        }
      }

      // Upload images
      let imageIds: number[] = [];
      if (images && images.length > 0) {
        imageIds = await uploadMedia(images);
      }

      // Upload video
      let videoId: number | undefined;
      if (video) {
        const videoIds = await uploadMedia([video]);
        videoId = videoIds[0];
      }

      // Get product numeric ID from documentId for the relation
      const productResponse = await $fetch<{ data: any[] }>(`${strapiUrl}/api/products`, {
        params: {
          "filters[documentId][$eq]": reviewData.productId,
        },
      });

      if (!productResponse.data || productResponse.data.length === 0) {
        throw new Error("Product not found");
      }

      const productNumericId = productResponse.data[0].id;

      // Create review data payload for new customer-review system
      const payload: any = {
        data: {
          name: reviewData.name,
          email: reviewData.email,
          rating: reviewData.rating,
          reviewTitle: reviewData.reviewTitle,
          reviewDescription: reviewData.reviewDescription,
          product: productNumericId, // Use numeric ID for Strapi relation
          status: "approved",
          helpfulCount: 0,
        },
      };
      if (imageIds.length > 0) {
        payload.data.images = imageIds;
      }
      if (videoId) {
        payload.data.video = videoId;
      }
      // Submit review to new customer-review endpoint
      const result = await $fetch<{ data: any }>(`${strapiUrl}/api/customer-reviews`, {
        method: "POST",
        body: payload,
      });
      return {
        success: true,
        review: result.data,
      };
    } catch (error: any) {
      console.error("Error submitting review:", error);
      return {
        success: false,
        error: error.message || "An error occurred while submitting your review",
      };
    }
  };

  /**
   * Fetch approved reviews for a product
   */
  const fetchProductReviews = async (productId: string): Promise<CustomerReview[]> => {
    try {
      // Get product numeric ID from documentId
      const productResponse = await $fetch<{ data: any[] }>(`${strapiUrl}/api/products`, {
        params: {
          "filters[documentId][$eq]": productId,
        },
      });

      if (!productResponse.data || productResponse.data.length === 0) {
        console.log("Product not found for documentId:", productId);
        return [];
      }

      const productNumericId = productResponse.data[0].id;
      console.log("Fetching reviews for product numeric ID:", productNumericId);

      // Fetch from new customer-review endpoint by product numeric ID
      const result = await $fetch<{ data: any[] }>(`${strapiUrl}/api/customer-reviews`, {
        params: {
          "filters[product][id][$eq]": productNumericId,
          "filters[status][$eq]": "approved",
          "pagination[pageSize]": 100,
          "populate": "*"
        },
      });
      
      console.log("Customer reviews response:", result);
      
      if (result && Array.isArray(result.data)) {
        return result.data.map((review: any) => ({
          id: review.id,
          documentId: review.documentId || String(review.id),
          name: review.name || "Anonymous",
          email: review.email || "",
          rating: review.rating || 5,
          reviewTitle: review.reviewTitle || "",
          reviewDescription: review.reviewDescription || "",
          images: review.images || [],
          video: review.video || undefined,
          product: review.product,
          status: review.status || "approved",
          isVerifiedPurchase: review.isVerifiedPurchase || false,
          helpfulCount: review.helpfulCount || 0,
          createdAt: review.createdAt || new Date().toISOString(),
          updatedAt: review.updatedAt || new Date().toISOString(),
        }));
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
      return [];
    }
  };

  /**
   * Mark a review as helpful
   */
  const markReviewHelpful = async (reviewId: string, currentCount: number): Promise<boolean> => {
    try {
      await $fetch(`${strapiUrl}/api/customer-reviews/${reviewId}`, {
        method: "PUT",
        body: {
          data: {
            helpfulCount: currentCount + 1,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error marking review as helpful:", error);
      return false;
    }
  };

  return {
    submitReview,
    fetchProductReviews,
    markReviewHelpful,
    checkVerifiedPurchase,
    validateImages,
    validateVideo,
  };
};

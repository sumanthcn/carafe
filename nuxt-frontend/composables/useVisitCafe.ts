import type { StrapiResponse } from "~/types/strapi";

export interface VisitCafeBanner {
  backgroundImage: any;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface BrandStory {
  headline: string;
  content: string;
  image: any;
}

export interface OpeningHoursWithImage {
  backgroundImage?: any;
  title: string;
  mondayToSaturday: string;
  sunday: string;
}

export interface GettingHereItem {
  id: number;
  icon: any;
  name: string;
  description: string;
}

export interface GettingHere {
  title: string;
  items: GettingHereItem[];
}

export interface VisitCafe {
  id: number;
  documentId: string;
  bannerSection?: VisitCafeBanner;
  brandStorySection?: BrandStory;
  openingHoursSection?: OpeningHoursWithImage;
  gettingHereSection?: GettingHere;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: any;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export const useVisitCafe = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch visit cafe page data
   */
  const fetchVisitCafeData = async (): Promise<VisitCafe | null> => {
    try {
      // Build populate params using bracket notation for nested population
      const params = new URLSearchParams();
      
      // Banner section with background image
      params.append("populate[bannerSection][populate][backgroundImage]", "true");
      
      // Brand story section with images
      params.append("populate[brandStorySection][populate][image]", "true");
      
      // Opening hours section with background image
      
      // Getting here section with items and their icons
      
      // SEO with meta image

      const response = await $fetch<StrapiResponse<VisitCafe>>(
        `${strapiUrl}/api/visit-cafe?${params.toString()}`
      );

      return response.data || null;
    } catch (error) {
      console.error("Error fetching visit cafe data:", error);
      return null;
    }
  };

  return {
    fetchVisitCafeData,
  };
};

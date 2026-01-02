import type { StrapiResponse } from "~/types/strapi";

export interface ArtAndCulture {
  bannerSection?: {
    title: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: any;
  };
  artExibits?: {
    headline: string;
    content?: string;
    images?: any[];
    imagePosition?: "left" | "right";
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
  cultureNights?: {
    headline?: string;
    description?: string;
    backgroundImage?: any;
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
  meetups?: {
    headline: string;
    content?: string;
    image?: any;
    imagePosition?: "left" | "right";
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
  upcomingEvents?: {
    headline?: string;
    content?: string;
    image?: any;
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

export const useArtAndCulture = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  /**
   * Fetch Art and Culture page data from Strapi
   */
  const fetchArtAndCultureData = async (): Promise<ArtAndCulture | null> => {
    try {
        // Build populate params using bracket notation for nested population
        const params = new URLSearchParams();
        // Banner section with background image
        params.append("populate[bannerSection][populate][backgroundImage]", "true");
        // Art exhibits section with images and CTA icon
        params.append("populate[artExibits][populate][images]", "true");
        params.append("populate[artExibits][populate][cta][populate][icon]", "true");
        // Culture nights section with background image and CTA icon
        params.append("populate[cultureNights][populate][backgroundImage]", "true");
        params.append("populate[cultureNights][populate][cta][populate][icon]", "true");
        // Meetups section with image and CTA icon
        params.append("populate[meetups][populate][image]", "true");
        params.append("populate[meetups][populate][cta][populate][icon]", "true");
        // Upcoming events section with image and CTA icon
        params.append("populate[upcomingEvents][populate][image]", "true");
        params.append("populate[upcomingEvents][populate][cta][populate][icon]", "true");

        // SEO with meta image
        params.append("populate[seo]", "true");

        const response = await $fetch<StrapiResponse<ArtAndCulture>>(
          `${strapiUrl}/api/art-and-culture?${params.toString()}`
        );

        return response.data || null;
    } catch (error) {
      console.error("Failed to fetch art and culture data:", error);
      return null;
    }
  };

  return {
    fetchArtAndCultureData,
  };
};

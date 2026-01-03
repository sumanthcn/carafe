import type { StrapiMedia, StrapiSeo, StrapiResponse } from "~/types/strapi";

export interface AboutFAQ {
  question: string;
  answer: string;
}

export interface AboutBannerSection {
  title: string;
  subtitle?: string;
  descriptionTitle?: string;
  description?: string;
  backgroundImage?: StrapiMedia;
}

export interface AboutContentSection {
  headline: string;
  content?: string;
  images?: StrapiMedia[];
  imagePosition?: "left" | "right";
  cta?: {
    text: string;
    url: string;
    style?: "primary" | "secondary" | "outline" | "text";
    icon?: StrapiMedia;
    iconPosition?: "left" | "right";
    openInNewTab?: boolean;
  };
}

export interface About {
  bannerSection?: AboutBannerSection;
  section1?: AboutContentSection;
  section2?: AboutContentSection;
  section3?: AboutContentSection;
  seo?: StrapiSeo;
}

export const useAbout = () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;

  const fetchAboutData = async (): Promise<About | null> => {
    try {
      const params = new URLSearchParams();

      // Banner section with background image
      params.append("populate[bannerSection][populate][backgroundImage]", "true");

      // Section 1 with images and CTA icon
      params.append("populate[section1][populate][images]", "true");
      params.append("populate[section1][populate][cta][populate][icon]", "true");

      // Section 2 with images and CTA icon
      params.append("populate[section2][populate][images]", "true");
      params.append("populate[section2][populate][cta][populate][icon]", "true");

      // Section 3 with images and CTA icon
      params.append("populate[section3][populate][images]", "true");
      params.append("populate[section3][populate][cta][populate][icon]", "true");

      // SEO
      params.append("populate[seo]", "true");

      const response = await $fetch<StrapiResponse<About>>(
        `${strapiUrl}/api/about?${params.toString()}`
      );

      return response.data || null;
    } catch (error) {
      console.error("Error fetching about data:", error);
      return null;
    }
  };

  return {
    fetchAboutData,
  };
};

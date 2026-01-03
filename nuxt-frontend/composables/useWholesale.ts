import type { StrapiMedia, StrapiSeo, StrapiResponse } from "~/types/strapi";

export interface WholesaleFAQ {
    question: string;
    answer: string;
}

export interface WholesaleImageText {
    image?: StrapiMedia;
    text?: string;
}

export interface WholesaleBannerSection {
    title: string;
    subtitle?: string;
    descriptionTitle?: string;
    description?: string;
    backgroundImage?: StrapiMedia;
}

export interface WholesaleFAQsSection {
    headline?: string;
    items?: WholesaleFAQ[];
}

export interface WholesaleOfferingSection {
    headline?: string;
    description?: string;
    backgroundImage?: StrapiMedia;
    imageTexts?: WholesaleImageText[];
}

export interface WholesaleContentSection {
    headline?: string;
    content?: string;
    image?: StrapiMedia;
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

export interface Wholesale {
    bannerSection: WholesaleBannerSection;
    faqs?: WholesaleFAQsSection;
    offerings?: WholesaleOfferingSection;
    getStarted?: WholesaleContentSection;
    buildTogether?: WholesaleContentSection;
    seo?: StrapiSeo;
}

export const useWholesale = () => {
    const config = useRuntimeConfig();
    const strapiUrl = config.public.strapiUrl;

    /**
     * Fetch wholesale page data
     */

    const fetchWholesaleData = async (): Promise<Wholesale | null> => {
        try {
            // Build populate params using bracket notation for nested population
            const params = new URLSearchParams();

            // Banner section with background image
            params.append("populate[bannerSection][populate][backgroundImage]", "true");

            // FAQs section
            params.append("populate[faqs][populate][items]", "true");

            // Offering section with background image and imageTexts with icons
            params.append("populate[offerings][populate][backgroundImage]", "true");
            params.append("populate[offerings][populate][imageTexts][populate][image]", "true");

            // Get Started section with image and CTA icon
            params.append("populate[getStarted][populate][image]", "true");
            params.append("populate[getStarted][populate][cta][populate][icon]", "true");
            
            // Build Together section with image and CTA icon
            params.append("populate[buildTogether][populate][image]", "true");
            params.append("populate[buildTogether][populate][cta][populate][icon]", "true");

            const response = await $fetch<StrapiResponse<Wholesale>>(
                `${strapiUrl}/api/wholesale?${params.toString()}`
            );

            return response.data || null;
        } catch (error) {
            console.error("Error fetching wholesale data:", error);
            return null;
        }
    }

    return {
        fetchWholesaleData,
    }
};

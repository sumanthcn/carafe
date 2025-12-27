import type {
  StrapiSeo,
  StrapiMedia,
  Product,
  GlobalSettings,
} from "~/types/strapi";

interface SeoOptions {
  seo?: StrapiSeo;
  title?: string;
  description?: string;
  image?: StrapiMedia;
  type?: "website" | "article" | "product";
  url?: string;
  product?: Product;
  globalSettings?: GlobalSettings;
}

/**
 * Composable for handling SEO meta tags
 * Reads SEO data from Strapi and applies to page head
 */
export function useSeo(options: SeoOptions = {}) {
  const config = useRuntimeConfig();
  const route = useRoute();
  const { getStrapiMediaUrl } = useStrapi();

  const {
    seo,
    title,
    description,
    image,
    type = "website",
    url,
    product,
    globalSettings,
  } = options;

  // Build canonical URL
  const siteUrl = config.public.siteUrl;
  const canonicalUrl = seo?.canonicalUrl || url || `${siteUrl}${route.path}`;

  // Get defaults from global settings or runtime config
  const siteName = globalSettings?.siteName || config.public.siteName;
  const defaultDescription =
    globalSettings?.siteDescription || config.public.siteDescription;
  const defaultOgImage = globalSettings?.defaultOgImage;

  // Resolve final values with fallbacks
  const metaTitle = seo?.metaTitle || title || siteName;
  const metaDescription =
    seo?.metaDescription || description || defaultDescription;
  const ogTitle = seo?.ogTitle || metaTitle;
  const ogDescription = seo?.ogDescription || metaDescription;
  const ogImage = seo?.ogImage || image || defaultOgImage;
  const ogImageUrl = ogImage
    ? getStrapiMediaUrl(ogImage)
    : `${siteUrl}/images/og-default.jpg`;
  const ogType = seo?.ogType || type;
  const twitterCard = seo?.twitterCard || "summary_large_image";
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;

  // Build robots meta
  const robots: string[] = [];
  if (seo?.noIndex) robots.push("noindex");
  if (seo?.noFollow) robots.push("nofollow");
  const robotsContent = robots.length > 0 ? robots.join(", ") : "index, follow";

  // Apply meta tags using Nuxt's useHead and useSeoMeta
  useHead({
    title: metaTitle,
    titleTemplate: (titleChunk) => {
      return titleChunk && titleChunk !== siteName
        ? `${titleChunk} | ${siteName}`
        : siteName;
    },
    link: [{ rel: "canonical", href: canonicalUrl }],
  });

  useSeoMeta({
    // Basic meta
    description: metaDescription,
    robots: robotsContent,

    // Open Graph
    ogType: ogType,
    ogTitle: ogTitle,
    ogDescription: ogDescription,
    ogImage: ogImageUrl,
    ogUrl: canonicalUrl,
    ogSiteName: siteName,
    ogLocale: "en_GB",

    // Twitter
    twitterCard: twitterCard,
    twitterTitle: twitterTitle,
    twitterDescription: twitterDescription,
    twitterImage: ogImageUrl,
  });

  // Return values for use in JSON-LD or elsewhere
  return {
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogImageUrl,
    siteName,
  };
}

/**
 * Generate Organization schema for coffee roaster
 */
export function useOrganizationSchema(globalSettings?: GlobalSettings) {
  const config = useRuntimeConfig();
  const { getStrapiMediaUrl } = useStrapi();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${config.public.siteUrl}/#organization`,
    name: globalSettings?.siteName || config.public.siteName,
    url: config.public.siteUrl,
    logo: globalSettings?.logo
      ? getStrapiMediaUrl(globalSettings.logo)
      : `${config.public.siteUrl}/images/logo.png`,
    description:
      globalSettings?.siteDescription || config.public.siteDescription,
    email: globalSettings?.contactEmail,
    telephone: globalSettings?.contactPhone,
    address: globalSettings?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: globalSettings.address.street,
          addressLocality: globalSettings.address.city,
          postalCode: globalSettings.address.postcode,
          addressCountry: globalSettings.address.country || "GB",
        }
      : undefined,
    sameAs: globalSettings?.socialLinks?.map((link) => link.url) || [],
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

/**
 * Generate LocalBusiness schema for café
 */
export function useLocalBusinessSchema(globalSettings?: GlobalSettings) {
  const config = useRuntimeConfig();
  const { getStrapiMediaUrl } = useStrapi();

  // Build opening hours spec
  const openingHoursSpec =
    globalSettings?.openingHours?.map((oh) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: oh.days.split("-").map((d) => d.trim()),
      opens: oh.hours.split("-")[0]?.trim(),
      closes: oh.hours.split("-")[1]?.trim(),
    })) || [];

  const schema = {
    "@context": "https://schema.org",
    "@type": ["CafeOrCoffeeShop", "LocalBusiness"],
    "@id": `${config.public.siteUrl}/#localbusiness`,
    name: globalSettings?.siteName || "Carafe Coffee House & Roasters",
    image: globalSettings?.logo
      ? getStrapiMediaUrl(globalSettings.logo)
      : `${config.public.siteUrl}/images/cafe.jpg`,
    url: `${config.public.siteUrl}/visit-cafe`,
    telephone: globalSettings?.contactPhone,
    email: globalSettings?.contactEmail,
    address: globalSettings?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: globalSettings.address.street,
          addressLocality: globalSettings.address.city,
          postalCode: globalSettings.address.postcode,
          addressCountry: globalSettings.address.country || "GB",
        }
      : {
          "@type": "PostalAddress",
          streetAddress: "29 Station Street",
          addressLocality: "Lewes",
          postalCode: "BN7 2DB",
          addressCountry: "GB",
        },
    geo:
      globalSettings?.address?.latitude && globalSettings?.address?.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: globalSettings.address.latitude,
            longitude: globalSettings.address.longitude,
          }
        : undefined,
    openingHoursSpecification: openingHoursSpec,
    servesCuisine: ["Coffee", "Specialty Coffee", "Breakfast", "Brunch"],
    priceRange: "££",
    acceptsReservations: false,
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

/**
 * Generate Product schema
 */
export function useProductSchema(product: Product) {
  const config = useRuntimeConfig();
  const { getStrapiMediaUrl } = useStrapi();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${config.public.siteUrl}/shop-coffee/${product.slug}`,
    name: product.name,
    description: product.shortDescription || product.description,
    image: product.images?.map((img) => getStrapiMediaUrl(img)) || [],
    brand: {
      "@type": "Brand",
      name: product.productSchema?.brand || "Carafe Coffee",
    },
    sku: product.sku,
    gtin: product.productSchema?.gtin,
    mpn: product.productSchema?.mpn,
    offers: {
      "@type": "Offer",
      url: `${config.public.siteUrl}/shop-coffee/${product.slug}`,
      priceCurrency: product.currency,
      price: product.salePrice || product.price,
      availability: `https://schema.org/${
        product.productSchema?.availability ||
        (product.inStock ? "InStock" : "OutOfStock")
      }`,
      seller: {
        "@type": "Organization",
        name: "Carafe Coffee House & Roasters",
      },
    },
    aggregateRating:
      product.productSchema?.reviewCount &&
      product.productSchema?.aggregateRating
        ? {
            "@type": "AggregateRating",
            ratingValue: product.productSchema.aggregateRating,
            reviewCount: product.productSchema.reviewCount,
          }
        : undefined,
    category: product.category?.name,
    weight: product.weight
      ? {
          "@type": "QuantitativeValue",
          value: product.weight,
          unitCode: product.weightUnit === "kg" ? "KGM" : "GRM",
        }
      : undefined,
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

/**
 * Generate Breadcrumb schema
 */
export function useBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
) {
  const config = useRuntimeConfig();

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url ? `${config.public.siteUrl}${item.url}` : undefined,
    })),
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

/**
 * Generate WebPage schema
 */
export function useWebPageSchema(options: {
  name: string;
  description?: string;
  url?: string;
  type?:
    | "WebPage"
    | "AboutPage"
    | "ContactPage"
    | "CollectionPage"
    | "ItemPage";
}) {
  const config = useRuntimeConfig();
  const route = useRoute();

  const schema = {
    "@context": "https://schema.org",
    "@type": options.type || "WebPage",
    name: options.name,
    description: options.description,
    url: options.url || `${config.public.siteUrl}${route.path}`,
    isPartOf: {
      "@id": `${config.public.siteUrl}/#website`,
    },
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

/**
 * Generate FAQ schema
 */
export function useFaqSchema(
  items: Array<{ question: string; answer: string }>
) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  useHead({
    script: [
      {
        type: "application/ld+json",
        innerHTML: JSON.stringify(schema),
      },
    ],
  });

  return schema;
}

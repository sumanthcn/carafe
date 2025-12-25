// Type definitions for Strapi API responses

// SEO Component
export interface StrapiSeo {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: StrapiMedia;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  twitterTitle?: string;
  twitterDescription?: string;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
  noFollow?: boolean;
}

// Media
export interface StrapiMedia {
  id: number;
  url: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
}

export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
}

// CTA Button
export interface CtaButton {
  text: string;
  url?: string;
  style?: "primary" | "secondary" | "outline" | "text";
  icon?: string;
  openInNewTab?: boolean;
}

// Address
export interface Address {
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// Opening Hours
export interface OpeningHours {
  days: string;
  hours: string;
}

// Social Link
export interface SocialLink {
  platform:
    | "instagram"
    | "facebook"
    | "twitter"
    | "tripadvisor"
    | "youtube"
    | "linkedin"
    | "tiktok";
  url: string;
}

// Navigation
export interface NavItem {
  id?: number;
  label: string;
  url: string;
  linkType: "internal" | "external";
  page?: Page | null;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
  children?: NavChild[];
}

export interface NavChild {
  id?: number;
  label: string;
  url: string;
  linkType?: "internal" | "external";
  page?: Page | null;
  order?: number;
  isVisible?: boolean;
  openInNewTab?: boolean;
}

// Feature Item
export interface FeatureItem {
  title: string;
  description?: string;
  icon?: StrapiMedia;
}

// Sections
export interface HeroSection {
  __component: "sections.hero-section";
  headline: string;
  subheadline?: string;
  backgroundImage?: StrapiMedia;
  primaryCta?: CtaButton;
  secondaryCta?: CtaButton;
  alignment?: "left" | "center" | "right";
}

export interface BrandStorySection {
  __component: "sections.brand-story";
  headline?: string;
  content?: string;
  image?: StrapiMedia;
  imagePosition?: "left" | "right";
  cta?: CtaButton;
}

export interface CafeLocationSection {
  __component: "sections.cafe-location";
  headline?: string;
  description?: string;
  backgroundImage?: StrapiMedia;
  cta?: CtaButton;
  features?: FeatureItem[];
}

export interface CultureSection {
  __component: "sections.culture-section";
  headline?: string;
  content?: string;
  image?: StrapiMedia;
  cta?: CtaButton;
}

export interface WholesaleSection {
  __component: "sections.wholesale-section";
  headline?: string;
  content?: string;
  image?: StrapiMedia;
  cta?: CtaButton;
  benefits?: FeatureItem[];
}

export interface NewsletterSection {
  __component: "sections.newsletter-section";
  headline?: string;
  description?: string;
  placeholderText?: string;
  buttonText?: string;
  successMessage?: string;
}

// Product Category
export interface ProductCategory {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: StrapiMedia;
  image?: StrapiMedia;
  displayOrder?: number;
  isActive?: boolean;
  products?: Product[];
  seo?: StrapiSeo;
}

// Product
export interface Product {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  subtitle?: string;
  description?: string;
  shortDescription?: string;
  price: number;
  salePrice?: number;
  currency: "EUR" | "GBP" | "USD";
  sku?: string;
  weight?: number;
  weightUnit?: "g" | "kg";
  stockQuantity?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isTopSeller?: boolean;
  isNewArrival?: boolean;
  isLimitedEdition?: boolean;
  roastDate?: string;
  origin?: string;
  roastLevel?: "light" | "medium-light" | "medium" | "medium-dark" | "dark";
  tastingNotes?: string;
  processingMethod?: string;
  altitude?: string;
  variety?: string;
  images: StrapiMedia[];
  category?: ProductCategory;
  relatedProducts?: Product[];
  seo?: StrapiSeo;
  productSchema?: ProductSchema;
}

export interface ProductSchema {
  brand?: string;
  gtin?: string;
  mpn?: string;
  aggregateRating?: number;
  reviewCount?: number;
  availability?: "InStock" | "OutOfStock" | "PreOrder" | "Discontinued";
}

// Subscription
export interface Subscription {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  frequency: "weekly" | "biweekly" | "monthly";
  pricePerDelivery: number;
  currency: "EUR" | "GBP" | "USD";
  coffeeAmount?: string;
  features?: FeatureItem[];
  image?: StrapiMedia;
  isPopular?: boolean;
  isActive?: boolean;
  displayOrder?: number;
  seo?: StrapiSeo;
}

// Hero Carousel Slide
export interface HeroCarouselSlide {
  headline: string;
  subheadline?: string;
  description?: string;
  backgroundImage?: StrapiMedia;
  buttons?: HeroButton[];
  textPosition?: "left" | "center" | "right";
  overlayOpacity?: number;
}

// Hero Button
export interface HeroButton {
  text: string;
  url?: string;
  variant?: "primary" | "secondary" | "outline";
  icon?: StrapiMedia;
  iconPosition?: "left" | "right";
  openInNewTab?: boolean;
}

// Carousel Settings
export interface CarouselSettings {
  autoplay?: boolean;
  autoplayDelay?: number;
  showNavigation?: boolean;
  showPagination?: boolean;
  loop?: boolean;
  effect?: "slide" | "fade";
  speed?: number;
  pauseOnHover?: boolean;
}

// Homepage
export interface Homepage {
  heroCarousel?: HeroCarouselSlide[];
  carouselSettings?: CarouselSettings;
  tasteTheCraft?: {
    headline?: string;
    description?: string;
    categories?: ProductCategory[];
  };
  brandStory?: BrandStorySection;
  cafeLocation?: CafeLocationSection;
  cultureSection?: BrandStorySection;
  wholesaleSection?: WholesaleSection;
  newsletter?: NewsletterSection;
  seo?: StrapiSeo;
}

// Global Settings
export interface GlobalSettings {
  siteName: string;
  siteDescription?: string;
  logo?: StrapiMedia;
  favicon?: StrapiMedia;
  defaultOgImage?: StrapiMedia;
  address?: Address;
  openingHours?: OpeningHours[];
  socialLinks?: SocialLink[];
  contactEmail?: string;
  contactPhone?: string;
  navigation?: NavItem[];
  defaultSeo?: StrapiSeo;
}

// Page
export interface Page {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content?: Array<HeroSection | TextContent | ImageGallery | CtaSection>;
  featuredImage?: StrapiMedia;
  seo?: StrapiSeo;
}

export interface TextContent {
  __component: "sections.text-content";
  content?: string;
}

export interface ImageGallery {
  __component: "sections.image-gallery";
  headline?: string;
  images?: StrapiMedia[];
  columns?: "2" | "3" | "4";
}

export interface CtaSection {
  __component: "sections.cta-section";
  headline?: string;
  description?: string;
  backgroundImage?: StrapiMedia;
  cta?: CtaButton;
}

// Order
export interface OrderItem {
  productId?: number;
  productName: string;
  productSlug?: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  status:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  total: number;
  currency: "EUR" | "GBP" | "USD";
  paymentMethod?: string;
  paymentId?: string;
  paymentStatus: "pending" | "authorized" | "captured" | "failed" | "refunded";
  worldpayOrderCode?: string;
  notes?: string;
}

// Cart (client-side)
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: "EUR" | "GBP" | "USD";
}

// API Response wrapper
export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

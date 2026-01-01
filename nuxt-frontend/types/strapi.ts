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
  icon?: StrapiMedia;
  iconPosition?: "left" | "right";
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
  platform: "instagram" | "facebook" | "google" | "tripadvisor";
  url: string;
  displayOrder?: number;
}

// Footer Link
export interface FooterLink {
  label: string;
  url: string;
  displayOrder?: number;
  isActive?: boolean;
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

// Shop Settings (Global)
export interface ShopSettings {
  id: number;
  documentId: string;
  returnPolicy: string;
  shippingInfo: string;
  freeShippingThreshold: number;
  standardShippingCost: number;
  currency: "GBP" | "EUR" | "USD";
}

// Product Variant
export interface ProductVariant {
  id: number;
  weight: "250g" | "500g" | "1kg" | "2kg";
  grindSize?: "Espresso" | "Filter" | "Whole Bean" | "Moka Pot" | "Aeropress" | "V60" | "Chemex" | "Cafetiere";
  roastLevel?: "Light" | "Medium-Light" | "Medium";
  price: number;
  salePrice?: number;
  sku: string;
  stockQuantity: number;
  inStock: boolean;
}

// Product Attributes
export interface ProductAttributes {
  id: number;
  taste?: string;
  origin?: string;
  region?: string;
  varietal?: string;
  process?: string;
  altitude?: string;
  bestServed?: string;
}

// Subscription Option
export interface SubscriptionOption {
  id: number;
  deliveryInterval: "1_week" | "2_weeks" | "3_weeks" | "1_month" | "2_months";
  discountPercentage: number;
}

// Customer Review
export interface CustomerReview {
  id: number;
  documentId: string;
  name: string;
  email: string;
  rating: number;
  reviewTitle: string;
  reviewDescription: string;
  images?: StrapiMedia[];
  video?: StrapiMedia;
  product?: Product;
  status: "approved" | "rejected";
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
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
  currency: "EUR" | "GBP" | "USD";
  isTopSeller?: boolean;
  isLimitedEdition?: boolean;
  isWhatsNew?: boolean;
  displayOrder?: number;
  roastDate?: string;
  origin?: string;
  tastingNotes?: string;
  variety?: string;
  images: StrapiMedia[];
  variants?: ProductVariant[];
  attributes?: ProductAttributes;
  subscriptionOptions?: SubscriptionOption[];
  category?: ProductCategory | null;
  relatedProducts?: Product[];
  reviews?: CustomerReview[];
  seo?: StrapiSeo;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
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

// Homepage
export interface Homepage {
  hero?: HeroSection;
  productCategories?: {
    headline?: string;
    description?: string;
    categories?: ProductCategory[];
  };
  brandStory?: BrandStorySection;
  cafeLocation?: CafeLocationSection;
  cultureSection?: CultureSection;
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
  footerLinks?: FooterLink[];
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
  selectedVariant?: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: "EUR" | "GBP" | "USD";
}

// Customer Testimonial
export interface CustomerTestimonial {
  id: number;
  documentId: string;
  reviewerName?: string;
  reviewText: string;
  rating: number;
  reviewerImage?: StrapiMedia | null;
  source: "TripAdvisor" | "Google" | "Manual";
  sourceUrl?: string;
  isFeatured: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

// Visit Cafe Card
export interface VisitCafeCard {
  title: string;
  description: string;
  cta?: CtaButton;
  displayOrder?: number;
}

// Visit Cafe Section
export interface VisitCafeSection {
  __component: "sections.visit-cafe-section";
  title: string;
  subtitle?: string;
  cards?: VisitCafeCard[];
}

// Shop Coffee
export interface ShopCoffee {
  id: number;
  documentId: string;
  visitCafeSection?: VisitCafeSection;
  seo?: StrapiSeo;
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

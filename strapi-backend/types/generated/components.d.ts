import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsAddress extends Struct.ComponentSchema {
  collectionName: 'components_elements_address';
  info: {
    description: 'Physical address';
    displayName: 'Address';
    icon: 'pinMap';
  };
  attributes: {
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    latitude: Schema.Attribute.Decimal;
    longitude: Schema.Attribute.Decimal;
    postcode: Schema.Attribute.String;
    street: Schema.Attribute.String;
  };
}

export interface ElementsCategory extends Struct.ComponentSchema {
  collectionName: 'components_elements_categories';
  info: {
    displayName: 'Category';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    name: Schema.Attribute.String;
  };
}

export interface ElementsCtaButton extends Struct.ComponentSchema {
  collectionName: 'components_elements_cta_button';
  info: {
    description: 'Call to action button';
    displayName: 'CTA Button';
    icon: 'cursor';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    iconPosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    style: Schema.Attribute.Enumeration<
      ['primary', 'secondary', 'outline', 'text']
    > &
      Schema.Attribute.DefaultTo<'primary'>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

export interface ElementsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_faq_item';
  info: {
    description: 'FAQ question and answer';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_feature_item';
  info: {
    description: 'Feature or benefit item';
    displayName: 'Feature Item';
    icon: 'check';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_column';
  info: {
    description: 'Footer link column';
    displayName: 'Footer Column';
    icon: 'layer';
  };
  attributes: {
    links: Schema.Attribute.Component<'elements.nav-child', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsFooterLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_footer_links';
  info: {
    description: 'Footer navigation link';
    displayName: 'Footer Link';
  };
  attributes: {
    displayOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    isActive: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsGettingHereItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_getting_here_items';
  info: {
    description: 'Individual transportation option with icon, name and description';
    displayName: 'Getting Here Item';
  };
  attributes: {
    description: Schema.Attribute.RichText & Schema.Attribute.Required;
    icon: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsNavChild extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_child';
  info: {
    description: 'Child/dropdown navigation item';
    displayName: 'Navigation Child';
    icon: 'link';
  };
  attributes: {
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    linkType: Schema.Attribute.Enumeration<['internal', 'external']> &
      Schema.Attribute.DefaultTo<'internal'>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'/'>;
  };
}

export interface ElementsNavItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_nav_item';
  info: {
    description: 'Navigation menu item for header/footer';
    displayName: 'Navigation Item';
    icon: 'link';
  };
  attributes: {
    children: Schema.Attribute.Component<'elements.nav-child', true>;
    isVisible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    linkType: Schema.Attribute.Enumeration<['internal', 'external']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'internal'>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    order: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    page: Schema.Attribute.Relation<'oneToOne', 'api::page.page'>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'/'>;
  };
}

export interface ElementsOpeningHours extends Struct.ComponentSchema {
  collectionName: 'components_elements_opening_hours';
  info: {
    description: 'Business opening hours';
    displayName: 'Opening Hours';
    icon: 'clock';
  };
  attributes: {
    days: Schema.Attribute.String & Schema.Attribute.Required;
    hours: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsOrderItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_order_item';
  info: {
    description: 'Order line item';
    displayName: 'Order Item';
    icon: 'shoppingCart';
  };
  attributes: {
    productId: Schema.Attribute.Integer;
    productName: Schema.Attribute.String & Schema.Attribute.Required;
    productSlug: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    sku: Schema.Attribute.String;
    totalPrice: Schema.Attribute.Decimal & Schema.Attribute.Required;
    unitPrice: Schema.Attribute.Decimal & Schema.Attribute.Required;
    weight: Schema.Attribute.String;
  };
}

export interface ElementsSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_elements_social_link';
  info: {
    description: 'Social media link';
    displayName: 'Social Link';
    icon: 'link';
  };
  attributes: {
    displayOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    platform: Schema.Attribute.Enumeration<
      ['instagram', 'facebook', 'google', 'tripadvisor']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_elements_team_member';
  info: {
    description: 'Team member profile';
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    bio: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String;
  };
}

export interface ElementsVisitCafeCard extends Struct.ComponentSchema {
  collectionName: 'components_elements_visit_cafe_cards';
  info: {
    description: 'Card for cafe visit section with title, description and CTA button';
    displayName: 'Visit Cafe Card';
  };
  attributes: {
    cta: Schema.Attribute.Component<'elements.cta-button', false>;
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    displayOrder: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProductAttributes extends Struct.ComponentSchema {
  collectionName: 'components_product_attributes';
  info: {
    description: 'Coffee product characteristics';
    displayName: 'Product Attributes';
    icon: 'list';
  };
  attributes: {
    altitude: Schema.Attribute.String;
    bestServed: Schema.Attribute.Text;
    origin: Schema.Attribute.String;
    process: Schema.Attribute.String;
    region: Schema.Attribute.String;
    tastingNotes: Schema.Attribute.Text;
    varietal: Schema.Attribute.String;
  };
}

export interface ProductSubscriptionOption extends Struct.ComponentSchema {
  collectionName: 'components_product_subscription_options';
  info: {
    description: 'Subscription pricing and delivery frequency options';
    displayName: 'Subscription Option';
    icon: 'calendar-check';
  };
  attributes: {
    deliveryInterval: Schema.Attribute.Enumeration<
      ['1_week', '2_weeks', '3_weeks', '1_month', '2_months']
    > &
      Schema.Attribute.Required;
    discountPercentage: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<10>;
  };
}

export interface ProductVariant extends Struct.ComponentSchema {
  collectionName: 'components_product_variants';
  info: {
    description: 'Product variants for weight and grind options';
    displayName: 'Product Variant';
    icon: 'layer-group';
  };
  attributes: {
    grindSize: Schema.Attribute.Enumeration<
      [
        'Espresso',
        'Filter',
        'Whole Bean',
        'Moka Pot',
        'Aeropress',
        'V60',
        'Chemex',
        'Cafetiere',
      ]
    >;
    inStock: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    price: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    roastLevel: Schema.Attribute.Enumeration<
      ['Light', 'Medium-Light', 'Medium']
    >;
    salePrice: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    sku: Schema.Attribute.String & Schema.Attribute.Required;
    stockQuantity: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    weight: Schema.Attribute.Enumeration<['250g', '500g', '1kg', '2kg']> &
      Schema.Attribute.Required;
  };
}

export interface SectionsBrandStory extends Struct.ComponentSchema {
  collectionName: 'components_sections_brand_story';
  info: {
    description: 'Brand story/about section';
    displayName: 'Text with Image';
    icon: 'book';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    cta: Schema.Attribute.Component<'elements.cta-button', false>;
    headline: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
  };
}

export interface SectionsCafeLocation extends Struct.ComponentSchema {
  collectionName: 'components_sections_cafe_location';
  info: {
    description: 'Caf\u00E9 location and visit CTA';
    displayName: 'Text with BG Image';
    icon: 'pinMap';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    cta: Schema.Attribute.Component<'elements.cta-button', false>;
    description: Schema.Attribute.Text;
    headline: Schema.Attribute.String;
  };
}

export interface SectionsContactSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_contact_section';
  info: {
    description: 'Contact information section';
    displayName: 'Contact Section';
    icon: 'phone';
  };
  attributes: {
    description: Schema.Attribute.Text;
    headline: Schema.Attribute.String;
    mapEmbed: Schema.Attribute.Text;
    showContactForm: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
  };
}

export interface SectionsFaqSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_faq_section';
  info: {
    description: 'FAQ accordion section';
    displayName: 'FAQ Section';
    icon: 'question';
  };
  attributes: {
    headline: Schema.Attribute.String;
    items: Schema.Attribute.Component<'elements.faq-item', true>;
  };
}

export interface SectionsFooterSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_footer_section';
  info: {
    description: 'Footer configuration';
    displayName: 'Footer Section';
    icon: 'layer';
  };
  attributes: {
    copyrightText: Schema.Attribute.String;
    footerLinks: Schema.Attribute.Component<'elements.footer-column', true>;
  };
}

export interface SectionsGettingHere extends Struct.ComponentSchema {
  collectionName: 'components_sections_getting_heres';
  info: {
    description: 'Getting here section with different transportation options';
    displayName: 'Getting Here';
  };
  attributes: {
    items: Schema.Attribute.Component<'elements.getting-here-item', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'GETTING HERE'>;
  };
}

export interface SectionsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_section';
  info: {
    description: 'Hero banner section';
    displayName: 'Hero Section';
    icon: 'picture';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    backgroundImage: Schema.Attribute.Media<'images'>;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    overlayImage: Schema.Attribute.Media<'images'>;
    primaryCta: Schema.Attribute.Component<'elements.cta-button', false>;
    secondaryCta: Schema.Attribute.Component<'elements.cta-button', false>;
    subheadline: Schema.Attribute.Text;
  };
}

export interface SectionsHeroSlide extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_slides';
  info: {
    description: 'Carousel slide for homepage hero';
    displayName: 'Hero Slide';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    buttons: Schema.Attribute.Component<'shared.button', true>;
    description: Schema.Attribute.Text;
    headline: Schema.Attribute.String & Schema.Attribute.Required;
    subheadline: Schema.Attribute.String;
    textPosition: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
  };
}

export interface SectionsImageGallery extends Struct.ComponentSchema {
  collectionName: 'components_sections_image_gallery';
  info: {
    description: 'Image gallery section';
    displayName: 'Image Gallery';
    icon: 'landscape';
  };
  attributes: {
    columns: Schema.Attribute.Enumeration<['2', '3', '4']> &
      Schema.Attribute.DefaultTo<'3'>;
    headline: Schema.Attribute.String;
    images: Schema.Attribute.Media<'images', true>;
  };
}

export interface SectionsOpeningHoursWithImage extends Struct.ComponentSchema {
  collectionName: 'components_sections_opening_hours_with_images';
  info: {
    description: 'Opening hours section with background image';
    displayName: 'Opening Hours with Image';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'>;
    mondayToSaturday: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'7:00am \u2013 6:00pm'>;
    sunday: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'8:00am \u2013 4:00pm'>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'OPENING HOURS'>;
  };
}

export interface SectionsProductCategories extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_categories';
  info: {
    description: 'Product categories display section';
    displayName: 'Product Categories Section';
    icon: 'grid';
  };
  attributes: {
    categories: Schema.Attribute.Component<'elements.category', true>;
    description: Schema.Attribute.Text;
    headline: Schema.Attribute.String;
  };
}

export interface SectionsTeamSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_team_section';
  info: {
    description: 'Team members section';
    displayName: 'Team Section';
    icon: 'user';
  };
  attributes: {
    headline: Schema.Attribute.String;
    members: Schema.Attribute.Component<'elements.team-member', true>;
  };
}

export interface SectionsTextContent extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_content';
  info: {
    description: 'Rich text content section';
    displayName: 'Text Content';
    icon: 'file';
  };
  attributes: {
    content: Schema.Attribute.RichText;
  };
}

export interface SectionsTextImages extends Struct.ComponentSchema {
  collectionName: 'components_sections_text_images';
  info: {
    displayName: 'Text Images';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    cta: Schema.Attribute.Component<'elements.cta-button', false>;
    headline: Schema.Attribute.String;
    imagePosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'right'>;
    images: Schema.Attribute.Media<'images' | 'files', true> &
      Schema.Attribute.Required;
  };
}

export interface SectionsVisitCafeBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_visit_cafe_banners';
  info: {
    description: 'Banner section for visit cafe page with background image, title, subtitle and description';
    displayName: 'Page Banner Section';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    description: Schema.Attribute.RichText;
    descriptionTitle: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsVisitCafeSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_visit_cafe_sections';
  info: {
    description: 'Section promoting cafe visits with image strip and cards';
    displayName: 'Visit Cafe Section';
  };
  attributes: {
    cards: Schema.Attribute.Component<'elements.visit-cafe-card', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Visit Our Lewes Caf\u00E9'>;
  };
}

export interface SectionsWholesaleSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_wholesale_section';
  info: {
    description: 'B2B wholesale CTA section';
    displayName: 'Text with Image (Absolute Right)';
    icon: 'briefcase';
  };
  attributes: {
    benefits: Schema.Attribute.Component<'elements.feature-item', true>;
    content: Schema.Attribute.RichText;
    cta: Schema.Attribute.Component<'elements.cta-button', false>;
    headline: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    description: 'Call-to-action button';
    displayName: 'Button';
  };
  attributes: {
    icon: Schema.Attribute.Media<'images'>;
    iconPosition: Schema.Attribute.Enumeration<['left', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    text: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.DefaultTo<'primary'>;
  };
}

export interface SharedCarouselSettings extends Struct.ComponentSchema {
  collectionName: 'components_shared_carousel_settings';
  info: {
    description: 'Configuration for carousel behavior and appearance';
    displayName: 'Carousel Settings';
  };
  attributes: {
    autoplay: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    autoplayDelay: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 30000;
          min: 1000;
        },
        number
      > &
      Schema.Attribute.DefaultTo<5000>;
    effect: Schema.Attribute.Enumeration<['fade', 'slide']> &
      Schema.Attribute.DefaultTo<'fade'>;
    loop: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    pauseOnHover: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showNavigation: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showPagination: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    speed: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 3000;
          min: 300;
        },
        number
      > &
      Schema.Attribute.DefaultTo<600>;
  };
}

export interface SharedProductSchema extends Struct.ComponentSchema {
  collectionName: 'components_shared_product_schema';
  info: {
    description: 'Product structured data for SEO';
    displayName: 'Product Schema';
    icon: 'code';
  };
  attributes: {
    aggregateRating: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    availability: Schema.Attribute.Enumeration<
      ['InStock', 'OutOfStock', 'PreOrder', 'Discontinued']
    > &
      Schema.Attribute.DefaultTo<'InStock'>;
    brand: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Carafe Coffee'>;
    gtin: Schema.Attribute.String;
    mpn: Schema.Attribute.String;
    reviewCount: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seo';
  info: {
    description: 'SEO metadata component';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    noFollow: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    ogDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    ogImage: Schema.Attribute.Media<'images'>;
    ogTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
    ogType: Schema.Attribute.Enumeration<['website', 'article', 'product']> &
      Schema.Attribute.DefaultTo<'website'>;
    structuredData: Schema.Attribute.JSON;
    twitterCard: Schema.Attribute.Enumeration<
      ['summary', 'summary_large_image']
    > &
      Schema.Attribute.DefaultTo<'summary_large_image'>;
    twitterDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    twitterTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 70;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'elements.address': ElementsAddress;
      'elements.category': ElementsCategory;
      'elements.cta-button': ElementsCtaButton;
      'elements.faq-item': ElementsFaqItem;
      'elements.feature-item': ElementsFeatureItem;
      'elements.footer-column': ElementsFooterColumn;
      'elements.footer-link': ElementsFooterLink;
      'elements.getting-here-item': ElementsGettingHereItem;
      'elements.nav-child': ElementsNavChild;
      'elements.nav-item': ElementsNavItem;
      'elements.opening-hours': ElementsOpeningHours;
      'elements.order-item': ElementsOrderItem;
      'elements.social-link': ElementsSocialLink;
      'elements.team-member': ElementsTeamMember;
      'elements.visit-cafe-card': ElementsVisitCafeCard;
      'product.attributes': ProductAttributes;
      'product.subscription-option': ProductSubscriptionOption;
      'product.variant': ProductVariant;
      'sections.brand-story': SectionsBrandStory;
      'sections.cafe-location': SectionsCafeLocation;
      'sections.contact-section': SectionsContactSection;
      'sections.faq-section': SectionsFaqSection;
      'sections.footer-section': SectionsFooterSection;
      'sections.getting-here': SectionsGettingHere;
      'sections.hero-section': SectionsHeroSection;
      'sections.hero-slide': SectionsHeroSlide;
      'sections.image-gallery': SectionsImageGallery;
      'sections.opening-hours-with-image': SectionsOpeningHoursWithImage;
      'sections.product-categories': SectionsProductCategories;
      'sections.team-section': SectionsTeamSection;
      'sections.text-content': SectionsTextContent;
      'sections.text-images': SectionsTextImages;
      'sections.visit-cafe-banner': SectionsVisitCafeBanner;
      'sections.visit-cafe-section': SectionsVisitCafeSection;
      'sections.wholesale-section': SectionsWholesaleSection;
      'shared.button': SharedButton;
      'shared.carousel-settings': SharedCarouselSettings;
      'shared.product-schema': SharedProductSchema;
      'shared.seo': SharedSeo;
    }
  }
}

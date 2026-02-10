<template>
  <div class="product-details-page">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading product...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <h2>Product Not Found</h2>
      <p>{{ error }}</p>
      <NuxtLink to="/shop-coffee" class="btn btn-primary">Back to Shop</NuxtLink>
    </div>

    <div v-else-if="product" class="product-content">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <ol class="breadcrumb__list">
            <li class="breadcrumb__item">
              <NuxtLink to="/">HOME</NuxtLink>
            </li>
            <li class="breadcrumb__separator">/</li>
            <li>
              <NuxtLink to="/shop-coffee">Shop Coffee</NuxtLink>
            </li>
            <li class="breadcrumb__separator">/</li>
            <li class="breadcrumb__item breadcrumb__item--active" aria-current="page">
              {{ product.name }}
            </li>
          </ol>
        </nav>
      </div>
      <section class="product-hero">
        <div class="container">
          <div class="product-hero-grid">
            <div class="product-images">
              <div class="main-image">
                <img :src="selectedImage.url" :alt="selectedImage.alternativeText || product.name" />
              </div>
              <div v-if="product.images.length > 1" class="thumbnail-gallery">
                <button v-for="(image, index) in product.images" :key="index" class="thumbnail"
                  :class="{ active: selectedImageIndex === index }" @click="selectedImageIndex = index">
                  <img :src="getThumbnailUrl(image)"
                    :alt="image.alternativeText" />
                </button>
              </div>
            </div>

            <div class="product-info">
              <!-- SECTION 1: REVIEW SUMMARY -->
              <div class="review-summary">
                <NuxtRating :rating-value="reviewStats.averageRating" :read-only="true" :rating-size="24"
                  :rating-count="5" active-color="#007ba7" inactive-color="#fff" border-color="#007ba7"
                  :border-width="2" :rating-spacing="5" />
                <button class="review-link" @click="scrollToReviews">
                  {{ reviewStats.totalReviews }} {{ reviewStats.totalReviews === 1 ? 'REVIEW' :
                    'REVIEWS' }}
                </button>
              </div>

              <!-- SECTION 2: PRODUCT CORE INFO -->
              <h1 class="product-title">{{ product.name }}</h1>
              <p v-if="product.subtitle" class="product-subtitle">{{ product.subtitle }}</p>
              <p v-if="product.tastingNotes" class="product-tasting-notes">
                <strong>Tasting Notes:</strong> {{ product.tastingNotes }}
              </p>

              <!-- Price Block -->
              <div v-if="!product.variants || product.variants.length === 0" class="product-pricing">
                <div class="price-group">
                  <span class="current-price">€0.00</span>
                </div>
                <p class="no-variants-message">Please add product variants in admin</p>
              </div>

              <!-- Product Variant Selector -->
              <VariantSelector
                v-if="product.variants && product.variants.length > 0"
                :variants="product.variants"
                :currency="product.currency"
                @variant-selected="handleVariantSelected"
              />

              <!-- CTA Buttons -->
              <div class="product-actions">
                <button class="btn btn-outline" @click="handleAddToCart" :disabled="!canAddToCart || isAddingToCart">
                  {{ isAddingToCart ? 'ADDING...' : (canAddToCart ? 'ADD TO CART' : 'OUT OF STOCK')
                  }}
                </button>
                <button class="btn btn-primary" @click="handleBuyNow" :disabled="!canAddToCart || isBuyingNow">
                  {{ isBuyingNow ? 'PROCESSING...' : 'BUY NOW' }}
                </button>
              </div>

              <!-- SECTION 3: SOCIAL SHARE ICONS -->
              <div class="social-share">
                <a :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`"
                  target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" class="social-icon">
                  <FontAwesomeIcon :icon="['fab', 'facebook']" />
                </a>
                <a :href="`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(product.name)}`"
                  target="_blank" rel="noopener noreferrer" aria-label="Share on Pinterest" class="social-icon">
                  <FontAwesomeIcon :icon="['fab', 'pinterest']" />
                </a>
                <a :href="`https://wa.me/?text=${encodeURIComponent(productUrl)}`" target="_blank"
                  rel="noopener noreferrer" aria-label="Share on WhatsApp" class="social-icon">
                  <FontAwesomeIcon :icon="['fab', 'whatsapp']" />
                </a>
                <a :href="`https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(product.name)}`"
                  target="_blank" rel="noopener noreferrer" aria-label="Share on X (Twitter)" class="social-icon">
                  <FontAwesomeIcon :icon="['fab', 'x-twitter']" />
                </a>
              </div>

              <!-- SECTION 4: PRODUCT INFO ACCORDION -->
              <div class="product-accordion">
                <!-- Product Info -->
                <div class="accordion-item" :class="{ active: activeAccordion === 'info' }">
                  <button class="accordion-header" @click="toggleAccordion('info')"
                    :aria-expanded="activeAccordion === 'info'">
                    <span>PRODUCT INFO</span>
                    <span class="icon">{{ activeAccordion === 'info' ? '−' : '+' }}</span>
                  </button>
                  <transition name="accordion">
                    <div v-show="activeAccordion === 'info'" class="accordion-content">
                      <div v-if="product.description" v-html="product.description"></div>
                      <div v-else-if="product.shortDescription">
                        <p>{{ product.shortDescription }}</p>
                      </div>
                      
                      <!-- Coffee Details/Attributes -->
                      <div v-if="product.attributes" class="coffee-details">
                        <ProductAttributes :attributes="product.attributes" />
                      </div>
                      
                    </div>
                  </transition>
                </div>

                <!-- Shipping Info -->
                <div class="accordion-item" :class="{ active: activeAccordion === 'shipping' }">
                  <button class="accordion-header" @click="toggleAccordion('shipping')"
                    :aria-expanded="activeAccordion === 'shipping'">
                    <span style="text-transform: uppercase;">Delivery & Shipping Information</span>
                    <span class="icon">{{ activeAccordion === 'shipping' ? '−' : '+' }}</span>
                  </button>
                  <transition name="accordion">
                    <div v-show="activeAccordion === 'shipping'" class="accordion-content">
                      <div v-if="shopSettings.shippingInfo" v-html="parseShippingInfo"></div>
                      <div v-else>
                        <p>Free shipping on orders over €50. Standard delivery takes 3-5
                          business days. Express shipping available at checkout.</p>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products Section -->
      <RelatedProducts v-if="product.relatedProducts && product.relatedProducts.length > 0" :products="product.relatedProducts" />


      <!-- Customer Reviews Section -->
      <section id="reviews">
        <CustomerReviews 
          v-if="product.documentId"
          :product-id="product.documentId"
          :initial-count="2"
          :load-more-count="3"
          :show-view-all="false"
        />
      </section>

      <VisitCafeSection v-if="shopCoffeeData?.visitCafeSection" :section="shopCoffeeData.visitCafeSection" />
      <EmailSubscribe />
    </div>
  </div>

  <!-- Checkout Modal -->
  <Transition name="fade">
    <div
      v-if="showCheckoutModal"
      class="checkout-modal-overlay"
      @click="closeModal"
    >
      <div class="checkout-modal" @click.stop>
        <button
          class="checkout-modal__close"
          aria-label="Close"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="checkout-modal__content">
          <h3 class="checkout-modal__title">How would you like to checkout?</h3>
          <p class="checkout-modal__description">
            You're not logged in. Would you like to create an account for faster checkout and order tracking, or continue as a guest?
          </p>

          <div class="checkout-modal__actions">
            <button
              class="btn btn--primary btn--full"
              @click="goToLogin"
            >
              Login to Your Account
            </button>
            
            <button
              class="btn btn--secondary btn--full"
              @click="goToSignup"
            >
              Create New Account
            </button>

            <button
              class="btn btn--outline btn--full"
              @click="continueAsGuest"
            >
              Continue as Guest
            </button>
          </div>

          <p class="checkout-modal__note">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            Creating an account allows you to track orders and save addresses for faster checkout.
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Product, ProductVariant } from "~/types/strapi";
import type { ReviewStats } from "~/composables/useProductReviews";
import RelatedProducts from "~/components/shop/RelatedProducts.vue";
import CustomerReviews from "~/components/product/CustomerReviews.vue";
import VariantSelector from "~/components/product/VariantSelector.vue";
import ProductAttributes from "~/components/product/ProductAttributes.vue";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const config = useRuntimeConfig();
const { parseMarkdown } = useMarkdown(); 
const { isAuthenticated } = useAuth();

const { fetchProductBySlug } = useProducts();
const { fetchShopCoffeeData } = useShopCoffee();
const { fetchReviewsByProduct } = useProductReviews();
const { settings: shopSettings, fetchShopSettings } = useShopSettings();
const { getStrapiMediaUrl } = useStrapi();
const strapiUrl = config.public.strapiUrl;

// State
const product = ref<Product | null>(null);
const shopCoffeeData = ref<any>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedImageIndex = ref(0);
const activeAccordion = ref<string | null>('info');
const isAddingToCart = ref(false);
const isBuyingNow = ref(false);
const selectedVariant = ref<ProductVariant | null>(null);
const selectedQuantity = ref(1);
const showCheckoutModal = ref(false);

// Reviews
const reviewStats = ref<ReviewStats>({
  averageRating: 0,
  totalReviews: 0,
  ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
});

// Computed

// Parse markdown description
const parseShippingInfo = computed(() => {
  if (!shopSettings.value.shippingInfo) return '';
  return parseMarkdown(shopSettings.value.shippingInfo);
});
const productUrl = computed(() => {
  if (!product.value) return '';
  return `${config.public.siteUrl || 'https://carafe.coffee'}/shop-coffee/${product.value.slug}`;
});

const selectedImage = computed(() => {
  if (product.value && product.value.images[selectedImageIndex.value]) {
    const img = product.value.images[selectedImageIndex.value];
    return {
      url: getStrapiMediaUrl(img),
      alternativeText: img.alternativeText || product.value.name
    };
  }
  return { url: '', alternativeText: '' };
});

// Helper function to get thumbnail URL
function getThumbnailUrl(image: any) {
  if (image.formats?.thumbnail?.url) {
    // Check if thumbnail URL is absolute (Cloudinary)
    if (image.formats.thumbnail.url.startsWith('http')) {
      return image.formats.thumbnail.url;
    }
    return `${strapiUrl}${image.formats.thumbnail.url}`;
  }
  // Fallback to main image
  return getStrapiMediaUrl(image);
}

const canAddToCart = computed(() => {
  // If product has variants, check if a variant is selected and in stock
  if (product.value?.variants && product.value.variants.length > 0) {
    return selectedVariant.value?.inStock && (selectedVariant.value?.stockQuantity ?? 0) > 0;
  }
  // For products without variants, not available (admin should add variants)
  return false;
});

// Utility functions
function calculateDiscount(originalPrice: number, salePrice?: number): number {
  if (!salePrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function scrollToReviews() {
  const reviewsSection = document.getElementById('reviews');
  if (reviewsSection) {
    reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Data loading
async function loadProduct() {
  try {
    loading.value = true;
    error.value = null;
    const slug = route.params.slug as string;
    product.value = await fetchProductBySlug(slug);

    // Fetch reviews using documentId
    if (product.value?.documentId) {
      const reviewData = await fetchReviewsByProduct(product.value.documentId);
      reviewStats.value = {
        averageRating: reviewData.stats.averageRating,
        totalReviews: reviewData.stats.totalReviews,
        ratingDistribution: {
          5: reviewData.stats.ratingDistribution['5'] || 0,
          4: reviewData.stats.ratingDistribution['4'] || 0,
          3: reviewData.stats.ratingDistribution['3'] || 0,
          2: reviewData.stats.ratingDistribution['2'] || 0,
          1: reviewData.stats.ratingDistribution['1'] || 0,
        }
      };
    }

    // Fetch shop settings for return/shipping policies
    await fetchShopSettings();

    // Try to fetch shop coffee data, but don't fail if it's not available
    try {
      shopCoffeeData.value = await fetchShopCoffeeData();
    } catch (e) {
      console.warn('Shop coffee data not available:', e);
      shopCoffeeData.value = null;
    }
  } catch (e: any) {
    error.value = e.message || "Failed to load product";
  } finally {
    loading.value = false;
  }
}

function toggleAccordion(section: string) {
  activeAccordion.value = activeAccordion.value === section ? null : section;
}

function handleVariantSelected(variant: ProductVariant | null, quantity: number) {
  selectedVariant.value = variant;
  selectedQuantity.value = quantity;
}

async function handleAddToCart() {
  if (product.value && !isAddingToCart.value && canAddToCart.value) {
    isAddingToCart.value = true;
    try {
      // If product has variants, require a variant selection
      if (product.value.variants && product.value.variants.length > 0) {
        if (!selectedVariant.value) {
          alert('Please select product options');
          return;
        }
        cartStore.addItem(product.value, selectedQuantity.value, selectedVariant.value);
      } else {
        cartStore.addItem(product.value, selectedQuantity.value);
      }
      // Optional: Add success toast/notification here
    } finally {
      setTimeout(() => {
        isAddingToCart.value = false;
      }, 500);
    }
  }
}

async function handleBuyNow() {
  if (product.value && !isBuyingNow.value && canAddToCart.value) {
    isBuyingNow.value = true;
    try {
      // If product has variants, require a variant selection
      if (product.value.variants && product.value.variants.length > 0) {
        if (!selectedVariant.value) {
          alert('Please select product options');
          isBuyingNow.value = false;
          return;
        }
        cartStore.addItem(product.value, selectedQuantity.value, selectedVariant.value);
      } else {
        cartStore.addItem(product.value, selectedQuantity.value);
      }
      
      // Check authentication before proceeding to checkout
      if (!isAuthenticated.value) {
        // User is not logged in, show modal
        showCheckoutModal.value = true;
        isBuyingNow.value = false;
        return;
      }
      
      // User is logged in, proceed to checkout
      await router.push('/checkout');
    } finally {
      isBuyingNow.value = false;
    }
  }
}

// Modal handlers
const closeModal = () => {
  showCheckoutModal.value = false;
};

const continueAsGuest = () => {
  showCheckoutModal.value = false;
  router.push('/checkout');
};

const goToLogin = () => {
  showCheckoutModal.value = false;
  router.push('/login?redirect=/checkout');
};

const goToSignup = () => {
  showCheckoutModal.value = false;
  router.push('/signup?redirect=/checkout');
};

onMounted(() => {
  loadProduct();
});

watch(() => route.params.slug, () => {
  if (route.params.slug) {
    loadProduct();
  }
});

useHead(() => {
  if (!product.value) return {};
  const title = product.value.seo?.metaTitle || `${product.value.name} - Carafe Coffee`;
  const description = product.value.seo?.metaDescription || product.value.shortDescription || '';
  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'product' },
    ],
  };
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.product-details-page {
  padding-top: 80px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: $color-primary;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

// Breadcrumb
.breadcrumb {
  font-family: $font-body;
  font-size: $font-size-lg;
  padding: 1.5rem 0;
}

.breadcrumb__list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  font-size: 0.875rem;
  color: #666;
}

.breadcrumb__item {
  a {
    color: $color-text;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: $color-primary-light;
    }
  }

  &--active {
    color: $color-primary-dark;
    font-weight: 500;
  }
}

.breadcrumb__separator {
  color: $color-text;
}

.product-hero {
  padding: 3rem 0;

  .product-hero-grid {
    display: grid;
    grid-template-columns: 0.5fr 1fr;
    gap: 2rem;
    align-items: start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.product-images {
  position: sticky;
  top: 2rem;
  align-self: start;
  
  .main-image {
    width: 100%;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  .thumbnail-gallery {
    display: flex;
    gap: 1rem;

    .thumbnail {
      width: 80px;
      height: 80px;
      border: 2px solid transparent;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      background: #f8f8f8;

      &.active {
        border-color: $color-primary;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

.product-info {

  // SECTION 1: REVIEW SUMMARY
  .review-summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;

    .review-link {
      font-family: $font-heading;
      font-size: $font-size-lg;
      background: none;
      border: none;
      color: $color-text;
      font-weight: bold;
      cursor: pointer;
      text-transform: uppercase;
      transition: color 0.2s;

      &:hover {
        color: darken($color-primary, 10%);
      }
    }
  }

  // SECTION 2: PRODUCT CORE INFO
  .product-title {
    font-size: $font-size-4xl;
    font-weight: bold;
    color: $color-text;
    margin-bottom: 0.5rem;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .product-subtitle {
    font-size: $font-size-lg;
    font-weight: bold;
    text-transform: uppercase;
    color: $color-text;
    margin-bottom: 1rem;
  }

  .product-tasting-notes {
    font-size: 1rem;
    line-height: 1.6;
    color: $color-text;
    margin-bottom: 2rem;

    strong {
      color: $color-text;
    }
  }

  // Price Block
  .product-pricing {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin-bottom: 2rem;

    .price-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .original-price {
      font-size: $font-size-2xl;
      color: $color-text;
      font-weight: 100;
      text-decoration: line-through;
    }

    .current-price {
      font-size: $font-size-2xl;
      font-weight: bold;
      color: $color-text;
    }

    .discount-badge {
      padding: 0.5rem 1rem;
      background: $color-gray-300;
      color: $color-text;
      border-radius: 50px;
      font-size: 0.875rem;
      font-weight: 700;
      text-transform: uppercase;
    }
  }

  // CTA Buttons
  .product-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;

    .btn {
      flex: 1;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      font-weight: 600;
      text-transform: uppercase;
      border-radius: 50px;
      max-width: 250px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .btn-outline {
      background: white;
      color: $color-text;
      border: 1px solid $color-text;

      &:hover:not(:disabled) {
        background: #333;
        color: white;
      }
    }

    .btn-primary {
      background: $color-primary;
      color: white;
      border: 2px solid $color-primary;

      &:hover:not(:disabled) {
        background: darken($color-primary, 10%);
        border-color: darken($color-primary, 10%);
      }
    }
  }

  // SECTION 3: SOCIAL SHARE
  .social-share {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;

    .social-icon {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f5f5f5;
      color: #333;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 1.25rem;

      &:hover {
        background: #333;
        color: white;
        transform: translateY(-2px);
      }
    }
  }
}

// SECTION 4: PRODUCT INFO ACCORDION
.product-accordion {
  padding: 3rem 0;
  background: #fff;

  .container {
    max-width: 1200px;
  }

  .accordion-item {
    background: white;
    border-bottom: 1px solid $color-text;
    margin-bottom: 0;
    transition: all 0.3s ease;
    color: $color-text;

    .accordion-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem 1.5rem 0;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: background 0.3s ease;

      .icon {
        font-size: 1.5rem;
        font-weight: 300;
        transition: transform 0.3s ease;
      }
    }

    .accordion-content {
      padding: 0 2rem 2rem 0;
      line-height: 1.4;
      font-family: $font-body;
      font-weight: 500;
      color: $color-text;
      font-size: $font-size-base;

      p {
        margin-bottom: 1rem;
      }

      a {
        color: $color-primary-light;
        text-decoration: underline;
        transition: color 0.2s ease;

        &:hover {
          color: darken($color-primary-light, 10%);
        }
      }

      :deep(a) {
        color: $color-primary-light;
        text-decoration: underline;
        transition: color 0.2s ease;

        &:hover {
          color: darken($color-primary-light, 10%);
        }
      }

      .coffee-details {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e5e7eb;

        .details-title {
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1.5rem;
          color: $color-text;
        }
      }

    }
  }
}

// Reviews Section
.reviews-section {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

// Accordion animation
.accordion-enter-active,
.accordion-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

// Checkout Modal
.checkout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.checkout-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

  &__close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: #666;
    transition: color 0.2s;

    &:hover {
      color: #000;
    }
  }

  &__content {
    padding: 2.5rem;
  }

  &__title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
    color: #333;
  }

  &__description {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  &__note {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;

    svg {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }
  }

  .btn {
    &--full {
      width: 100%;
      justify-content: center;
    }
  }
}

// Fade transition for modal
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

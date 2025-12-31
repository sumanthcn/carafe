<template>
  <section class="whats-new">
    <div class="container">
      <div class="whats-new__header">
        <h2 class="whats-new__title">WHAT'S NEW</h2>
        <div class="whats-new__nav">
          <button
            class="nav-button nav-button--prev"
            @click="slidePrev"
            :disabled="isBeginning"
            aria-label="Previous product"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
          </button>
          <button
            class="nav-button nav-button--next"
            @click="slideNext"
            :disabled="isEnd"
            aria-label="Next product"
          >
            <FontAwesomeIcon :icon="['fas', 'arrow-right']" />
          </button>
        </div>
      </div>

      <div class="whats-new__carousel" ref="carouselRef">
        <Swiper
          :modules="[SwiperNavigation]"
          :slides-per-view="1"
          :space-between="30"
          :breakpoints="{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 1 },
          }"
          @swiper="onSwiper"
          @slide-change="onSlideChange"
          class="whats-new__swiper"
        >
          <SwiperSlide
            v-for="product in products"
            :key="product.id"
            class="whats-new__slide"
          >
            <div class="product-showcase">
              <!-- Product Image -->
              <div class="product-showcase__image">
                <img
                  v-if="product.images && product.images.length > 0"
                  :src="`${strapiUrl}${product.images[0].url}`"
                  :alt="product.images[0].alternativeText || product.name"
                  loading="lazy"
                />
              </div>

              <!-- Product Details -->
              <div class="product-showcase__content">
                <span class="product-showcase__badge">LIMITED EDITION</span>
                <h3 class="product-showcase__name">{{ product.name }}</h3>
                <p class="product-showcase__subtitle">
                  {{ product.shortDescription || "Not Proivded in Admin" }}
                </p>

                <p v-if="product.tastingNotes" class="product-showcase__notes">
                  <strong>Tasting Notes:</strong> {{ product.tastingNotes }}
                </p>

                <div class="product-showcase__footer">
                  <div class="product-showcase__price">
                    {{ getProductPrice(product) }}
                  </div>
                  <button
                    @click="handleAddToCart(product)"
                    class="btn-add"
                    :disabled="
                      !hasStock(product) || addingProductId === product.id
                    "
                  >
                    {{
                      addingProductId === product.id
                        ? "ADDING..."
                        : "ADD TO CART"
                    }}
                  </button>
                </div>

                <!-- Social Share -->
                <div class="product-showcase__social">
                  <a
                    :href="`https://www.facebook.com/sharer/sharer.php?u=${shareUrl(
                      product
                    )}`"
                    target="_blank"
                    rel="noopener"
                    aria-label="Share on Facebook"
                  >
                    <FontAwesomeIcon :icon="['fab', 'facebook']" />
                  </a>
                  <a
                    :href="`https://pinterest.com/pin/create/button/?url=${shareUrl(
                      product
                    )}`"
                    target="_blank"
                    rel="noopener"
                    aria-label="Share on Pinterest"
                  >
                    <FontAwesomeIcon :icon="['fab', 'pinterest']" />
                  </a>
                  <a
                    :href="`https://wa.me/?text=${shareUrl(product)}`"
                    target="_blank"
                    rel="noopener"
                    aria-label="Share on WhatsApp"
                  >
                    <FontAwesomeIcon :icon="['fab', 'whatsapp']" />
                  </a>
                  <a
                    href="https://twitter.com/share"
                    target="_blank"
                    rel="noopener"
                    aria-label="Share on Twitter"
                  >
                    <FontAwesomeIcon :icon="['fab', 'twitter']" />
                  </a>
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation as SwiperNavigation } from "swiper/modules";
import type { Product } from "~/types/strapi";
import "swiper/css";

interface WhatsNewCarouselProps {
  products: Product[];
}

const props = defineProps<WhatsNewCarouselProps>();

const config = useRuntimeConfig();
const strapiUrl = config.public.strapiUrl;
const cartStore = useCartStore();
const toast = useToast();

const swiperInstance = ref<any>(null);
const isBeginning = ref(true);
const isEnd = ref(false);
const addingProductId = ref<number | null>(null);

function onSwiper(swiper: any) {
  swiperInstance.value = swiper;
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
}

function onSlideChange(swiper: any) {
  isBeginning.value = swiper.isBeginning;
  isEnd.value = swiper.isEnd;
}

function slidePrev() {
  swiperInstance.value?.slidePrev();
}

function slideNext() {
  swiperInstance.value?.slideNext();
}

function shareUrl(product: Product) {
  const baseUrl = config.public.siteUrl || "https://carafe.coffee";
  return encodeURIComponent(`${baseUrl}/shop-coffee/${product.slug}`);
}

// Check if product has any variant in stock
function hasStock(product: Product): boolean {
  if (!product.variants || product.variants.length === 0) {
    return false;
  }
  return product.variants.some(v => v.inStock && v.stockQuantity > 0);
}

// Get price display for product
function getProductPrice(product: Product): string {
  const variants = product.variants || [];
  
  if (variants.length === 0) {
    return '€0.00';
  }

  const prices = variants.map(v => v.salePrice || v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const currency = product.currency || 'EUR';
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';

  if (minPrice === maxPrice) {
    return `${symbol}${minPrice.toFixed(2)}`;
  }

  return `From ${symbol}${minPrice.toFixed(2)}`;
}

async function handleAddToCart(product: Product) {
  if (!hasStock(product)) {
    toast.add({
      title: "Out of Stock",
      description: "This product is currently unavailable",
      color: "red",
      icon: "i-heroicons-exclamation-circle",
    });
    return;
  }

  // Navigate to product page for variant selection
  navigateTo(`/shop-coffee/${product.slug}`);
}
</script>

<style lang="scss" scoped>
.whats-new {
  padding: 2rem 0;
  background: $color-background-alt;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.whats-new__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.whats-new__title {
  font-family: $font-family-heading;
  font-size: $font-size-3xl;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-text;
}

.whats-new__nav {
  display: flex;
  gap: 0.25rem;
}

.nav-button {
  width: 60px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid $color-text;
  background: transparent;
  color: $color-text;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  padding: 10px;

  svg {
    width: 25px;
  }

  &:hover:not(:disabled) {
    transform: scale(1);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.product-showcase {
  display: grid;
  grid-template-columns: 0.5fr 1fr;
  gap: 0;
  align-items: center;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-showcase__image {
  position: relative;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  img {
    width: 90%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 10px rgba(0, 0, 0, 0.2));
  }
}

.product-showcase__content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-showcase__badge {
  display: inline-block;
  align-self: flex-start;
  color: $color-primary;
  font-size: $font-size-lg;
  font-weight: bold;
  text-transform: uppercase;
}

.product-showcase__name {
  font-size: $font-size-3xl;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-dark;
}

.product-showcase__subtitle {
  font-size: $font-size-xl;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-text;
}

.product-showcase__notes {
  font-size: 1rem;
  color: $color-text;

  strong {
    color: $color-dark;
  }
}

.product-showcase__footer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-showcase__price {
  font-size: $font-size-xl;
  font-weight: bold;
  color: $color-dark;
  position: relative;

  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 3px;
    background: $color-text;
    transition: width 0.3s ease;
    position: absolute;
    left: 0;
    top: 0;
  }
}

.btn-add {
  background: white;
  border: 2px solid #000;
  color: $color-text;
  font-size: $font-size-xl;
  font-weight: bold;
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  max-width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;

  &:hover:not(:disabled) {
    background: #000;
    color: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.product-showcase__social {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;

  a {
    width: 25px;
    height: 10px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    transition: all 0.3s ease;

    &:hover {
      background: #000;
      color: #fff;
      transform: translateY(-2px);
    }
  }
}

// Responsive
@media (max-width: 1024px) {
  .product-showcase {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem;
  }

  .product-showcase__name {
    font-size: 2rem;
  }

  .product-showcase__price {
    font-size: 1.5rem;
  }

  .whats-new__title {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .whats-new {
    padding: 2rem 0;
  }

  .container {
    padding: 0 1rem;
  }

  .whats-new__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .product-showcase__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-add {
    width: 100%;
  }
}
</style>

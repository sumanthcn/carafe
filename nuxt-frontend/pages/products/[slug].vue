<script setup lang="ts">
const route = useRoute();
const { getProductBySlug, getProducts } = useStrapi();

const slug = route.params.slug as string;

// Fetch product
const { data: product, error } = await useAsyncData(`product-${slug}`, () =>
  getProductBySlug(slug)
);

// Handle 404
if (!product.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Product not found",
  });
}

// Fetch related products
const { data: relatedProducts } = await useAsyncData(`related-${slug}`, () =>
  getProducts({
    category: product.value?.category?.slug,
    pageSize: 4,
  })
);

// Cart
const cartStore = useCartStore();
const quantity = ref(1);

const addToCart = () => {
  if (product.value) {
    cartStore.addItem(product.value, quantity.value);
  }
};

// SEO
useSeo({
  seo: product.value?.seo,
  title: product.value?.name,
  description: product.value?.shortDescription,
  image: product.value?.images?.[0],
  type: "product",
  product: product.value || undefined,
});

// Product schema
if (product.value) {
  useProductSchema(product.value);
}

// Breadcrumb schema
useBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Shop Coffee", url: "/shop" },
  { name: product.value?.name || "Product" },
]);

// Active image
const activeImageIndex = ref(0);

// Price display
const displayPrice = computed(() => {
  if (!product.value) return "";
  return cartStore.formatPrice(product.value.salePrice || product.value.price);
});

const originalPrice = computed(() => {
  if (!product.value?.salePrice) return "";
  return cartStore.formatPrice(product.value.price);
});

const discount = computed(() => {
  if (!product.value?.salePrice) return 0;
  return Math.round((1 - product.value.salePrice / product.value.price) * 100);
});
</script>

<template>
  <div class="product-page">
    <!-- Breadcrumb -->
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol class="breadcrumb__list">
        <li><NuxtLink to="/">Home</NuxtLink></li>
        <li><NuxtLink to="/shop">Shop Coffee</NuxtLink></li>
        <li aria-current="page">{{ product?.name }}</li>
      </ol>
    </nav>

    <!-- Product Detail -->
    <div class="product-detail">
      <!-- Images -->
      <div class="product-detail__gallery">
        <div class="product-detail__main-image">
          <NuxtImg
            v-if="product?.images?.[activeImageIndex]"
            provider="strapi"
            :src="product.images[activeImageIndex].url"
            :alt="
              product.images[activeImageIndex].alternativeText || product.name
            "
            width="600"
            height="600"
            fit="contain"
            preset="productDetail"
          />
        </div>
        <div
          v-if="product?.images?.length > 1"
          class="product-detail__thumbnails"
        >
          <button
            v-for="(image, index) in product.images"
            :key="image.id"
            class="product-detail__thumb"
            :class="{
              'product-detail__thumb--active': index === activeImageIndex,
            }"
            @click="activeImageIndex = index"
          >
            <NuxtImg
              provider="strapi"
              :src="image.url"
              :alt="`${product.name} - Image ${index + 1}`"
              width="80"
              height="80"
              fit="cover"
            />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="product-detail__info">
        <!-- Rating -->
        <div
          v-if="product?.productSchema?.aggregateRating"
          class="product-detail__rating"
        >
          <div class="product-detail__stars">
            <span
              v-for="i in 5"
              :key="i"
              class="star"
              :class="{
                filled: i <= Math.round(product.productSchema.aggregateRating),
              }"
              >★</span
            >
          </div>
          <span class="product-detail__review-count">
            {{ product.productSchema.reviewCount }} reviews
          </span>
        </div>

        <h1 class="product-detail__title">{{ product?.name }}</h1>
        <p v-if="product?.subtitle" class="product-detail__subtitle">
          {{ product.subtitle }}
        </p>

        <!-- Tasting notes -->
        <p v-if="product?.tastingNotes" class="product-detail__tasting">
          <strong>Tasting Notes:</strong> {{ product.tastingNotes }}
        </p>

        <!-- Price -->
        <div class="product-detail__price">
          <span v-if="originalPrice" class="product-detail__original-price">{{
            originalPrice
          }}</span>
          <span class="product-detail__current-price">{{ displayPrice }}</span>
          <span v-if="discount" class="product-detail__discount"
            >-{{ discount }}% OFF</span
          >
        </div>

        <!-- Add to Cart -->
        <div class="product-detail__actions">
          <div class="product-detail__quantity">
            <button @click="quantity = Math.max(1, quantity - 1)">-</button>
            <input type="number" v-model.number="quantity" min="1" max="99" />
            <button @click="quantity = Math.min(99, quantity + 1)">+</button>
          </div>
          <button
            class="btn btn--outline btn--large"
            :disabled="!product?.inStock"
            @click="addToCart"
          >
            Add to Cart
          </button>
          <button
            class="btn btn--primary btn--large"
            :disabled="!product?.inStock"
          >
            Buy It Now
          </button>
        </div>

        <!-- Stock status -->
        <p v-if="!product?.inStock" class="product-detail__out-of-stock">
          Currently out of stock
        </p>

        <!-- Share -->
        <div class="product-detail__share">
          <a href="#" aria-label="Share on Facebook">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
              />
            </svg>
          </a>
          <a href="#" aria-label="Share on Pinterest">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"
              />
            </svg>
          </a>
          <a href="#" aria-label="Share on WhatsApp">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
          </a>
          <a href="#" aria-label="Share on Twitter">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
              />
            </svg>
          </a>
        </div>

        <!-- Accordions -->
        <div class="product-detail__accordions">
          <details class="product-accordion" open>
            <summary>PRODUCT INFO</summary>
            <div
              class="product-accordion__content"
              v-html="product?.description || 'Product details coming soon.'"
            ></div>
          </details>
          <details class="product-accordion">
            <summary>RETURN & REFUND POLICY</summary>
            <div class="product-accordion__content">
              <p>
                We want you to love your coffee! If you're not satisfied with
                your purchase, please contact us within 14 days for a full
                refund or exchange.
              </p>
            </div>
          </details>
          <details class="product-accordion">
            <summary>SHIPPING INFO</summary>
            <div class="product-accordion__content">
              <p>
                Free UK shipping on orders over £50. Standard delivery 2-3
                working days. Express delivery available.
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <section v-if="relatedProducts?.data?.length" class="related-products">
      <h2 class="related-products__title">YOU MAY ALSO LIKE</h2>
      <div class="related-products__grid">
        <ProductCard
          v-for="relatedProduct in relatedProducts.data
            .filter((p) => p.id !== product?.id)
            .slice(0, 4)"
          :key="relatedProduct.id"
          :product="relatedProduct"
        />
      </div>
    </section>

    <!-- Customer Reviews -->
    <section class="customer-reviews">
      <CustomerReviews :product-id="product?.id" />
    </section>

    <!-- Visit Café CTA -->
    <section class="product-cafe-cta">
      <VisitCafeCta />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.product-page {
  padding-top: 80px;
}

.breadcrumb {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;

  &__list {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 0.875rem;
    color: #666;

    li:not(:last-child)::after {
      content: "/";
      margin-left: 0.5rem;
    }

    a {
      color: inherit;
      text-decoration: none;
      &:hover {
        color: $color-primary;
      }
    }
  }
}

.product-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  &__gallery {
    position: sticky;
    top: 100px;
    align-self: start;
  }

  &__main-image {
    aspect-ratio: 1;
    background: #f5f5f5;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1rem;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__thumbnails {
    display: flex;
    gap: 0.75rem;
  }

  &__thumb {
    width: 80px;
    height: 80px;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: #f5f5f5;
    padding: 0;

    &--active {
      border-color: $color-primary;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    padding-top: 1rem;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  &__stars {
    .star {
      color: #ddd;
      &.filled {
        color: #f5a623;
      }
    }
  }

  &__review-count {
    font-size: 0.875rem;
    color: #666;
  }

  &__title {
    font-family: $font-heading;
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  &__subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__tasting {
    font-size: 0.9375rem;
    color: #444;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }

  &__price {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  &__original-price {
    font-size: 1rem;
    color: #999;
    text-decoration: line-through;
  }

  &__current-price {
    font-size: 1.5rem;
    font-weight: 700;
  }

  &__discount {
    background: $color-dark;
    color: white;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-weight: 600;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__quantity {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: fit-content;

    button {
      width: 44px;
      height: 44px;
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;

      &:hover {
        background: #f5f5f5;
      }
    }

    input {
      width: 60px;
      height: 44px;
      text-align: center;
      border: none;
      border-left: 1px solid #ddd;
      border-right: 1px solid #ddd;
      font-size: 1rem;

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        -webkit-appearance: none;
      }
    }
  }

  &__out-of-stock {
    color: #e53e3e;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  &__share {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;

    a {
      color: #666;
      transition: color 0.2s ease;

      &:hover {
        color: $color-primary;
      }
    }
  }
}

.product-accordion {
  border-top: 1px solid #ddd;

  summary {
    padding: 1.25rem 0;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &::after {
      content: "+";
      font-size: 1.25rem;
      font-weight: 400;
    }
  }

  &[open] summary::after {
    content: "−";
  }

  &__content {
    padding-bottom: 1.5rem;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: #444;
  }
}

.related-products {
  max-width: 1400px;
  margin: 0 auto;
  padding: 4rem 2rem;
  border-top: 1px solid #eee;

  &__title {
    font-family: $font-heading;
    font-size: 1.25rem;
    text-align: center;
    margin-bottom: 2rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 2rem;
  }
}

.customer-reviews,
.product-cafe-cta {
  margin-top: 4rem;
}
</style>

<template>
  <section class="related-products" v-if="products && products.length > 0">
    <div class="container">
      <h2 class="section-title">YOU MAY ALSO LIKE</h2>
      
      <div class="carousel-wrapper">
        <button 
          v-if="showControls && canScrollLeft"
          @click="scrollLeft" 
          class="carousel-control carousel-control-left"
          aria-label="Previous products"
        >
          <FontAwesomeIcon :icon="['fas', 'chevron-left']" />
        </button>

        <div class="carousel-container" ref="carouselRef">
          <div class="carousel-track" :class="{ 'carousel-track-center': products.length < 4 }">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="carousel-item"
            >
              <ProductCard :product="product" />
            </div>
          </div>
        </div>

        <button 
          v-if="showControls && canScrollRight"
          @click="scrollRight" 
          class="carousel-control carousel-control-right"
          aria-label="Next products"
        >
          <FontAwesomeIcon :icon="['fas', 'chevron-right']" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Product } from "~/types/strapi";
import ProductCard from "~/components/shop/ProductCard.vue";

interface RelatedProductsProps {
  products: Product[];
}

const props = defineProps<RelatedProductsProps>();

const carouselRef = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const showControls = ref(false);

const checkScrollPosition = () => {
  if (!carouselRef.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = carouselRef.value;
  
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10;
  showControls.value = scrollWidth > clientWidth;
};

const scrollLeft = () => {
  if (!carouselRef.value) return;
  const scrollAmount = carouselRef.value.clientWidth * 0.8;
  carouselRef.value.scrollBy({
    left: -scrollAmount,
    behavior: 'smooth'
  });
};

const scrollRight = () => {
  if (!carouselRef.value) return;
  const scrollAmount = carouselRef.value.clientWidth * 0.8;
  carouselRef.value.scrollBy({
    left: scrollAmount,
    behavior: 'smooth'
  });
};

onMounted(() => {
  if (carouselRef.value) {
    checkScrollPosition();
    carouselRef.value.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);
  }
});

onUnmounted(() => {
  if (carouselRef.value) {
    carouselRef.value.removeEventListener('scroll', checkScrollPosition);
    window.removeEventListener('resize', checkScrollPosition);
  }
});

watch(() => props.products, () => {
  nextTick(() => {
    checkScrollPosition();
  });
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.related-products {
  padding: 4rem 0;
  background: #f9f9f9;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: $color-text;

  @media (max-width: 768px) {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
}

.carousel-wrapper {
  position: relative;
  width: 100%;
}

.carousel-container {
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE and Edge
  
  &::-webkit-scrollbar {
    display: none; // Chrome, Safari, Opera
  }
}

.carousel-track {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
}

.carousel-track-center {
    justify-content: center;
}

.carousel-item {
  flex: 0 0 calc(25% - 2rem);
  min-width: 280px;
  max-width: 350px;
  
  @media (max-width: 1200px) {
    flex: 0 0 calc(33.333% - 1.33rem);
  }
  
  @media (max-width: 900px) {
    flex: 0 0 calc(50% - 0.5rem);
  }
  
  @media (max-width: 640px) {
    flex: 0 0 calc(100% - 0rem);
    min-width: 260px;
  }
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid $color-text;
  color: $color-text;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  svg {
    width: 20px;
  }
  
  &:hover {
    background: $color-text;
    color: white;
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
  
  @media (max-width: 768px) {
    width: 3px;
    height: 30px;
    font-size: 0.875rem;
  }
}

.carousel-control-left {
  left: -25px;
  
  @media (max-width: 1400px) {
    left: 0;
  }
}

.carousel-control-right {
  right: -25px;
  
  @media (max-width: 1400px) {
    right: 0;
  }
}
</style>

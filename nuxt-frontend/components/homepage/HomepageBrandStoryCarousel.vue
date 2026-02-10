<template>
  <section 
    v-if="data" 
    class="brand-story-carousel"
    :class="`brand-story-carousel--${backgroundColor}`"
  >
    <div class="container">
      <div
        class="brand-story-grid"
        :class="{
          'brand-story-grid--image-left': data.imagePosition === 'left',
        }"
      >
        <div class="brand-story__content">
          <h2>
            {{ data.headline }}
          </h2>
          <div
            v-if="data.content"
            class="brand-story__text"
            v-html="parseMarkdown(data.content)"
          ></div>
          <NuxtLink
            v-if="data.cta"
            :to="data.cta.url || '/'"
            :target="data.cta.openInNewTab ? '_blank' : undefined"
            :class="['btn', `btn--${data.cta.style || 'primary'}`]"
          >
            <img
              v-if="data.cta.icon && data.cta.iconPosition === 'left'"
              :src="getStrapiMediaUrl(data.cta.icon)"
              alt=""
              class="btn__icon btn__icon--left"
            />
            <span>{{ data.cta.text }}</span>
            <img
              v-if="data.cta.icon && data.cta.iconPosition === 'right'"
              :src="getStrapiMediaUrl(data.cta.icon)"
              alt=""
              class="btn__icon btn__icon--right"
            />
          </NuxtLink>
        </div>
        
        <!-- Swiper Carousel for Multiple Images -->
        <div v-if="data.images && data.images.length > 0" class="brand-story__carousel">
          <swiper
            :modules="[Autoplay, Pagination]"
            :slides-per-view="1"
            :space-between="0"
            :loop="true"
            :autoplay="{
              delay: 5000,
              disableOnInteraction: false,
            }"
            :pagination="{
              clickable: true,
              dynamicBullets: false,
            }"
            class="carousel-swiper"
          >
            <swiper-slide v-for="(image, index) in data.images" :key="index">
              <img 
                :src="getStrapiMediaUrl(image)" 
                :alt="`${data.headline} - Image ${index + 1}`" 
              />
            </swiper-slide>
          </swiper>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from "swiper/vue";

const { getStrapiMediaUrl } = useStrapi();
const { parseMarkdown } = useMarkdown();

interface BrandStoryCarouselProps {
  data?: {
    headline: string;
    content?: string;
    images?: any[];
    imagePosition?: "left" | "right";
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
  backgroundColor?: "default" | "alt";
}

withDefaults(defineProps<BrandStoryCarouselProps>(), {
  backgroundColor: "default",
});
</script>

<style lang="scss" scoped>
.brand-story-carousel {
  padding: 0rem 2rem;

  &--default {
    background: $color-background;
  }

  &--alt {
    background: $color-background-alt;
  }

  &__content {
    @media (min-width: 1024px) {
      margin-top: -$spacing-14;
    }
  }

  .container {
    @media (max-width: 767px) {
      margin-top: 1rem;
      padding: 0;
    }
  }
}

.brand-story-grid {
  display: grid;
  gap: 3rem;
  align-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  &--image-left {
    @media (min-width: 1024px) {
      .brand-story__carousel {
        order: -1;
      }
    }
  }
}

.brand-story__content {
  h2 {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-text;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    font-weight: bold;
  }

  .brand-story__text {
    :deep(p) {
      color: $color-text;
      line-height: 1.8;
      margin-bottom: 1rem;
    }
  }

  .btn {
    margin-top: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &.btn--primary {
      .btn__icon {
        filter: brightness(0) invert(1);
      }

      &:hover {
        transform: translateY(-2px);
      }
    }
  }
}

.brand-story__carousel {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;

  .carousel-swiper {
    width: 100%;
    height: 100%;
    border-radius: 12px;
  }

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: 12px;
  }

  // Swiper pagination customization (dots at bottom)
  :deep(.swiper-pagination) {
    bottom: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    
    .swiper-pagination-bullet {
      background: rgba(0, 0, 0, 0.3);
      opacity: 1;
      width: 8px;
      height: 8px;
      margin: 0 !important;
      transition: all 0.3s ease;
      
      &-active {
        background: rgba(0, 0, 0, 0.8);
        width: 8px;
        height: 8px;
      }
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

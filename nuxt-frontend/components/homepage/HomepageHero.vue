<template>
  <section v-if="heroCarousel?.length" class="hero-carousel">
    <Swiper
      :modules="modules"
      :slides-per-view="1"
      :space-between="0"
      :navigation="carouselSettings.showNavigation"
      :pagination="
        carouselSettings.showPagination ? { clickable: true } : false
      "
      :autoplay="
        carouselSettings.autoplay
          ? {
              delay: carouselSettings.autoplayDelay,
              disableOnInteraction: false,
              pauseOnMouseEnter: carouselSettings.pauseOnHover,
            }
          : false
      "
      :effect="carouselSettings.effect"
      :loop="carouselSettings.loop"
      :speed="carouselSettings.speed"
      class="hero-swiper"
    >
      <SwiperSlide
        v-for="(slide, index) in heroCarousel"
        :key="index"
        class="hero-slide"
      >
        <div
          class="hero-slide__background"
          :style="{
            backgroundImage: `url(${getStrapiMediaUrl(slide.backgroundImage)})`,
          }"
        ></div>
        <div
          class="hero-slide__overlay"
          :style="{ opacity: (slide.overlayOpacity || 50) / 100 }"
        ></div>
        <div
          class="hero-slide__content container"
          :class="`text-${slide.textPosition || 'left'}`"
        >
          <h1 class="hero-slide__headline">{{ slide.headline }}</h1>
          <p v-if="slide.subheadline" class="hero-slide__subheadline">
            {{ slide.subheadline }}
          </p>
          <p v-if="slide.description" class="hero-slide__description">
            {{ slide.description }}
          </p>
          <div v-if="slide.buttons?.length" class="hero-slide__actions">
            <NuxtLink
              v-for="(button, btnIndex) in slide.buttons"
              :key="btnIndex"
              :to="button.url || '/'"
              :target="button.openInNewTab ? '_blank' : undefined"
              :class="[
                'btn',
                `btn--${button.variant || 'primary'}`,
                'hero-btn',
              ]"
            >
              <img
                v-if="button.icon"
                :src="getStrapiMediaUrl(button.icon)"
                alt=""
                :class="[
                  'btn__icon',
                  `btn__icon--${button.iconPosition || 'left'}`,
                ]"
              />
              <span>{{ button.text }}</span>
            </NuxtLink>
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
  </section>
</template>

<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const { getStrapiMediaUrl } = useStrapi();

interface HeroProps {
  heroCarousel?: any[];
  settings?: any;
}

const props = defineProps<HeroProps>();

// Swiper modules
const modules = [Navigation, Pagination, Autoplay, EffectFade];

// Carousel settings with defaults
const carouselSettings = computed(() => {
  const settings = props.settings;
  return {
    autoplay: settings?.autoplay ?? true,
    autoplayDelay: settings?.autoplayDelay ?? 5000,
    showNavigation: settings?.showNavigation ?? true,
    showPagination: settings?.showPagination ?? true,
    loop: settings?.loop ?? true,
    effect: settings?.effect ?? "fade",
    speed: settings?.speed ?? 600,
    pauseOnHover: settings?.pauseOnHover ?? true,
  };
});
</script>

<style lang="scss" scoped>
.hero-carousel {
  position: relative;
  height: 580px;

  @media (min-width: 768px) {
    height: 580px;
  }
}

.hero-swiper {
  width: 100%;
  height: 100%;

  :deep(.swiper-button-next),
  :deep(.swiper-button-prev) {
    color: white;
    width: 30px;
    height: 30px;
  }

  :deep(.swiper-button-next::after),
  :deep(.swiper-button-prev::after) {
    font-size: 2rem;
  }

  :deep(.swiper-pagination-bullet) {
    width: 30px;
    height: 12px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 1;
    transition: all 0.3s ease;
    border-radius: 6px;
  }

  :deep(.swiper-pagination-bullet-active) {
    background: white;
    width: 60px;
    border-radius: 6px;
  }
}

.hero-slide {
  position: relative;
  height: 100%;

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
  }

  &__overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
  }

  &__content {
    position: relative;
    z-index: 2;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;

    &.text-left {
      align-items: flex-start;
      text-align: left;
    }

    &.text-center {
      align-items: center;
      text-align: center;
    }

    &.text-right {
      align-items: flex-end;
      text-align: right;
    }
  }

  &__headline {
    font-family: $font-myriad;
    font-size: clamp(2rem, 5vw, 4rem);
    color: white;
    font-weight: bold;
    margin-bottom: 1rem;
    line-height: 1;
    max-width: 800px;
    text-transform: uppercase;
  }

  &__subheadline {
    font-size: clamp(1rem, 2vw, 1.5rem);
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 1rem;
    max-width: 600px;
  }

  &__description {
    font-size: clamp(0.9rem, 1.5vw, 1.125rem);
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 2rem;
    max-width: 600px;
    line-height: 1.6;
  }

  &__actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

.hero-btn {
  border-radius: 50px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;

  // Hero-specific overrides for button variants
  &.btn--primary {
    .btn__icon {
      filter: brightness(0) invert(1);
    }

    &:hover {
      transform: translateY(-2px);
    }
  }

  &.btn--secondary,
  &.btn--outline {
    background: transparent;
    color: white;
    border: 2px solid white;

    .btn__icon {
      filter: brightness(0) invert(1);
    }

    &:hover {
      background: white;
      color: $color-text;

      .btn__icon {
        filter: none;
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

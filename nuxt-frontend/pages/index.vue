<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const { getHomepage, getStrapiMediaUrl } = useStrapi();

// Fetch homepage data with error handling
const { data: homepage, error: homepageError } = await useAsyncData(
  "homepage",
  async () => {
    try {
      const data = await getHomepage();
      console.log("Homepage data:", JSON.stringify(data, null, 2));
      return data as any;
    } catch (err) {
      console.error("Failed to fetch homepage:", err);
      return null;
    }
  }
);

// Swiper modules
const modules = [Navigation, Pagination, Autoplay, EffectFade];

// Carousel settings with defaults
const carouselSettings = computed(() => {
  const settings = homepage.value?.data?.carouselSettings;
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

// SEO
useSeoMeta({
  title: "Carafe Coffee House & Roasters - Home",
  description:
    "Artisan coffee roasted in the heart of Lewes. Shop our small-batch beans online or visit our café.",
});
</script>

<template>
  <div class="homepage">
    <!-- Hero Carousel -->
    <section v-if="homepage?.data?.heroCarousel?.length" class="hero-carousel">
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
          v-for="(slide, index) in homepage.data.heroCarousel"
          :key="index"
          class="hero-slide"
        >
          <div
            class="hero-slide__background"
            :style="{
              backgroundImage: `url(${getStrapiMediaUrl(
                slide.backgroundImage
              )})`,
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
                  'hero-btn',
                  `hero-btn--${button.variant || 'primary'}`,
                ]"
              >
                <img
                  v-if="button.icon"
                  :src="getStrapiMediaUrl(button.icon)"
                  alt=""
                  :class="[
                    'hero-btn__icon',
                    `hero-btn__icon--${button.iconPosition || 'left'}`,
                  ]"
                />
                <span v-if="button.iconPosition !== 'right'">{{
                  button.text
                }}</span>
                <span v-else>{{ button.text }}</span>
              </NuxtLink>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </section>

    <!-- Product Categories Section -->
    <section
      v-if="homepage?.data?.productCategories"
      class="product-categories"
    >
      <div class="container">
        <h2 class="section-title">
          {{
            homepage.data.productCategories.headline ||
            "YOUR COFFEE, ROASTED TO PERFECTION"
          }}
        </h2>
        <p
          v-if="homepage.data.productCategories.description"
          class="section-description"
        >
          {{ homepage.data.productCategories.description }}
        </p>
        <div class="categories-grid">
          <NuxtLink
            v-for="(category, index) in homepage.data.productCategories
              .categories"
            :key="index"
            :to="`/shop?category=${category.slug || ''}`"
            class="category-card"
          >
            <div class="category-icon">
              <img
                v-if="category.icon"
                :src="getStrapiMediaUrl(category.icon)"
                :alt="category.name"
              />
            </div>
            <h3>{{ category.name }}</h3>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Brand Story Section -->
    <section v-if="homepage?.data?.brandStory" class="brand-story">
      <div class="container">
        <div class="brand-story-grid">
          <div class="brand-story__content">
            <h2>
              {{
                homepage.data.brandStory.headline || "FROM LEWES TO YOUR CUP"
              }}
            </h2>
            <div
              v-if="homepage.data.brandStory.content"
              v-html="homepage.data.brandStory.content"
            ></div>
            <NuxtLink
              v-if="homepage.data.brandStory.cta"
              :to="homepage.data.brandStory.cta.url || '/'"
              class="btn-primary"
            >
              {{ homepage.data.brandStory.cta.text }}
            </NuxtLink>
          </div>
          <div v-if="homepage.data.brandStory.image" class="brand-story__image">
            <img
              :src="getStrapiMediaUrl(homepage.data.brandStory.image)"
              :alt="homepage.data.brandStory.headline"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Cafe Location Section -->
    <section v-if="homepage?.data?.cafeLocation" class="cafe-section">
      <div
        class="cafe-section__hero"
        :style="
          homepage.data.cafeLocation.backgroundImage
            ? {
                backgroundImage: `url(${getStrapiMediaUrl(
                  homepage.data.cafeLocation.backgroundImage
                )})`,
              }
            : {}
        "
      >
        <div class="cafe-section__overlay">
          <div class="container">
            <h2>
              {{ homepage.data.cafeLocation.headline || "THE HEART OF CARAFE" }}
            </h2>
            <p v-if="homepage.data.cafeLocation.description">
              {{ homepage.data.cafeLocation.description }}
            </p>
            <NuxtLink
              v-if="homepage.data.cafeLocation.cta"
              :to="homepage.data.cafeLocation.cta.url || '/'"
              class="btn-primary"
            >
              {{ homepage.data.cafeLocation.cta.text }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Culture Section -->
    <section v-if="homepage?.data?.cultureSection" class="culture-section">
      <div class="container">
        <div class="culture-grid">
          <div v-if="homepage.data.cultureSection.image" class="culture-image">
            <img
              :src="getStrapiMediaUrl(homepage.data.cultureSection.image)"
              :alt="homepage.data.cultureSection.headline"
            />
          </div>
          <div class="culture-content">
            <h2>
              {{
                homepage.data.cultureSection.headline || "COFFEE MEETS CULTURE"
              }}
            </h2>
            <p v-if="homepage.data.cultureSection.description">
              {{ homepage.data.cultureSection.description }}
            </p>
            <NuxtLink
              v-if="homepage.data.cultureSection.cta"
              :to="homepage.data.cultureSection.cta.url || '/'"
              class="btn-primary"
            >
              {{ homepage.data.cultureSection.cta.text }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Wholesale Section -->
    <section v-if="homepage?.data?.wholesaleSection" class="wholesale-section">
      <div class="container">
        <div class="wholesale-grid">
          <div class="wholesale-content">
            <h2>
              {{ homepage.data.wholesaleSection.headline || "PARTNER WITH US" }}
            </h2>
            <p v-if="homepage.data.wholesaleSection.description">
              {{ homepage.data.wholesaleSection.description }}
            </p>
            <NuxtLink
              v-if="homepage.data.wholesaleSection.cta"
              :to="homepage.data.wholesaleSection.cta.url || '/'"
              class="btn-primary"
            >
              {{ homepage.data.wholesaleSection.cta.text }}
            </NuxtLink>
          </div>
          <div
            v-if="homepage.data.wholesaleSection.image"
            class="wholesale-image"
          >
            <img
              :src="getStrapiMediaUrl(homepage.data.wholesaleSection.image)"
              :alt="homepage.data.wholesaleSection.headline"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section v-if="homepage?.data?.newsletter" class="newsletter-section">
      <div class="container">
        <h2>
          {{ homepage.data.newsletter.headline || "JOIN OUR COFFEE CIRCLE" }}
        </h2>
        <p v-if="homepage.data.newsletter.description">
          {{ homepage.data.newsletter.description }}
        </p>
        <form class="newsletter-form" @submit.prevent="() => {}">
          <input type="email" placeholder="ENTER YOUR EMAIL ADDRESS" required />
          <button type="submit" class="btn-primary">SUBSCRIBE</button>
        </form>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.homepage {
  padding-top: 80px;
}

// Hero Carousel
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

  // Swiper navigation - custom rounded white buttons
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

  &__logo {
    width: 200px;
    height: auto;
    margin-bottom: 2rem;
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &__icon {
    width: 20px;
    height: 20px;
    object-fit: contain;

    &--left {
      margin-right: 0.25rem;
    }

    &--right {
      margin-left: 0.25rem;
    }
  }

  &--primary {
    background: $color-primary;
    color: white;

    .hero-btn__icon {
      filter: brightness(0) invert(1);
    }

    &:hover {
      background: $color-primary-dark;
      transform: translateY(-2px);
    }
  }

  &--secondary {
    background: transparent;
    color: white;
    border: 2px solid white;

    .hero-btn__icon {
      filter: brightness(0) invert(1);
    }

    &:hover {
      background: white;
      color: $color-text;

      .hero-btn__icon {
        filter: none;
      }
    }
  }

  &--outline {
    background: transparent;
    color: white;
    border: 2px solid white;

    .hero-btn__icon {
      filter: brightness(0) invert(1);
    }

    &:hover {
      background: white;
      color: $color-text;

      .hero-btn__icon {
        filter: none;
      }
    }
  }
}

// Shared Section Styles
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  font-family: $font-heading;
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  text-align: center;
  margin-bottom: 1rem;
  color: $color-text;
  text-transform: uppercase;
}

.section-description {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
  color: $color-text;
  line-height: 1.8;
  font-size: 1.125rem;
}

.btn-primary {
  display: inline-block;
  background: $color-primary;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }
}

// Product Categories
.product-categories {
  padding: 6rem 2rem;
  background: white;
}

.categories-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.category-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border: 2px solid $color-border;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }

  .category-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $color-primary;
    border-radius: 50%;

    img {
      width: 40px;
      height: 40px;
      filter: brightness(0) invert(1);
    }
  }

  h3 {
    color: $color-text;
    font-size: 1.125rem;
    font-weight: 600;
  }
}

// Brand Story
.brand-story {
  padding: 6rem 2rem;
  background: $color-background-alt;
}

.brand-story-grid {
  display: grid;
  gap: 3rem;
  align-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.brand-story__content {
  h2 {
    font-family: $font-heading;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    color: $color-text;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  :deep(p) {
    color: $color-text;
    line-height: 1.8;
    margin-bottom: 1rem;
  }

  .btn-primary {
    margin-top: 1rem;
  }
}

.brand-story__image {
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }
}

// Cafe Section
.cafe-section__hero {
  min-height: 500px;
  background-size: cover;
  background-position: center;
  background-color: $color-secondary;
  display: flex;
  align-items: center;
  position: relative;
}

.cafe-section__overlay {
  width: 100%;
  padding: 4rem 2rem;
  background: rgba(0, 0, 0, 0.5);
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: clamp(2rem, 4vw, 3rem);
    color: white;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  p {
    color: rgba(255, 255, 255, 0.9);
    max-width: 800px;
    margin: 0 auto 2rem;
    line-height: 1.8;
    font-size: 1.125rem;
  }
}

// Culture Section
.culture-section {
  padding: 6rem 2rem;
  background: white;
}

.culture-grid {
  display: grid;
  gap: 3rem;
  align-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.culture-image {
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }
}

.culture-content {
  h2 {
    font-family: $font-heading;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    color: $color-text;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  p {
    color: $color-text;
    line-height: 1.8;
    margin-bottom: 2rem;
  }
}

// Wholesale Section
.wholesale-section {
  padding: 6rem 2rem;
  background: $color-background-alt;
}

.wholesale-grid {
  display: grid;
  gap: 3rem;
  align-items: center;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
}

.wholesale-content {
  h2 {
    font-family: $font-heading;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    color: $color-text;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  p {
    color: $color-text;
    line-height: 1.8;
    margin-bottom: 2rem;
  }
}

.wholesale-image {
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }
}

// Newsletter Section
.newsletter-section {
  padding: 4rem 2rem;
  background: $color-secondary;
  color: white;
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  p {
    margin-bottom: 2rem;
    opacity: 0.9;
  }
}

.newsletter-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  input {
    flex: 1;
    min-width: 250px;
    padding: 1rem 1.5rem;
    border: 2px solid white;
    border-radius: 4px;
    background: transparent;
    color: white;
    font-size: 0.875rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  button {
    padding: 1rem 2rem;
  }
}
</style>

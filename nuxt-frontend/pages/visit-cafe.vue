<template>
  <div class="page-visit-cafe">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>

    <!-- Content -->
    <div v-else-if="visitCafeData">
      <!-- Banner Section -->
      <section
        v-if="visitCafeData.bannerSection"
        class="banner-section"
        :style="bannerBackgroundStyle"
      >
        <div class="banner-container">
          <div class="banner-content">
            <h1 class="banner-title">{{ visitCafeData.bannerSection.title }}</h1>
            <p v-if="visitCafeData.bannerSection.subtitle" class="banner-subtitle">
              {{ visitCafeData.bannerSection.subtitle }}
            </p>
          </div>
        </div>
      </section>
      <div
        v-if="visitCafeData?.bannerSection?.description"
        class="banner-description"
        v-html="visitCafeData.bannerSection.description"
      ></div>
      
      <!-- Brand Story Section -->
      <section v-if="visitCafeData.brandStorySection" class="brand-story-section">
        <div class="container">
          <div class="brand-story-grid">
            <div class="story-content">
              <span class="heading">{{ visitCafeData.brandStorySection.heading }}</span>
              <h2 class="title">{{ visitCafeData.brandStorySection.title }}</h2>
              <div class="description" v-html="visitCafeData.brandStorySection.description"></div>
            </div>
            <div class="story-images">
              <img
                v-for="(image, index) in visitCafeData.brandStorySection.images"
                :key="index"
                :src="getStrapiMediaUrl(image)"
                :alt="`Brand story image ${index + 1}`"
                class="story-image"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Opening Hours Section -->
      <section
        v-if="visitCafeData.openingHoursSection"
        class="opening-hours-section"
        :style="openingHoursBackgroundStyle"
      >
        <div class="hours-overlay"></div>
        <div class="container">
          <h2 class="hours-title">{{ visitCafeData.openingHoursSection.title }}</h2>
          <div class="hours-grid">
            <div class="hours-card">
              <h3>MONDAY – SATURDAY</h3>
              <p>{{ visitCafeData.openingHoursSection.mondayToSaturday }}</p>
            </div>
            <div class="hours-card">
              <h3>SUNDAY</h3>
              <p>{{ visitCafeData.openingHoursSection.sunday }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Getting Here Section -->
      <section v-if="visitCafeData.gettingHereSection" class="getting-here-section">
        <div class="container">
          <h2 class="section-title">{{ visitCafeData.gettingHereSection.title }}</h2>
          <div class="getting-here-grid">
            <div
              v-for="item in visitCafeData.gettingHereSection.items"
              :key="item.id"
              class="getting-here-item"
            >
              <div class="item-icon">
                <img :src="getStrapiMediaUrl(item.icon)" :alt="item.name" />
              </div>
              <h3 class="item-name">{{ item.name }}</h3>
              <div class="item-description" v-html="item.description"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Email Subscribe -->
      <EmailSubscribe />
    </div>

    <!-- Error State -->
    <div v-else class="error-container">
      <p>Unable to load page content. Please try again later.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VisitCafe } from "~/composables/useVisitCafe";

definePageMeta({
  layout: "default",
});

const { fetchVisitCafeData } = useVisitCafe();
const { getStrapiMediaUrl } = useStrapi();
const config = useRuntimeConfig();

const loading = ref(true);
const visitCafeData = ref<VisitCafe | null>(null);

// Fetch data
onMounted(async () => {
  loading.value = true;
  visitCafeData.value = await fetchVisitCafeData();
  loading.value = false;
});

// Computed styles
const bannerBackgroundStyle = computed(() => {
  if (visitCafeData.value?.bannerSection?.backgroundImage) {
    return {
      backgroundImage: `url(${getStrapiMediaUrl(visitCafeData.value.bannerSection.backgroundImage)})`,
    };
  }
  return {};
});

const openingHoursBackgroundStyle = computed(() => {
  if (visitCafeData.value?.openingHoursSection?.backgroundImage) {
    return {
      backgroundImage: `url(${getStrapiMediaUrl(visitCafeData.value.openingHoursSection.backgroundImage)})`,
    };
  }
  return {};
});

// SEO
useHead(() => {
  const seo = visitCafeData.value?.seo;
  return {
    title: seo?.metaTitle || "Visit Our Café - Carafe Coffee",
    meta: [
      {
        name: "description",
        content:
          seo?.metaDescription ||
          "Visit Carafe Coffee House and experience exceptional coffee in a warm atmosphere.",
      },
      {
        property: "og:title",
        content: seo?.metaTitle || "Visit Our Café - Carafe Coffee",
      },
      {
        property: "og:description",
        content:
          seo?.metaDescription ||
          "Visit Carafe Coffee House and experience exceptional coffee in a warm atmosphere.",
      },
    ],
  };
});
</script>

<style lang="scss" scoped>
.page-visit-cafe {
  padding-top: 80px;
}

// Loading State
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba($color-primary, 0.1);
    border-left-color: $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    margin-top: 1rem;
    color: $color-text;
    font-size: 1.125rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

// Error State
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;

  p {
    color: $color-danger;
    font-size: 1.125rem;
  }
}

// Banner Section
.banner-section {
  position: relative;
  height: 350px;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;

  @media (max-width: 991px) {
    height: 350px;
  }

  @media (max-width: 767px) {
    height: 350px;
  }

  .banner-container {
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 60px;
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;

    @media (max-width: 991px) {
      padding: 0 40px;
    }

    @media (max-width: 767px) {
      padding: 0 20px;
      justify-content: center;
    }
  }

  .banner-content {
    max-width: 600px;
    color: white;

    @media (max-width: 767px) {
      text-align: center;
      max-width: 100%;
    }

    .banner-title {
      font-family: $font-myriad;
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: bold;
      margin: 0 0 20px 0;
      line-height: 1;
    max-width: 800px;
      text-transform: uppercase;
      // letter-spacing: 8px;
      color: white;

      @media (max-width: 991px) {
        font-size: $font-size-4xl;
      }

      @media (max-width: 767px) {
        font-size: $font-size-3xl;
        margin-bottom: 15px;
      }
    }

    .banner-subtitle {
      font-size: clamp(1rem, 2vw, 1.5rem);
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 1rem;
      max-width: 400px;

      @media (max-width: 991px) {
        font-size: 1rem;
      }

      @media (max-width: 767px) {
        font-size: 0.9375rem;
      }
    }
  }
}

.banner-description {
  background: $color-background-alt;
  padding: 2rem 60px;
  max-width: 1400px;
  font-family: $font-body;
  font-size: $font-size-base;
  text-align: center;
}

// Brand Story Section
.brand-story-section {
  padding: 80px 60px;
  background: #f5f5f0;

  @media (max-width: 991px) {
    padding: 60px 40px;
  }

  @media (max-width: 767px) {
    padding: 40px 20px;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .brand-story-grid {
    display: grid;
    gap: 60px;
    align-items: center;

    @media (min-width: 992px) {
      grid-template-columns: 1fr 1fr;
      gap: 80px;
    }
  }

  .story-content {
    .heading {
      display: block;
      color: #8b6f47;
      font-size: 0.8125rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 2.5px;
      margin-bottom: 16px;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 600;
      color: #2c2c2c;
      margin-bottom: 24px;
      line-height: 1.2;
      letter-spacing: -0.5px;

      @media (max-width: 991px) {
        font-size: 2rem;
      }

      @media (max-width: 767px) {
        font-size: 1.75rem;
      }
    }

    .description {
      color: #4a4a4a;
      line-height: 1.8;
      font-size: 1.0625rem;
      font-weight: 400;

      @media (max-width: 767px) {
        font-size: 1rem;
      }

      p {
        margin: 0 0 16px 0;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .story-images {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(2, 1fr);

    @media (max-width: 767px) {
      gap: 12px;
    }

    .story-image {
      width: 100%;
      height: 280px;
      object-fit: cover;
      border-radius: 4px;

      @media (max-width: 991px) {
        height: 240px;
      }

      @media (max-width: 767px) {
        height: 180px;
      }
    }
  }
}

// Opening Hours Section
.opening-hours-section {
  position: relative;
  min-height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 80px 60px;
  color: white;

  @media (max-width: 991px) {
    padding: 60px 40px;
    min-height: 400px;
  }

  @media (max-width: 767px) {
    padding: 40px 20px;
    min-height: 350px;
  }

  .hours-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }

  .container {
    position: relative;
    z-index: 2;
    max-width: 900px;
    text-align: center;
  }

  .hours-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 50px;
    text-transform: uppercase;
    letter-spacing: 4px;
    color: white;

    @media (max-width: 991px) {
      font-size: 2rem;
      margin-bottom: 40px;
    }

    @media (max-width: 767px) {
      font-size: 1.75rem;
      letter-spacing: 2px;
      margin-bottom: 30px;
    }
  }

  .hours-grid {
    display: grid;
    gap: 30px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 40px;
    }
  }

  .hours-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    padding: 32px 24px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.25);
    }

    @media (max-width: 767px) {
      padding: 24px 20px;
    }

    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      letter-spacing: 2px;
      color: rgba(255, 255, 255, 0.9);

      @media (max-width: 767px) {
        font-size: 0.9375rem;
      }
    }

    p {
      font-size: 1.625rem;
      font-weight: 500;
      margin: 0;
      color: white;

      @media (max-width: 767px) {
        font-size: 1.375rem;
      }
    }
  }
}

// Getting Here Section
.getting-here-section {
  padding: 80px 60px;
  background: white;

  @media (max-width: 991px) {
    padding: 60px 40px;
  }

  @media (max-width: 767px) {
    padding: 40px 20px;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 60px;
    color: #2c2c2c;
    text-transform: uppercase;
    letter-spacing: 4px;

    @media (max-width: 991px) {
      font-size: 2rem;
      margin-bottom: 50px;
    }

    @media (max-width: 767px) {
      font-size: 1.75rem;
      letter-spacing: 2px;
      margin-bottom: 40px;
    }
  }

  .getting-here-grid {
    display: grid;
    gap: 30px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
    }

    @media (min-width: 992px) {
      grid-template-columns: repeat(4, 1fr);
      gap: 28px;
    }
  }

  .getting-here-item {
    text-align: center;
    padding: 36px 24px;
    background: #fafaf8;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
    border: 1px solid rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      border-color: rgba(139, 111, 71, 0.2);
    }

    @media (max-width: 767px) {
      padding: 28px 20px;
    }

    .item-icon {
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;

      @media (max-width: 767px) {
        min-height: 60px;
      }

      img {
        width: 70px;
        height: 70px;
        object-fit: contain;

        @media (max-width: 991px) {
          width: 60px;
          height: 60px;
        }

        @media (max-width: 767px) {
          width: 50px;
          height: 50px;
        }
      }
    }

    .item-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #8b6f47;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      @media (max-width: 767px) {
        font-size: 1rem;
      }
    }

    .item-description {
      color: #5a5a5a;
      line-height: 1.7;
      font-size: 0.9375rem;
      font-weight: 400;

      @media (max-width: 767px) {
        font-size: 0.875rem;
      }

      p {
        margin: 0;
      }
    }
  }
}
</style>

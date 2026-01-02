<template>
  <div>
    <!-- Banner Section -->
    <section
      v-if="data"
      class="banner-section"
      :style="bannerBackgroundStyle"
    >
      <div class="banner-container">
        <div class="banner-content">
          <h1 class="banner-title">{{ data.title }}</h1>
          <p v-if="data.subtitle" class="banner-subtitle">
            {{ data.subtitle }}
          </p>
        </div>
      </div>
    </section>
    
    <!-- Banner Description (if provided) -->
    <div
      v-if="data?.description"
      class="banner-description"
    >
    <div class="heading-text">{{ data.descriptionTitle }}</div>
      <div class="text" v-html="parsedDescription" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();
const { parseMarkdown } = useMarkdown();

interface BannerProps {
  data?: {
    title: string;
    subtitle?: string;
    descriptionTitle?: string;
    description?: string;
    backgroundImage?: any;
  };
}

const props = defineProps<BannerProps>();

// Computed styles
const bannerBackgroundStyle = computed(() => {
  if (props.data?.backgroundImage) {
    return {
      backgroundImage: `url(${getStrapiMediaUrl(props.data.backgroundImage)})`,
    };
  }
  return {};
});

// Parse markdown description
const parsedDescription = computed(() => {
  if (!props.data?.description) return '';
  return parseMarkdown(props.data.description);
});
</script>

<style lang="scss" scoped>
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
      max-width: 500px;

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
  font-family: $font-body;
  font-size: $font-size-base;
  text-align: center;

  .heading-text {
    font-family: $font-heading;
    font-size: $font-size-2xl;
    color: $color-text;
    text-transform: uppercase;
    font-weight: bold;
    max-width: 500px;
    margin: 0 auto 1.5rem;
    line-height: 1.2;
  }

  .text {
    max-width: 900px;
    margin: 0 auto;
    color: $color-text;
    line-height: 1.5;
  }
}
</style>

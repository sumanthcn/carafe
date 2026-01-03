<template>
  <section class="offering-section">
    <div
      class="offering-section__hero"
      :style="
        data?.backgroundImage
          ? {
              backgroundImage: `url(${getStrapiMediaUrl(
                data.backgroundImage
              )})`,
            }
          : {}
      "
    >
      <div class="offering-section__overlay">
        <div class="container">
          <h2>{{ data?.headline || "OUR WHOLESALE OFFERING" }}</h2>
          <p v-if="data?.description">{{ data.description }}</p>
          
          <!-- Grid Items -->
          <div v-if="data?.imageTexts && data.imageTexts.length > 0" class="offering-grid">
            <div
              v-for="(item, index) in data.imageTexts"
              :key="index"
              class="offering-item"
            >
              <div class="offering-icon">
                <img
                  v-if="item.image"
                  :src="getStrapiMediaUrl(item.image)"
                  :alt="item.text || ''"
                />
              </div>
              <p v-if="item.text" class="offering-item-content">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();

interface ImageText {
  image?: any;
  text?: string;
}

interface OfferingSectionProps {
  data?: {
    headline?: string;
    description?: string;
    backgroundImage?: any;
    imageTexts?: ImageText[];
  };
}

defineProps<OfferingSectionProps>();
</script>

<style lang="scss" scoped>
.offering-section__hero {
  min-height: 400px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  position: relative;
  padding: 4rem 0;

  @media (max-width: 767px) {
    min-height: auto;
    padding: 2rem 0;
  }
}

.offering-section__overlay {
  width: 100%;
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-white;
    margin-bottom: 3rem;
    text-transform: uppercase;
    font-weight: bold;

    @media (max-width: 767px) {
      font-size: $font-size-3xl;
    }
  }

  p {
    color: $color-white;
    max-width: 800px;
    margin: 0 auto 1rem;
    line-height: 1.6;
    font-size: 1.125rem;

    @media (max-width: 767px) {
      font-size: 1rem;
      margin-bottom: 2rem;
    }
  }
}

.offering-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}

.offering-item {
  text-align: center;
  color: $color-white;

  .offering-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 767px) {
      width: 60px;
      height: 60px;
      margin-bottom: 1rem;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }
  }

  .offering-item-title {
    font-family: $font-heading;
    font-size: $font-size-xl;
    font-weight: bold;
    margin-bottom: 1rem;
    color: $color-white;

    @media (max-width: 767px) {
      font-size: $font-size-lg;
      margin-bottom: 0.75rem;
    }
  }

  .offering-item-content {
    font-family: $font-body;
    font-size: $font-size-base;
    font-weight: 500;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.9);

    @media (max-width: 767px) {
      font-size: $font-size-sm;
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

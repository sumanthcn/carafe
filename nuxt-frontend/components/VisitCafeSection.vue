<template>
  <section v-if="section" class="visit-cafe-section">
    <!-- Content Container -->
    <div class="content-container">
      <!-- Title & Subtitle -->
      <div class="header">
        <h2 class="title">{{ section.title }}</h2>
        <p v-if="section.subtitle" class="subtitle">{{ section.subtitle }}</p>
      </div>

      <!-- Cards Grid -->
      <div class="cards-grid" v-if="section.cards && section.cards.length > 0">
        <div v-for="card in sortedCards" :key="card.title" class="cafe-card">
          <!-- Title -->
          <h3 class="card-title">{{ card.title }}</h3>

          <!-- Description -->
          <p class="card-description">{{ card.description }}</p>

          <!-- CTA Button with Icon -->
          <button
            v-if="card.cta && card.cta.url"
            @click="handleCtaClick($event, card.cta)"
            :class="[
              'btn-cta',
              card.cta.iconPosition === 'right'
                ? 'btn-cta--icon-right'
                : 'btn-cta--icon-left',
            ]"
          >
            <img
              v-if="card.cta.icon && card.cta.iconPosition === 'left'"
              :src="getStrapiMediaUrl(card.cta.icon)"
              :alt="card.title"
              class="btn-icon"
            />
            <span>{{ card.cta.text }}</span>
            <img
              v-if="card.cta.icon && card.cta.iconPosition === 'right'"
              :src="getStrapiMediaUrl(card.cta.icon)"
              :alt="card.title"
              class="btn-icon"
            />
          </button>
          <button
            v-else-if="card.cta && !card.cta.url"
            :class="[
              'btn-cta',
              'btn-cta--disabled',
              card.cta.iconPosition === 'right'
                ? 'btn-cta--icon-right'
                : 'btn-cta--icon-left',
            ]"
            disabled
          >
            <img
              v-if="card.cta.icon && card.cta.iconPosition === 'left'"
              :src="getStrapiMediaUrl(card.cta.icon)"
              :alt="card.title"
              class="btn-icon"
            />
            <span>{{ card.cta.text }}</span>
            <img
              v-if="card.cta.icon && card.cta.iconPosition === 'right'"
              :src="getStrapiMediaUrl(card.cta.icon)"
              :alt="card.title"
              class="btn-icon"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Google Maps Modal -->
    <Teleport to="body">
      <div v-if="showMapModal" class="map-modal-overlay" @click="closeMapModal">
        <div class="map-modal-content" @click.stop>
          <button class="map-modal-close" @click="closeMapModal">×</button>
          <iframe
            :src="mapUrl"
            class="map-iframe"
            frameborder="0"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import type {
  VisitCafeSection as VisitCafeSectionType,
  CtaButton,
} from "~/types/strapi";

interface Props {
  section: VisitCafeSectionType | null;
}

const props = defineProps<Props>();

const { getStrapiMediaUrl } = useStrapi();

const sortedCards = computed(() => {
  if (!props.section?.cards) return [];
  return [...props.section.cards].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );
});

// Google Maps Modal state
const showMapModal = ref(false);
const mapUrl = ref("");

const closeMapModal = () => {
  showMapModal.value = false;
  mapUrl.value = "";
};

const convertToEmbedUrl = (url: string): string => {
  // If it's already an embed URL, return as is
  if (url.includes("/maps/embed")) {
    return url;
  }

  // Try to convert regular Google Maps URL to embed URL
  // Extract place ID or coordinates if available
  const placeIdMatch = url.match(/place\/([\w\s,]+)/);
  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

  if (placeIdMatch) {
    const place = encodeURIComponent(placeIdMatch[1]);
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${place}`;
  } else if (coordsMatch) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lng}&zoom=15`;
  }

  // If we can't convert, return the original URL with /embed path
  return url.replace(/\/maps\//, "/maps/embed/");
};

const handleCtaClick = (event: MouseEvent, cta: CtaButton) => {
  if (!cta.url) return;

  // Check if it's a Google Maps URL and openInNewTab is true
  if (cta.url.includes("google.com/maps") && cta.openInNewTab) {
    event.preventDefault();

    // Check if it's an embed URL
    if (cta.url.includes("/maps/embed")) {
      // It's an embed URL, show in modal
      mapUrl.value = cta.url;
      showMapModal.value = true;
    } else {
      // Regular Maps URL - open in new tab instead of iframe
      // Google blocks regular maps URLs in iframes
      window.open(cta.url, "_blank", "noopener,noreferrer");
    }
  } else if (cta.url.startsWith("http")) {
    // External URL
    if (cta.openInNewTab) {
      window.open(cta.url, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = cta.url;
    }
  } else {
    // Internal URL - use router
    navigateTo(cta.url);
  }
};
</script>

<style scoped lang="scss">
@import "@/assets/scss/variables";
@import "@/assets/scss/mixins";

.visit-cafe-section {
  width: 100%;
  padding: 2rem 0;
  background-color: $color-background-alt;
}

// Content Container
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;

  @media (min-width: 768px) {
    padding: 4rem 2rem;
  }

  @media (min-width: 1024px) {
    padding: 2rem 2rem;
  }
}

// Header
.header {
  font-family: $font-family-heading;
  font-size: $font-size-3xl;
  font-weight: bold;
  text-transform: uppercase;
  color: $color-text;
  margin: 0;
  text-align: center;
  margin-bottom: 3rem;

  @media (min-width: 768px) {
    margin-bottom: 4rem;
  }
}

.title {
  font-family: $font-family-heading;
  font-size: 2rem;
  font-weight: 00;
  color: $color-text;
  margin-bottom: 1rem;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }

  @media (min-width: 1024px) {
    font-size: 3rem;
  }
}

.subtitle {
  font-family: $font-family-body;
  font-size: 1rem;
  color: $color-text;
  font-weight: 500;
  line-height: 1.6;

  @media (min-width: 768px) {
    font-size: 1.125rem;
  }
}

// Cards Grid
.cards-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 3rem;
  }
}

// Cafe Card
.cafe-card {
  background: #ffffff;
  border-radius: 25px;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  @media (min-width: 768px) {
    padding: 3rem 2.5rem;
  }
}

.card-title {
  font-family: $font-family-heading;
  font-size: $font-size-xs;
  font-weight: bold;
  color: $color-primary;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (min-width: 768px) {
    font-size: $font-size-xs;
  }
}

.card-description {
  font-family: $font-family-body;
  font-size: $font-size-base;
  font-weight: 500;
  color: $color-text;
  line-height: 1.2;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    font-size: $font-size-base;
  }
}

// CTA Button - matching WhatsNewCarousel style
.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: $color-primary;
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  border: none;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  font-family: $font-family-heading;
  font-size: $font-size-sm;
  cursor: pointer;

  &:hover:not(.btn-cta--disabled) {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--icon-right {
    flex-direction: row;
  }

  &--icon-left {
    flex-direction: row;
  }

  .btn-icon {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}

// Google Maps Modal
.map-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.map-modal-content {
  position: relative;
  width: 100%;
  max-width: 900px;
  height: 80vh;
  max-height: 600px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
}

.map-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  background: white;
  border: none;
  border-radius: 50%;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.1);
  }
}

.map-iframe {
  width: 100%;
  height: 100%;
  border: none;
}
</style>

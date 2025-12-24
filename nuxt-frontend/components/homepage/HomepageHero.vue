<template>
  <section class="hero">
    <div class="hero__background">
      <NuxtImg
        v-if="hero?.backgroundImage?.url"
        :src="hero.backgroundImage.url"
        :alt="hero?.backgroundImage?.alternativeText || 'Carafe Coffee'"
        preset="hero"
        loading="eager"
        class="hero__image"
      />
      <div class="hero__overlay"></div>
    </div>

    <div class="container hero__content">
      <span v-if="hero?.badge" class="hero__badge">
        {{ hero.badge }}
      </span>

      <h1 class="hero__title">
        {{ hero?.heading || "Carafe Coffee House" }}
      </h1>

      <p v-if="hero?.subheading" class="hero__subtitle">
        {{ hero.subheading }}
      </p>

      <div v-if="hero?.ctaButtons?.length" class="hero__cta">
        <NuxtLink
          v-for="(button, index) in hero.ctaButtons"
          :key="index"
          :to="button.url"
          :class="[
            'btn',
            button.variant === 'primary' ? 'btn--primary' : 'btn--outline',
          ]"
        >
          {{ button.label }}
        </NuxtLink>
      </div>

      <div v-if="hero?.features?.length" class="hero__features">
        <div
          v-for="(feature, index) in hero.features"
          :key="index"
          class="hero__feature"
        >
          <span class="hero__feature-icon">{{ feature.icon }}</span>
          <span class="hero__feature-text">{{ feature.text }}</span>
        </div>
      </div>
    </div>

    <div class="hero__scroll">
      <span>Scroll to explore</span>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 13L12 18L17 13"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M7 6L12 11L17 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
interface HeroProps {
  hero?: {
    badge?: string;
    heading?: string;
    subheading?: string;
    backgroundImage?: {
      url: string;
      alternativeText?: string;
    };
    ctaButtons?: Array<{
      label: string;
      url: string;
      variant?: string;
    }>;
    features?: Array<{
      icon: string;
      text: string;
    }>;
  };
}

defineProps<HeroProps>();
</script>

<style lang="scss" scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  color: $color-white;

  &__background {
    position: absolute;
    inset: 0;
    z-index: -1;
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.4) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }

  &__content {
    text-align: center;
    padding: $spacing-8 $spacing-4;
    max-width: 800px;
    margin: 0 auto;
  }

  &__badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    padding: $spacing-2 $spacing-4;
    border-radius: $border-radius-full;
    font-size: $font-size-sm;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: $spacing-6;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 400;
    line-height: 1.1;
    margin-bottom: $spacing-6;
  }

  &__subtitle {
    font-size: $font-size-lg;
    opacity: 0.9;
    max-width: 600px;
    margin: 0 auto $spacing-8;
    line-height: 1.7;
  }

  &__cta {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: $spacing-12;

    .btn--outline {
      border-color: $color-white;
      color: $color-white;

      &:hover {
        background: $color-white;
        color: $color-dark;
      }
    }
  }

  &__features {
    display: flex;
    gap: $spacing-8;
    justify-content: center;
    flex-wrap: wrap;
  }

  &__feature {
    display: flex;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    opacity: 0.9;

    &-icon {
      font-size: 1.25rem;
    }
  }

  &__scroll {
    position: absolute;
    bottom: $spacing-8;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-2;
    font-size: $font-size-sm;
    opacity: 0.7;
    animation: bounce 2s infinite;

    span {
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  }
}

@keyframes bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(10px);
  }
}
</style>

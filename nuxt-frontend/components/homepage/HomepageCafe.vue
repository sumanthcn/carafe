<template>
  <section class="cafe-section">
    <div
      class="cafe-section__hero"
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
      <div class="cafe-section__overlay">
        <div class="container">
          <h2>{{ data?.headline || "THE HEART OF CARAFE" }}</h2>
          <p v-if="data?.description">{{ data.description }}</p>
          <NuxtLink
            v-if="data?.cta"
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();

interface CafeSectionProps {
  data?: {
    headline?: string;
    description?: string;
    backgroundImage?: any;
    cta?: {
      text: string;
      url: string;
      style?: "primary" | "secondary" | "outline" | "text";
      icon?: any;
      iconPosition?: "left" | "right";
      openInNewTab?: boolean;
    };
  };
}

defineProps<CafeSectionProps>();
</script>

<style lang="scss" scoped>
.cafe-section__hero {
  min-height: 380px;
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
  // background: rgba(0, 0, 0, 0.5);
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-white;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  p {
    color: $color-white;
    max-width: 800px;
    margin: 0 auto 2rem;
    line-height: 1;
    font-size: 1.125rem;
  }

  // Cafe-specific button overrides
  .btn {
    border-radius: 25px;
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

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

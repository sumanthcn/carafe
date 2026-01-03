<template>
  <section v-if="data" class="wholesale-section">
    <div class="container">
      <div class="wholesale-wrapper">
        <div v-if="data.image" class="wholesale-image">
          <img :src="getStrapiMediaUrl(data.image)" :alt="data.headline" />
        </div>
        <div class="wholesale-content">
          <h2>{{ data.headline || "PARTNER WITH US" }}</h2>
          <div
            v-if="data.content"
            class="wholesale-text"
            v-html="data.content"
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
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();

interface WholesaleSectionProps {
  data?: {
    headline?: string;
    content?: string;
    image?: any;
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

defineProps<WholesaleSectionProps>();
</script>

<style lang="scss" scoped>
.wholesale-section {
  padding: 2rem;

  @media (max-width: 767px) {
    padding: 0;
  }
}

.wholesale-wrapper {
  position: relative;
  min-height: 500px;
  display: flex;
  align-items: center;
}

.wholesale-image {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 60%;
  max-width: 700px;
  z-index: 1;

  @media (max-width: 767px) {
      display: none;
    }

  @media (max-width: 1023px) {
    position: relative;
    width: 100%;
    max-width: 100%;
    transform: none;
    top: auto;
    margin-bottom: 2rem;
  }

  img {
    width: 100%;
    height: auto;
    border-radius: 24px;
    object-fit: cover;

  }
}

.wholesale-content {
  position: relative;
  z-index: 2;
  background: white;
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 10px solid rgba(0, 0, 0, 0.05);
  max-width: 600px;
  min-height: 320px;

  @media (max-width: 1023px) {
    max-width: 100%;
  }

  @media (max-width: 767px) {
      padding: 3rem 2rem;
  }

  h2 {
    font-family: $font-heading;
    font-size: $font-size-4xl;
    color: $color-text;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
    font-weight: bold;

    @media (max-width: 767px) {
      font-size: $font-size-3xl;
    }
  }

  .wholesale-text {
    :deep(p) {
      color: $color-text;
      line-height: 1.8;
      margin-bottom: 1rem;
      font-size: 1rem;
    }
  }

  .btn {
    margin-top: 2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1rem 2rem;
    border-radius: 50px;
    font-weight: 600;

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

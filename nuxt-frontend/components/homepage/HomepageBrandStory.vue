<template>
  <section 
    v-if="data" 
    class="brand-story"
    :class="`brand-story--${backgroundColor}`"
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
            {{ data.headline || "FROM LEWES TO YOUR CUP" }}
          </h2>
          <div
            v-if="data.content"
            class="brand-story__text"
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
        <div v-if="data.image" class="brand-story__image">
          <img :src="getStrapiMediaUrl(data.image)" :alt="data.headline" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();

interface BrandStoryProps {
  data?: {
    headline?: string;
    content?: string;
    image?: any;
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

withDefaults(defineProps<BrandStoryProps>(), {
  backgroundColor: "default",
});

</script>

<style lang="scss" scoped>
.brand-story {
  padding: 0rem 2rem;

  @media (max-width: 767px) {
    padding: 2rem 0;
  }

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
      .brand-story__image {
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

  // Brand story specific button overrides
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

.brand-story__image {
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

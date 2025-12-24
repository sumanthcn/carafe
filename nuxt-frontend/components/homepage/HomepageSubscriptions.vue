<template>
  <section class="subscriptions">
    <div class="container">
      <div class="section-header">
        <span v-if="badge" class="section-badge">{{ badge }}</span>
        <h2 class="section-title">{{ title || "Coffee Subscriptions" }}</h2>
        <p v-if="subtitle" class="section-subtitle">{{ subtitle }}</p>
      </div>

      <div class="subscriptions__grid">
        <div
          v-for="subscription in subscriptions"
          :key="subscription.id"
          class="subscription-card"
          :class="{ 'subscription-card--featured': subscription.featured }"
        >
          <div v-if="subscription.featured" class="subscription-card__badge">
            Most Popular
          </div>

          <div class="subscription-card__header">
            <h3 class="subscription-card__name">{{ subscription.name }}</h3>
            <p
              v-if="subscription.description"
              class="subscription-card__description"
            >
              {{ subscription.description }}
            </p>
          </div>

          <div class="subscription-card__price">
            <span class="subscription-card__price-amount">
              £{{ subscription.price.toFixed(2) }}
            </span>
            <span class="subscription-card__price-period">
              / {{ subscription.frequency }}
            </span>
          </div>

          <ul
            v-if="subscription.features?.length"
            class="subscription-card__features"
          >
            <li v-for="feature in subscription.features" :key="feature">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13L9 17L19 7"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              {{ feature }}
            </li>
          </ul>

          <NuxtLink
            :to="`/subscriptions/${subscription.slug}`"
            :class="[
              'btn',
              subscription.featured ? 'btn--primary' : 'btn--outline',
            ]"
          >
            Choose Plan
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Subscription } from "~/types/strapi";

interface SubscriptionsProps {
  subscriptions: Subscription[];
  title?: string;
  subtitle?: string;
  badge?: string;
}

withDefaults(defineProps<SubscriptionsProps>(), {
  title: "Coffee Subscriptions",
});
</script>

<style lang="scss" scoped>
.subscriptions {
  padding: $spacing-16 0;
  background: $color-gray-50;

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: $spacing-6;
    margin-top: $spacing-12;
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  }
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.section-badge {
  display: inline-block;
  color: $color-primary;
  font-size: $font-size-sm;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: $spacing-4;
}

.section-title {
  font-family: $font-family-heading;
  font-size: $font-size-3xl;
  color: $color-dark;
  margin-bottom: $spacing-4;

  @include tablet {
    font-size: $font-size-4xl;
  }
}

.section-subtitle {
  color: $color-gray-600;
  font-size: $font-size-lg;
  line-height: 1.7;
}

.subscription-card {
  position: relative;
  background: $color-white;
  border-radius: $border-radius-lg;
  padding: $spacing-8;
  text-align: center;
  box-shadow: $shadow-sm;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-4px);
  }

  &--featured {
    border: 2px solid $color-primary;
    transform: scale(1.02);

    &:hover {
      transform: scale(1.02) translateY(-4px);
    }
  }

  &__badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: $color-primary;
    color: $color-white;
    padding: $spacing-1 $spacing-4;
    border-radius: $border-radius-full;
    font-size: $font-size-xs;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  &__header {
    margin-bottom: $spacing-6;
  }

  &__name {
    font-family: $font-family-heading;
    font-size: $font-size-xl;
    color: $color-dark;
    margin-bottom: $spacing-2;
  }

  &__description {
    font-size: $font-size-sm;
    color: $color-gray-500;
    line-height: 1.6;
  }

  &__price {
    margin-bottom: $spacing-6;
    padding: $spacing-4 0;
    border-top: 1px solid $color-gray-100;
    border-bottom: 1px solid $color-gray-100;

    &-amount {
      font-size: $font-size-4xl;
      font-weight: 600;
      color: $color-dark;
    }

    &-period {
      font-size: $font-size-sm;
      color: $color-gray-500;
    }
  }

  &__features {
    list-style: none;
    padding: 0;
    margin: 0 0 $spacing-6 0;
    flex: 1;

    li {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-2;
      padding: $spacing-2 0;
      color: $color-gray-700;
      font-size: $font-size-sm;

      svg {
        color: $color-success;
        flex-shrink: 0;
      }
    }
  }

  .btn {
    margin-top: auto;
    width: 100%;
  }
}
</style>

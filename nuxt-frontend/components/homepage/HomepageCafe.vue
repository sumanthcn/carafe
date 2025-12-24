<template>
  <section class="cafe-section">
    <div class="cafe-section__background">
      <NuxtImg
        v-if="data?.backgroundImage?.url"
        :src="data.backgroundImage.url"
        :alt="data.backgroundImage.alternativeText || 'Carafe Café'"
        preset="hero"
        loading="lazy"
      />
      <div class="cafe-section__overlay"></div>
    </div>

    <div class="container cafe-section__content">
      <div class="cafe-section__text">
        <span v-if="data?.badge" class="cafe-section__badge">
          {{ data.badge }}
        </span>

        <h2 class="cafe-section__title">
          {{ data?.heading || "Visit Our Café" }}
        </h2>

        <p v-if="data?.description" class="cafe-section__description">
          {{ data.description }}
        </p>
      </div>

      <div class="cafe-section__info">
        <div v-if="data?.address" class="cafe-section__address">
          <h3>Find Us</h3>
          <address>
            <span v-if="data.address.street">{{ data.address.street }}</span>
            <span v-if="data.address.city"
              >{{ data.address.city }}, {{ data.address.postcode }}</span
            >
            <span v-if="data.address.country">{{ data.address.country }}</span>
          </address>
          <a
            v-if="data.address.googleMapsUrl"
            :href="data.address.googleMapsUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="cafe-section__map-link"
          >
            Get Directions
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M7 17L17 7M17 7H8M17 7V16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>

        <div v-if="data?.openingHours?.length" class="cafe-section__hours">
          <h3>Opening Hours</h3>
          <ul>
            <li v-for="(hours, index) in data.openingHours" :key="index">
              <span class="day">{{ hours.days }}</span>
              <span class="time">{{ hours.hours }}</span>
            </li>
          </ul>
        </div>

        <div v-if="data?.phone || data?.email" class="cafe-section__contact">
          <h3>Contact</h3>
          <a v-if="data.phone" :href="`tel:${data.phone}`">{{ data.phone }}</a>
          <a v-if="data.email" :href="`mailto:${data.email}`">{{
            data.email
          }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface CafeSectionProps {
  data?: {
    badge?: string;
    heading?: string;
    description?: string;
    backgroundImage?: {
      url: string;
      alternativeText?: string;
    };
    address?: {
      street?: string;
      city?: string;
      postcode?: string;
      country?: string;
      googleMapsUrl?: string;
    };
    openingHours?: Array<{
      days: string;
      hours: string;
    }>;
    phone?: string;
    email?: string;
  };
}

defineProps<CafeSectionProps>();
</script>

<style lang="scss" scoped>
.cafe-section {
  position: relative;
  padding: $spacing-20 0;
  color: $color-white;
  min-height: 600px;
  display: flex;
  align-items: center;

  &__background {
    position: absolute;
    inset: 0;
    z-index: -1;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.85) 0%,
      rgba(0, 0, 0, 0.6) 100%
    );
  }

  &__content {
    display: grid;
    gap: $spacing-12;

    @include tablet {
      grid-template-columns: 1fr 1fr;
      align-items: center;
    }
  }

  &__badge {
    display: inline-block;
    color: $color-primary;
    font-size: $font-size-sm;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-bottom: $spacing-4;
  }

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-3xl;
    margin-bottom: $spacing-4;

    @include tablet {
      font-size: $font-size-4xl;
    }
  }

  &__description {
    font-size: $font-size-lg;
    opacity: 0.9;
    line-height: 1.7;
  }

  &__info {
    display: grid;
    gap: $spacing-8;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    padding: $spacing-8;
    border-radius: $border-radius-lg;
    border: 1px solid rgba(255, 255, 255, 0.2);

    h3 {
      font-size: $font-size-sm;
      text-transform: uppercase;
      letter-spacing: 2px;
      opacity: 0.7;
      margin-bottom: $spacing-3;
    }
  }

  &__address {
    address {
      font-style: normal;
      line-height: 1.8;

      span {
        display: block;
      }
    }
  }

  &__map-link {
    display: inline-flex;
    align-items: center;
    gap: $spacing-2;
    color: $color-primary;
    text-decoration: none;
    font-weight: 500;
    margin-top: $spacing-3;

    &:hover {
      text-decoration: underline;
    }
  }

  &__hours {
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      display: flex;
      justify-content: space-between;
      padding: $spacing-2 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }
    }

    .day {
      font-weight: 500;
    }

    .time {
      opacity: 0.9;
    }
  }

  &__contact {
    a {
      display: block;
      color: $color-white;
      text-decoration: none;
      padding: $spacing-2 0;

      &:hover {
        color: $color-primary;
      }
    }
  }
}
</style>

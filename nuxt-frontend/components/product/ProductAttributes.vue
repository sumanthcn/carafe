<template>
  <div v-if="attributes" class="product-attributes">
    <h2 class="attributes-title">Coffee Details</h2>
    <div class="attributes-grid">
      <div v-if="attributes.taste" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
            <line x1="6" y1="1" x2="6" y2="4"/>
            <line x1="10" y1="1" x2="10" y2="4"/>
            <line x1="14" y1="1" x2="14" y2="4"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Taste</h3>
          <p class="attribute-value">{{ attributes.taste }}</p>
        </div>
      </div>

      <div v-if="attributes.origin" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Origin</h3>
          <p class="attribute-value">{{ attributes.origin }}</p>
        </div>
      </div>

      <div v-if="attributes.region" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Region</h3>
          <p class="attribute-value">{{ attributes.region }}</p>
        </div>
      </div>

      <div v-if="attributes.varietal" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Varietal</h3>
          <p class="attribute-value">{{ attributes.varietal }}</p>
        </div>
      </div>

      <div v-if="attributes.process" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Process</h3>
          <p class="attribute-value">{{ attributes.process }}</p>
        </div>
      </div>

      <div v-if="attributes.altitude" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 3l7 16H3l3-7 4 4 4-13z"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Altitude</h3>
          <p class="attribute-value">{{ attributes.altitude }}</p>
        </div>
      </div>

      <div v-if="attributes.bestServed" class="attribute-item">
        <div class="attribute-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="attribute-content">
          <h3 class="attribute-label">Best Served</h3>
          <p class="attribute-value">{{ attributes.bestServed }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductAttributes } from '~/types/strapi';

interface Props {
  attributes: ProductAttributes | null | undefined;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.product-attributes {
  padding: 0;
  background: white;
}

.attributes-title {
  font-family: $font-family-heading;
  font-size: 1.2rem;
  font-weight: bold;
  text-transform: uppercase;
  margin: 0 0 1rem 0;
  color: $color-text;
}

.attributes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.attribute-item {
  display: flex;
  gap: 1rem;
  padding: 0.875rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.attribute-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  border: 2px solid $color-primary;
  color: $color-primary;

  svg {
    width: 24px;
    height: 24px;
  }
}

.attribute-content {
  flex: 1;
}

.attribute-label {
  font-family: $font-family-heading;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
  color: $color-text-light;
}

.attribute-value {
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  color: $color-text;
  font-weight: 500;
}
</style>

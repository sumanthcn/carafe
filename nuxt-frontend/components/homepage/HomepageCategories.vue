<template>
  <section v-if="tasteTheCraft" class="taste-the-craft">
    <div class="container">
      <h2 class="taste-the-craft__title">
        {{ tasteTheCraft.headline }}
      </h2>
      <p v-if="tasteTheCraft.description" class="taste-the-craft__description">
        {{ tasteTheCraft.description }}
      </p>

      <div
        v-if="tasteTheCraft.categories?.length"
        class="taste-the-craft__categories"
      >
        <div
          v-for="category in tasteTheCraft.categories"
          :key="category.id"
          class="category-item"
        >
          <div v-if="category.icon" class="category-item__icon">
            <img :src="getStrapiMediaUrl(category.icon)" :alt="category.name" />
          </div>
          <h3 class="category-item__name">{{ category.name }}</h3>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { getStrapiMediaUrl } = useStrapi();

interface TasteTheCraftProps {
  tasteTheCraft?: {
    headline?: string;
    description?: string;
    categories?: Array<{
      id: number;
      documentId: string;
      name: string;
      icon?: any;
    }>;
  };
}

defineProps<TasteTheCraftProps>();
</script>

<style lang="scss" scoped>
.taste-the-craft {
  padding: 4rem 0;
  background: $color-background-alt;

  &__title {
    font-family: $font-family-heading;
    font-size: $font-size-4xl;
    text-transform: uppercase;
    font-weight: bold;
    text-align: center;
    margin-bottom: 1rem;
    color: $color-text;
  }

  &__description {
    text-align: center;
    font-size: 1.1rem;
    color: $color-text;
    max-width: 65%;
    margin: 0 auto 3rem;

    @media (max-width: 767px) {
      max-width: 100%;
    }
  }

  &__categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 25px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }

  &__icon {
    width: 100px;
    height: 100px;
    background-color: $color-primary;
    border-radius: 50%;
    padding: $spacing-3;
    position: relative;

    img {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 55%;
      object-fit: contain;
      margin-bottom: 1rem;
    }
  }

  &__name {
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-text;
    text-align: center;
    margin-top: 20px;
    font-weight: bold;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

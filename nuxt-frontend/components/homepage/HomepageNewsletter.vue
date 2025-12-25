<template>
  <section class="newsletter-section">
    <div class="container">
      <h2>{{ data?.headline || "JOIN OUR COFFEE CIRCLE" }}</h2>
      <p v-if="data?.description">{{ data.description }}</p>
      <form class="newsletter-form" @submit.prevent="() => {}">
        <input type="email" placeholder="ENTER YOUR EMAIL ADDRESS" required />
        <button type="submit" class="btn-primary">SUBSCRIBE</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
interface NewsletterProps {
  data?: {
    headline?: string;
    description?: string;
  };
}

defineProps<NewsletterProps>();
</script>

<style lang="scss" scoped>
.newsletter-section {
  padding: 4rem 2rem;
  background: $color-secondary;
  color: white;
  text-align: center;

  h2 {
    font-family: $font-heading;
    font-size: clamp(1.75rem, 3vw, 2.5rem);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  p {
    margin-bottom: 2rem;
    opacity: 0.9;
  }
}

.newsletter-form {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  input {
    flex: 1;
    min-width: 250px;
    padding: 1rem 1.5rem;
    border: 2px solid white;
    border-radius: 4px;
    background: transparent;
    color: white;
    font-size: 0.875rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    &:focus {
      outline: none;
      background: rgba(255, 255, 255, 0.1);
    }
  }

  button {
    padding: 1rem 2rem;
  }
}

.btn-primary {
  display: inline-block;
  background: $color-primary;
  color: white;
  padding: 1rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>

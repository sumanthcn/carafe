<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "About Us - Carafe Coffee House & Roasters",
  description:
    "Learn about our story, our passion for coffee, and our commitment to quality and sustainability.",
});
</script>

<template>
  <div class="page-about">
    <section class="hero-section">
      <div class="container">
        <h1>About Carafe Coffee</h1>
        <p class="lead">
          Crafting exceptional coffee experiences since our inception
        </p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="content-grid">
          <div class="content-block">
            <h2>Our Story</h2>
            <p>
              Carafe Coffee House & Roasters was born from a passion for
              exceptional coffee and community. What started as a small roastery
              has grown into a beloved gathering place for coffee enthusiasts.
            </p>
            <p>
              We source our beans directly from sustainable farms around the
              world, ensuring quality and fair trade practices at every step.
            </p>
          </div>

          <div class="content-block">
            <h2>Our Mission</h2>
            <p>
              To deliver the finest coffee experience while supporting
              sustainable farming practices and building meaningful connections
              within our community.
            </p>
          </div>

          <div class="content-block">
            <h2>Our Values</h2>
            <ul>
              <li>Quality over quantity</li>
              <li>Sustainability and ethical sourcing</li>
              <li>Community engagement</li>
              <li>Continuous learning and improvement</li>
              <li>Passion for the craft</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-about {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  color: white;
  padding: 8rem 2rem 4rem;
  text-align: center;

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }

  .lead {
    font-size: 1.25rem;
    opacity: 0.9;
  }
}

.content-section {
  padding: 4rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content-grid {
  display: grid;
  gap: 3rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.content-block {
  h2 {
    color: $color-primary;
    margin-bottom: 1rem;
    font-size: 1.75rem;
  }

  p {
    line-height: 1.8;
    color: $color-text;
    margin-bottom: 1rem;
  }

  ul {
    list-style: none;
    padding: 0;

    li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;

      &::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: $color-primary;
        font-weight: bold;
      }
    }
  }
}
</style>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Art & Culture - Carafe Coffee House",
  description:
    "Discover our commitment to supporting local artists and cultural events at Carafe Coffee House.",
});
</script>

<template>
  <div class="page-art-culture">
    <section class="hero-section">
      <div class="container">
        <h1>Art & Culture</h1>
        <p class="lead">Where coffee meets creativity</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="intro">
          <p class="intro-text">
            At Carafe, we believe that great coffee and great art go hand in
            hand. Our spaces serve as a gallery for local artists and a venue
            for cultural events that bring our community together.
          </p>
        </div>

        <div class="content-grid">
          <div class="content-block">
            <h2>Featured Artists</h2>
            <p>
              Each month, we showcase works from talented local artists. Our
              walls are adorned with rotating exhibitions ranging from paintings
              and photography to mixed media installations.
            </p>
            <p>
              All artwork is available for purchase, with proceeds supporting
              the artists directly.
            </p>
          </div>

          <div class="content-block">
            <h2>Live Events</h2>
            <p>Join us for regular cultural events including:</p>
            <ul>
              <li>Live acoustic music performances</li>
              <li>Poetry readings and open mic nights</li>
              <li>Art workshops and creative sessions</li>
              <li>Book club meetups</li>
              <li>Coffee tasting and brewing workshops</li>
            </ul>
          </div>

          <div class="content-block">
            <h2>Community Space</h2>
            <p>
              Our café is designed to be more than just a place for coffee. It's
              a gathering space for creatives, thinkers, and community members
              to connect and collaborate.
            </p>
          </div>

          <div class="content-block">
            <h2>Get Involved</h2>
            <p>
              Are you an artist looking to showcase your work? Or do you have an
              idea for a community event? We'd love to hear from you!
            </p>
            <p>
              <strong>Contact us:</strong> events@carafecoffee.com
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-art-culture {
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

.intro {
  text-align: center;
  margin-bottom: 4rem;
}

.intro-text {
  font-size: 1.25rem;
  line-height: 1.8;
  color: $color-text;
  max-width: 800px;
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
        content: "•";
        position: absolute;
        left: 0;
        color: $color-primary;
        font-weight: bold;
        font-size: 1.5rem;
        line-height: 1;
      }
    }
  }

  strong {
    color: $color-secondary;
  }
}
</style>

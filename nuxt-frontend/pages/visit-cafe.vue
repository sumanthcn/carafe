<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Visit Our Café - Carafe Coffee House",
  description:
    "Find our locations, hours, and plan your visit to Carafe Coffee House.",
});
</script>

<template>
  <div class="page-visit-cafe">
    <section class="hero-section">
      <div class="container">
        <h1>Visit Our Café</h1>
        <p class="lead">Come experience exceptional coffee in a warm atmosphere</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="locations-grid">
          <div class="location-card">
            <h2>Downtown Location</h2>
            <div class="location-info">
              <div class="info-item">
                <strong>Address:</strong>
                <p>123 Coffee Street<br />Downtown, City 12345</p>
              </div>
              <div class="info-item">
                <strong>Hours:</strong>
                <p>
                  Monday - Friday: 7:00 AM - 7:00 PM<br />
                  Saturday - Sunday: 8:00 AM - 6:00 PM
                </p>
              </div>
              <div class="info-item">
                <strong>Phone:</strong>
                <p>(555) 123-4567</p>
              </div>
            </div>
          </div>

          <div class="location-card">
            <h2>Northside Location</h2>
            <div class="location-info">
              <div class="info-item">
                <strong>Address:</strong>
                <p>456 Brew Avenue<br />Northside, City 12346</p>
              </div>
              <div class="info-item">
                <strong>Hours:</strong>
                <p>
                  Monday - Friday: 6:30 AM - 8:00 PM<br />
                  Saturday - Sunday: 7:00 AM - 7:00 PM
                </p>
              </div>
              <div class="info-item">
                <strong>Phone:</strong>
                <p>(555) 987-6543</p>
              </div>
            </div>
          </div>
        </div>

        <div class="amenities">
          <h2>Amenities</h2>
          <div class="amenities-grid">
            <div class="amenity-item">☕ Specialty Coffee</div>
            <div class="amenity-item">🥐 Fresh Pastries</div>
            <div class="amenity-item">📶 Free WiFi</div>
            <div class="amenity-item">💺 Outdoor Seating</div>
            <div class="amenity-item">🅿️ Parking Available</div>
            <div class="amenity-item">♿ Wheelchair Accessible</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-visit-cafe {
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

.locations-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.location-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    color: $color-primary;
    margin-bottom: 1.5rem;
    font-size: 1.75rem;
  }
}

.location-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-item {
  strong {
    display: block;
    color: $color-secondary;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-text;
    line-height: 1.6;
    margin: 0;
  }
}

.amenities {
  text-align: center;

  h2 {
    color: $color-primary;
    margin-bottom: 2rem;
    font-size: 2rem;
  }
}

.amenities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.amenity-item {
  background: $color-background-alt;
  padding: 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  color: $color-text;
}
</style>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Coffee Subscriptions - Carafe Coffee",
  description:
    "Never run out of great coffee. Subscribe and get fresh roasted coffee delivered to your door.",
});
</script>

<template>
  <div class="page-subscriptions">
    <section class="hero-section">
      <div class="container">
        <h1>Coffee Subscriptions</h1>
        <p class="lead">Fresh coffee delivered to your door, every month</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="intro">
          <p class="intro-text">
            Never run out of your favorite coffee. Our subscription service
            delivers freshly roasted beans straight to your door on your
            schedule.
          </p>
        </div>

        <div class="plans-grid">
          <div class="plan-card">
            <h2>Monthly Plan</h2>
            <div class="plan-price">
              <span class="price">$24.99</span>
              <span class="period">/month</span>
            </div>
            <ul class="plan-features">
              <li>1 bag of coffee (250g)</li>
              <li>Choose your roast level</li>
              <li>Free shipping</li>
              <li>Cancel anytime</li>
              <li>10% off regular price</li>
            </ul>
            <button class="btn-subscribe">Subscribe Now</button>
          </div>

          <div class="plan-card plan-card--featured">
            <div class="plan-badge">Most Popular</div>
            <h2>Bi-Weekly Plan</h2>
            <div class="plan-price">
              <span class="price">$44.99</span>
              <span class="period">/month</span>
            </div>
            <ul class="plan-features">
              <li>2 bags of coffee (500g)</li>
              <li>Choose your roast level</li>
              <li>Free shipping</li>
              <li>Cancel anytime</li>
              <li>15% off regular price</li>
              <li>Priority roasting</li>
            </ul>
            <button class="btn-subscribe btn-subscribe--featured">Subscribe Now</button>
          </div>

          <div class="plan-card">
            <h2>Weekly Plan</h2>
            <div class="plan-price">
              <span class="price">$79.99</span>
              <span class="period">/month</span>
            </div>
            <ul class="plan-features">
              <li>4 bags of coffee (1kg)</li>
              <li>Choose your roast level</li>
              <li>Free shipping</li>
              <li>Cancel anytime</li>
              <li>20% off regular price</li>
              <li>Priority roasting</li>
              <li>Exclusive varieties</li>
            </ul>
            <button class="btn-subscribe">Subscribe Now</button>
          </div>
        </div>

        <div class="benefits">
          <h2>Why Subscribe?</h2>
          <div class="benefits-grid">
            <div class="benefit">
              <div class="benefit-icon">📦</div>
              <h3>Always Fresh</h3>
              <p>We roast your beans just before shipping for maximum freshness</p>
            </div>
            <div class="benefit">
              <div class="benefit-icon">🚚</div>
              <h3>Free Delivery</h3>
              <p>Free shipping on all subscription orders</p>
            </div>
            <div class="benefit">
              <div class="benefit-icon">💰</div>
              <h3>Save Money</h3>
              <p>Up to 20% off compared to one-time purchases</p>
            </div>
            <div class="benefit">
              <div class="benefit-icon">⚙️</div>
              <h3>Flexible</h3>
              <p>Pause, skip, or cancel your subscription anytime</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-subscriptions {
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

.plans-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.plan-card {
  background: white;
  border: 2px solid $color-border;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  &--featured {
    border-color: $color-primary;
    box-shadow: 0 4px 20px rgba($color-primary, 0.2);

    .plan-badge {
      display: block;
    }
  }

  h2 {
    color: $color-secondary;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
}

.plan-badge {
  display: none;
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: $color-primary;
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.plan-price {
  margin-bottom: 2rem;

  .price {
    font-size: 2.5rem;
    font-weight: 700;
    color: $color-primary;
  }

  .period {
    color: $color-text-light;
    font-size: 1rem;
  }
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  text-align: left;

  li {
    padding: 0.75rem 0;
    padding-left: 1.5rem;
    position: relative;
    color: $color-text;

    &::before {
      content: "✓";
      position: absolute;
      left: 0;
      color: $color-primary;
      font-weight: bold;
    }
  }
}

.btn-subscribe {
  width: 100%;
  padding: 1rem 2rem;
  background: $color-primary;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }

  &--featured {
    background: $color-secondary;

    &:hover {
      background: darken($color-secondary, 10%);
    }
  }
}

.benefits {
  margin-top: 4rem;

  h2 {
    text-align: center;
    color: $color-primary;
    font-size: 2rem;
    margin-bottom: 3rem;
  }
}

.benefits-grid {
  display: grid;
  gap: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.benefit {
  text-align: center;

  .benefit-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: $color-secondary;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  p {
    color: $color-text;
    line-height: 1.6;
    font-size: 0.9rem;
  }
}
</style>

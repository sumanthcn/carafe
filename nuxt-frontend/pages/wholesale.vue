<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Wholesale Coffee - Carafe Coffee Roasters",
  description:
    "Partner with Carafe Coffee for wholesale coffee supplies. Premium beans for restaurants, cafés, and offices.",
});

const form = ref({
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  businessType: "",
  message: "",
});

const isSubmitting = ref(false);
const submitSuccess = ref(false);

async function handleSubmit() {
  isSubmitting.value = true;
  // Simulate form submission
  setTimeout(() => {
    isSubmitting.value = false;
    submitSuccess.value = true;
    form.value = {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      businessType: "",
      message: "",
    };
  }, 1000);
}
</script>

<template>
  <div class="page-wholesale">
    <section class="hero-section">
      <div class="container">
        <h1>Wholesale Coffee</h1>
        <p class="lead">
          Premium coffee for your business. Roasted to perfection, delivered
          with care.
        </p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="intro">
          <h2>Partner With Us</h2>
          <p>
            We supply premium, freshly roasted coffee to restaurants, cafés,
            hotels, and offices. Our wholesale program offers competitive
            pricing, consistent quality, and personalized service.
          </p>
        </div>

        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">☕</div>
            <h3>Premium Quality</h3>
            <p>
              Hand-selected beans from the world's finest coffee-growing regions
            </p>
          </div>

          <div class="benefit-card">
            <div class="benefit-icon">🚚</div>
            <h3>Reliable Delivery</h3>
            <p>Consistent supply schedule tailored to your business needs</p>
          </div>

          <div class="benefit-card">
            <div class="benefit-icon">🎓</div>
            <h3>Training & Support</h3>
            <p>
              Barista training and brewing guidance to help your team excel
            </p>
          </div>

          <div class="benefit-card">
            <div class="benefit-icon">💰</div>
            <h3>Competitive Pricing</h3>
            <p>Volume discounts and flexible payment terms for partners</p>
          </div>
        </div>

        <div class="form-section">
          <h2>Request Information</h2>
          <form v-if="!submitSuccess" @submit.prevent="handleSubmit">
            <div class="form-grid">
              <div class="form-group">
                <label for="businessName">Business Name *</label>
                <input
                  id="businessName"
                  v-model="form.businessName"
                  type="text"
                  required
                />
              </div>

              <div class="form-group">
                <label for="contactName">Contact Name *</label>
                <input
                  id="contactName"
                  v-model="form.contactName"
                  type="text"
                  required
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                />
              </div>

              <div class="form-group">
                <label for="phone">Phone *</label>
                <input id="phone" v-model="form.phone" type="tel" required />
              </div>

              <div class="form-group full-width">
                <label for="businessType">Business Type</label>
                <select id="businessType" v-model="form.businessType">
                  <option value="">Select...</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Café</option>
                  <option value="hotel">Hotel</option>
                  <option value="office">Office</option>
                  <option value="retail">Retail</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label for="message">Message</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="5"
                ></textarea>
              </div>
            </div>

            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? "Sending..." : "Submit Request" }}
            </button>
          </form>

          <div v-else class="success-message">
            <h3>✓ Thank You!</h3>
            <p>
              We've received your inquiry and will contact you within 1-2
              business days.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-wholesale {
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
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  h2 {
    color: $color-primary;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.125rem;
    line-height: 1.8;
    color: $color-text;
  }
}

.benefits-grid {
  display: grid;
  gap: 2rem;
  margin-bottom: 4rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.benefit-card {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

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

.form-section {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 3rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  h2 {
    color: $color-primary;
    margin-bottom: 2rem;
    text-align: center;
    font-size: 2rem;
  }
}

.form-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;

  &.full-width {
    grid-column: 1 / -1;
  }

  label {
    margin-bottom: 0.5rem;
    color: $color-secondary;
    font-weight: 500;
  }

  input,
  select,
  textarea {
    padding: 0.75rem;
    border: 1px solid $color-border;
    border-radius: 6px;
    font-family: $font-body;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  textarea {
    resize: vertical;
  }
}

.btn-submit {
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

  &:hover:not(:disabled) {
    background: $color-primary-dark;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.success-message {
  text-align: center;
  padding: 2rem;

  h3 {
    color: $color-success;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  p {
    color: $color-text;
    font-size: 1.125rem;
  }
}
</style>

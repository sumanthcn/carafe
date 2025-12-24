<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Contact Us - Carafe Coffee House & Roasters",
  description:
    "Get in touch with Carafe Coffee. We'd love to hear from you!",
});

const form = ref({
  name: "",
  email: "",
  subject: "",
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
      name: "",
      email: "",
      subject: "",
      message: "",
    };

    // Reset success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 5000);
  }, 1000);
}
</script>

<template>
  <div class="page-contact">
    <section class="hero-section">
      <div class="container">
        <h1>Contact Us</h1>
        <p class="lead">We'd love to hear from you</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="contact-grid">
          <div class="contact-info">
            <h2>Get In Touch</h2>
            <p>
              Have a question, feedback, or just want to say hello? Fill out the
              form and we'll get back to you as soon as possible.
            </p>

            <div class="info-blocks">
              <div class="info-block">
                <h3>📍 Location</h3>
                <p>123 Coffee Street<br />Downtown, City 12345</p>
              </div>

              <div class="info-block">
                <h3>📞 Phone</h3>
                <p>(555) 123-4567</p>
              </div>

              <div class="info-block">
                <h3>📧 Email</h3>
                <p>hello@carafecoffee.com</p>
              </div>

              <div class="info-block">
                <h3>⏰ Hours</h3>
                <p>
                  Mon-Fri: 7:00 AM - 7:00 PM<br />
                  Sat-Sun: 8:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>

          <div class="contact-form-wrapper">
            <form v-if="!submitSuccess" @submit.prevent="handleSubmit">
              <div class="form-group">
                <label for="name">Name *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="Your name"
                />
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input
                  id="email"
                  v-model="form.email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div class="form-group">
                <label for="subject">Subject *</label>
                <input
                  id="subject"
                  v-model="form.subject"
                  type="text"
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div class="form-group">
                <label for="message">Message *</label>
                <textarea
                  id="message"
                  v-model="form.message"
                  rows="6"
                  required
                  placeholder="Tell us more..."
                ></textarea>
              </div>

              <button type="submit" class="btn-submit" :disabled="isSubmitting">
                {{ isSubmitting ? "Sending..." : "Send Message" }}
              </button>
            </form>

            <div v-else class="success-message">
              <div class="success-icon">✓</div>
              <h3>Message Sent!</h3>
              <p>
                Thank you for contacting us. We'll get back to you within 24
                hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-contact {
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

.contact-grid {
  display: grid;
  gap: 3rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1.5fr;
  }
}

.contact-info {
  h2 {
    color: $color-primary;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  > p {
    color: $color-text;
    line-height: 1.8;
    margin-bottom: 2rem;
  }
}

.info-blocks {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-block {
  h3 {
    color: $color-secondary;
    font-size: 1.125rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-text;
    line-height: 1.6;
    margin: 0;
  }
}

.contact-form-wrapper {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: $color-secondary;
    font-weight: 500;
  }

  input,
  textarea {
    width: 100%;
    padding: 0.875rem;
    border: 1px solid $color-border;
    border-radius: 6px;
    font-family: $font-body;
    font-size: 1rem;
    transition: border-color 0.2s ease;

    &:focus {
      outline: none;
      border-color: $color-primary;
    }

    &::placeholder {
      color: $color-text-muted;
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
    box-shadow: 0 4px 12px rgba($color-primary, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.success-message {
  text-align: center;
  padding: 3rem 2rem;

  .success-icon {
    width: 64px;
    height: 64px;
    background: $color-success;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    margin: 0 auto 1.5rem;
    font-weight: bold;
  }

  h3 {
    color: $color-success;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }

  p {
    color: $color-text;
    font-size: 1.125rem;
  }
}
</style>

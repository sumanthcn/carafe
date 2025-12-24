<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Gift Vouchers - Carafe Coffee",
  description: "Give the gift of great coffee with Carafe gift vouchers.",
});

const selectedAmount = ref(50);
const customAmount = ref("");
const form = ref({
  recipientName: "",
  recipientEmail: "",
  senderName: "",
  message: "",
});
</script>

<template>
  <div class="page-gift-vouchers">
    <section class="hero-section">
      <div class="container">
        <h1>Gift Vouchers</h1>
        <p class="lead">Share the love of exceptional coffee</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="content-grid">
          <div class="voucher-info">
            <h2>The Perfect Gift</h2>
            <p>
              Give your loved ones the gift of choice with a Carafe Coffee gift
              voucher. Perfect for coffee lovers, our vouchers can be used for
              any product in our shop or café.
            </p>

            <div class="info-blocks">
              <div class="info-block">
                <h3>✉️ Instant Delivery</h3>
                <p>Gift vouchers are delivered instantly via email</p>
              </div>
              <div class="info-block">
                <h3>🎁 No Expiry</h3>
                <p>Our vouchers never expire - use them whenever you like</p>
              </div>
              <div class="info-block">
                <h3>💳 Easy to Redeem</h3>
                <p>Simply enter the code at checkout online or in-store</p>
              </div>
              <div class="info-block">
                <h3>🔄 Flexible</h3>
                <p>Can be used for multiple purchases until balance is zero</p>
              </div>
            </div>
          </div>

          <div class="voucher-form">
            <h2>Purchase a Gift Voucher</h2>

            <div class="form-group">
              <label>Select Amount</label>
              <div class="amount-options">
                <button
                  v-for="amount in [25, 50, 75, 100]"
                  :key="amount"
                  class="amount-btn"
                  :class="{ 'amount-btn--active': selectedAmount === amount }"
                  @click="selectedAmount = amount; customAmount = ''"
                >
                  ${{ amount }}
                </button>
              </div>
              <input
                v-model="customAmount"
                type="number"
                placeholder="Or enter custom amount"
                class="custom-amount"
                @input="selectedAmount = 0"
              />
            </div>

            <div class="form-group">
              <label for="recipientName">Recipient Name *</label>
              <input
                id="recipientName"
                v-model="form.recipientName"
                type="text"
                required
              />
            </div>

            <div class="form-group">
              <label for="recipientEmail">Recipient Email *</label>
              <input
                id="recipientEmail"
                v-model="form.recipientEmail"
                type="email"
                required
              />
            </div>

            <div class="form-group">
              <label for="senderName">Your Name *</label>
              <input
                id="senderName"
                v-model="form.senderName"
                type="text"
                required
              />
            </div>

            <div class="form-group">
              <label for="message">Personal Message (Optional)</label>
              <textarea
                id="message"
                v-model="form.message"
                rows="4"
                placeholder="Add a personal message..."
              ></textarea>
            </div>

            <div class="total">
              <span>Total:</span>
              <span class="total-amount"
                >${{ customAmount || selectedAmount }}</span
              >
            </div>

            <button class="btn-purchase">Purchase Gift Voucher</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-gift-vouchers {
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

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1.2fr;
  }
}

.voucher-info {
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

.voucher-form {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);

  h2 {
    color: $color-primary;
    margin-bottom: 2rem;
    font-size: 1.75rem;
  }
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

    &:focus {
      outline: none;
      border-color: $color-primary;
    }
  }

  textarea {
    resize: vertical;
  }
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.amount-btn {
  padding: 1rem;
  background: white;
  border: 2px solid $color-border;
  border-radius: 6px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
  }

  &--active {
    background: $color-primary;
    color: white;
    border-color: $color-primary;
  }
}

.custom-amount {
  margin-top: 0.75rem;
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: $color-background-alt;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;

  .total-amount {
    color: $color-primary;
    font-size: 2rem;
  }
}

.btn-purchase {
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
}
</style>

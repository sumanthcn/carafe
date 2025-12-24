<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Terms & Conditions - Carafe Coffee",
  description: "Read our terms and conditions for using our website and purchasing our products.",
});
</script>

<template>
  <div class="page-legal">
    <section class="hero-section">
      <div class="container">
        <h1>Terms & Conditions</h1>
        <p class="lead">Last updated: December 24, 2025</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="legal-content">
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using the Carafe Coffee House & Roasters website and
            services, you agree to be bound by these Terms and Conditions. If you
            do not agree with any part of these terms, you may not use our
            services.
          </p>

          <h2>2. Products and Services</h2>
          <h3>2.1 Product Information</h3>
          <p>
            We strive to provide accurate product descriptions and pricing.
            However, we do not warrant that product descriptions, pricing, or
            other content is accurate, complete, reliable, current, or error-free.
          </p>

          <h3>2.2 Pricing</h3>
          <p>
            All prices are in USD and are subject to change without notice. We
            reserve the right to modify or discontinue products at any time.
          </p>

          <h2>3. Orders and Payment</h2>
          <h3>3.1 Order Acceptance</h3>
          <p>
            We reserve the right to refuse or cancel any order for any reason,
            including product availability, errors in pricing or product
            information, or suspected fraud.
          </p>

          <h3>3.2 Payment</h3>
          <p>
            Payment must be received before orders are processed. We accept major
            credit cards and other payment methods as indicated on our website.
          </p>

          <h2>4. Shipping and Delivery</h2>
          <p>
            Shipping times are estimates and may vary. We are not responsible for
            delays caused by shipping carriers or circumstances beyond our
            control. Risk of loss and title for products pass to you upon
            delivery to the carrier.
          </p>

          <h2>5. Returns and Refunds</h2>
          <h3>5.1 Return Policy</h3>
          <p>
            Due to the nature of our fresh roasted coffee products, we can only
            accept returns for damaged or defective items. Please contact us
            within 7 days of receipt for such issues.
          </p>

          <h3>5.2 Refunds</h3>
          <p>
            Approved refunds will be processed within 7-10 business days and
            credited to the original payment method.
          </p>

          <h2>6. Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images,
            and software, is the property of Carafe Coffee House & Roasters and is
            protected by copyright and other intellectual property laws.
          </p>

          <h2>7. User Accounts</h2>
          <p>
            If you create an account, you are responsible for maintaining the
            confidentiality of your account information and for all activities
            that occur under your account.
          </p>

          <h2>8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Carafe Coffee House & Roasters
            shall not be liable for any indirect, incidental, special, or
            consequential damages arising out of or in connection with your use of
            our website or products.
          </p>

          <h2>9. Governing Law</h2>
          <p>
            These Terms and Conditions are governed by and construed in accordance
            with the laws of the jurisdiction in which we operate.
          </p>

          <h2>10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time.
            Changes will be effective immediately upon posting to the website.
            Your continued use of our services constitutes acceptance of the
            modified terms.
          </p>

          <h2>11. Contact Information</h2>
          <p>
            For questions about these Terms and Conditions, please contact us at:
          </p>
          <p>
            Email: legal@carafecoffee.com<br />
            Phone: (555) 123-4567<br />
            Address: 123 Coffee Street, Downtown, City 12345
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.page-legal {
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
    font-size: 1rem;
    opacity: 0.9;
  }
}

.content-section {
  padding: 4rem 2rem;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

.legal-content {
  h2 {
    color: $color-primary;
    font-size: 1.75rem;
    margin-top: 3rem;
    margin-bottom: 1rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h3 {
    color: $color-secondary;
    font-size: 1.25rem;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
  }

  p {
    color: $color-text;
    line-height: 1.8;
    margin-bottom: 1.5rem;
  }

  ul {
    margin-bottom: 1.5rem;
    padding-left: 2rem;

    li {
      color: $color-text;
      line-height: 1.8;
      margin-bottom: 0.5rem;
    }
  }
}
</style>

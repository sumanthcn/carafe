<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Privacy Policy - Carafe Coffee",
  description: "Read our privacy policy to understand how we collect, use, and protect your personal information.",
});
</script>

<template>
  <div class="page-legal">
    <section class="hero-section">
      <div class="container">
        <h1>Privacy Policy</h1>
        <p class="lead">Last updated: December 24, 2025</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <div class="legal-content">
          <h2>Introduction</h2>
          <p>
            At Carafe Coffee House & Roasters ("we," "our," or "us"), we are
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you visit our website or make a purchase from us.
          </p>

          <h2>Information We Collect</h2>
          <h3>Personal Information</h3>
          <p>We may collect personal information that you provide to us, including:</p>
          <ul>
            <li>Name and contact information (email, phone, address)</li>
            <li>Payment information (processed securely through our payment provider)</li>
            <li>Order history and preferences</li>
            <li>Account credentials if you create an account</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>When you visit our website, we automatically collect certain information:</p>
          <ul>
            <li>Browser type and version</li>
            <li>IP address</li>
            <li>Pages visited and time spent on pages</li>
            <li>Referring website addresses</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and inquiries</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our website and services</li>
            <li>Prevent fraud and enhance security</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li>Service providers who assist us in operating our business</li>
            <li>Payment processors to complete transactions</li>
            <li>Shipping companies to deliver your orders</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience,
            analyze usage, and deliver personalized content. You can control
            cookies through your browser settings.
          </p>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal information. However, no method of transmission
            over the internet is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Object to processing of your data</li>
          </ul>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@carafecoffee.com<br />
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

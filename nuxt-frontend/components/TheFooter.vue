<script setup lang="ts">
// Use global settings composable instead of props
const { getStrapiMediaUrl } = useStrapi();
const {
  globalSettings: settings,
  logo,
  siteName,
  address,
  openingHours,
  socialLinks,
  contactInfo,
} = useGlobalSettings();

const currentYear = new Date().getFullYear();

const socialIcons: Record<string, string> = {
  instagram:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>',
  facebook:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>',
  twitter:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>',
  tripadvisor:
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/></svg>',
};
</script>

<template>
  <footer class="footer">
    <div class="footer__container">
      <div class="footer__grid">
        <!-- Logo & Description -->
        <div class="footer__brand">
          <NuxtLink to="/" class="footer__logo">
            <img
              v-if="logo"
              :src="getStrapiMediaUrl(logo)"
              :alt="siteName"
              width="150"
              height="50"
            />
            <span v-else class="footer__logo-text">CARAFE</span>
          </NuxtLink>
          <p class="footer__tagline">SPECIALITY COFFEE ROASTERS</p>
        </div>

        <!-- Visit Us -->
        <div class="footer__column">
          <h4 class="footer__heading">VISIT US</h4>
          <address class="footer__address">
            <p>{{ address?.street || "29 Station Street" }}</p>
            <p>
              {{ address?.city || "Lewes" }},
              {{ address?.postcode || "BN7 2DB" }}, UK
            </p>
          </address>
          <div v-if="openingHours?.length" class="footer__hours">
            <h5 class="footer__subheading">OPENING HOURS:</h5>
            <p v-for="(hours, index) in openingHours" :key="index">
              {{ hours.days }}: {{ hours.hours }}
            </p>
          </div>
          <div v-else class="footer__hours">
            <h5 class="footer__subheading">OPENING HOURS:</h5>
            <p>Mon-Fri: 7:30am-5pm</p>
            <p>Sat-Sun: 8am-5pm</p>
          </div>
        </div>

        <!-- Connect -->
        <div class="footer__column">
          <h4 class="footer__heading">CONNECT</h4>
          <ul class="footer__links">
            <li v-for="link in socialLinks" :key="link.platform">
              <a
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="footer__social-link"
              >
                {{
                  link.platform.charAt(0).toUpperCase() + link.platform.slice(1)
                }}
              </a>
            </li>
            <template v-if="!socialLinks?.length">
              <li>
                <a
                  href="https://instagram.com/carafecoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Instagram</a
                >
              </li>
              <li>
                <a
                  href="https://facebook.com/carafecoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  >Facebook</a
                >
              </li>
              <li>
                <a
                  href="https://tripadvisor.com/carafecoffee"
                  target="_blank"
                  rel="noopener noreferrer"
                  >TripAdvisor</a
                >
              </li>
            </template>
          </ul>
        </div>

        <!-- Shop -->
        <div class="footer__column">
          <h4 class="footer__heading">SHOP</h4>
          <ul class="footer__links">
            <li><NuxtLink to="/shop">Fresh Coffee</NuxtLink></li>
            <li><NuxtLink to="/subscriptions">Subscriptions</NuxtLink></li>
            <li><NuxtLink to="/gift-vouchers">Gift Vouchers</NuxtLink></li>
            <li><NuxtLink to="/wholesale">Wholesale</NuxtLink></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="footer__bottom">
        <p class="footer__copyright">
          © {{ currentYear }}
          {{ settings?.siteName || "CARAFE COFFEE HOUSE & ROASTERS" }}. CRAFTED
          WITH <span class="footer__heart">❤</span> IN LEWES.
        </p>
        <div class="footer__legal">
          <NuxtLink to="/privacy-policy">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms-conditions">Terms & Conditions</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer {
  background-color: $color-dark;
  color: white;
  padding: 4rem 0 2rem;

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  &__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: 1.5fr 1fr 1fr 1fr;
    }
  }

  &__brand {
    @media (min-width: 1024px) {
      padding-right: 2rem;
    }
  }

  &__logo {
    display: inline-block;
    margin-bottom: 1rem;

    img {
      height: 50px;
      width: auto;
    }
  }

  &__logo-text {
    font-family: $font-heading;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: white;
  }

  &__tagline {
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: rgba(white, 0.7);
  }

  &__column {
    // Column styles
  }

  &__heading {
    font-family: $font-heading;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    margin-bottom: 1.5rem;
    color: $color-primary;
  }

  &__subheading {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    margin: 1rem 0 0.5rem;
    color: $color-primary;
  }

  &__address {
    font-style: normal;
    line-height: 1.8;
    font-size: 0.875rem;
    color: rgba(white, 0.8);
  }

  &__hours {
    font-size: 0.875rem;
    line-height: 1.8;
    color: rgba(white, 0.8);
  }

  &__links {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 0.75rem;
    }

    a {
      color: rgba(white, 0.8);
      text-decoration: none;
      font-size: 0.875rem;
      transition: color 0.2s ease;

      &:hover {
        color: $color-primary;
      }
    }
  }

  &__bottom {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid rgba(white, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;

    @media (min-width: 768px) {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  &__copyright {
    font-size: 0.75rem;
    color: rgba(white, 0.6);
  }

  &__heart {
    color: $color-primary;
  }

  &__legal {
    display: flex;
    gap: 1.5rem;

    a {
      font-size: 0.75rem;
      color: rgba(white, 0.6);
      text-decoration: none;
      transition: color 0.2s ease;

      &:hover {
        color: white;
      }
    }
  }
}
</style>

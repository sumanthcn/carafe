import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faMapMarkerAlt,
  faUtensils,
  faCamera,
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faStar as farStar,
} from "@fortawesome/free-regular-svg-icons";
import {
  faFacebook,
  faFacebookF,
  faPinterest,
  faPinterestP,
  faWhatsapp,
  faXTwitter,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

// This is important, we are going to let Nuxt worry about the CSS
config.autoAddCss = false;

// Add all icons to the library so you can use them in your components
library.add(
  faArrowLeft,
  faArrowRight,
  faMapMarkerAlt,
  faUtensils,
  faCamera,
  faStar,
  faStarHalfAlt,
  faChevronLeft,
  faChevronRight,
  farStar,
  faFacebook,
  faFacebookF,
  faPinterest,
  faPinterestP,
  faWhatsapp,
  faXTwitter,
  faTwitter
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});

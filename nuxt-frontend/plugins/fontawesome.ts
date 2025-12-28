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
  faUser,
  faCheckCircle,
  faThumbsUp,
  faFlag,
  faSearch,
  faCircleUser,
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
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faCcAmex,
  faApplePay,
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
  faUser,
  faCheckCircle,
  faThumbsUp,
  faFlag,
  faSearch,
  farStar,
  faFacebook,
  faFacebookF,
  faPinterest,
  faPinterestP,
  faWhatsapp,
  faXTwitter,
  faTwitter,
  faCircleUser,
  faCcVisa,
  faCcMastercard,
  faCcPaypal,
  faCcAmex,
  faApplePay,
);

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("FontAwesomeIcon", FontAwesomeIcon);
});

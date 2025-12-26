import { library, config } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
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

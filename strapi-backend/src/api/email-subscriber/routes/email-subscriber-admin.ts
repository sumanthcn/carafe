import { factories } from "@strapi/strapi";

// Core CRUD routes for admin panel access
export default factories.createCoreRouter(
  "api::email-subscriber.email-subscriber",
  {
    config: {
      find: {},
      findOne: {},
      update: {},
      delete: {},
    },
  }
);

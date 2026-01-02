export default ({ env }) => [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "'self'",
            "data:",
            "blob:",
            "market-assets.strapi.io",
            "res.cloudinary.com",
            "*.cloudinary.com",
            env("AWS_BUCKET", "").includes("s3") ? "*.amazonaws.com" : "",
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "res.cloudinary.com",
            "*.cloudinary.com",
            env("AWS_BUCKET", "").includes("s3") ? "*.amazonaws.com" : "",
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [
        env("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:1337",
        "https://www.carafecoffee.co.uk",
        "https://carafecoffee.co.uk",
        "https://carafe-82d2cfeaa846.herokuapp.com",
        "https://admin.carafecoffee.co.uk",
        "https://carafe-strapi-6a5c003b33c5.herokuapp.com",
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

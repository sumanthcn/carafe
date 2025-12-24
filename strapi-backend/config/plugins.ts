export default ({ env }) => ({
  // Users & Permissions plugin
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d",
      },
      register: {
        allowedFields: ["firstName", "lastName", "phone"],
      },
    },
  },

  // Upload plugin configuration
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
      breakpoints: {
        xlarge: 1920,
        large: 1200,
        medium: 768,
        small: 480,
        thumbnail: 156,
      },
      sizeLimit: 10 * 1024 * 1024, // 10MB
    },
  },
});

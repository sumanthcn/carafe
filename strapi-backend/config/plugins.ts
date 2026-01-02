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
      provider: env('UPLOAD_PROVIDER', 'local'),
      providerOptions: env('UPLOAD_PROVIDER') === 'cloudinary'
        ? {
            cloud_name: env('CLOUDINARY_NAME'),
            api_key: env('CLOUDINARY_KEY'),
            api_secret: env('CLOUDINARY_SECRET'),
          }
        : {
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

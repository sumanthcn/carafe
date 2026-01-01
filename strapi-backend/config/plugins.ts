import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

// Ensure uploads directory exists (for Heroku and other environments)
const uploadsDir = join(process.cwd(), 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdir(uploadsDir, { recursive: true }).catch((err) => {
    console.error('Failed to create uploads directory:', err);
  });
}

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

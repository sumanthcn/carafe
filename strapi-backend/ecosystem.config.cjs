// =============================================================================
// PM2 ECOSYSTEM CONFIG - STRAPI
// =============================================================================

module.exports = {
  apps: [
    {
      name: "carafe-strapi",
      cwd: "/var/www/carafe/strapi-backend",
      script: "npm",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 1337,
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/pm2/carafe-strapi-error.log",
      out_file: "/var/log/pm2/carafe-strapi-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};

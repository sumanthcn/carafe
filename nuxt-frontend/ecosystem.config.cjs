// =============================================================================
// PM2 ECOSYSTEM CONFIG - NUXT FRONTEND
// =============================================================================

module.exports = {
  apps: [
    {
      name: "carafe-nuxt",
      cwd: "/var/www/carafe/nuxt-frontend",
      script: ".output/server/index.mjs",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
      },
      error_file: "/var/log/pm2/carafe-nuxt-error.log",
      out_file: "/var/log/pm2/carafe-nuxt-out.log",
      merge_logs: true,
      time: true,
    },
  ],
};

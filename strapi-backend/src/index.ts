import { verifySmtpConnection } from './api/order/services/emailService';
import { seedEmailTemplates } from '../scripts/seed-email-templates';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi } */) {},

  /**
   * Bootstrap: runs once the application is ready.
   * - Verifies SMTP connection so email errors surface early.
   * - Seeds default email templates if they don't exist yet.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Verify SMTP connection
    await verifySmtpConnection(strapi.log);

    // Seed default email templates (idempotent – skips existing)
    await seedEmailTemplates(strapi);
  },
};

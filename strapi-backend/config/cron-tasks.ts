import { sendSubscriptionReminderEmail } from '../src/api/order/services/emailService';

export default {
  // ── Reminders: daily at 8 AM UTC ───────────────────────────────────────────
  // Sends "your card will be charged tomorrow" emails for subscriptions
  // whose nextBillingDate falls within the next 24–48 hours.
  // NOTE: Billing is handled by Heroku Scheduler (POST /api/stripe/process-subscriptions)
  // not by an internal cron, so this file only manages reminder emails.
  '0 8 * * *': {
    task: async () => {
      try {
        const now  = new Date();
        const from = new Date(now.getTime() + 24 * 60 * 60 * 1000);  // +24h
        const to   = new Date(now.getTime() + 48 * 60 * 60 * 1000);  // +48h

        const dueTomorrow: any[] = await strapi.entityService.findMany(
          'api::customer-subscription.customer-subscription' as any,
          {
            filters: {
              status: 'active',
              nextBillingDate: { $gte: from.toISOString(), $lte: to.toISOString() },
            } as any,
            limit: 200,
          }
        ) as any[];

        let sent = 0;
        for (const sub of dueTomorrow) {
          await sendSubscriptionReminderEmail(sub, strapi);
          sent++;
        }

        if (sent > 0) {
          strapi.log.info('[cron] Subscription reminders sent: ' + sent);
        }
      } catch (err: any) {
        strapi.log.error('[cron] Subscription reminder job error:', err.message);
      }
    },
  },
};

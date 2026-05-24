import { processDueSubscriptions } from '../src/api/stripe/controllers/stripe';
import { sendSubscriptionReminderEmail } from '../src/api/order/services/emailService';

export default {
  // ── Billing: every hour (production-safe) ──────────────────────────────────
  // Charges subscriptions whose nextBillingDate is in the past.
  // Hourly is the right balance: real subs (weekly/monthly) fire within 1 hour
  // of their due time. In dev, set to '* * * * *' for fast 5-minute test subs.
  '0 * * * *': {
    task: async () => {
      try {
        const result = await processDueSubscriptions();
        if (result.processed > 0 || result.failed > 0) {
          strapi.log.info(
            '[cron] Subscription billing — processed: ' +
            result.processed + ', failed: ' + result.failed
          );
        }
      } catch (err: any) {
        strapi.log.error('[cron] Subscription billing job error:', err.message);
      }
    },
  },

  // ── Reminders: daily at 9 AM (UK local time = UTC+1 summer / UTC+0 winter) ─
  // Sends "your card will be charged tomorrow" emails for subscriptions
  // whose nextBillingDate falls within the next 24–48 hours.
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

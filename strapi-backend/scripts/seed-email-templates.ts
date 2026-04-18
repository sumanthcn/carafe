/**
 * seed-email-templates.ts
 * ─────────────────────────────────────────────────────────────
 * Seeds the EmailTemplate collection with default HTML templates
 * for every order status.
 *
 * Usage:
 *   npx ts-node -e "require('./scripts/seed-email-templates')"
 *   (or run from the Strapi bootstrap for one-time seeding)
 *
 * To call from bootstrap (runs only when templates are missing):
 *   import seedEmailTemplates from '../scripts/seed-email-templates';
 *   await seedEmailTemplates(strapi);
 */

// Shared brand header / footer snippets
const HEADER = (title: string, colour = '#007ba7') => `
  <div style="background:${colour};padding:28px 32px;border-radius:8px 8px 0 0;">
    <h1 style="color:white;margin:0;font-family:sans-serif;font-size:22px;">${title}</h1>
    <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;font-family:sans-serif;">
      Carafe Coffee Roasters
    </p>
  </div>`;

const FOOTER = `
  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;
              font-family:sans-serif;font-size:12px;color:#9ca3af;">
    <p style="margin:0;">Carafe Coffee Roasters · <a href="https://www.carafecoffee.co.uk" style="color:#007ba7;">www.carafecoffee.co.uk</a></p>
    <p style="margin:6px 0 0;">Questions? Email <a href="mailto:support@carafecoffee.co.uk" style="color:#007ba7;">support@carafecoffee.co.uk</a></p>
  </div>`;

const WRAPPER = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px 0;background:#f3f4f6;font-family:sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;
              box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;">
    ${content}
    <div style="padding:24px 32px;">
      ${FOOTER}
    </div>
  </div>
</body>
</html>`;

const TRACKING_BTN = `
  <div style="text-align:center;margin:28px 0;">
    <a href="{{tracking_url}}"
       style="background:#007ba7;color:white;text-decoration:none;padding:14px 32px;
              border-radius:6px;font-weight:600;font-size:15px;display:inline-block;">
      Track My Order
    </a>
  </div>`;

// ─── Default templates ────────────────────────────────────────

const TEMPLATES = [
  // ── 1: Order Received ──────────────────────────────────────
  {
    name: 'Order Received',
    type: 'order_received',
    subject: 'Your Carafe Coffee order is confirmed — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('☕ Order Confirmed!')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          Thank you for your order — we're already getting your freshly roasted coffee ready!
        </p>

        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;
                      font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 16px;color:#6b7280;width:40%;">Order Number</td>
            <td style="padding:12px 16px;font-weight:600;color:#111827;">{{order_number}}</td>
          </tr>
          <tr style="background:white;">
            <td style="padding:12px 16px;color:#6b7280;">Order Date</td>
            <td style="padding:12px 16px;color:#111827;">{{order_date}}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#6b7280;">Shipping Method</td>
            <td style="padding:12px 16px;color:#111827;">{{shipping_method}}</td>
          </tr>
          <tr style="background:white;">
            <td style="padding:12px 16px;color:#6b7280;">Order Total</td>
            <td style="padding:12px 16px;font-weight:700;color:#007ba7;font-size:16px;">{{total_amount}}</td>
          </tr>
        </table>

        <h3 style="font-size:15px;margin:0 0 12px;color:#111827;">Items Ordered</h3>
        {{items_list}}

        <p style="color:#6b7280;font-size:13px;margin-top:20px;line-height:1.6;">
          We'll pack and dispatch your order within <strong>1–2 working days</strong>
          (excluding weekends and UK bank holidays). You'll receive a separate dispatch
          confirmation with tracking details.
        </p>

        ${TRACKING_BTN}
      </div>`),
    isActive: true,
  },

  // ── 2: Packed ──────────────────────────────────────────────
  {
    name: 'Order Packed',
    type: 'packed',
    subject: 'Your order is packed and ready to ship — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('📦 Your Order Is Packed!', '#6d28d9')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          Great news! Your order <strong>{{order_number}}</strong> has been packed and is
          awaiting collection by our courier. It'll be on its way to you very shortly.
        </p>

        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;
                      font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 16px;color:#6b7280;width:40%;">Order Number</td>
            <td style="padding:12px 16px;font-weight:600;color:#111827;">{{order_number}}</td>
          </tr>
          <tr style="background:white;">
            <td style="padding:12px 16px;color:#6b7280;">Shipping Method</td>
            <td style="padding:12px 16px;color:#111827;">{{shipping_method}}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#6b7280;">Delivery Address</td>
            <td style="padding:12px 16px;color:#111827;">{{shipping_address}}</td>
          </tr>
        </table>

        ${TRACKING_BTN}
      </div>`),
    isActive: true,
  },

  // ── 3: Shipped ─────────────────────────────────────────────
  {
    name: 'Order Shipped',
    type: 'shipped',
    subject: 'Your Carafe Coffee order is on its way! — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('🚚 Your Order Has Been Dispatched!', '#059669')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          Your order has been dispatched and is on its way. Here are your tracking details:
        </p>

        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;
                    padding:20px 24px;margin-bottom:24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:6px 0;color:#065f46;width:40%;font-weight:600;">Order Number</td>
              <td style="padding:6px 0;color:#111827;">{{order_number}}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#065f46;font-weight:600;">Carrier</td>
              <td style="padding:6px 0;color:#111827;">{{carrier}}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#065f46;font-weight:600;">Tracking Number</td>
              <td style="padding:6px 0;color:#111827;font-family:monospace;">{{tracking_number}}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;color:#065f46;font-weight:600;">Dispatched</td>
              <td style="padding:6px 0;color:#111827;">{{order_date}}</td>
            </tr>
          </table>
        </div>

        <p style="color:#6b7280;font-size:13px;line-height:1.6;">
          Tracking information may take up to 24 hours to become active with the carrier.
        </p>

        ${TRACKING_BTN}
      </div>`),
    isActive: true,
  },

  // ── 4: In Transit ──────────────────────────────────────────
  {
    name: 'Order In Transit',
    type: 'in_transit',
    subject: 'Your order is in transit — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('🛣️ Almost There!', '#2563eb')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          Your order <strong>{{order_number}}</strong> is currently in transit with
          <strong>{{carrier}}</strong> and should arrive very soon.
        </p>

        <table style="width:100%;border-collapse:collapse;background:#eff6ff;border-radius:8px;
                      font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 16px;color:#1e40af;width:40%;font-weight:600;">Tracking Number</td>
            <td style="padding:12px 16px;color:#111827;font-family:monospace;">{{tracking_number}}</td>
          </tr>
          <tr style="background:#dbeafe;">
            <td style="padding:12px 16px;color:#1e40af;font-weight:600;">Carrier</td>
            <td style="padding:12px 16px;color:#111827;">{{carrier}}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#1e40af;font-weight:600;">Deliver to</td>
            <td style="padding:12px 16px;color:#111827;">{{shipping_address}}</td>
          </tr>
        </table>

        ${TRACKING_BTN}
      </div>`),
    isActive: true,
  },

  // ── 5: Delivered ───────────────────────────────────────────
  {
    name: 'Order Delivered',
    type: 'delivered',
    subject: 'Your Carafe Coffee order has been delivered — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('✅ Order Delivered — Enjoy Your Coffee!', '#059669')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          Your order <strong>{{order_number}}</strong> has been delivered.
          We hope you enjoy your coffee!
        </p>

        <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;
                      font-size:14px;margin-bottom:24px;">
          <tr>
            <td style="padding:12px 16px;color:#6b7280;width:40%;">Order Number</td>
            <td style="padding:12px 16px;font-weight:600;color:#111827;">{{order_number}}</td>
          </tr>
          <tr style="background:white;">
            <td style="padding:12px 16px;color:#6b7280;">Total Paid</td>
            <td style="padding:12px 16px;font-weight:700;color:#007ba7;">{{total_amount}}</td>
          </tr>
        </table>

        <h3 style="font-size:15px;margin:0 0 12px;color:#111827;">Items Delivered</h3>
        {{items_list}}

        <div style="background:#f0fdf4;border-left:4px solid #059669;padding:16px;
                    border-radius:4px;margin-top:24px;">
          <p style="margin:0;color:#065f46;font-size:14px;">
            ⭐ <strong>Enjoying your coffee?</strong> Leave us a review and let others discover
            great coffee too!
          </p>
        </div>
      </div>`),
    isActive: true,
  },

  // ── 6: Cancelled ───────────────────────────────────────────
  {
    name: 'Order Cancelled',
    type: 'cancelled',
    subject: 'Your order has been cancelled — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('❌ Order Cancelled', '#dc2626')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          We're sorry to let you know that your order <strong>{{order_number}}</strong>
          has been cancelled.
        </p>
        <p style="color:#6b7280;line-height:1.6;">
          If you were charged, a refund will be processed within 3–5 business days.
          If you have any questions please don't hesitate to contact us.
        </p>
      </div>`),
    isActive: true,
  },

  // ── 7: Refunded ────────────────────────────────────────────
  {
    name: 'Order Refunded',
    type: 'refunded',
    subject: 'Your refund has been processed — {{order_number}}',
    body: WRAPPER(`
      ${HEADER('💰 Refund Processed', '#d97706')}
      <div style="padding:28px 32px;">
        <p style="font-size:16px;color:#111827;margin:0 0 16px;">
          Hi <strong>{{customer_name}}</strong>,
        </p>
        <p style="color:#374151;line-height:1.6;margin:0 0 20px;">
          A refund of <strong>{{total_amount}}</strong> for order <strong>{{order_number}}</strong>
          has been processed and should appear in your account within 3–5 business days
          depending on your bank.
        </p>
        <p style="color:#6b7280;font-size:14px;">
          Payment Reference: <code style="background:#f3f4f6;padding:2px 6px;border-radius:3px;">{{payment_id}}</code>
        </p>
      </div>`),
    isActive: true,
  },
];

export async function seedEmailTemplates(strapiInstance: any): Promise<void> {
  for (const tpl of TEMPLATES) {
    const existing = await strapiInstance.entityService.findMany(
      'api::email-template.email-template',
      { filters: { type: tpl.type }, limit: 1 }
    );

    if (existing && existing.length > 0) {
      strapiInstance.log.info(`[seedEmailTemplates] Template "${tpl.type}" already exists – skipping.`);
      continue;
    }

    await strapiInstance.entityService.create('api::email-template.email-template', {
      data: tpl,
    });
    strapiInstance.log.info(`[seedEmailTemplates] Created template: ${tpl.name}`);
  }
}

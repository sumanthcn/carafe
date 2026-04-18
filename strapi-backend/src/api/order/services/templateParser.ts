/**
 * templateParser.ts
 * ─────────────────────────────────────────────────────────────
 * Replaces {{placeholder}} tokens in email templates with real
 * order data.
 *
 * Supported placeholders:
 *   {{order_id}}          – internal Strapi id
 *   {{order_number}}      – human-readable ORD-… string
 *   {{order_date}}        – formatted creation date
 *   {{order_status}}      – current status label
 *   {{payment_id}}        – Stripe payment / session id
 *   {{payment_date}}      – same as order_date for now
 *   {{shipment_number}}   – carrier tracking number
 *   {{customer_name}}     – full customer name
 *   {{customer_email}}    – customer email
 *   {{total_amount}}      – formatted total (currency symbol)
 *   {{subtotal}}          – pre-shipping subtotal
 *   {{shipping_cost}}     – shipping cost
 *   {{tax}}               – VAT / GST amount
 *   {{currency}}          – GBP / EUR / USD
 *   {{tracking_number}}   – same as shipment_number
 *   {{carrier}}           – carrier name
 *   {{shipping_method}}   – human-readable method label
 *   {{shipping_address}}  – full shipping address block (HTML)
 *   {{items_list}}        – HTML table of ordered items
 *   {{tracking_url}}      – deep-link to track-order page
 */

const CARRIER_LABELS: Record<string, string> = {
  'royal-mail': 'Royal Mail - Tracked 24',
  'dhl':        'DPD - DPD Next Day (Standard)',
};

const STATUS_LABELS: Record<string, string> = {
  order_received: 'Order Received',
  packed: 'Packed',
  shipped: 'Shipped',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: '£',
  EUR: '€',
  USD: '$',
};

/**
 * Format a number as a currency string.
 */
function formatMoney(amount: number | string, currency = 'GBP'): string {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${sym}${parseFloat(String(amount ?? 0)).toFixed(2)}`;
}

/**
 * Build an HTML address block from an address component object.
 */
function formatAddress(addr: any): string {
  if (!addr) return '—';
  const parts = [
    `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim(),
    addr.line1,
    addr.line2,
    addr.city,
    addr.county,
    addr.postcode,
    addr.country,
  ].filter(Boolean);
  return parts.join('<br>');
}

/**
 * Build an HTML table for order items including shipping and totals.
 */
function formatItemsTable(items: any[], currency: string, order: any): string {
  if (!items || items.length === 0) return '<p>No items</p>';

  const rows = items
    .map(
      (item: any) => {
        // Strapi may store the price as unitPrice or price
        const price = parseFloat(String(item.unitPrice ?? item.price ?? 0));
        const qty   = parseInt(String(item.quantity ?? 1), 10);
        return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">${item.productName ?? item.name ?? '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(price, currency)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(price * qty, currency)}</td>
        </tr>`;
      }
    )
    .join('');

  const subtotal     = parseFloat(String(order.subtotal     ?? 0));
  const shippingCost = parseFloat(String(order.shippingCost ?? 0));
  const discount     = parseFloat(String(order.discount     ?? 0));
  const total        = parseFloat(String(order.total        ?? 0));

  const shippingLabel = shippingCost === 0 ? 'FREE' : formatMoney(shippingCost, currency);

  const discountRow = discount > 0
    ? `<tr>
        <td colspan="3" style="padding:6px 12px;text-align:right;color:#16a34a;">Discount</td>
        <td style="padding:6px 12px;text-align:right;color:#16a34a;">-${formatMoney(discount, currency)}</td>
       </tr>`
    : '';

  return `
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="background:#f5f5f5;">
          <th style="padding:8px 12px;text-align:left;">Product</th>
          <th style="padding:8px 12px;text-align:center;">Qty</th>
          <th style="padding:8px 12px;text-align:right;">Unit Price</th>
          <th style="padding:8px 12px;text-align:right;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="padding:6px 12px;text-align:right;color:#6b7280;border-top:1px solid #eee;">Items subtotal</td>
          <td style="padding:6px 12px;text-align:right;border-top:1px solid #eee;">${formatMoney(subtotal, currency)}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding:6px 12px;text-align:right;color:#6b7280;">Shipping &amp; handling</td>
          <td style="padding:6px 12px;text-align:right;">${shippingLabel}</td>
        </tr>
        ${discountRow}
        <tr style="background:#f5f5f5;font-weight:700;">
          <td colspan="3" style="padding:10px 12px;text-align:right;font-size:15px;">Order Total</td>
          <td style="padding:10px 12px;text-align:right;font-size:15px;color:#007ba7;">${formatMoney(total, currency)}</td>
        </tr>
      </tfoot>
    </table>`;
}

/**
 * Build the placeholder map from an order object.
 */
export function buildPlaceholderMap(order: any): Record<string, string> {
  const currency = order.currency ?? 'GBP';
  const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';

  const trackingUrl = order.isGuestOrder
    ? `${frontendUrl}/track-order?orderNumber=${order.orderNumber}&token=${order.orderTrackingToken ?? ''}`
    : `${frontendUrl}/account/orders/${order.documentId ?? order.id}`;

  return {
    order_id:         String(order.id ?? ''),
    order_number:     order.orderNumber ?? '',
    order_date:       order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—',
    order_status:     STATUS_LABELS[order.orderStatus ?? order.status] ?? (order.orderStatus ?? ''),
    payment_id:       order.paymentId ?? order.stripeSessionId ?? '—',
    payment_date:     order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : '—',
    shipment_number:  order.trackingNumber ?? '—',
    tracking_number:  order.trackingNumber ?? '—',
    carrier:          CARRIER_LABELS[order.carrier ?? ''] ?? order.carrier ?? '—',
    shipping_method:  order.shippingMethod ?? '—',
    customer_name:    order.customerName ?? '',
    customer_email:   order.customerEmail ?? '',
    total_amount:     formatMoney(order.total, currency),
    subtotal:         formatMoney(order.subtotal, currency),
    shipping_cost:    order.shippingCost === 0 ? 'FREE' : formatMoney(order.shippingCost, currency),
    tax:              formatMoney(order.tax, currency),
    currency,
    shipping_address: formatAddress(order.shippingAddress),
    items_list:       formatItemsTable(order.items ?? [], currency, order),
    tracking_url:     trackingUrl,
  };
}

/**
 * Replace every {{key}} token in a string with the corresponding value.
 * Unknown tokens are left intact.
 */
export function parsePlaceholders(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
}

/**
 * Parse both subject and body of a template object.
 */
export function parseTemplate(
  template: { subject: string; body: string },
  order: any
): { subject: string; body: string } {
  const map = buildPlaceholderMap(order);
  return {
    subject: parsePlaceholders(template.subject, map),
    body:    parsePlaceholders(template.body, map),
  };
}

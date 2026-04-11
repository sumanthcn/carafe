<template>
  <div class="order-confirmation">
    <div class="container">
      <div class="order-confirmation__card">
        <div class="order-confirmation__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="2"
            />
            <path
              d="M8 12L11 15L16 9"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <h1>Thank You for Your Order!</h1>

        <p class="order-confirmation__message">
          Your order has been successfully placed. We've sent a confirmation
          email to your inbox.
        </p>

        <div v-if="orderNumber" class="order-confirmation__details">
          <div class="order-confirmation__detail">
            <span class="label">Order Number</span>
            <span class="value">{{ orderNumber }}</span>
          </div>
          <div v-if="orderDate" class="order-confirmation__detail">
            <span class="label">Date</span>
            <span class="value">{{ formatDate(orderDate) }}</span>
          </div>
        </div>

        <div class="order-confirmation__next">
          <h2>What happens next?</h2>
          <ol>
            <li>We'll prepare your freshly roasted coffee</li>
            <li>You'll receive a shipping confirmation email with tracking</li>
            <li>Your coffee will arrive within the estimated delivery time</li>
          </ol>
        </div>

        <div class="order-confirmation__actions">
          <NuxtLink to="/shop-coffee" class="btn btn--primary">
            Continue Shopping
          </NuxtLink>
          <NuxtLink 
            v-if="!isGuestOrder" 
            to="/account/orders" 
            class="btn btn--outline"
          >
            View Order History
          </NuxtLink>
          <NuxtLink 
            v-else-if="trackingUrl" 
            :to="trackingUrl" 
            class="btn btn--outline"
          >
            Track Your Order
          </NuxtLink>
          <button class="btn btn--outline" @click="downloadInvoice">
            Download Invoice (PDF)
          </button>
        </div>

        <p v-if="isGuestOrder" class="order-confirmation__guest-notice">
          <strong>Guest Order:</strong> A tracking link has been sent to your email. 
          Bookmark this page or save your order number to track your delivery.
        </p>

        <p class="order-confirmation__support">
          Questions about your order?
          <NuxtLink to="/contact">Contact us</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "~/stores/cart";

// SEO
useHead({
  title: "Order Confirmed | Carafe Coffee",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

const route = useRoute();
const cartStore = useCartStore();
const { fetchOrder } = useOrders();
const { user } = useAuth();

const orderNumber = ref<string>('');
const orderDate   = ref<Date | null>(null);
const isGuestOrder = ref<boolean>(false);
const trackingUrl  = ref<string>('');
const orderData    = ref<any>(null);

// Fetch order details
onMounted(async () => {
  const token = route.query.token as string;
  const order = route.query.order as string;

  if (token && order) {
    isGuestOrder.value = true;
    orderNumber.value = order;
    orderDate.value = new Date();
    trackingUrl.value = `/track-order?order=${order}&token=${token}`;
    cartStore.clearCart();
    return;
  }

  const orderId = route.query.orderId as string;

  if (orderId) {
    const result = await fetchOrder(orderId);
    if (result.success && result.order) {
      orderNumber.value = result.order.orderNumber;
      orderDate.value   = new Date(result.order.createdAt);
      isGuestOrder.value = !user.value;
      orderData.value    = result.order;
    }
    cartStore.clearCart();
  } else {
    orderNumber.value  = route.query.orderCode as string || '';
    orderDate.value    = new Date();
    isGuestOrder.value = !user.value;
    cartStore.clearCart();
  }
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-GB", { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const formatPrice = (amount: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);

function downloadInvoice() {
  const o = orderData.value;
  const dateStr = orderDate.value ? formatDate(orderDate.value) : new Date().toLocaleDateString('en-GB');
  const currency = o?.currency || 'GBP';

  const itemsHtml = o?.items?.length
    ? o.items.map((item: any) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${item.productName || item.name || ''}${item.weight ? ` <span style="color:#64748b;font-size:.85em">(${item.weight})</span>` : ''}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:center">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${formatPrice(item.unitPrice || item.price || 0, currency)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${formatPrice((item.unitPrice || item.price || 0) * item.quantity, currency)}</td>
        </tr>`).join('')
    : `<tr><td colspan="4" style="padding:8px 0;color:#64748b">No item details available</td></tr>`;

  const addr = o?.shippingAddress;
  const addrHtml = addr
    ? `${addr.addressLine1 || addr.street || ''}<br>${addr.city || ''}, ${addr.postalCode || addr.postcode || ''}<br>${addr.country || ''}`
    : '—';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice – ${orderNumber.value || 'Carafe Coffee'}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, serif; color: #1e293b; font-size: 14px; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .brand { font-size: 28px; font-weight: bold; letter-spacing: 1px; }
    .brand span { color: #92400e; }
    .invoice-meta { text-align: right; }
    .invoice-meta h1 { font-size: 22px; margin-bottom: 6px; }
    .invoice-meta p { color: #64748b; font-size: 13px; }
    .divider { border: none; border-top: 2px solid #e2e8f0; margin: 20px 0; }
    .two-col { display: flex; gap: 40px; margin-bottom: 32px; }
    .two-col > div { flex: 1; }
    .section-label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #64748b; margin-bottom: 6px; font-family: Arial, sans-serif; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    thead th { font-family: Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; padding: 8px 0; border-bottom: 2px solid #e2e8f0; text-align: left; }
    thead th:not(:first-child) { text-align: right; }
    thead th:nth-child(2) { text-align: center; }
    .totals { margin-left: auto; width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #64748b; }
    .totals-row.total { font-size: 16px; font-weight: bold; color: #1e293b; border-top: 2px solid #e2e8f0; padding-top: 10px; margin-top: 4px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">☕ <span>Carafe</span> Coffee</div>
    <div class="invoice-meta">
      <h1>Invoice</h1>
      <p>${orderNumber.value ? `Order #${orderNumber.value}` : ''}</p>
      <p>${dateStr}</p>
    </div>
  </div>
  <hr class="divider" />
  <div class="two-col">
    <div>
      <div class="section-label">Bill To</div>
      <p>${o?.customerName || user.value?.username || ''}</p>
      <p>${o?.customerEmail || user.value?.email || ''}</p>
      ${o?.customerPhone ? `<p>${o.customerPhone}</p>` : ''}
    </div>
    <div>
      <div class="section-label">Ship To</div>
      <p>${addrHtml}</p>
    </div>
    <div>
      <div class="section-label">Payment</div>
      <p>${o?.paymentMethod || 'Card'}</p>
      <p style="color:#16a34a;font-weight:600">${o?.paymentStatus === 'captured' ? 'Paid' : (o?.paymentStatus || 'Paid')}</p>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Unit Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>${formatPrice(o?.subtotal || 0, currency)}</span></div>
    <div class="totals-row"><span>Shipping</span><span>${formatPrice(o?.shippingCost || 0, currency)}</span></div>
    ${o?.tax ? `<div class="totals-row"><span>Tax</span><span>${formatPrice(o.tax, currency)}</span></div>` : ''}
    ${o?.discount ? `<div class="totals-row"><span>Discount</span><span>-${formatPrice(o.discount, currency)}</span></div>` : ''}
    <div class="totals-row total"><span>Total</span><span>${formatPrice(o?.total || 0, currency)}</span></div>
  </div>
  <div class="footer">
    <p>Thank you for your order! | caraffee.co.uk | hello@caraffee.co.uk</p>
    <p>Carafe Coffee · VAT No. (if applicable)</p>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";
@import "~/assets/scss/mixins";

.order-confirmation {
  padding: $spacing-16 0;
  min-height: 100vh;
  background: $color-gray-50;
  display: flex;
  align-items: center;

  &__card {
    max-width: 600px;
    margin: 0 auto;
    background: $color-white;
    border-radius: $border-radius-lg;
    padding: $spacing-12;
    text-align: center;
    box-shadow: $shadow-lg;
  }

  &__icon {
    color: $color-success;
    margin-bottom: $spacing-6;

    svg {
      width: 80px;
      height: 80px;
    }
  }

  h1 {
    font-family: $font-family-heading;
    font-size: $font-size-3xl;
    color: $color-dark;
    margin-bottom: $spacing-4;
  }

  &__message {
    color: $color-gray-600;
    font-size: $font-size-lg;
    margin-bottom: $spacing-8;
  }

  &__details {
    display: flex;
    justify-content: center;
    gap: $spacing-8;
    padding: $spacing-6;
    background: $color-gray-50;
    border-radius: $border-radius-md;
    margin-bottom: $spacing-8;
  }

  &__detail {
    text-align: center;

    .label {
      display: block;
      font-size: $font-size-sm;
      color: $color-gray-500;
      margin-bottom: $spacing-1;
    }

    .value {
      font-weight: 600;
      color: $color-dark;
    }
  }

  &__next {
    text-align: left;
    padding: $spacing-6;
    background: rgba($color-primary, 0.05);
    border-radius: $border-radius-md;
    margin-bottom: $spacing-8;

    h2 {
      font-size: $font-size-base;
      color: $color-dark;
      margin-bottom: $spacing-4;
    }

    ol {
      margin: 0;
      padding-left: $spacing-6;
      color: $color-gray-600;

      li {
        padding: $spacing-2 0;
      }
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-4;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: $spacing-6;
  }

  &__support {
    font-size: $font-size-sm;
    color: $color-gray-500;

    a {
      color: $color-primary;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>

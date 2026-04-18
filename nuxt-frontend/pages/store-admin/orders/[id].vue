<template>
  <div class="admin-order-detail-page">
    <div v-if="actionFeedback" :class="['action-toast', actionOk ? 'action-toast--ok' : 'action-toast--err']">{{ actionFeedback }}</div>
    <div class="container-fluid">
      <!-- Header -->
      <div class="page-header">
        <NuxtLink to="/store-admin/orders" class="btn-back">← Back to Orders</NuxtLink>
        <div class="header-content">
          <h1>Order {{ order?.orderNumber }}</h1>
          <span :class="`status-badge status-badge--${getStatusColor(order?.status)}`">
            {{ order?.status }}
          </span>
        </div>
      </div>

      <div v-if="order" class="order-detail-grid">
        <!-- Left Column -->
        <div class="detail-column">
          <!-- Status Update Card (merged with Tracking) -->
          <div class="card">
            <h2>Update Order Status</h2>
            <form @submit.prevent="handleStatusUpdate" class="status-form">
              <div v-if="order.status === 'delivered'" class="delivered-notice">
                ✅ This order has been delivered. The status is locked.
              </div>
              <template v-else>
              <div class="form-group">
                <label>Status</label>
                <select v-model="statusForm.status" class="form-control">
                  <option value="order_received">Order Received</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <template v-if="statusForm.status === 'shipped' || statusForm.status === 'in_transit'">
                <div class="form-group">
                  <label>Carrier <span class="req">*</span></label>
                  <select v-model="statusForm.carrier" class="form-control">
                    <option value="royal-mail">Royal Mail - Tracked 24</option>
                    <option value="dhl">DPD - DPD Next Day (Standard)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tracking Number <span class="req">*</span></label>
                  <input
                    v-model="statusForm.trackingNumber"
                    type="text"
                    class="form-control"
                    placeholder="e.g. RM123456789GB"
                  />
                </div>
              </template>

              <div class="form-group">
                <label>Notes</label>
                <textarea
                  v-model="statusForm.notes"
                  class="form-control"
                  rows="2"
                  placeholder="Optional notes about this status change..."
                ></textarea>
              </div>
              <button type="submit" class="btn btn--primary" :disabled="orderManagement.loading.value">
                {{ orderManagement.loading.value ? 'Saving...' : 'Update Status' }}
              </button>
              </template>
            </form>
          </div>

          <!-- Current Tracking Info -->
          <div v-if="order.trackingNumber" class="card">
            <h2>Current Tracking</h2>
            <div class="info-group"><strong>Carrier:</strong><p>{{ order.carrier || '-' }}</p></div>
            <div class="info-group"><strong>Tracking Number:</strong><p class="transaction-id">{{ order.trackingNumber }}</p></div>
            <a :href="trackingLink(order.carrier, order.trackingNumber)"
               target="_blank" rel="noopener noreferrer"
               class="btn btn--secondary btn--small">
              Track Package →
            </a>
          </div>

          <!-- Order Items -->
          <div class="card">
            <h2>Order Items ({{ order.items.length }})</h2>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.id" class="item-row">
                <div class="item-icon">☕</div>
                <div class="item-details">
                  <strong>{{ item.productName }}</strong>
                  <p class="item-variant">{{ item.variant }}</p>
                  <p class="item-price">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
                </div>
                <div class="item-total">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <div class="order-summary">
              <div class="summary-row">
                <span>Subtotal</span>
                <span>{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="summary-row">
                <span>Shipping</span>
                <span>{{ formatPrice(order.shippingCost) }}</span>
              </div>
              <div v-if="order.tax" class="summary-row">
                <span>Tax</span>
                <span>{{ formatPrice(order.tax) }}</span>
              </div>
              <div v-if="order.discount" class="summary-row summary-row--discount">
                <span>Discount</span>
                <span>-{{ formatPrice(order.discount) }}</span>
              </div>
              <div class="summary-row summary-row--total">
                <strong>Total</strong>
                <strong>{{ formatPrice(order.total) }}</strong>
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div class="card">
            <h2>Admin Actions</h2>

            <!-- Resend Email -->
            <div class="action-section">
              <h3 class="action-section__title">📧 Resend Email</h3>
              <p class="action-section__desc">Manually send a notification email to the customer.</p>
              <div class="form-group">
                <label>Email Type</label>
                <select v-model="resendEmailType" class="form-control">
                  <option value="order_received">Order Received (with Invoice)</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped / Dispatched</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered (with Invoice)</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <button
                class="btn btn--primary btn--full"
                :disabled="resendLoading"
                @click="handleResendEmail"
              >
                {{ resendLoading ? 'Sending...' : '📤 Send Email' }}
              </button>
            </div>

            <div class="action-divider"></div>

            <!-- Invoice Actions -->
            <div class="action-section">
              <h3 class="action-section__title">🧾 Invoice</h3>
              <div class="action-buttons">
                <button class="btn btn--secondary btn--full" @click="downloadInvoice" :disabled="invoiceLoading">
                  {{ invoiceLoading ? 'Generating...' : '⬇️ Download Invoice PDF' }}
                </button>
                <button class="btn btn--ghost btn--full" @click="printInvoice">
                  🖨️ Print Page
                </button>
              </div>
            </div>

            <div class="action-divider"></div>

            <!-- Other admin actions -->
            <div class="action-section">
              <h3 class="action-section__title">⚙️ Other</h3>
              <div class="action-buttons">
                <a :href="`mailto:${order?.customerEmail}?subject=Regarding Order ${order?.orderNumber}`"
                   class="btn btn--ghost btn--full">
                  ✉️ Open in Mail Client
                </a>
                <button v-if="order?.paymentStatus === 'paid'" class="btn btn--warning btn--full" @click="initiateRefund">
                  💸 Issue Refund
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="detail-column">
          <!-- Customer Info -->
          <div class="card">
            <h2>Customer Information</h2>
            <div class="info-group">
              <strong>Name:</strong>
              <p>{{ order.customerName }}</p>
            </div>
            <div class="info-group">
              <strong>Email:</strong>
              <p><a :href="`mailto:${order.customerEmail}`">{{ order.customerEmail }}</a></p>
            </div>
            <div class="info-group">
              <strong>Phone:</strong>
              <p><a :href="`tel:${order.customerPhone}`">{{ order.customerPhone }}</a></p>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="card">
            <h2>Shipping Address</h2>
            <address>
              {{ order.shippingAddress.line1 }}<br />
              <span v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}<br /></span>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}<br />
              {{ order.shippingAddress.country }}
              <span v-if="order.shippingAddress.phone"><br />{{ order.shippingAddress.phone }}</span>
            </address>
          </div>

          <!-- Billing Address -->
          <div class="card">
            <h2>Billing Address</h2>
            <address v-if="order.billingAddress">
              {{ order.billingAddress.line1 }}<br />
              <span v-if="order.billingAddress.line2">{{ order.billingAddress.line2 }}<br /></span>
              {{ order.billingAddress.city }}, {{ order.billingAddress.postalCode }}<br />
              {{ order.billingAddress.country }}
            </address>
            <p v-else class="same-as-shipping">Same as shipping address</p>
          </div>

          <!-- Payment Info -->
          <div class="card">
            <h2>Payment Information</h2>
            <div class="info-group">
              <strong>Method:</strong>
              <p>{{ order.paymentMethod }}</p>
            </div>
            <div class="info-group">
              <strong>Status:</strong>
              <span :class="`payment-badge payment-badge--${order.paymentStatus}`">
                {{ order.paymentStatus }}
              </span>
            </div>
            <div v-if="order.stripeSessionId" class="info-group">
              <strong>Stripe Session:</strong>
              <p class="transaction-id">{{ order.stripeSessionId }}</p>
            </div>
            <div v-if="order.paymentId" class="info-group">
              <strong>Payment ID:</strong>
              <p class="transaction-id">{{ order.paymentId }}</p>
            </div>
            <div class="info-group">
              <strong>Order ID:</strong>
              <p class="transaction-id">#{{ order.id }}</p>
            </div>
            <div v-if="order.isGuestOrder" class="info-group">
              <span class="guest-badge">Guest Order</span>
            </div>
          </div>

          <!-- Order Timeline -->
          <div class="card">
            <h2>Order History</h2>
            <div class="timeline">
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Order Placed</strong>
                  <p>{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
              <div v-if="order.status !== 'order_received'" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Packed &amp; Processing</strong>
                  <p>{{ formatDate(order.updatedAt) }}</p>
                </div>
              </div>
              <div v-if="['shipped','in_transit','delivered'].includes(order.status)" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Dispatched{{ order.carrier ? ` via ${order.carrier}` : '' }}</strong>
                  <p>{{ order.dispatchedAt ? formatDate(order.dispatchedAt) : formatDate(order.updatedAt) }}</p>
                  <p v-if="order.trackingNumber" class="tracking-inline">Tracking: {{ order.trackingNumber }}</p>
                </div>
              </div>
              <div v-if="order.status === 'in_transit'" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content"><strong>In Transit</strong></div>
              </div>
              <div v-if="order.status === 'delivered'" class="timeline-item timeline-item--done">
                <div class="timeline-dot timeline-dot--green"></div>
                <div class="timeline-content">
                  <strong>Delivered</strong>
                  <p>{{ order.deliveredAt ? formatDate(order.deliveredAt) : '' }}</p>
                </div>
              </div>
              <div v-if="order.status === 'cancelled'" class="timeline-item timeline-item--cancelled">
                <div class="timeline-dot timeline-dot--red"></div>
                <div class="timeline-content"><strong>Cancelled</strong></div>
              </div>
              <div v-if="order.status === 'refunded'" class="timeline-item">
                <div class="timeline-dot timeline-dot--orange"></div>
                <div class="timeline-content"><strong>Refunded</strong></div>
              </div>
            </div>
          </div>

          <!-- Email Log -->
          <div v-if="order?.emailSentLogs?.length" class="card">
            <h2>Email Log</h2>
            <div class="email-log">
              <div v-for="(log, i) in [...(order.emailSentLogs)].reverse()" :key="i" class="email-log__item">
                <span class="email-log__badge">{{ log.type }}</span>
                <span class="email-log__to">→ {{ log.to }}</span>
                <span class="email-log__date">{{ formatDate(log.sentAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="orderLoading" class="state-box">
        <div class="spinner"></div>
        <p>Loading order details...</p>
      </div>

      <div v-else-if="orderError && !order" class="state-box state-box--error">
        <p class="state-icon">!</p>
        <p class="state-title">Could not load order</p>
        <p class="state-msg">{{ orderError }}</p>
        <button class="btn btn--secondary" @click="reloadOrder">Try Again</button>
      </div>

      <div v-else-if="!order" class="state-box">
        <p>Order not found.</p>
        <NuxtLink to="/store-admin/orders" class="btn btn--secondary">Back to Orders</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin access only
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
});

const route = useRoute();
const orderDocumentId = computed(() => route.params.id as string);

const orderManagement = useOrderManagement();
const order = computed(() => orderManagement.currentOrder.value);
const orderLoading = orderManagement.loading;
const orderError   = orderManagement.error;

async function reloadOrder() {
  await orderManagement.fetchOrder(orderDocumentId.value);
  if (order.value) {
    statusForm.status = order.value.status;
    statusForm.trackingNumber = order.value.trackingNumber || '';
    statusForm.carrier = order.value.carrier || 'royal-mail';
  }
}

const statusForm = reactive({
  status: '',
  notes: '',
  trackingNumber: '',
  carrier: 'royal-mail',
});

onMounted(reloadOrder);

const actionFeedback = ref('');
const actionOk       = ref(true);
function showFeedback(msg: string, ok: boolean) {
  actionFeedback.value = msg; actionOk.value = ok;
  setTimeout(() => actionFeedback.value = '', 4000);
}

const handleStatusUpdate = async () => {
  const success = await orderManagement.updateOrderStatus(
    orderDocumentId.value,
    statusForm.status as any,
    statusForm.notes,
    statusForm.carrier,
    statusForm.trackingNumber,
  );
  if (success) { showFeedback('Order updated successfully', true); statusForm.notes = ''; }
  else { showFeedback(orderManagement.error.value || 'Update failed', false); }
};

function trackingLink(carrier: string | undefined, trackingNumber: string) {
  const carriers: Record<string, string> = {
    'royal-mail': `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`,
    'dhl': `https://www.dhl.com/gb-en/home/tracking/tracking-ecommerce.html?submit=1&tracking-id=${trackingNumber}`,
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'fedex': `https://www.fedex.com/fedextrack/?tracknumbers=${trackingNumber}`,
    'dpd': `https://www.dpd.co.uk/apps/tracking/?reference=${trackingNumber}`,
    'evri': `https://www.evri.com/track-a-parcel/parcel/${trackingNumber}`,
    'parcelforce': `https://www.parcelforce.com/track-trace?trackNumber=${trackingNumber}`,
  };
  return carriers[carrier || 'royal-mail'] || `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
};

const getStatusColor = (status: string = '') => {
  const colors: Record<string, string> = {
    order_received: 'blue',
    packed: 'purple',
    shipped: 'purple',
    in_transit: 'purple',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'orange',
  };
  return colors[status] || 'gray';
};

const printInvoice = () => {
  window.print();
};

// ── Resend Email ────────────────────────────────────────────────
const resendEmailType = ref('');
const resendLoading   = ref(false);

// Default the email type selector to the current order status
watch(order, (o) => {
  if (o) resendEmailType.value = o.status || 'order_received';
}, { immediate: true });

const handleResendEmail = async () => {
  if (!order.value) return;
  resendLoading.value = true;
  try {
    const config = useRuntimeConfig();
    const { getAuthHeaders } = useAuth();
    await $fetch(`${config.public.strapiUrl}/api/orders/${orderDocumentId.value}/resend-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { emailType: resendEmailType.value },
    });
    showFeedback(`Email (${resendEmailType.value}) sent to ${order.value.customerEmail}`, true);
  } catch (err: any) {
    showFeedback(err?.data?.error?.message || 'Failed to send email', false);
  } finally {
    resendLoading.value = false;
  }
};

// ── Invoice Download ────────────────────────────────────────────
const invoiceLoading = ref(false);

const downloadInvoice = async () => {
  if (!order.value) return;
  invoiceLoading.value = true;
  try {
    const config = useRuntimeConfig();
    const { getAuthHeaders } = useAuth();
    const blob = await $fetch<Blob>(
      `${config.public.strapiUrl}/api/orders/${orderDocumentId.value}/invoice`,
      { method: 'GET', headers: getAuthHeaders(), responseType: 'blob' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.value.orderNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err: any) {
    showFeedback('Failed to download invoice', false);
  } finally {
    invoiceLoading.value = false;
  }
};

const initiateRefund = () => {
  if (confirm('Are you sure you want to initiate a refund for this order?')) {
    alert('Refund functionality coming soon. This would integrate with the Stripe refund API.');
  }
};

const formatDate = (date: string) => orderManagement.formatDate(date);
const formatPrice = (amount: number) => orderManagement.formatPrice(amount);

// SEO
useHead({
  title: `Order ${order.value?.orderNumber || ''} - Admin - Carafe Coffee`,
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.admin-order-detail-page {
  padding: $spacing-8;
  background: $color-gray-50;
  min-height: 100vh;
}

.container-fluid {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: $spacing-8;
  
  .btn-back {
    display: inline-block;
    margin-bottom: $spacing-4;
    color: $color-primary;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .header-content {
    display: flex;
    align-items: center;
    gap: $spacing-4;
    
    h1 {
      font-size: $font-size-3xl;
      font-weight: 700;
      margin: 0;
    }
  }
}

.order-detail-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $spacing-6;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
}

.card {
  background: white;
  border-radius: 12px;
  padding: $spacing-6;
  margin-bottom: $spacing-6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  h2 {
    font-size: $font-size-xl;
    font-weight: 600;
    margin-bottom: $spacing-4;
    padding-bottom: $spacing-3;
    border-bottom: 2px solid $color-gray-100;
  }
}

.delivered-notice {
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  padding: $spacing-4;
  font-weight: 600;
  font-size: $font-size-sm;
}

.status-form,
.tracking-form {
  .form-group {

    label {
      display: block;
      font-weight: 600;
      margin-bottom: $spacing-2;
      color: $color-gray-700;

      .req { color: #dc2626; margin-left: 2px; }
    }

    .form-control {
      width: 100%;
      padding: $spacing-3;
      border: 2px solid $color-gray-300;
      border-radius: 8px;
      font-size: $font-size-base;

      &:focus {
        outline: none;
        border-color: $color-primary;
      }
    }

    textarea { resize: vertical; }
  }
}

.current-tracking {
  margin-top: $spacing-6;
  padding-top: $spacing-4;
  border-top: 1px solid $color-gray-200;
  
  p {
    margin: $spacing-2 0 $spacing-3;
    font-family: 'Courier New', monospace;
    background: $color-gray-50;
    padding: $spacing-2 $spacing-3;
    border-radius: 6px;
  }
}

.items-list {
  margin-bottom: $spacing-4;
}

.item-row {
  display: flex;
  gap: $spacing-4;
  padding: $spacing-4;
  border: 1px solid $color-gray-200;
  border-radius: 8px;
  margin-bottom: $spacing-3;
  
  .item-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  
  .item-details {
    flex: 1;
    
    strong {
      display: block;
      margin-bottom: $spacing-1;
    }
    
    .item-variant,
    .item-price {
      font-size: $font-size-sm;
      color: $color-gray-600;
      margin: 2px 0;
    }
  }
  
  .item-total {
    font-weight: 700;
    font-size: $font-size-lg;
  }
}

.order-summary {
  border-top: 2px solid $color-gray-200;
  padding-top: $spacing-4;
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: $spacing-2;
    
    &--total {
      font-size: $font-size-lg;
      padding-top: $spacing-3;
      border-top: 1px solid $color-gray-200;
      margin-top: $spacing-2;
    }
  }
}

.info-group {
  margin-bottom: $spacing-4;
  
  strong {
    display: block;
    color: $color-gray-700;
    margin-bottom: $spacing-1;
  }
  
  p, address {
    margin: 0;
    color: $color-gray-900;
  }
  
  a {
    color: $color-primary;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

address {
  font-style: normal;
  line-height: 1.6;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: $font-size-sm;
  font-weight: 600;
  text-transform: uppercase;
  
  &--gray { background: #f3f4f6; color: #6b7280; }
  &--blue { background: #dbeafe; color: #1e40af; }
  &--purple { background: #ede9fe; color: #6d28d9; }
  &--green { background: #d1fae5; color: #065f46; }
  &--red { background: #fee2e2; color: #991b1b; }
  &--orange { background: #ffedd5; color: #9a3412; }
}

.payment-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: $font-size-xs;
  font-weight: 600;
  text-transform: uppercase;
  
  &--pending { background: #fef3c7; color: #92400e; }
  &--paid { background: #d1fae5; color: #065f46; }
  &--authorized { background: #dbeafe; color: #1e40af; }
  &--captured { background: #d1fae5; color: #065f46; }
  &--failed { background: #fee2e2; color: #991b1b; }
  &--refunded { background: #ffedd5; color: #9a3412; }
}

.guest-badge {
  display: inline-block;
  background: #f3f4f6;
  color: #6b7280;
  font-size: $font-size-xs;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.same-as-shipping {
  color: $color-gray-600;
  font-style: italic;
}

.summary-row--discount {
  color: #16a34a;
}

.tracking-inline {
  font-size: $font-size-xs;
  font-family: 'Courier New', monospace;
  color: $color-gray-600;
  margin-top: 2px;
}

.transaction-id {
  font-family: 'Courier New', monospace;
  font-size: $font-size-sm;
  background: $color-gray-50;
  padding: $spacing-2;
  border-radius: 4px;
}

.timeline {
  position: relative;
  padding-left: $spacing-6;
  
  &::before {
    content: '';
    position: absolute;
    left: 10px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: $color-gray-200;
  }
}

.timeline-item {
  position: relative;
  margin-bottom: $spacing-4;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: -34px;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $color-primary;
  border: 3px solid white;
  box-shadow: 0 0 0 2px $color-primary;

  &--green  { background: #16a34a; box-shadow: 0 0 0 2px #16a34a; }
  &--red    { background: #dc2626; box-shadow: 0 0 0 2px #dc2626; }
  &--orange { background: #ea580c; box-shadow: 0 0 0 2px #ea580c; }
}

.timeline-content {
  strong {
    display: block;
    margin-bottom: $spacing-1;
  }
  
  p {
    font-size: $font-size-sm;
    color: $color-gray-600;
    margin: 0;
  }
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  
  .btn {
    justify-content: center;
  }
}

.loading {
  text-align: center;
  padding: $spacing-16;
  color: $color-gray-500;
}

.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-4;
  padding: $spacing-16;
  text-align: center;
  color: $color-gray-600;

  &--error { color: #991b1b; }
}

.state-icon {
  font-size: 3rem;
  font-weight: 700;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.state-title {
  font-size: $font-size-xl;
  font-weight: 700;
  margin: 0;
}

.state-msg {
  margin: 0;
  max-width: 400px;
  font-size: $font-size-sm;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin { to { transform: rotate(360deg); } }

.action-toast {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 300;
  padding: .75rem 1.25rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: .9rem;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);

  &--ok  { background: #dcfce7; color: #166534; }
  &--err { background: #fee2e2; color: #991b1b; }
}

// ── Admin action sections ───────────────────────────────────────
.action-section {
  margin-bottom: 0;

  &__title {
    font-size: .9rem;
    font-weight: 700;
    color: $color-text;
    margin: 0 0 .3rem;
  }

  &__desc {
    font-size: .8rem;
    color: $color-text-light;
    margin: 0 0 .85rem;
  }
}

.action-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 1.25rem 0;
}

// Utility modifiers for buttons inside action sections
.btn {
  &--full  { width: 100%; margin-bottom: .5rem; }
  &--ghost {
    background: transparent;
    border: 1.5px solid #e0e0e0;
    color: $color-text-light;
    &:hover { background: #f9f9f9; color: $color-text; }
  }
  &--warning {
    background: #fff7ed;
    border: 1.5px solid #fed7aa;
    color: #9a3412;
    &:hover { background: #ffedd5; }
  }
}

// ── Email log ───────────────────────────────────────────────────
.email-log {
  display: flex;
  flex-direction: column;
  gap: .5rem;

  &__item {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .4rem;
    font-size: .8rem;
  }

  &__badge {
    background: #e0e7ff;
    color: #3730a3;
    padding: .15rem .5rem;
    border-radius: 2rem;
    font-weight: 600;
    font-size: .72rem;
    white-space: nowrap;
  }

  &__to {
    color: $color-text-light;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__date {
    color: $color-text-light;
    white-space: nowrap;
    font-size: .72rem;
  }
}

@media print {
  .page-header .btn-back,
  .status-form,
  .tracking-form,
  .action-buttons,
  .action-section,
  .btn,
  .action-toast { display: none !important; }

  .card { box-shadow: none !important; border: 1px solid #e2e8f0; page-break-inside: avoid; }
  .order-detail-grid { display: block !important; }
  .detail-column { width: 100% !important; margin-bottom: 1rem; }
}
</style>

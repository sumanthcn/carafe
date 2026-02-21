<template>
  <div class="admin-order-detail-page">
    <div class="container-fluid">
      <!-- Header -->
      <div class="page-header">
        <NuxtLink to="/admin/orders" class="btn-back">← Back to Orders</NuxtLink>
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
          <!-- Status Update Card -->
          <div class="card">
            <h2>Update Order Status</h2>
            <form @submit.prevent="handleStatusUpdate" class="status-form">
              <div class="form-group">
                <label>Current Status</label>
                <select v-model="statusForm.status" class="form-control">
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div class="form-group">
                <label>Status Notes</label>
                <textarea
                  v-model="statusForm.notes"
                  class="form-control"
                  rows="3"
                  placeholder="Add notes about this status change..."
                ></textarea>
              </div>
              <button type="submit" class="btn btn--primary">Update Status</button>
            </form>
          </div>

          <!-- Tracking Card -->
          <div class="card">
            <h2>Shipping & Tracking</h2>
            <form @submit.prevent="handleTrackingUpdate" class="tracking-form">
              <div class="form-group">
                <label>Tracking Number</label>
                <input
                  v-model="trackingForm.trackingNumber"
                  type="text"
                  class="form-control"
                  :placeholder="order.trackingNumber || 'Enter tracking number'"
                />
              </div>
              <div class="form-group">
                <label>Carrier</label>
                <select v-model="trackingForm.carrier" class="form-control">
                  <option value="royal-mail">Royal Mail</option>
                  <option value="dhl">DHL</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dpd">DPD</option>
                </select>
              </div>
              <button type="submit" class="btn btn--primary">Update Tracking</button>
            </form>

            <div v-if="order.trackingNumber" class="current-tracking">
              <strong>Current Tracking:</strong>
              <p>{{ order.trackingNumber }}</p>
              <a :href="`https://www3.royalmail.com/track-your-item#/tracking-results/${order.trackingNumber}`"
                 target="_blank"
                 class="btn btn--secondary btn--small">
                Track Package →
              </a>
            </div>
          </div>

          <!-- Order Items -->
          <div class="card">
            <h2>Order Items ({{ order.items.length }})</h2>
            <div class="items-list">
              <div v-for="item in order.items" :key="item.id" class="item-row">
                <img :src="item.imageUrl || '/images/placeholder.jpg'" :alt="item.productName" class="item-image" />
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
              <div class="summary-row summary-row--total">
                <strong>Total</strong>
                <strong>{{ formatPrice(order.total) }}</strong>
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
              {{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}<br />
              {{ order.shippingAddress.line1 }}<br />
              <span v-if="order.shippingAddress.line2">{{ order.shippingAddress.line2 }}<br /></span>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}<br />
              {{ order.shippingAddress.country }}
            </address>
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
            <div class="info-group">
              <strong>Order ID:</strong>
              <p class="transaction-id">#{{ order.id }}</p>
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
              <div v-if="order.status !== 'pending'" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Processing Started</strong>
                  <p>{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
              <div v-if="order.status === 'shipped' || order.status === 'delivered'" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Shipped</strong>
                  <p>{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
              <div v-if="order.status === 'delivered'" class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                  <strong>Delivered</strong>
                  <p>{{ formatDate(order.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Admin Actions -->
          <div class="card">
            <h2>Admin Actions</h2>
            <div class="action-buttons">
              <button class="btn btn--secondary" @click="printInvoice">
                🖨️ Print Invoice
              </button>
              <button class="btn btn--secondary" @click="sendEmail">
                ✉️ Email Customer
              </button>
              <button v-if="order.paymentStatus === 'paid'" class="btn btn--warning" @click="initiateRefund">
                💸 Issue Refund
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading">
        <p>Loading order details...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Admin access only
definePageMeta({
  middleware: 'auth',
  // TODO: Add admin role check
});

const route = useRoute();
const orderId = computed(() => parseInt(route.params.id as string));

const orderManagement = useOrderManagement();
const order = computed(() => orderManagement.currentOrder.value);

const statusForm = reactive({
  status: '',
  notes: '',
});

const trackingForm = reactive({
  trackingNumber: '',
  carrier: 'royal-mail',
});

onMounted(async () => {
  await orderManagement.fetchOrder(orderId.value);
  if (order.value) {
    statusForm.status = order.value.status;
    trackingForm.trackingNumber = order.value.trackingNumber || '';
  }
});

const handleStatusUpdate = async () => {
  const success = await orderManagement.updateOrderStatus(orderId.value, statusForm.status as any, statusForm.notes);
  if (success) {
    alert('Order status updated successfully!');
    statusForm.notes = '';
  }
};

const handleTrackingUpdate = async () => {
  const success = await orderManagement.addTrackingNumber(
    orderId.value,
    trackingForm.trackingNumber,
    trackingForm.carrier
  );
  if (success) {
    alert('Tracking information updated!');
  }
};

const getStatusColor = (status: string = '') => {
  const colors: Record<string, string> = {
    pending: 'gray',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'orange',
  };
  return colors[status] || 'gray';
};

const printInvoice = () => {
  window.print();
};

const sendEmail = () => {
  const email = order.value?.customerEmail;
  window.location.href = `mailto:${email}?subject=Regarding Order ${order.value?.orderNumber}`;
};

const initiateRefund = () => {
  if (confirm('Are you sure you want to initiate a refund for this order?')) {
    alert('Refund functionality coming soon. This would integrate with Worldpay refund API.');
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

.status-form,
.tracking-form {
  .form-group {
    margin-bottom: $spacing-4;
    
    label {
      display: block;
      font-weight: 600;
      margin-bottom: $spacing-2;
      color: $color-gray-700;
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
    
    textarea {
      resize: vertical;
    }
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
  
  .item-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
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
  &--failed { background: #fee2e2; color: #991b1b; }
  &--refunded { background: #ffedd5; color: #9a3412; }
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

@media print {
  .page-header,
  .card h2,
  .status-form,
  .tracking-form,
  .action-buttons {
    display: none;
  }
}
</style>

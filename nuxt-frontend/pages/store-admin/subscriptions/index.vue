<template>
  <div class="admin-subscriptions-page">
    <div class="container-fluid">
      <div class="admin-header">
        <div>
          <h1>Customer Subscriptions</h1>
          <p>Track active subscriptions, billing history and lifecycle from start to cancellation</p>
        </div>
        <div class="admin-header__actions">
          <button @click="runBillingNow" class="btn btn--warning" :disabled="billingRunning">
            {{ billingRunning ? 'Running...' : '⚡ Run Billing Now' }}
          </button>
          <button @click="loadSubscriptions" class="btn btn--secondary">Refresh</button>
          <NuxtLink to="/store-admin" class="btn btn--secondary">Dashboard</NuxtLink>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card__icon">🔁</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ activeCount }}</div>
            <div class="stat-card__label">Active Subscriptions</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">⚠️</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ failedCount }}</div>
            <div class="stat-card__label">Payment Failed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">📦</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ totalOrdersGenerated }}</div>
            <div class="stat-card__label">Total Orders Generated</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-card__icon">💷</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ formatPrice(totalRevenue) }}</div>
            <div class="stat-card__label">Lifetime Revenue</div>
          </div>
        </div>
      </div>

      <!-- Billing run result banner -->
      <div v-if="billingResult" class="billing-result" :class="billingResult.failed > 0 ? 'billing-result--warn' : 'billing-result--ok'">
        Billing run complete — ✅ {{ billingResult.processed }} processed, ⚠️ {{ billingResult.failed }} failed
        <span v-if="billingResult.errors?.length"> — {{ billingResult.errors[0] }}</span>
      </div>

      <!-- Test subscription panel -->
      <div class="test-panel">
        <button class="test-panel__toggle" @click="testPanelOpen = !testPanelOpen">
          🧪 Test Subscription (5-min billing) {{ testPanelOpen ? '▾' : '▸' }}
        </button>
        <div v-if="testPanelOpen" class="test-panel__body">
          <p class="test-panel__info">
            Creates a <strong>test subscription</strong> that bills every <strong>5 minutes</strong>.
            The subscription is immediately due — click <em>Run Billing Now</em> after creating it to trigger the first auto-order and Stripe charge.<br>
            Find the <code>pi_...</code> Payment Intent ID in your Stripe test dashboard or from the <em>paymentId</em> field of any captured order.
          </p>
          <div class="test-panel__form">
            <div class="test-field">
              <label>Payment Intent ID (pi_...) *</label>
              <input v-model="testForm.paymentIntentId" placeholder="pi_3..." class="test-input" />
            </div>
            <div class="test-field">
              <label>Product name</label>
              <input v-model="testForm.productName" placeholder="Test Coffee Subscription" class="test-input" />
            </div>
            <div class="test-field">
              <label>Unit price (GBP)</label>
              <input v-model="testForm.unitPrice" type="number" step="0.01" placeholder="12.00" class="test-input test-input--sm" />
            </div>
            <div class="test-field">
              <label>Customer email (optional — defaults to PI customer)</label>
              <input v-model="testForm.customerEmail" placeholder="test@carafe.coffee" class="test-input" />
            </div>
            <div class="test-field">
              <label>Customer name (optional)</label>
              <input v-model="testForm.customerName" placeholder="Test Customer" class="test-input" />
            </div>
            <button class="btn btn--test" :disabled="testRunning" @click="createTestSub">
              {{ testRunning ? 'Creating...' : '🚀 Create Test Subscription' }}
            </button>
          </div>
          <div v-if="testResult" class="test-result" :class="testResult.ok ? 'test-result--ok' : 'test-result--err'">
            <template v-if="testResult.ok">
              ✅ {{ testResult.message }}<br>
              <small>Subscription ID: <strong>{{ testResult.subscriptionId }}</strong> — Stripe customer: {{ testResult.stripeCustomerId }}</small>
            </template>
            <template v-else>⚠️ {{ testResult.message }}</template>
          </div>
        </div>
      </div>

      <!-- Recovery panel: recreate missed subscriptions from an existing paid order -->
      <div class="recover-panel">
        <div class="recover-panel__inner">
          <span class="recover-panel__label">🔁 Recover missed subscription from a paid order:</span>
          <input
            v-model="recoverOrderNumber"
            placeholder="ORD-1779596461923-D57A3F"
            class="test-input recover-input"
          />
          <button class="btn btn--recover" :disabled="recoverRunning" @click="recoverSubscription">
            {{ recoverRunning ? 'Recovering...' : 'Recover Subscription' }}
          </button>
        </div>
        <div v-if="recoverResult" class="test-result" :class="recoverResult.ok ? 'test-result--ok' : 'test-result--err'">
          <template v-if="recoverResult.ok">✅ {{ recoverResult.message }}</template>
          <template v-else>⚠️ {{ recoverResult.message }}</template>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <input v-model="searchQuery" type="text" placeholder="Search by customer, product, email..." class="search-input" />
        <select v-model="statusFilter" class="filter-select">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="payment_failed">Payment Failed</option>
          <option value="cancelled">Cancelled</option>
          <option value="paused">Paused</option>
        </select>
        <select v-model="intervalFilter" class="filter-select">
          <option value="">All Intervals</option>
          <option value="5_minutes">Every 5 min (test)</option>
          <option value="1_week">Weekly</option>
          <option value="2_weeks">Every 2 Weeks</option>
          <option value="3_weeks">Every 3 Weeks</option>
          <option value="1_month">Every 4 Weeks</option>
          <option value="2_months">Every 2 Months</option>
        </select>
      </div>

      <!-- Table -->
      <div class="table-container" v-if="!loading">
        <table class="subscriptions-table" v-if="filtered.length">
          <thead>
            <tr>
              <th></th>
              <th>Customer</th>
              <th>Product</th>
              <th>Interval</th>
              <th>Started</th>
              <th>Next Billing</th>
              <th>Orders</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="sub in filtered" :key="sub.id">
              <!-- Main row -->
              <tr :class="['sub-row', 'sub-row--' + sub.status]" @click="toggleExpand(sub.id)">
                <td class="expand-cell">
                  <span class="expand-icon">{{ expandedId === sub.id ? '▾' : '▸' }}</span>
                </td>
                <td>
                  <div class="customer-info">
                    <strong>{{ sub.customerName }}</strong>
                    <small>{{ sub.customerEmail }}</small>
                  </div>
                </td>
                <td>
                  <div class="product-info">
                    <strong>{{ sub.productName }}</strong>
                    <small v-if="sub.variantDetails?.weight">{{ sub.variantDetails.weight }}</small>
                  </div>
                </td>
                <td><span class="interval-badge">{{ formatInterval(sub.interval) }}</span></td>
                <td>{{ formatDate(sub.startDate) }}</td>
                <td :class="{ 'overdue': isOverdue(sub) }">
                  <span v-if="sub.status === 'active'">{{ formatDate(sub.nextBillingDate) }}</span>
                  <span v-else-if="sub.status === 'cancelled'" class="muted">Cancelled {{ formatDate(sub.cancelledAt) }}</span>
                  <span v-else class="muted">—</span>
                </td>
                <td>{{ sub.totalOrdersGenerated || 1 }}</td>
                <td><strong>{{ formatPrice(sub.totalRevenue || 0) }}</strong></td>
                <td><span class="status-badge" :class="'status-badge--' + sub.status">{{ statusLabel(sub.status) }}</span></td>
                <td @click.stop>
                  <div class="action-buttons">
                    <button
                      v-if="sub.status === 'active' || sub.status === 'payment_failed'"
                      @click="cancelSub(sub)"
                      class="btn-small btn-small--danger"
                    >Cancel</button>
                    <button
                      v-if="sub.status === 'payment_failed'"
                      @click="reactivateSub(sub)"
                      class="btn-small btn-small--ok"
                    >Reactivate</button>
                    <button
                      v-if="!sub.stripeCustomerId || !sub.stripePaymentMethodId"
                      @click="fixStripeIds(sub)"
                      class="btn-small btn-small--warn"
                      title="Attach Stripe customer/payment method so auto-billing works"
                    >Fix Stripe IDs</button>
                  </div>
                </td>
              </tr>

              <!-- Expanded: order history + details -->
              <tr v-if="expandedId === sub.id" class="expanded-row">
                <td colspan="10">
                  <div class="order-history">
                    <h4>Order History ({{ (sub.orderNumbers || []).length }} orders)</h4>
                    <div v-if="sub.lastBillingError" class="billing-error-banner">
                      ⚠️ Last billing error: {{ sub.lastBillingError }}
                    </div>
                    <div v-if="!(sub.orderNumbers || []).length" class="muted">No orders linked yet.</div>
                    <table v-else class="order-history-table">
                      <thead>
                        <tr><th>#</th><th>Order Number</th><th>Type</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        <tr v-for="(orderNum, idx) in sub.orderNumbers" :key="orderNum">
                          <td>{{ idx + 1 }}</td>
                          <td><strong>{{ orderNum }}</strong></td>
                          <td>{{ idx === 0 ? '🟢 First order' : '🔁 Auto-generated' }}</td>
                          <td>
                            <NuxtLink :to="`/store-admin/orders?search=${orderNum}`" class="btn-small btn-small--ghost">View →</NuxtLink>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="sub-detail-grid">
                      <div><label>Qty / Order</label><span>{{ sub.quantity }}</span></div>
                      <div><label>Unit Price</label><span>{{ formatPrice(sub.unitPrice) }}</span></div>
                      <div><label>Discount</label><span>{{ sub.discountPercentage ? sub.discountPercentage + '%' : '—' }}</span></div>
                      <div><label>Shipping</label><span>{{ formatPrice(sub.shippingCost || 0) }}</span></div>
                      <div><label>Stripe Customer</label><span class="mono">{{ sub.stripeCustomerId || 'not captured' }}</span></div>
                      <div><label>Payment Method</label><span class="mono">{{ sub.stripePaymentMethodId ? '••• saved' : 'not captured' }}</span></div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <div v-else class="empty-table">
          <p>No subscriptions found{{ statusFilter ? ' with status "' + statusFilter + '"' : '' }}.</p>
        </div>
      </div>
      <div v-else class="empty-table"><p>Loading subscriptions...</p></div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' });

const config = useRuntimeConfig();
const { getAuthHeaders } = useAuth();

const subscriptions = ref<any[]>([]);
const loading = ref(true);
const billingRunning = ref(false);
const billingResult = ref<any>(null);
const searchQuery = ref('');

// --- Test subscription panel ---
const testPanelOpen = ref(false);
const testForm = ref({ paymentIntentId: '', productName: 'Test Coffee Subscription', unitPrice: '12.00', customerEmail: '', customerName: '' });
const testRunning = ref(false);
const testResult = ref<any>(null);

// --- Recovery panel ---
const recoverOrderNumber = ref('');
const recoverRunning = ref(false);
const recoverResult = ref<any>(null);

const INTERVAL_LABELS: Record<string, string> = {
  '5_minutes': '⚡ Every 5 min (test)', '1_week': 'Weekly', '2_weeks': 'Every 2 Weeks',
  '3_weeks': 'Every 3 Weeks', '1_month': 'Every 4 Weeks', '2_months': 'Every 2 Months',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Active', paused: 'Paused', cancelled: 'Cancelled', payment_failed: 'Payment Failed',
};

const statusFilter = ref('');
const intervalFilter = ref('');
const expandedId = ref<number | null>(null);

const loadSubscriptions = async () => {
  loading.value = true;
  try {
    const res = await $fetch<{ data: any[] }>(
      `${config.public.strapiUrl}/api/customer-subscriptions?sort=createdAt:desc&pagination[limit]=500&populate[shippingAddress]=true`,
      { headers: getAuthHeaders() }
    );
    subscriptions.value = res.data || [];
  } catch (e) { console.error('Failed to load subscriptions', e); }
  finally { loading.value = false; }
};

onMounted(loadSubscriptions);

const filtered = computed(() => {
  let list = subscriptions.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) list = list.filter(s =>
    s.customerName?.toLowerCase().includes(q) || s.customerEmail?.toLowerCase().includes(q) ||
    s.productName?.toLowerCase().includes(q) || (s.orderNumbers || []).some((n: string) => n.toLowerCase().includes(q))
  );
  if (statusFilter.value) list = list.filter(s => s.status === statusFilter.value);
  if (intervalFilter.value) list = list.filter(s => s.interval === intervalFilter.value);
  return list;
});

const activeCount = computed(() => subscriptions.value.filter(s => s.status === 'active').length);
const failedCount = computed(() => subscriptions.value.filter(s => s.status === 'payment_failed').length);
const totalOrdersGenerated = computed(() => subscriptions.value.reduce((s, sub) => s + (sub.totalOrdersGenerated || 1), 0));
const totalRevenue = computed(() => subscriptions.value.reduce((s, sub) => s + Number(sub.totalRevenue || 0), 0));

const toggleExpand = (id: number) => { expandedId.value = expandedId.value === id ? null : id; };
const isOverdue = (sub: any) => sub.status === 'active' && sub.nextBillingDate && new Date(sub.nextBillingDate) < new Date();

const formatDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n || 0);
const formatInterval = (i: string) => INTERVAL_LABELS[i] || i;
const statusLabel = (s: string) => STATUS_LABELS[s] || s;

const cancelSub = async (sub: any) => {
  if (!confirm(`Cancel subscription for ${sub.customerName} (${sub.productName})?`)) return;
  try {
    await $fetch(`${config.public.strapiUrl}/api/stripe/cancel-subscription`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: { subscriptionId: sub.id },
    });
    await loadSubscriptions();
  } catch (e: any) { alert('Failed to cancel: ' + (e.message || e)); }
};

const reactivateSub = async (sub: any) => {
  if (!confirm(`Reactivate subscription for ${sub.customerName}?`)) return;
  try {
    await $fetch(`${config.public.strapiUrl}/api/customer-subscriptions/${sub.id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: { data: { status: 'active', lastBillingError: null } },
    });
    await loadSubscriptions();
  } catch (e: any) { alert('Failed to reactivate: ' + (e.message || e)); }
};

const fixStripeIds = async (sub: any) => {
  const email = sub.customerEmail;
  if (!confirm(`Look up Stripe customer/payment method for "${email}" and attach to subscription ${sub.id}?`)) return;
  try {
    const res = await $fetch<any>(`${config.public.strapiUrl}/api/stripe/attach-stripe-ids`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: { subscriptionId: sub.id, customerEmail: email },
    });
    alert(res.message + '\nCustomer: ' + res.stripeCustomerId + '\nPayment method: ' + res.stripePaymentMethodId);
    await loadSubscriptions();
  } catch (e: any) {
    alert('Failed to attach Stripe IDs: ' + (e.data?.error?.message || e.message || String(e)));
  }
};

const runBillingNow = async () => {
  if (!confirm('Run the billing cycle now? This will charge all overdue subscriptions immediately.')) return;
  billingRunning.value = true;
  billingResult.value = null;
  try {
    const res = await $fetch<any>(`${config.public.strapiUrl}/api/stripe/process-subscriptions`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: {},
    });
    billingResult.value = res;
    await loadSubscriptions();
  } catch (e: any) {
    billingResult.value = { processed: 0, failed: 1, errors: [e.message || String(e)] };
  } finally { billingRunning.value = false; }
};

const createTestSub = async () => {
  if (!testForm.value.paymentIntentId.trim()) {
    alert('Please enter the Payment Intent ID (pi_...) from your Stripe test dashboard or a past order.');
    return;
  }
  testRunning.value = true;
  testResult.value = null;
  try {
    const res = await $fetch<any>(`${config.public.strapiUrl}/api/stripe/create-test-subscription`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: {
        paymentIntentId: testForm.value.paymentIntentId.trim(),
        productName: testForm.value.productName || 'Test Coffee Subscription',
        unitPrice: Number(testForm.value.unitPrice) || 12,
        customerEmail: testForm.value.customerEmail || undefined,
        customerName: testForm.value.customerName || undefined,
      },
    });
    testResult.value = { ok: true, ...res };
    await loadSubscriptions();
  } catch (e: any) {
    testResult.value = { ok: false, message: e.data?.error?.message || e.message || String(e) };
  } finally { testRunning.value = false; }
};

const recoverSubscription = async () => {
  const orderNum = recoverOrderNumber.value.trim();
  if (!orderNum) { alert('Enter an order number (e.g. ORD-1779596461923-D57A3F)'); return; }
  recoverRunning.value = true;
  recoverResult.value = null;
  try {
    const res = await $fetch<any>(`${config.public.strapiUrl}/api/stripe/retry-subscription-for-order`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: { orderNumber: orderNum },
    });
    recoverResult.value = { ok: true, ...res };
    await loadSubscriptions();
  } catch (e: any) {
    recoverResult.value = { ok: false, message: e.data?.error?.message || e.message || String(e) };
  } finally { recoverRunning.value = false; }
};

useHead({
  title: 'Customer Subscriptions - Store Admin - Carafe Coffee',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.admin-subscriptions-page {
  padding: $spacing-8;
  background: $color-gray-50;
  min-height: 100vh;
}

.container-fluid { max-width: 1400px; margin: 0 auto; }

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: $spacing-4;
  margin-bottom: $spacing-6;
  h1 { font-size: 1.75rem; margin-bottom: $spacing-2; color: $color-dark; }
  p { color: $color-gray-600; margin: 0; }
  &__actions { display: flex; gap: $spacing-3; flex-wrap: wrap; }
}

.btn {
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  &--warning   { background: #f59e0b; color: #fff; border-color: #f59e0b; }
  &:disabled   { opacity: 0.5; cursor: not-allowed; }
}

.billing-result {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: $spacing-4;
  font-size: 0.875rem;
  &--ok   { background: #dcfce7; color: #166534; }
  &--warn { background: #fef3c7; color: #92400e; }
}

.test-panel {
  margin-bottom: $spacing-4;
  border: 2px dashed #a78bfa;
  border-radius: 10px;
  overflow: hidden;

  &__toggle {
    width: 100%;
    background: #f5f3ff;
    border: none;
    padding: 0.7rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #5b21b6;
    cursor: pointer;
    text-align: left;
    &:hover { background: #ede9fe; }
  }

  &__body {
    padding: 1rem;
    background: #faf5ff;
  }

  &__info {
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 1rem;
    line-height: 1.5;
    code { background: #e5e7eb; padding: 1px 4px; border-radius: 4px; }
  }

  &__form {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: flex-end;
  }
}

.test-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  label { font-size: 0.75rem; color: #374151; font-weight: 500; }
}

.test-input {
  padding: 0.4rem 0.7rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 260px;
  &--sm { min-width: 100px; }
}

.test-result {
  margin-top: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-radius: 6px;
  font-size: 0.8rem;
  line-height: 1.6;
  &--ok  { background: #dcfce7; color: #166534; }
  &--err { background: #fee2e2; color: #991b1b; }
}

.btn--test {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  height: fit-content;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.recover-panel {
  margin-bottom: $spacing-4;
  background: #fff8ed;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 0.75rem 1rem;

  &__inner {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 0.875rem;
    font-weight: 600;
    color: #92400e;
    white-space: nowrap;
  }
}

.recover-input { min-width: 300px; }

.btn--recover {
  background: #d97706;
  color: #fff;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: $spacing-4;
  margin-bottom: $spacing-6;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: $spacing-4;
  display: flex;
  align-items: center;
  gap: $spacing-3;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  &__icon { font-size: 1.75rem; }
  &__value { font-size: 1.5rem; font-weight: 700; color: $color-dark; }
  &__label { font-size: 0.75rem; color: $color-gray-600; text-transform: uppercase; letter-spacing: .05em; }
}

.filters-bar {
  display: flex;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin-bottom: $spacing-4;
  .search-input, .filter-select {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    font-size: 0.875rem;
    background: #fff;
    color: $color-dark;
    outline: none;
    &:focus { border-color: $color-primary; }
  }
  .search-input { flex: 1; min-width: 200px; }
}

.table-container {
  background: #fff;
  border-radius: 12px;
  overflow: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}

.subscriptions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  th {
    padding: 0.75rem 1rem;
    text-align: left;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: .05em;
    color: $color-gray-600;
    white-space: nowrap;
  }
  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: middle;
  }
}

.sub-row {
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #f8fafc; }
  &--payment_failed td { background: #fff7ed; }
  &--cancelled { opacity: 0.65; }
}

.expand-cell { width: 32px; text-align: center; }
.expand-icon { font-size: 0.75rem; color: $color-gray-600; }

.customer-info, .product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  small { color: $color-gray-600; font-size: 0.75rem; }
}

.interval-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 99px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  &--active         { background: #dcfce7; color: #166534; }
  &--paused         { background: #fef3c7; color: #92400e; }
  &--cancelled      { background: #f1f5f9; color: #64748b; }
  &--payment_failed { background: #fee2e2; color: #991b1b; }
}

.overdue { color: #dc2626; font-weight: 600; }
.muted { color: $color-gray-600; font-size: 0.8rem; }

.action-buttons { display: flex; gap: 6px; }

.btn-small {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  text-decoration: none;
  display: inline-flex;
  &--danger { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
  &--ok     { background: #dcfce7; color: #166534; border-color: #86efac; }
  &--warn   { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
  &--ghost  { background: #f8fafc; color: #374151; border-color: #e2e8f0; }
}

.expanded-row td { background: #f8fafc; padding: 0; }

.order-history {
  padding: 1.25rem 1.5rem;
  border-top: 2px solid #e2e8f0;
  h4 { margin: 0 0 0.75rem; font-size: 0.9rem; color: $color-dark; }
}

.billing-error-banner {
  padding: 0.5rem 0.75rem;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #92400e;
  margin-bottom: 0.75rem;
}

.order-history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  margin-bottom: 1rem;
  th {
    padding: 0.4rem 0.75rem;
    background: #f1f5f9;
    border-bottom: 1px solid #e2e8f0;
    text-align: left;
    font-weight: 600;
    color: $color-gray-600;
    font-size: 0.72rem;
    text-transform: uppercase;
  }
  td { padding: 0.4rem 0.75rem; border-bottom: 1px solid #f1f5f9; }
}

.sub-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 0.8rem;
  > div { display: flex; flex-direction: column; gap: 2px; }
  label { color: $color-gray-600; font-size: 0.7rem; text-transform: uppercase; font-weight: 600; }
  .mono { font-family: monospace; font-size: 0.75rem; }
}

.empty-table {
  padding: 2.5rem;
  text-align: center;
  color: #94a3b8;
}
</style>

  th {
    background: #f8fafc;
    color: #64748b;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid #e2e8f0;
  }

  tbody tr:not(:last-child) td {
    border-bottom: 1px solid #f1f5f9;
  }
}

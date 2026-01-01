<template>
  <div class="purchase-options">
    <h3 class="purchase-options__title">Purchase Options</h3>
    
    <!-- One-time Purchase -->
    <label class="purchase-option" :class="{ active: !isSubscription }">
      <input
        type="radio"
        name="purchaseType"
        value="one-time"
        v-model="purchaseType"
        @change="handlePurchaseTypeChange"
      />
      <div class="option-content">
        <span class="option-label">One-time Purchase</span>
        <span class="option-price">{{ formatCurrency(basePrice) }}</span>
      </div>
    </label>

    <!-- Subscribe & Save -->
    <label class="purchase-option" :class="{ active: isSubscription }">
      <input
        type="radio"
        name="purchaseType"
        value="subscription"
        v-model="purchaseType"
        @change="handlePurchaseTypeChange"
      />
      <div class="option-content">
        <span class="option-label">Subscribe & Save</span>
        <span v-if="selectedSubscription" class="option-price">
          {{ formatCurrency(subscriptionPrice) }}
          <span class="savings">Save {{ selectedSubscription.discountPercentage }}%</span>
        </span>
      </div>
    </label>

    <!-- Subscription Frequency Options -->
    <div v-if="isSubscription" class="subscription-frequencies">
      <label class="frequency-label">Deliver every:</label>
      <div class="frequency-options">
        <label
          v-for="option in subscriptionOptions"
          :key="option.id"
          class="frequency-option"
          :class="{ active: selectedSubscription?.id === option.id }"
        >
          <input
            type="radio"
            name="frequency"
            :value="option.id"
            v-model="selectedFrequencyId"
            @change="handleFrequencyChange"
          />
          <span>{{ formatInterval(option.deliveryInterval) }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SubscriptionOption } from '~/types/strapi';

interface Props {
  subscriptionOptions?: SubscriptionOption[];
  basePrice: number;
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subscriptionOptions: () => [],
  currency: 'EUR',
});

const emit = defineEmits<{
  purchaseOptionChanged: [type: 'one-time' | 'subscription', subscription?: SubscriptionOption];
}>();

const purchaseType = ref<'one-time' | 'subscription'>('one-time');
const selectedFrequencyId = ref<number | null>(null);

const isSubscription = computed(() => purchaseType.value === 'subscription');

const selectedSubscription = computed(() => {
  if (!isSubscription.value || !selectedFrequencyId.value) return null;
  return props.subscriptionOptions.find(opt => opt.id === selectedFrequencyId.value) || null;
});

const subscriptionPrice = computed(() => {
  if (!selectedSubscription.value) return props.basePrice;
  const discount = selectedSubscription.value.discountPercentage / 100;
  return props.basePrice * (1 - discount);
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: props.currency,
  }).format(amount);
};

const formatInterval = (interval: string): string => {
  const map: Record<string, string> = {
    '1_week': '1 Week',
    '2_weeks': '2 Weeks',
    '3_weeks': '3 Weeks',
    '1_month': '1 Month',
    '2_months': '2 Months',
  };
  return map[interval] || interval;
};

const handlePurchaseTypeChange = () => {
  if (isSubscription.value && !selectedFrequencyId.value && props.subscriptionOptions.length > 0) {
    // Auto-select first frequency option
    selectedFrequencyId.value = props.subscriptionOptions[0].id;
  }
  emitChange();
};

const handleFrequencyChange = () => {
  emitChange();
};

const emitChange = () => {
  if (isSubscription.value && selectedSubscription.value) {
    emit('purchaseOptionChanged', 'subscription', selectedSubscription.value);
  } else {
    emit('purchaseOptionChanged', 'one-time');
  }
};

// Initialize with first subscription option if available
onMounted(() => {
  if (props.subscriptionOptions.length > 0) {
    selectedFrequencyId.value = props.subscriptionOptions[0].id;
  }
});
</script>

<style lang="scss" scoped>
.purchase-options {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.purchase-options__title {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  color: $color-text;
}

.purchase-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
    background: lighten($color-primary, 48%);
  }

  &.active {
    border-color: $color-primary;
    background: lighten($color-primary, 45%);
  }

  input[type="radio"] {
    margin-right: 0.75rem;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
}

.option-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.option-label {
  font-weight: 600;
  font-size: 1rem;
  color: $color-text;
}

.option-price {
  font-weight: 700;
  font-size: 1.125rem;
  color: $color-text;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.savings {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: #10b981;
  color: white;
  border-radius: 4px;
  font-weight: 600;
}

.subscription-frequencies {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.frequency-label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  color: $color-text;
}

.frequency-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.5rem;
}

.frequency-option {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: $color-primary;
    background: lighten($color-primary, 48%);
  }

  &.active {
    border-color: $color-primary;
    background: $color-primary;
    color: white;
  }

  input[type="radio"] {
    display: none;
  }

  span {
    font-size: 0.875rem;
    font-weight: 500;
  }
}
</style>

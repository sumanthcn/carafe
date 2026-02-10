<template>
  <div class="address-selector">
    <div class="selector-header">
      <label class="selector-label">
        <input
          type="checkbox"
          v-model="useSavedAddress"
          @change="handleToggle"
          class="checkbox-input"
        />
        <span>Use saved address</span>
      </label>
    </div>

    <div v-if="useSavedAddress" class="saved-addresses">
      <!-- Loading State -->
      <div v-if="loading" class="loading-message">
        Loading addresses...
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- No Addresses -->
      <div v-else-if="addresses.length === 0" class="no-addresses">
        <p>No saved addresses found.</p>
        <button @click="useSavedAddress = false" class="btn-link">
          Enter address manually
        </button>
      </div>

      <!-- Address Selection -->
      <div v-else class="address-options">
        <div
          v-for="address in addresses"
          :key="address.id"
          class="address-option"
          :class="{ 'address-option--selected': selectedAddressId === address.id }"
          @click="selectAddress(address)"
        >
          <div class="radio-wrapper">
            <input
              type="radio"
              :id="`address-${address.id}`"
              :value="address.id"
              v-model="selectedAddressId"
              class="radio-input"
            />
          </div>
          
          <label :for="`address-${address.id}`" class="address-content">
            <div class="address-header">
              <span class="address-label">{{ address.label }}</span>
              <span v-if="address.isDefault" class="default-badge">Default</span>
            </div>
            
            <div class="address-details">
              <p>{{ address.firstName }} {{ address.lastName }}</p>
              <p>{{ address.address1 }}</p>
              <p v-if="address.address2">{{ address.address2 }}</p>
              <p>{{ address.city }}, {{ address.postcode }}</p>
              <p>{{ address.country }}</p>
              <p class="address-phone">{{ address.phone }}</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserAddress } from '~/composables/useAddresses';

const emit = defineEmits<{
  'address-selected': [address: UserAddress | null];
}>();

const { addresses, loading, error, fetchAddresses, getDefaultAddress } = useAddresses();
const { isAuthenticated } = useAuth();

const useSavedAddress = ref(false);
const selectedAddressId = ref<number | null>(null);

// Fetch addresses on mount if authenticated
onMounted(async () => {
  if (isAuthenticated.value) {
    try {
      await fetchAddresses();
      
      // Auto-select default address if available
      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        selectedAddressId.value = defaultAddress.id;
        emit('address-selected', defaultAddress);
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    }
  }
});

function handleToggle() {
  if (!useSavedAddress.value) {
    // Switched to manual entry
    selectedAddressId.value = null;
    emit('address-selected', null);
  } else {
    // Switched to saved addresses
    // Try to select default address
    const defaultAddress = getDefaultAddress();
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id;
      emit('address-selected', defaultAddress);
    }
  }
}

function selectAddress(address: UserAddress) {
  selectedAddressId.value = address.id;
  emit('address-selected', address);
}

// Watch for address changes
watch(selectedAddressId, () => {
  if (selectedAddressId.value) {
    const address = addresses.value.find(a => a.id === selectedAddressId.value);
    if (address) {
      emit('address-selected', address);
    }
  }
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.address-selector {
  margin-bottom: 1.5rem;
}

.selector-header {
  margin-bottom: 1rem;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  color: $color-dark;

  span {
    font-size: 1rem;
  }
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.saved-addresses {
  margin-top: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.loading-message,
.error-message,
.no-addresses {
  text-align: center;
  padding: 1.5rem;
  color: #6b7280;
}

.error-message {
  color: #dc2626;
}

.btn-link {
  background: none;
  border: none;
  color: $color-primary;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.875rem;
  margin-top: 0.5rem;

  &:hover {
    color: darken($color-primary, 10%);
  }
}

.address-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.address-option {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
  }

  &--selected {
    border-color: $color-primary;
    background: #fef3f2;
  }
}

.radio-wrapper {
  flex-shrink: 0;
  padding-top: 0.25rem;
}

.radio-input {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.address-content {
  flex: 1;
  cursor: pointer;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.address-label {
  font-weight: 600;
  font-size: 1rem;
  color: $color-dark;
}

.default-badge {
  padding: 0.125rem 0.5rem;
  background-color: $color-primary;
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.address-details {
  font-size: 0.875rem;
  color: #4b5563;
  line-height: 1.5;

  p {
    margin: 0.125rem 0;
  }
}

.address-phone {
  margin-top: 0.25rem;
  color: #6b7280;
  font-family: monospace;
}
</style>

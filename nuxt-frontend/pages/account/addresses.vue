<template>
  <div class="addresses-page">
    <div class="container">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">My Addresses</h1>
          <p class="page-subtitle">Manage your saved shipping addresses</p>
        </div>
        <button
          v-if="!showForm && addresses.length > 0"
          @click="handleAdd"
          class="btn btn--primary"
        >
          <span class="btn-icon">+</span>
          Add New Address
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="alert alert--success">
        {{ successMessage }}
      </div>

      <!-- Form (Add/Edit) -->
      <div v-if="showForm" class="form-section">
        <AddressForm
          :title="isEditing ? 'Edit Address' : 'Add New Address'"
          :address="selectedAddress"
          :submit-label="isEditing ? 'Update Address' : 'Save Address'"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>

      <!-- Address List -->
      <div v-else class="list-section">
        <AddressList
          :addresses="addresses"
          :loading="loading"
          :error="error"
          @add="handleAdd"
          @edit="handleEdit"
          @delete="handleDelete"
          @set-default="handleSetDefault"
          @retry="fetchAddresses"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserAddress, CreateAddressData } from '~/composables/useAddresses';

definePageMeta({
  middleware: 'auth',
  layout: 'default',
});

const {
  addresses,
  loading,
  error,
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = useAddresses();

const showForm = ref(false);
const isEditing = ref(false);
const selectedAddress = ref<UserAddress | null>(null);
const successMessage = ref('');

// Fetch addresses on mount
onMounted(async () => {
  try {
    await fetchAddresses();
  } catch (err) {
    console.error('Failed to load addresses:', err);
  }
});

function handleAdd() {
  selectedAddress.value = null;
  isEditing.value = false;
  showForm.value = true;
  successMessage.value = '';
}

function handleEdit(address: UserAddress) {
  selectedAddress.value = address;
  isEditing.value = true;
  showForm.value = true;
  successMessage.value = '';
}

function handleCancel() {
  showForm.value = false;
  isEditing.value = false;
  selectedAddress.value = null;
}

async function handleSubmit(data: CreateAddressData) {
  try {
    if (isEditing.value && selectedAddress.value) {
      await updateAddress(selectedAddress.value.id, data);
      successMessage.value = 'Address updated successfully!';
    } else {
      await createAddress(data);
      successMessage.value = 'Address added successfully!';
    }
    
    showForm.value = false;
    isEditing.value = false;
    selectedAddress.value = null;

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: any) {
    console.error('Failed to save address:', err);
    alert(err.message || 'Failed to save address. Please try again.');
  }
}

async function handleDelete(id: number) {
  try {
    await deleteAddress(id);
    successMessage.value = 'Address deleted successfully!';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: any) {
    console.error('Failed to delete address:', err);
    alert(err.message || 'Failed to delete address. Please try again.');
  }
}

async function handleSetDefault(id: number) {
  try {
    await setDefaultAddress(id);
    successMessage.value = 'Default address updated!';
    
    setTimeout(() => {
      successMessage.value = '';
    }, 5000);
  } catch (err: any) {
    console.error('Failed to set default address:', err);
    alert(err.message || 'Failed to set default address. Please try again.');
  }
}

useHead({
  title: 'My Addresses | Carafe Coffee',
  meta: [
    { name: 'description', content: 'Manage your saved shipping addresses' },
  ],
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.addresses-page {
  min-height: calc(100vh - 200px);
  padding: 3rem 0;
  background: #f9fafb;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: $color-dark;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background-color: $color-primary;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken($color-primary, 10%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.btn-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.alert {
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  margin-bottom: 2rem;
  font-size: 0.875rem;
  animation: slideDown 0.3s ease-out;

  &--success {
    background-color: #d1fae5;
    color: #065f46;
    border: 1px solid #6ee7b7;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-section {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>

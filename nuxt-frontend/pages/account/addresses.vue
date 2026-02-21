<template>
  <div class="addresses-page">
    <!-- Hero Section -->
    <div class="addresses-hero">
      <div class="addresses-hero__background"></div>
      <div class="container">
        <div class="addresses-hero__content">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/">Home</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <NuxtLink to="/account">Account</NuxtLink>
            <span class="breadcrumb__separator">/</span>
            <span class="breadcrumb__current">Addresses</span>
          </nav>

          <!-- Hero Title -->
          <div class="addresses-hero__header">
            <div>
              <h1 class="addresses-hero__title">My Addresses</h1>
              <p class="addresses-hero__subtitle">Manage your saved shipping addresses</p>
            </div>
            <button
              v-if="!showForm && addresses.length > 0"
              @click="handleAdd"
              class="btn-hero"
            >
              <span class="btn-icon">+</span>
              Add New Address
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container">
      <div class="addresses-page__wrapper">

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
  min-height: 100vh;
  background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
  padding-bottom: $spacing-16;
}

// Hero Section
.addresses-hero {
  position: relative;
  padding: 140px 0 120px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a7b 100%);
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 120px 0 100px;
  }

  &__background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    opacity: 0.6;
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: $spacing-4;
    gap: $spacing-4;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: $spacing-3;
    }
  }

  &__title {
    font-family: $font-family-heading;
    font-size: 3rem;
    font-weight: 700;
    color: white;
    margin: 0 0 $spacing-3;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  &__subtitle {
    font-size: 1.125rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

// Breadcrumb
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: $spacing-2;

  a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: white;
    }
  }

  &__separator {
    color: rgba(255, 255, 255, 0.5);
  }

  &__current {
    color: white;
    font-weight: 500;
  }
}

// Hero Button
.btn-hero {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #1e3a5f;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  .btn-icon {
    font-size: 1.25rem;
    font-weight: 700;
  }
}

// Wrapper
.addresses-page__wrapper {
  max-width: 1200px;
  margin: -80px auto 0;
  padding: 0 $spacing-4;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    margin-top: -60px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
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

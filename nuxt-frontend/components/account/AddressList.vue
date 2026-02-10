<template>
  <div class="address-list">
    <div v-if="loading" class="loading-state">
      <p>Loading addresses...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="$emit('retry')" class="btn btn--secondary">
        Retry
      </button>
    </div>

    <div v-else-if="addresses.length === 0" class="empty-state">
      <p>No saved addresses yet.</p>
      <button @click="$emit('add')" class="btn btn--primary">
        Add Your First Address
      </button>
    </div>

    <div v-else class="addresses-grid">
      <div
        v-for="address in addresses"
        :key="address.id"
        class="address-card"
        :class="{ 'address-card--default': address.isDefault }"
      >
        <!-- Default Badge -->
        <div v-if="address.isDefault" class="default-badge">
          Default
        </div>

        <!-- Address Label -->
        <h3 class="address-label">{{ address.label }}</h3>

        <!-- Address Details -->
        <div class="address-details">
          <p class="address-name">{{ address.firstName }} {{ address.lastName }}</p>
          <p class="address-line">{{ address.address1 }}</p>
          <p v-if="address.address2" class="address-line">{{ address.address2 }}</p>
          <p class="address-line">{{ address.city }}, {{ address.postcode }}</p>
          <p class="address-line">{{ address.country }}</p>
          <p class="address-phone">{{ address.phone }}</p>
        </div>

        <!-- Actions -->
        <div class="address-actions">
          <button
            v-if="!address.isDefault"
            @click="$emit('set-default', address.id)"
            class="action-btn action-btn--default"
            :disabled="settingDefault === address.id"
          >
            <span v-if="settingDefault === address.id">Setting...</span>
            <span v-else>Set as Default</span>
          </button>
          
          <button
            @click="$emit('edit', address)"
            class="action-btn action-btn--edit"
          >
            Edit
          </button>
          
          <button
            @click="confirmDelete(address)"
            class="action-btn action-btn--delete"
            :disabled="deleting === address.id"
          >
            <span v-if="deleting === address.id">Deleting...</span>
            <span v-else>Delete</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Delete Address</h3>
          <p class="modal-message">
            Are you sure you want to delete "<strong>{{ addressToDelete?.label }}</strong>"?
            This action cannot be undone.
          </p>
          <div class="modal-actions">
            <button
              @click="cancelDelete"
              class="btn btn--secondary"
              :disabled="deleting !== null"
            >
              Cancel
            </button>
            <button
              @click="handleDelete"
              class="btn btn--danger"
              :disabled="deleting !== null"
            >
              <span v-if="deleting !== null">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { UserAddress } from '~/composables/useAddresses';

interface Props {
  addresses: UserAddress[];
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  add: [];
  edit: [address: UserAddress];
  delete: [id: number];
  'set-default': [id: number];
  retry: [];
}>();

const showDeleteModal = ref(false);
const addressToDelete = ref<UserAddress | null>(null);
const deleting = ref<number | null>(null);
const settingDefault = ref<number | null>(null);

function confirmDelete(address: UserAddress) {
  addressToDelete.value = address;
  showDeleteModal.value = true;
}

function cancelDelete() {
  if (deleting.value === null) {
    showDeleteModal.value = false;
    addressToDelete.value = null;
  }
}

async function handleDelete() {
  if (!addressToDelete.value) return;
  
  deleting.value = addressToDelete.value.id;
  try {
    emit('delete', addressToDelete.value.id);
    showDeleteModal.value = false;
    addressToDelete.value = null;
  } finally {
    deleting.value = null;
  }
}

// Watch for external setting default state
defineExpose({
  setSettingDefault: (id: number | null) => {
    settingDefault.value = id;
  },
});
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.address-list {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
}

.addresses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.address-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s ease;

  &:hover {
    border-color: $color-primary;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &--default {
    border-color: $color-primary;
    background: #fef3f2;
  }
}

.default-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  background-color: $color-primary;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.address-label {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-dark;
  margin-bottom: 1rem;
}

.address-details {
  margin-bottom: 1.5rem;

  p {
    margin: 0.25rem 0;
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.5;
  }
}

.address-name {
  font-weight: 600;
  color: $color-dark !important;
}

.address-phone {
  margin-top: 0.5rem !important;
  color: #6b7280 !important;
  font-family: monospace;
}

.address-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--default {
    color: $color-primary;
    border-color: $color-primary;

    &:hover:not(:disabled) {
      background-color: $color-primary;
      color: white;
    }
  }

  &--edit {
    color: #3b82f6;
    border-color: #3b82f6;

    &:hover:not(:disabled) {
      background-color: #3b82f6;
      color: white;
    }
  }

  &--delete {
    color: #dc2626;
    border-color: #dc2626;

    &:hover:not(:disabled) {
      background-color: #dc2626;
      color: white;
    }
  }
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background-color: $color-primary;
    color: white;

    &:hover:not(:disabled) {
      background-color: darken($color-primary, 10%);
    }
  }

  &--secondary {
    background-color: #f3f4f6;
    color: $color-dark;

    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  }

  &--danger {
    background-color: #dc2626;
    color: white;

    &:hover:not(:disabled) {
      background-color: #b91c1c;
    }
  }
}

// Modal styles
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-dark;
  margin-bottom: 1rem;
}

.modal-message {
  color: #4b5563;
  margin-bottom: 1.5rem;
  line-height: 1.5;

  strong {
    color: $color-dark;
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
</style>

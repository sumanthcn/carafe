<template>
  <form @submit.prevent="handleSubmit" class="address-form">
    <h3 v-if="title" class="form-title">{{ title }}</h3>

    <!-- Label -->
    <div class="form-group">
      <label for="label" class="form-label">Address Label *</label>
      <input
        id="label"
        v-model="formData.label"
        type="text"
        class="form-input"
        :class="{ 'form-input--error': errors.label }"
        placeholder="e.g., Home, Work, Office"
        required
        maxlength="50"
      />
      <span v-if="errors.label" class="form-error">{{ errors.label }}</span>
    </div>

    <div class="form-row">
      <!-- First Name -->
      <div class="form-group">
        <label for="firstName" class="form-label">First Name *</label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.firstName }"
          placeholder="John"
          required
        />
        <span v-if="errors.firstName" class="form-error">{{ errors.firstName }}</span>
      </div>

      <!-- Last Name -->
      <div class="form-group">
        <label for="lastName" class="form-label">Last Name *</label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.lastName }"
          placeholder="Doe"
          required
        />
        <span v-if="errors.lastName" class="form-error">{{ errors.lastName }}</span>
      </div>
    </div>

    <!-- Phone -->
    <div class="form-group">
      <label for="phone" class="form-label">Phone Number *</label>
      <input
        id="phone"
        v-model="formData.phone"
        type="tel"
        class="form-input"
        :class="{ 'form-input--error': errors.phone }"
        placeholder="+44 20 7946 0958"
        required
        @input="handlePhoneInput"
      />
      <span v-if="errors.phone" class="form-error">{{ errors.phone }}</span>
    </div>

    <!-- Address Line 1 -->
    <div class="form-group">
      <label for="address1" class="form-label">Address Line 1 *</label>
      <input
        id="address1"
        v-model="formData.address1"
        type="text"
        class="form-input"
        :class="{ 'form-input--error': errors.address1 }"
        placeholder="Street address, P.O. box"
        required
      />
      <span v-if="errors.address1" class="form-error">{{ errors.address1 }}</span>
    </div>

    <!-- Address Line 2 -->
    <div class="form-group">
      <label for="address2" class="form-label">Address Line 2</label>
      <input
        id="address2"
        v-model="formData.address2"
        type="text"
        class="form-input"
        placeholder="Apartment, suite, unit, building, floor, etc."
      />
    </div>

    <div class="form-row">
      <!-- City -->
      <div class="form-group">
        <label for="city" class="form-label">City *</label>
        <input
          id="city"
          v-model="formData.city"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.city }"
          placeholder="London"
          required
        />
        <span v-if="errors.city" class="form-error">{{ errors.city }}</span>
      </div>

      <!-- Postcode -->
      <div class="form-group">
        <label for="postcode" class="form-label">Postcode *</label>
        <input
          id="postcode"
          v-model="formData.postcode"
          type="text"
          class="form-input"
          :class="{ 'form-input--error': errors.postcode }"
          placeholder="SW1A 1AA"
          required
        />
        <span v-if="errors.postcode" class="form-error">{{ errors.postcode }}</span>
      </div>
    </div>

    <!-- Country -->
    <div class="form-group">
      <label for="country" class="form-label">Country *</label>
      <select
        id="country"
        v-model="formData.country"
        class="form-input"
        required
      >
        <option value="United Kingdom">United Kingdom</option>
        <option value="Ireland">Ireland</option>
        <option value="France">France</option>
        <option value="Germany">Germany</option>
        <option value="Spain">Spain</option>
        <option value="Italy">Italy</option>
        <option value="Netherlands">Netherlands</option>
        <option value="Belgium">Belgium</option>
      </select>
    </div>

    <!-- Set as Default -->
    <div class="form-group form-group--checkbox">
      <label class="checkbox-label">
        <input
          v-model="formData.isDefault"
          type="checkbox"
          class="checkbox-input"
        />
        <span>Set as default address</span>
      </label>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="alert alert--error">
      {{ errorMessage }}
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button
        type="button"
        @click="$emit('cancel')"
        class="btn btn--secondary"
        :disabled="isLoading"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn--primary"
        :disabled="isLoading || !isFormValid"
      >
        <span v-if="isLoading">Saving...</span>
        <span v-else>{{ submitLabel }}</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { CreateAddressData, UserAddress } from '~/composables/useAddresses';

interface Props {
  title?: string;
  address?: UserAddress | null;
  submitLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  address: null,
  submitLabel: 'Save Address',
});

const emit = defineEmits<{
  submit: [data: CreateAddressData];
  cancel: [];
}>();

const formData = reactive<CreateAddressData>({
  label: props.address?.label || '',
  firstName: props.address?.firstName || '',
  lastName: props.address?.lastName || '',
  phone: props.address?.phone || '+44 ',
  address1: props.address?.address1 || '',
  address2: props.address?.address2 || '',
  city: props.address?.city || '',
  postcode: props.address?.postcode || '',
  country: props.address?.country || 'United Kingdom',
  isDefault: props.address?.isDefault || false,
});

const errors = reactive({
  label: '',
  firstName: '',
  lastName: '',
  phone: '',
  address1: '',
  city: '',
  postcode: '',
});

const errorMessage = ref('');
const isLoading = ref(false);

// Phone formatting function
function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except +
  let cleaned = value.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +44
  if (!cleaned.startsWith('+44')) {
    if (cleaned.startsWith('44')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      cleaned = '+44' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
      cleaned = '+44';
    } else {
      cleaned = '+44' + cleaned;
    }
  }
  
  // Format: +44 20 7946 0958
  const match = cleaned.match(/^\+44(\d{0,2})(\d{0,4})(\d{0,4})/);
  if (match) {
    let formatted = '+44';
    if (match[1]) formatted += ' ' + match[1];
    if (match[2]) formatted += ' ' + match[2];
    if (match[3]) formatted += ' ' + match[3];
    return formatted.trim();
  }
  
  return cleaned;
}

function handlePhoneInput(event: Event) {
  const input = event.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;
  const oldValue = input.value;
  const formatted = formatPhoneNumber(oldValue);
  
  formData.phone = formatted;
  
  // Adjust cursor position
  nextTick(() => {
    if (formatted.length > oldValue.length) {
      input.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
    } else {
      input.setSelectionRange(cursorPosition, cursorPosition);
    }
  });
}

// Validation functions
function validateRequired(field: keyof typeof errors, value: string, fieldName: string) {
  if (!value.trim()) {
    errors[field] = `${fieldName} is required`;
  } else {
    errors[field] = '';
  }
}

function validatePhone(value: string) {
  const cleaned = value.replace(/[^\d]/g, '');
  if (cleaned.length < 11) {
    errors.phone = 'Please enter a valid phone number';
  } else {
    errors.phone = '';
  }
}

function validatePostcode(value: string) {
  // UK postcode regex
  const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
  if (!postcodeRegex.test(value.trim())) {
    errors.postcode = 'Please enter a valid UK postcode';
  } else {
    errors.postcode = '';
  }
}

// Watch for changes
watch(() => formData.label, (value) => validateRequired('label', value, 'Label'));
watch(() => formData.firstName, (value) => validateRequired('firstName', value, 'First name'));
watch(() => formData.lastName, (value) => validateRequired('lastName', value, 'Last name'));
watch(() => formData.phone, (value) => validatePhone(value));
watch(() => formData.address1, (value) => validateRequired('address1', value, 'Address'));
watch(() => formData.city, (value) => validateRequired('city', value, 'City'));
watch(() => formData.postcode, (value) => validatePostcode(value));

const isFormValid = computed(() => {
  return (
    formData.label.trim() &&
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.phone.replace(/[^\d]/g, '').length >= 11 &&
    formData.address1.trim() &&
    formData.city.trim() &&
    formData.postcode.trim() &&
    formData.country.trim() &&
    !Object.values(errors).some(error => error !== '')
  );
});

function handleSubmit() {
  // Validate all fields
  validateRequired('label', formData.label, 'Label');
  validateRequired('firstName', formData.firstName, 'First name');
  validateRequired('lastName', formData.lastName, 'Last name');
  validatePhone(formData.phone);
  validateRequired('address1', formData.address1, 'Address');
  validateRequired('city', formData.city, 'City');
  validatePostcode(formData.postcode);

  if (!isFormValid.value) {
    errorMessage.value = 'Please fix all errors before submitting';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    emit('submit', { ...formData });
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to save address';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "~/assets/scss/variables";

.address-form {
  max-width: 600px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: $color-dark;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 1.25rem;

  &--checkbox {
    margin-top: 0.5rem;
  }
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: $color-dark;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
  color: $color-dark;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }

  &::placeholder {
    color: #9ca3af;
  }

  &--error {
    border-color: #ef4444;
    background-color: #fef2f2;

    &:focus {
      border-color: #dc2626;
    }
  }
}

.form-error {
  display: block;
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;

  span {
    font-size: 0.875rem;
    color: $color-dark;
  }
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
}

.alert {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;

  &--error {
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
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
}
</style>

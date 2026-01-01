<template>
  <div class="product-variant-selector">
    <!-- Weight Selection -->
    <div v-if="availableWeights.length > 0" class="selector-group">
      <label class="selector-label">Weight</label>
      <div class="selector-options">
        <button
          v-for="weight in availableWeights"
          :key="weight"
          :class="['selector-option', { active: selectedWeight === weight }]"
          @click="selectWeight(weight)"
        >
          {{ weight }}
        </button>
      </div>
    </div>

    <!-- Roast Level Selection -->
    <div v-if="availableRoastLevels.length > 0" class="selector-group">
      <label class="selector-label">Roast Level</label>
      <div class="selector-options">
        <button
          v-for="roast in availableRoastLevels"
          :key="roast"
          :class="['selector-option', { active: selectedRoast === roast }]"
          @click="roast && selectRoast(roast)"
        >
          {{ roast }}
        </button>
      </div>
    </div>

    <!-- Grind Size Selection -->
    <div v-if="availableGrindSizes.length > 0" class="selector-group">
      <label class="selector-label">Grind Size</label>
      <div class="selector-options selector-options--grid">
        <button
          v-for="grind in availableGrindSizes"
          :key="grind"
          :class="['selector-option', { active: selectedGrind === grind }]"
          @click="grind && selectGrind(grind)"
        >
          {{ grind }}
        </button>
      </div>
    </div>

    <!-- Quantity Selector -->
    <div v-if="selectedVariant" class="quantity-selector">
      <label class="selector-label">Quantity</label>
      <div class="quantity-controls">
        <button 
          class="quantity-btn" 
          @click="decrementQuantity"
          :disabled="quantity <= 1"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input 
          type="number" 
          v-model.number="quantity" 
          min="1" 
          :max="selectedVariant.stockQuantity"
          class="quantity-input"
          @input="validateQuantity"
        />
        <button 
          class="quantity-btn" 
          @click="incrementQuantity"
          :disabled="quantity >= selectedVariant.stockQuantity"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>

    <!-- Price Display -->
    <div v-if="selectedVariant" class="variant-price">
      <div class="price-group">
        <span v-if="selectedVariant.salePrice" class="original-price">
          {{ formatCurrency(selectedVariant.price * quantity) }}
        </span>
        <span class="current-price">
          {{ formatCurrency((selectedVariant.salePrice || selectedVariant.price) * quantity) }}
        </span>
      </div>
      <span v-if="selectedVariant.salePrice" class="discount-badge">
        -{{ calculateDiscount(selectedVariant.price, selectedVariant.salePrice) }}% OFF
      </span>
    </div>

    <!-- Stock Status -->
    <div v-if="selectedVariant" class="stock-status">
      <span v-if="selectedVariant.inStock && selectedVariant.stockQuantity > 0" class="in-stock">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        In Stock ({{ selectedVariant.stockQuantity }} available)
      </span>
      <span v-else class="out-of-stock">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        Out of Stock
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductVariant } from '~/types/strapi';

interface Props {
  variants: ProductVariant[];
  currency?: string;
}

const props = withDefaults(defineProps<Props>(), {
  currency: 'EUR',
});

const emit = defineEmits<{
  variantSelected: [variant: ProductVariant | null, quantity: number];
}>();

// Derive available options from variants (only in-stock)
const availableWeights = computed(() => {
  const weights = [...new Set(props.variants.filter(v => v.inStock && v.stockQuantity > 0).map(v => v.weight))];
  return weights.sort((a, b) => {
    const order = ['250g', '500g', '1kg', '2kg'];
    return order.indexOf(a) - order.indexOf(b);
  });
});

const availableRoastLevels = computed(() => {
  // Filter based on selected weight
  const filtered = props.variants.filter(v => {
    const weightMatch = !selectedWeight.value || v.weight === selectedWeight.value;
    return weightMatch && v.inStock && v.stockQuantity > 0;
  });
  return [...new Set(filtered.map(v => v.roastLevel).filter(Boolean))];
});

const availableGrindSizes = computed(() => {
  // Filter based on selected weight and roast
  const filtered = props.variants.filter(v => {
    const weightMatch = !selectedWeight.value || v.weight === selectedWeight.value;
    const roastMatch = !selectedRoast.value || v.roastLevel === selectedRoast.value;
    return weightMatch && roastMatch && v.inStock && v.stockQuantity > 0;
  });
  return [...new Set(filtered.map(v => v.grindSize).filter(Boolean))];
});

// Selected options
const selectedWeight = ref<string>('');
const selectedRoast = ref<string>('');
const selectedGrind = ref<string>('');
const quantity = ref<number>(1);

// Computed
const selectedVariant = computed<ProductVariant | null>(() => {
  if (!selectedWeight.value) return null;

  return props.variants.find((v) => {
    const weightMatch = v.weight === selectedWeight.value;
    const roastMatch = !selectedRoast.value || v.roastLevel === selectedRoast.value;
    const grindMatch = !selectedGrind.value || v.grindSize === selectedGrind.value;
    
    return weightMatch && roastMatch && grindMatch;
  }) || null;
});

// Quantity methods
const incrementQuantity = () => {
  if (selectedVariant.value && quantity.value < selectedVariant.value.stockQuantity) {
    quantity.value++;
  }
};

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

const validateQuantity = () => {
  if (selectedVariant.value) {
    if (quantity.value < 1) quantity.value = 1;
    if (quantity.value > selectedVariant.value.stockQuantity) {
      quantity.value = selectedVariant.value.stockQuantity;
    }
  }
};

// Methods
const selectWeight = (weight: string) => {
  selectedWeight.value = weight;
  quantity.value = 1; // Reset quantity when variant changes
  
  // Auto-select first available roast level if current one is not available
  const availableRoasts = availableRoastLevels.value.filter(Boolean) as string[];
  if (selectedRoast.value && !availableRoasts.includes(selectedRoast.value)) {
    selectedRoast.value = availableRoasts[0] || '';
  }
  
  // Auto-select first available grind size if current one is not available
  const availableGrinds = availableGrindSizes.value.filter(Boolean) as string[];
  if (selectedGrind.value && !availableGrinds.includes(selectedGrind.value)) {
    selectedGrind.value = availableGrinds[0] || '';
  }
};


const selectRoast = (roast: string) => {
  selectedRoast.value = roast;
  quantity.value = 1; // Reset quantity when variant changes
  
  // Auto-select first available grind size if current one is not available
  const availableGrinds = availableGrindSizes.value.filter(Boolean) as string[];
  if (selectedGrind.value && !availableGrinds.includes(selectedGrind.value)) {
    selectedGrind.value = availableGrinds[0] || '';
  }
};

const selectGrind = (grind: string) => {
  selectedGrind.value = grind;
  quantity.value = 1; // Reset quantity when variant changes
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: props.currency,
  }).format(amount);
};

const calculateDiscount = (originalPrice: number, salePrice: number): number => {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
};

// Initialize with first available options
onMounted(() => {
  if (availableWeights.value.length > 0) {
    selectedWeight.value = availableWeights.value[0];
  }
  
  // Auto-select first roast level if available
  if (availableRoastLevels.value.length > 0) {
    selectedRoast.value = availableRoastLevels.value[0] || '';
  }
  
  // Auto-select first grind size if available
  if (availableGrindSizes.value.length > 0) {
    selectedGrind.value = availableGrindSizes.value[0] || '';
  }
});

// Emit selected variant and quantity changes
watch([selectedVariant, quantity], ([variant, qty]) => {
  emit('variantSelected', variant, qty);
});
</script>

<style lang="scss" scoped>
@import "~/assets/scss/variables";

.product-variant-selector {
  margin: 2rem 0;
}

.selector-group {
  margin-bottom: 1.5rem;
}

.selector-label {
  display: block;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.75rem;
  color: $color-text;
}

.selector-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;

  &--grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  }
}

.selector-option {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: $color-text;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: $color-primary;
    background: lighten($color-primary, 45%);
  }

  &.active {
    border-color: $color-primary;
    background: $color-primary;
    color: white;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.quantity-selector {
  margin-top: 1.5rem;

  .selector-label {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.75rem;
    color: $color-text;
  }
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 150px;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #e5e7eb;
  background: white;
  color: $color-text;
  font-size: 1.25rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: $color-primary;
    background: lighten($color-primary, 45%);
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}

.quantity-input {
  width: 60px;
  height: 40px;
  text-align: center;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: $color-text;

  &:focus {
    outline: none;
    border-color: $color-primary;
  }

  /* Remove spinner arrows */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type=number] {
    -moz-appearance: textfield;
  }
}

.variant-price {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;

  .price-group {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .original-price {
    font-size: 1.25rem;
    color: #6b7280;
    text-decoration: line-through;
  }

  .current-price {
    font-size: 1.75rem;
    font-weight: bold;
    color: $color-text;
  }

  .discount-badge {
    padding: 0.5rem 1rem;
    background: $color-primary;
    color: white;
    border-radius: 50px;
    font-size: 0.875rem;
    font-weight: 700;
    text-transform: uppercase;
  }
}

.stock-status {
  margin: 1rem 0;

  span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .in-stock {
    color: #059669;

    svg {
      color: #059669;
    }
  }

  .out-of-stock {
    color: #dc2626;

    svg {
      color: #dc2626;
    }
  }
}

@media (max-width: 768px) {
  .selector-options--grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .selector-option {
    padding: 0.625rem 1rem;
    font-size: 0.8125rem;
  }

  .variant-price {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .current-price {
      font-size: 1.5rem;
    }
  }
}
</style>

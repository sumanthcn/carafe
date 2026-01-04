import type { StrapiMedia } from '~/types/strapi';

export interface ShippingOption {
  id: number;
  carrierName: string;
  serviceName: string;
  cost: number;
  freeEligible: boolean;
  estimatedDays: number;
  description?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ShippingConfig {
  id: number;
  freeShippingThreshold: number;
  shippingOptions: ShippingOption[];
  allowedCountries: string[];
  processingDays: number;
  excludeWeekends: boolean;
  excludeBankHolidays: boolean;
}

export interface CheckoutAddress {
  street: string;
  city: string;
  postcode: string;
  country: string;
}

export interface CheckoutData {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress | null;
  sameAsBilling: boolean;
  shippingMethod: string;
  createAccount: boolean;
}

export interface OrderItem {
  productId: number;
  productName: string;
  variantId?: number;
  quantity: number;
  price: number;
  total: number;
}

export const useCheckout = () => {
  const cart = useCartStore();
  const auth = useAuth();
  const config = useRuntimeConfig();

  const checkoutData = ref<CheckoutData>({
    customerEmail: '',
    customerName: '',
    customerPhone: '',
    shippingAddress: {
      street: '',
      city: '',
      postcode: '',
      country: 'GB',
    },
    billingAddress: null,
    sameAsBilling: true,
    shippingMethod: '',
    createAccount: false,
  });

  const shippingConfig = ref<ShippingConfig | null>(null);
  const selectedShippingId = ref<number | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch shipping options
  const fetchShippingOptions = async () => {
    try {
      loading.value = true;
      const response = await $fetch<{ data: ShippingConfig }>(
        `${config.public.strapiUrl}/api/shipping-config`
      );

      shippingConfig.value = response.data;
    } catch (err) {
      console.error('Failed to load shipping options:', err);
      error.value = 'Failed to load shipping options';
    } finally {
      loading.value = false;
    }
  };

  // Get active shipping options
  const activeShippingOptions = computed(() => {
    if (!shippingConfig.value) return [];
    return shippingConfig.value.shippingOptions
      .filter(opt => opt.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  });

  // Get selected shipping option
  const selectedShipping = computed(() => {
    if (!selectedShippingId.value) return null;
    return activeShippingOptions.value.find(opt => opt.id === selectedShippingId.value);
  });

  // Calculate shipping cost
  const shippingCost = computed(() => {
    if (!selectedShipping.value || !shippingConfig.value) return 0;

    const option = selectedShipping.value;
    const subtotal = cart.subtotal;

    // Check for free shipping eligibility
    if (option.freeEligible && subtotal >= shippingConfig.value.freeShippingThreshold) {
      return 0;
    }

    return option.cost;
  });

  // Calculate totals
  const orderSummary = computed(() => {
    const subtotal = cart.subtotal;
    const shipping = shippingCost.value;
    const tax = 0; // UK VAT already included in product prices
    const total = subtotal + shipping;

    return {
      subtotal,
      shipping,
      tax,
      total,
    };
  });

  // Validate checkout data
  const validateCheckoutData = (): { valid: boolean; message?: string } => {
    if (!checkoutData.value.customerEmail) {
      return { valid: false, message: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkoutData.value.customerEmail)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }

    if (!checkoutData.value.customerName) {
      return { valid: false, message: 'Name is required' };
    }

    if (!checkoutData.value.shippingAddress.street) {
      return { valid: false, message: 'Street address is required' };
    }

    if (!checkoutData.value.shippingAddress.city) {
      return { valid: false, message: 'City is required' };
    }

    if (!checkoutData.value.shippingAddress.postcode) {
      return { valid: false, message: 'Postcode is required' };
    }

    // UK postcode validation
    const postcodeRegex = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;
    if (!postcodeRegex.test(checkoutData.value.shippingAddress.postcode.replace(/\s/g, ''))) {
      return { valid: false, message: 'Please enter a valid UK postcode' };
    }

    if (!selectedShippingId.value) {
      return { valid: false, message: 'Please select a shipping method' };
    }

    return { valid: true };
  };

  // Create order
  const createOrder = async () => {
    loading.value = true;
    error.value = null;

    try {
      // Validate
      const validation = validateCheckoutData();
      if (!validation.valid) {
        error.value = validation.message || 'Please check your information';
        return null;
      }

      if (!selectedShipping.value) {
        error.value = 'Please select a shipping method';
        return null;
      }

      // Prepare shipping method string
      const shippingMethodStr = `${selectedShipping.value.carrierName} - ${selectedShipping.value.serviceName}`;

      // Prepare order data
      const orderData = {
        data: {
          customerEmail: checkoutData.value.customerEmail,
          customerName: checkoutData.value.customerName,
          customerPhone: checkoutData.value.customerPhone || null,
          shippingAddress: checkoutData.value.shippingAddress,
          billingAddress: checkoutData.value.sameAsBilling 
            ? checkoutData.value.shippingAddress 
            : checkoutData.value.billingAddress,
          items: cart.items.map(item => {
            // Get price from variant or product
            const price = item.selectedVariant 
              ? (item.selectedVariant.salePrice || item.selectedVariant.price)
              : (item.product.defaultPrice || 0);

            return {
              productId: item.product.id,
              productName: item.product.name,
              variantId: item.selectedVariant?.id || null,
              quantity: item.quantity,
              price: price,
              total: item.quantity * price,
            };
          }),
          subtotal: orderSummary.value.subtotal,
          shippingCost: orderSummary.value.shipping,
          shippingMethod: shippingMethodStr,
          tax: orderSummary.value.tax,
          discount: 0,
          total: orderSummary.value.total,
          currency: 'GBP',
          paymentMethod: 'worldpay',
        },
      };

      // Add auth token if user is logged in
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (auth.isAuthenticated && auth.token) {
        headers.Authorization = `Bearer ${auth.token}`;
      }

      const response = await $fetch<{ 
        data: any; 
        trackingToken?: string;
        message: string;
      }>(`${config.public.strapiUrl}/api/orders`, {
        method: 'POST',
        headers,
        body: orderData,
      });

      // Store tracking token for guest orders
      if (response.trackingToken) {
        localStorage.setItem('orderTrackingToken', response.trackingToken);
        localStorage.setItem('orderNumber', response.data.orderNumber);
      }

      // Clear cart after successful order
      cart.clearCart();

      return response.data;

    } catch (err: any) {
      console.error('Failed to create order:', err);
      error.value = err.data?.error?.message || err.message || 'Failed to create order. Please try again.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  // Pre-fill user data if authenticated
  const prefillUserData = () => {
    if (auth.isAuthenticated && auth.user.value) {
      checkoutData.value.customerEmail = auth.user.value.email || '';
      checkoutData.value.customerName = auth.user.value.username || '';
    }
  };

  return {
    checkoutData,
    shippingConfig,
    activeShippingOptions,
    selectedShippingId,
    selectedShipping,
    shippingCost,
    orderSummary,
    loading,
    error,
    fetchShippingOptions,
    validateCheckoutData,
    createOrder,
    prefillUserData,
  };
};

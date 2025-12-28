import type { Ref } from 'vue';

// Order status types matching Strapi schema
export type OrderStatus = 
  | 'order_received'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'refunded';

export interface Address {
  street: string;
  city: string;
  postcode: string;
  country: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productSlug: string;
  sku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight?: string;
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount?: number;
  total: number;
  currency: 'EUR' | 'GBP' | 'USD';
  paymentMethod?: string;
  paymentId?: string;
  worldpayOrderCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  shippingMethod?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  data: Order;
  message: string;
}

export interface CheckPurchaseResponse {
  data: {
    hasPurchased: boolean;
    canReview: boolean;
  };
}

/**
 * Composable for managing orders
 */
export const useOrders = () => {
  const { getAuthHeaders } = useAuth();
  const config = useRuntimeConfig();
  
  const orders: Ref<Order[]> = useState('orders', () => []);
  const currentOrder: Ref<Order | null> = useState('currentOrder', () => null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Create a new order
   */
  const createOrder = async (orderData: CreateOrderData): Promise<{ success: boolean; order?: Order; error?: string }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch<CreateOrderResponse>(`${config.public.strapiUrl}/api/orders`, {
        method: 'POST',
        headers,
        body: {
          data: orderData,
        },
      });

      if (response.data) {
        currentOrder.value = response.data;
        return {
          success: true,
          order: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to create order',
      };
    } catch (err: any) {
      const errorMessage = err?.data?.error?.message || err?.message || 'Failed to create order';
      error.value = errorMessage;
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get all orders for the current user
   */
  const fetchOrders = async (): Promise<{ success: boolean; orders?: Order[]; error?: string }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch<{ data: Order[] }>(`${config.public.strapiUrl}/api/orders`, {
        method: 'GET',
        headers,
      });

      if (response.data) {
        orders.value = response.data;
        return {
          success: true,
          orders: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch orders',
      };
    } catch (err: any) {
      const errorMessage = err?.data?.error?.message || err?.message || 'Failed to fetch orders';
      error.value = errorMessage;
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Get a specific order by ID
   */
  const fetchOrder = async (id: number | string): Promise<{ success: boolean; order?: Order; error?: string }> => {
    isLoading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch<{ data: Order }>(`${config.public.strapiUrl}/api/orders/${id}`, {
        method: 'GET',
        headers,
      });

      if (response.data) {
        currentOrder.value = response.data;
        return {
          success: true,
          order: response.data,
        };
      }

      return {
        success: false,
        error: 'Failed to fetch order',
      };
    } catch (err: any) {
      const errorMessage = err?.data?.error?.message || err?.message || 'Failed to fetch order';
      error.value = errorMessage;
      
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if user has purchased a product and it's been delivered
   * Used to determine if user can write a review
   */
  const checkPurchase = async (productId: number): Promise<{ hasPurchased: boolean; canReview: boolean }> => {
    try {
      const headers = getAuthHeaders();
      
      const response = await $fetch<CheckPurchaseResponse>(
        `${config.public.strapiUrl}/api/orders/check-purchase/${productId}`,
        {
          method: 'GET',
          headers,
        }
      );

      return response.data;
    } catch (err) {
      console.error('Error checking purchase:', err);
      return {
        hasPurchased: false,
        canReview: false,
      };
    }
  };

  /**
   * Get human-readable order status label
   */
  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      order_received: 'Order Received',
      packed: 'Packed',
      shipped: 'Shipped',
      in_transit: 'In Transit',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    
    return labels[status] || status;
  };

  /**
   * Get human-readable payment status label
   */
  const getPaymentStatusLabel = (status: PaymentStatus): string => {
    const labels: Record<PaymentStatus, string> = {
      pending: 'Pending',
      authorized: 'Authorized',
      captured: 'Paid',
      failed: 'Failed',
      refunded: 'Refunded',
    };
    
    return labels[status] || status;
  };

  return {
    // State
    orders: readonly(orders),
    currentOrder: readonly(currentOrder),
    isLoading: readonly(isLoading),
    error: readonly(error),
    
    // Methods
    createOrder,
    fetchOrders,
    fetchOrder,
    checkPurchase,
    getStatusLabel,
    getPaymentStatusLabel,
  };
};

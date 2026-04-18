/**
 * Order Management Composable
 * Handles fetching and managing orders for both customers and admins
 * Currently uses dummy data for testing until payment integration is complete
 */

export interface OrderItem {
  id: number;
  productName: string;
  variant?: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderAddress {
  firstName?: string;
  lastName?: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: number;
  documentId: string;
  orderNumber: string;
  status: 'order_received' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;

  // Customer Info
  customerEmail: string;
  customerName: string;
  customerPhone: string;

  // Address
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;

  // Order Details
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  tax?: number;
  discount?: number;
  total: number;
  currency: string;

  // Shipping
  shippingMethod: string;
  carrier?: string;
  trackingNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;

  // Payment
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'authorized' | 'captured';
  paymentId?: string;
  stripeSessionId?: string;
  transactionReference?: string;

  // Admin Notes
  notes?: string;
  isGuestOrder?: boolean;
  emailSentLogs?: Array<{ type: string; sentAt: string; to: string }>;
}

// Dummy data for testing
const DUMMY_ORDERS: Order[] = [
  {
    id: 1,
    documentId: 'dummy-order-001',
    orderNumber: 'ORD-2026-001',
    status: 'delivered',
    createdAt: '2026-02-15T10:30:00Z',
    updatedAt: '2026-02-18T14:20:00Z',
    customerEmail: 'john@example.com',
    customerName: 'John Smith',
    customerPhone: '07700900123',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      line1: '123 Coffee Street',
      line2: 'Apt 4B',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      {
        id: 1,
        productName: 'Ethiopian Yirgacheffe',
        variant: '250g - Whole Bean',
        quantity: 2,
        price: 12.99,
        imageUrl: '/images/products/ethiopian.jpg',
      },
      {
        id: 2,
        productName: 'Colombian Supremo',
        variant: '500g - Ground',
        quantity: 1,
        price: 18.50,
        imageUrl: '/images/products/colombian.jpg',
      },
    ],
    subtotal: 44.48,
    shippingCost: 3.85,
    total: 48.33,
    currency: 'GBP',
    shippingMethod: 'Royal Mail 48',
    trackingNumber: 'RM123456789GB',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    transactionReference: 'WP-2026-001-ABC',
  },
  {
    id: 2,
    documentId: 'dummy-order-002',
    orderNumber: 'ORD-2026-002',
    status: 'shipped',
    createdAt: '2026-02-18T09:15:00Z',
    updatedAt: '2026-02-19T11:30:00Z',
    customerEmail: 'john@example.com',
    customerName: 'John Smith',
    customerPhone: '07700900123',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      line1: '123 Coffee Street',
      line2: 'Apt 4B',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      {
        id: 3,
        productName: 'Brazilian Santos',
        variant: '1kg - Whole Bean',
        quantity: 1,
        price: 28.99,
      },
    ],
    subtotal: 28.99,
    shippingCost: 0, // Free shipping
    total: 28.99,
    currency: 'GBP',
    shippingMethod: 'DPD Next Day',
    trackingNumber: 'DPD987654321GB',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    transactionReference: 'WP-2026-002-XYZ',
  },
  {
    id: 3,
    documentId: 'dummy-order-003',
    orderNumber: 'ORD-2026-003',
    status: 'packed',
    createdAt: '2026-02-19T14:20:00Z',
    updatedAt: '2026-02-19T14:20:00Z',
    customerEmail: 'john@example.com',
    customerName: 'John Smith',
    customerPhone: '07700900123',
    shippingAddress: {
      firstName: 'John',
      lastName: 'Smith',
      line1: '123 Coffee Street',
      city: 'London',
      postalCode: 'SW1A 1AA',
      country: 'GB',
    },
    items: [
      {
        id: 4,
        productName: 'Espresso Blend',
        variant: '250g - Whole Bean',
        quantity: 3,
        price: 11.99,
      },
    ],
    subtotal: 35.97,
    shippingCost: 3.85,
    total: 39.82,
    currency: 'GBP',
    shippingMethod: 'Royal Mail 48',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    transactionReference: 'WP-2026-003-DEF',
  },
  {
    id: 4,
    documentId: 'dummy-order-004',
    orderNumber: 'ORD-2026-004',
    status: 'order_received',
    createdAt: '2026-02-20T08:45:00Z',
    updatedAt: '2026-02-20T08:45:00Z',
    customerEmail: 'sarah@example.com',
    customerName: 'Sarah Johnson',
    customerPhone: '07700900456',
    shippingAddress: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      line1: '456 Bean Avenue',
      city: 'Manchester',
      postalCode: 'M1 1AA',
      country: 'GB',
    },
    items: [
      {
        id: 5,
        productName: 'Decaf Colombian',
        variant: '250g - Ground',
        quantity: 2,
        price: 13.50,
      },
    ],
    subtotal: 27.00,
    shippingCost: 3.85,
    total: 30.85,
    currency: 'GBP',
    shippingMethod: 'Royal Mail 48',
    paymentMethod: 'Credit Card',
    paymentStatus: 'pending',
  },
];

/**
 * Map a raw Strapi address to our OrderAddress format
 */
const mapAddress = (addr: any): OrderAddress | undefined => {
  if (!addr) return undefined;
  return {
    line1: addr.addressLine1 || addr.street || '',
    line2: addr.addressLine2 || '',
    city: addr.city || '',
    postalCode: addr.postalCode || addr.postcode || '',
    country: addr.country || 'GB',
    phone: addr.phone || '',
  };
};

/**
 * Map a raw Strapi order-item component to our OrderItem format
 */
const mapItem = (i: any): OrderItem => ({
  id: i.productId || i.id,
  productName: i.productName,
  variant: [i.weight, i.sku].filter(Boolean).join(' · ') || undefined,
  quantity: i.quantity,
  price: parseFloat(i.unitPrice || (i.totalPrice && i.quantity ? i.totalPrice / i.quantity : 0)),
  imageUrl: undefined,
});

/**
 * Map Strapi order status to our frontend status
 */
const mapStrapiStatus = (strapiStatus: string): Order['status'] => {
  const statusMap: Record<string, Order['status']> = {
    'order_received': 'order_received',
    'packed': 'packed',
    'shipped': 'shipped',
    'in_transit': 'in_transit',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'refunded': 'refunded',
  };
  
  return statusMap[strapiStatus] || 'order_received';
};

export const useOrderManagement = () => {
  const config = useRuntimeConfig();
  const { user } = useAuth();
  
  // State
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  /**
   * Fetch all orders for current user
   * Fetches from Strapi API
   */
  const fetchUserOrders = async () => {
    console.log('fetchUserOrders called');
    loading.value = true;
    error.value = null;

    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();

      // Use the /my-orders endpoint which filters by the authenticated user
      const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders/my-orders`, {
        method: 'GET',
        headers,
      });

      console.log('Strapi my-orders response:', response);

      if (response?.data && Array.isArray(response.data)) {
        orders.value = response.data.map((item: any) => {
          const order = item.attributes || item;

          const shippingAddr = mapAddress(order.shippingAddress);
          return {
            id: item.id,
            orderNumber: order.orderNumber,
            status: mapStrapiStatus(order.orderStatus || order.status),
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            customerEmail: order.customerEmail || user.value?.email || '',
            customerName: order.customerName || user.value?.username || '',
            customerPhone: order.customerPhone || '',
            shippingAddress: shippingAddr || { line1: '', city: '', postalCode: '', country: 'GB' },
            billingAddress: mapAddress(order.billingAddress) || shippingAddr,
            items: (order.items || []).map(mapItem),
            subtotal: parseFloat(order.subtotal || 0),
            shippingCost: parseFloat(order.shippingCost || 0),
            tax: order.tax ? parseFloat(order.tax) : undefined,
            discount: order.discount ? parseFloat(order.discount) : undefined,
            total: parseFloat(order.total || 0),
            currency: order.currency || 'GBP',
            shippingMethod: order.shippingMethod || '',
            carrier: order.carrier || undefined,
            trackingNumber: order.trackingNumber || undefined,
            dispatchedAt: order.dispatchedAt || undefined,
            deliveredAt: order.deliveredAt || undefined,
            paymentMethod: order.paymentMethod || 'stripe',
            paymentStatus: order.paymentStatus || 'pending',
            paymentId: order.paymentId || undefined,
            stripeSessionId: order.stripeSessionId || undefined,
            transactionReference: order.stripeSessionId || order.paymentId || undefined,
            notes: order.notes || undefined,
            isGuestOrder: order.isGuestOrder || false,
            emailSentLogs: order.emailSentLogs || undefined,
          };
        });

        console.log('Orders mapped:', orders.value.length);
      } else {
        orders.value = [];
        console.log('No orders found');
      }
    } catch (err: any) {
      console.error('Error fetching user orders:', err);
      if (err.statusCode === 401 || err.statusCode === 403) {
        error.value = 'Authentication error. Please log in again.';
      } else if (err.statusCode === 404) {
        orders.value = [];
      } else {
        error.value = err.message || 'Failed to fetch orders';
      }
    } finally {
      loading.value = false;
      console.log('fetchUserOrders finished, orders count:', orders.value.length);
    }
  };
  
  /**
   * Fetch all orders (admin only)
   */
  const fetchAllOrders = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();

      const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders`, {
        method: 'GET',
        headers,
        params: { populate: '*', sort: 'createdAt:desc', 'pagination[limit]': 200 },
      });

      if (response?.data && Array.isArray(response.data)) {
        orders.value = response.data.map((item: any) => {
          const order = item.attributes || item;
          const shippingAddr = mapAddress(order.shippingAddress);
          return {
            id: item.id,
            documentId: item.documentId || String(item.id),
            orderNumber: order.orderNumber,
            status: mapStrapiStatus(order.orderStatus || order.status),
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            customerEmail: order.customerEmail || '',
            customerName: order.customerName || '',
            customerPhone: order.customerPhone || '',
            shippingAddress: shippingAddr || { line1: '', city: '', postalCode: '', country: 'GB' },
            billingAddress: mapAddress(order.billingAddress) || shippingAddr,
            items: (order.items || []).map(mapItem),
            subtotal: parseFloat(order.subtotal || 0),
            shippingCost: parseFloat(order.shippingCost || 0),
            tax: order.tax ? parseFloat(order.tax) : undefined,
            discount: order.discount ? parseFloat(order.discount) : undefined,
            total: parseFloat(order.total || 0),
            currency: order.currency || 'GBP',
            shippingMethod: order.shippingMethod || '',
            carrier: order.carrier || undefined,
            trackingNumber: order.trackingNumber || undefined,
            dispatchedAt: order.dispatchedAt || undefined,
            deliveredAt: order.deliveredAt || undefined,
            paymentMethod: order.paymentMethod || 'stripe',
            paymentStatus: order.paymentStatus || 'pending',
            paymentId: order.paymentId || undefined,
            stripeSessionId: order.stripeSessionId || undefined,
            transactionReference: order.stripeSessionId || order.paymentId || undefined,
            notes: order.notes || undefined,
            isGuestOrder: order.isGuestOrder || false,
            emailSentLogs: order.emailSentLogs || undefined,
          };
        });
      } else {
        orders.value = [];
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch orders';
      console.error('Error fetching orders:', err);
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Fetch single order by ID
   */
  const fetchOrder = async (documentId: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();
      
      // Fetch single order from Strapi
      const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders/${documentId}`, {
        method: 'GET',
        headers,
        params: {
          populate: '*',
        },
      });
      
      if (response?.data) {
        const item = response.data;
        const order = item.attributes || item;
        
        const shippingAddr = mapAddress(order.shippingAddress);
        currentOrder.value = {
          id: item.id,
          documentId: item.documentId || String(item.id),
          orderNumber: order.orderNumber,
          status: mapStrapiStatus(order.orderStatus || order.status),
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
          customerEmail: order.customerEmail || user.value?.email || '',
          customerName: order.customerName || user.value?.username || '',
          customerPhone: order.customerPhone || '',
          shippingAddress: shippingAddr || { line1: '', city: '', postalCode: '', country: 'GB' },
          billingAddress: mapAddress(order.billingAddress) || shippingAddr,
          items: (order.items || []).map(mapItem),
          subtotal: parseFloat(order.subtotal || 0),
          shippingCost: parseFloat(order.shippingCost || 0),
          tax: order.tax ? parseFloat(order.tax) : undefined,
          discount: order.discount ? parseFloat(order.discount) : undefined,
          total: parseFloat(order.total || 0),
          currency: order.currency || 'GBP',
          shippingMethod: order.shippingMethod || '',
          carrier: order.carrier || undefined,
          trackingNumber: order.trackingNumber || undefined,
          dispatchedAt: order.dispatchedAt || undefined,
          deliveredAt: order.deliveredAt || undefined,
          paymentMethod: order.paymentMethod || 'stripe',
          paymentStatus: order.paymentStatus || 'pending',
          paymentId: order.paymentId || undefined,
          stripeSessionId: order.stripeSessionId || undefined,
          transactionReference: order.stripeSessionId || order.paymentId || undefined,
          notes: order.notes || undefined,
          emailSentLogs: order.emailSentLogs || undefined,
        };
      } else {
        throw new Error('Order not found');
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch order';
      console.error('Error fetching order:', err);
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Update order status (admin only)
   */
  const updateOrderStatus = async (documentId: string, status: Order['status'], notes?: string, carrier?: string, trackingNumber?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();

      const body: any = { status };
      if (notes) body.notes = notes;
      if (carrier) body.carrier = carrier;
      if (trackingNumber) body.trackingNumber = trackingNumber;

      await $fetch<any>(`${config.public.strapiUrl}/api/orders/${documentId}/status`, {
        method: 'PUT',
        headers,
        body,
      });

      // Update local state
      if (currentOrder.value?.documentId === documentId) {
        currentOrder.value.status = status;
        currentOrder.value.updatedAt = new Date().toISOString();
        if (notes) currentOrder.value.notes = notes;
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.error?.message || err.message || 'Failed to update order';
      console.error('Error updating order:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Add tracking number to order (admin only)
   */
  const addTrackingNumber = async (documentId: string, trackingNumber: string, carrier?: string) => {
    loading.value = true;
    error.value = null;

    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();

      await $fetch<any>(`${config.public.strapiUrl}/api/orders/${documentId}/status`, {
        method: 'PUT',
        headers,
        body: { trackingNumber, carrier },
      });

      if (currentOrder.value?.documentId === documentId) {
        currentOrder.value.trackingNumber = trackingNumber;
        currentOrder.value.status = 'shipped';
        currentOrder.value.updatedAt = new Date().toISOString();
      }

      return true;
    } catch (err: any) {
      error.value = err.data?.error?.message || err.message || 'Failed to add tracking number';
      console.error('Error adding tracking:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Get order status display info
   */
  const getStatusInfo = (status: Order['status']) => {
    const statusMap = {
      order_received: { label: 'Order Received', color: 'blue', icon: '⏳' },
      packed: { label: 'Packed', color: 'purple', icon: '📦' },
      shipped: { label: 'Shipped', color: 'purple', icon: '🚚' },
      in_transit: { label: 'In Transit', color: 'purple', icon: '🚚' },
      delivered: { label: 'Delivered', color: 'green', icon: '✅' },
      cancelled: { label: 'Cancelled', color: 'red', icon: '❌' },
      refunded: { label: 'Refunded', color: 'orange', icon: '💰' },
    };
    
    return statusMap[status] || statusMap.order_received;
  };
  
  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  /**
   * Format currency
   */
  const formatPrice = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount);
  };
  
  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    
    // Methods
    fetchUserOrders,
    fetchAllOrders,
    fetchOrder,
    updateOrderStatus,
    addTrackingNumber,
    
    // Helpers
    getStatusInfo,
    formatDate,
    formatPrice,
  };
};

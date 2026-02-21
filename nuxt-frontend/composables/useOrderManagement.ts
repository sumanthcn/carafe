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

export interface Order {
  id: number;
  orderNumber: string;
  status: 'order_received' | 'packed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
  createdAt: string;
  updatedAt: string;
  
  // Customer Info
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  
  // Shipping Info
  shippingAddress: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
  // Order Details
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  
  // Shipping
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  
  // Payment
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionReference?: string;
  
  // Admin Notes
  notes?: string;
}

// Dummy data for testing
const DUMMY_ORDERS: Order[] = [
  {
    id: 1,
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
    estimatedDelivery: '2026-02-17',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    transactionReference: 'WP-2026-001-ABC',
  },
  {
    id: 2,
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
    estimatedDelivery: '2026-02-20',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    transactionReference: 'WP-2026-002-XYZ',
  },
  {
    id: 3,
    orderNumber: 'ORD-2026-003',
    status: 'processing',
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
    orderNumber: 'ORD-2026-004',
    status: 'pending',
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
    console.log('Current user:', user.value);
    loading.value = true;
    error.value = null;
    
    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();
      
      // Fetch orders from Strapi
      const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders`, {
        method: 'GET',
        headers,
        params: {
          populate: '*',
          sort: 'createdAt:desc',
        },
      });
      
      console.log('Strapi response:', response);
      
      if (response?.data && Array.isArray(response.data)) {
        // Map Strapi data to our Order interface
        orders.value = response.data.map((item: any) => {
          const order = item.attributes || item;
          
          return {
            id: item.id,
            orderNumber: order.orderNumber,
            status: mapStrapiStatus(order.status),
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            customerEmail: order.customerEmail || user.value?.email || '',
            customerName: order.customerName || user.value?.username || '',
            customerPhone: order.customerPhone || '',
            shippingAddress: {
              firstName: order.shippingAddress?.fullName?.split(' ')[0] || '',
              lastName: order.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || '',
              line1: order.shippingAddress?.addressLine1 || '',
              line2: order.shippingAddress?.addressLine2 || '',
              city: order.shippingAddress?.city || '',
              postalCode: order.shippingAddress?.postalCode || '',
              country: order.shippingAddress?.country || 'GB',
            },
            items: (order.items || []).map((item: any) => ({
              id: item.productId || item.id,
              productName: item.productName,
              variant: item.weight || item.sku,
              quantity: item.quantity,
              price: parseFloat(item.unitPrice || item.totalPrice / item.quantity),
              imageUrl: undefined, // TODO: Add product image if available
            })),
            subtotal: parseFloat(order.subtotal || 0),
            shippingCost: parseFloat(order.shippingCost || 0),
            total: parseFloat(order.total || 0),
            currency: order.currency || 'EUR',
            shippingMethod: order.shippingMethod || 'Standard Shipping',
            trackingNumber: order.trackingNumber || undefined,
            estimatedDelivery: undefined, // Not in schema
            paymentMethod: order.paymentMethod || 'Credit Card',
            paymentStatus: order.paymentStatus === 'captured' ? 'paid' : order.paymentStatus || 'pending',
            transactionReference: order.worldpayOrderCode || order.paymentId || undefined,
            notes: order.notes || undefined,
          };
        });
        
        console.log('Orders mapped:', orders.value.length);
      } else {
        // Fallback to empty array if no data
        orders.value = [];
        console.log('No orders found in response');
      }
    } catch (err: any) {
      console.error('Error fetching orders from Strapi:', err);
      
      // Check if it's a network/auth error
      if (err.statusCode === 401 || err.statusCode === 403) {
        error.value = 'Authentication error. Please log in again.';
      } else if (err.statusCode === 404) {
        // No orders found is not really an error
        orders.value = [];
        console.log('No orders endpoint or no orders found');
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
   * Uses dummy data for testing
   */
  const fetchAllOrders = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      // TODO: Replace with actual API call when payment is working
      // const response = await $fetch(`${config.public.strapiUrl}/api/orders`, {
      //   params: {
      //     populate: '*',
      //     sort: 'createdAt:desc',
      //   },
      // });
      
      // For now, use all dummy data
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      orders.value = [...DUMMY_ORDERS];
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
  const fetchOrder = async (orderId: number) => {
    loading.value = true;
    error.value = null;
    
    try {
      const { getAuthHeaders } = useAuth();
      const headers = getAuthHeaders();
      
      // Fetch single order from Strapi
      const response = await $fetch<any>(`${config.public.strapiUrl}/api/orders/${orderId}`, {
        method: 'GET',
        headers,
        params: {
          populate: '*',
        },
      });
      
      if (response?.data) {
        const item = response.data;
        const order = item.attributes || item;
        
        currentOrder.value = {
          id: item.id,
          orderNumber: order.orderNumber,
          status: mapStrapiStatus(order.status),
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: order.updatedAt || order.createdAt || new Date().toISOString(),
          customerEmail: order.customerEmail || user.value?.email || '',
          customerName: order.customerName || user.value?.username || '',
          customerPhone: order.customerPhone || '',
          shippingAddress: {
            firstName: order.shippingAddress?.fullName?.split(' ')[0] || '',
            lastName: order.shippingAddress?.fullName?.split(' ').slice(1).join(' ') || '',
            line1: order.shippingAddress?.addressLine1 || '',
            line2: order.shippingAddress?.addressLine2 || '',
            city: order.shippingAddress?.city || '',
            postalCode: order.shippingAddress?.postalCode || '',
            country: order.shippingAddress?.country || 'GB',
          },
          items: (order.items || []).map((item: any) => ({
            id: item.productId || item.id,
            productName: item.productName,
            variant: item.weight || item.sku,
            quantity: item.quantity,
            price: parseFloat(item.unitPrice || item.totalPrice / item.quantity),
            imageUrl: undefined,
          })),
          subtotal: parseFloat(order.subtotal || 0),
          shippingCost: parseFloat(order.shippingCost || 0),
          total: parseFloat(order.total || 0),
          currency: order.currency || 'EUR',
          shippingMethod: order.shippingMethod || 'Standard Shipping',
          trackingNumber: order.trackingNumber || undefined,
          estimatedDelivery: undefined,
          paymentMethod: order.paymentMethod || 'Credit Card',
          paymentStatus: order.paymentStatus === 'captured' ? 'paid' : order.paymentStatus || 'pending',
          transactionReference: order.worldpayOrderCode || order.paymentId || undefined,
          notes: order.notes || undefined,
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
  const updateOrderStatus = async (orderId: number, status: Order['status'], notes?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in dummy data
      const orderIndex = DUMMY_ORDERS.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        DUMMY_ORDERS[orderIndex].status = status;
        DUMMY_ORDERS[orderIndex].updatedAt = new Date().toISOString();
        if (notes) {
          DUMMY_ORDERS[orderIndex].notes = notes;
        }
      }
      
      // Update current order if it's the one being modified
      if (currentOrder.value?.id === orderId) {
        currentOrder.value.status = status;
        currentOrder.value.updatedAt = new Date().toISOString();
        if (notes) {
          currentOrder.value.notes = notes;
        }
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to update order';
      console.error('Error updating order:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };
  
  /**
   * Add tracking number to order (admin only)
   */
  const addTrackingNumber = async (orderId: number, trackingNumber: string, carrier?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update in dummy data
      const orderIndex = DUMMY_ORDERS.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        DUMMY_ORDERS[orderIndex].trackingNumber = trackingNumber;
        DUMMY_ORDERS[orderIndex].status = 'shipped';
        DUMMY_ORDERS[orderIndex].updatedAt = new Date().toISOString();
      }
      
      if (currentOrder.value?.id === orderId) {
        currentOrder.value.trackingNumber = trackingNumber;
        currentOrder.value.status = 'shipped';
        currentOrder.value.updatedAt = new Date().toISOString();
      }
      
      return true;
    } catch (err: any) {
      error.value = err.message || 'Failed to add tracking number';
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

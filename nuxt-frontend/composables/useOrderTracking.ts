export interface TrackedOrder {
  orderNumber: string;
  status: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  shippingAddress: {
    city?: string;
    postcode?: string;
  };
  shippingMethod?: string;
  carrier?: string;
  trackingNumber?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface StatusTimelineStep {
  key: string;
  label: string;
  completed: boolean;
  current: boolean;
}

export const useOrderTracking = () => {
  const config = useRuntimeConfig();
  const order = ref<TrackedOrder | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Track order by order number and token/email
   */
  const trackOrder = async (
    orderNumber: string, 
    token?: string, 
    email?: string
  ): Promise<TrackedOrder | null> => {
    loading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        orderNumber,
        ...(token && { token }),
        ...(email && { email }),
      });

      const response = await $fetch<{ data: TrackedOrder }>(
        `${config.public.strapiUrl}/api/orders/track?${params.toString()}`
      );

      order.value = response.data;
      return response.data;

    } catch (err: any) {
      console.error('Order tracking failed:', err);
      error.value = err.data?.error?.message || 'Order not found. Please check your order number and email/tracking link.';
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get status timeline for current order
   */
  const getStatusTimeline = computed<StatusTimelineStep[]>(() => {
    if (!order.value) return [];

    const statuses = [
      { key: 'order_received', label: 'Order Received', completed: false, current: false },
      { key: 'packed', label: 'Packed', completed: false, current: false },
      { key: 'shipped', label: 'Shipped', completed: false, current: false },
      { key: 'in_transit', label: 'In Transit', completed: false, current: false },
      { key: 'delivered', label: 'Delivered', completed: false, current: false },
    ];

    const currentIndex = statuses.findIndex(s => s.key === order.value?.status);
    
    if (currentIndex === -1) {
      // Handle cancelled or refunded status
      return statuses.map(status => ({ ...status, completed: false }));
    }

    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  });

  /**
   * Get tracking URL for carrier
   */
  const getCarrierTrackingUrl = computed<string | null>(() => {
    if (!order.value?.carrier || !order.value?.trackingNumber) {
      return null;
    }

    const trackingNumber = order.value.trackingNumber;
    
    // Royal Mail tracking
    if (order.value.carrier.toLowerCase().includes('royal mail')) {
      return `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;
    }

    // DPD tracking
    if (order.value.carrier.toLowerCase().includes('dpd')) {
      return `https://www.dpd.co.uk/apps/tracking/?reference=${trackingNumber}`;
    }

    return null;
  });

  /**
   * Format date for display
   */
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Get estimated delivery date
   */
  const estimatedDeliveryDate = computed<string>(() => {
    if (order.value?.deliveredAt) {
      return 'Delivered';
    }

    if (order.value?.dispatchedAt) {
      const dispatched = new Date(order.value.dispatchedAt);
      const estimated = new Date(dispatched);
      estimated.setDate(estimated.getDate() + 2); // Add 2 days
      return formatDate(estimated.toISOString());
    }

    return 'To be confirmed';
  });

  /**
   * Check if order can be reviewed
   */
  const canReview = computed<boolean>(() => {
    return order.value?.status === 'delivered';
  });

  return {
    order,
    loading,
    error,
    trackOrder,
    getStatusTimeline,
    getCarrierTrackingUrl,
    formatDate,
    estimatedDeliveryDate,
    canReview,
  };
};

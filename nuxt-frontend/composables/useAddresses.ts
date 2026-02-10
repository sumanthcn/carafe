export interface UserAddress {
  id: number;
  documentId?: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressData {
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
  isDefault?: boolean;
}

export function useAddresses() {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  const { getAuthHeaders } = useAuth();

  const addresses = ref<UserAddress[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetch all addresses for the authenticated user
   */
  async function fetchAddresses(): Promise<UserAddress[]> {
    loading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      const response = await $fetch<{ data: UserAddress[] }>(`${strapiUrl}/api/user-addresses`, {
        method: 'GET',
        headers,
      });

      addresses.value = response.data || [];
      return addresses.value;
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err);
      error.value = err.message || 'Failed to fetch addresses';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Get a single address by ID
   */
  async function getAddress(id: number): Promise<UserAddress> {
    loading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      const response = await $fetch<{ data: UserAddress }>(`${strapiUrl}/api/user-addresses/${id}`, {
        method: 'GET',
        headers,
      });

      return response.data;
    } catch (err: any) {
      console.error('Failed to fetch address:', err);
      error.value = err.message || 'Failed to fetch address';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Create a new address
   */
  async function createAddress(addressData: CreateAddressData): Promise<UserAddress> {
    loading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      const response = await $fetch<{ data: UserAddress }>(`${strapiUrl}/api/user-addresses`, {
        method: 'POST',
        headers,
        body: { data: addressData },
      });

      // Refresh addresses list
      await fetchAddresses();

      return response.data;
    } catch (err: any) {
      console.error('Failed to create address:', err);
      error.value = err.message || 'Failed to create address';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Update an existing address
   */
  async function updateAddress(id: number, addressData: Partial<CreateAddressData>): Promise<UserAddress> {
    loading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      const response = await $fetch<{ data: UserAddress }>(`${strapiUrl}/api/user-addresses/${id}`, {
        method: 'PUT',
        headers,
        body: { data: addressData },
      });

      // Refresh addresses list
      await fetchAddresses();

      return response.data;
    } catch (err: any) {
      console.error('Failed to update address:', err);
      error.value = err.message || 'Failed to update address';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Delete an address
   */
  async function deleteAddress(id: number): Promise<void> {
    loading.value = true;
    error.value = null;

    try {
      const headers = getAuthHeaders();
      await $fetch(`${strapiUrl}/api/user-addresses/${id}`, {
        method: 'DELETE',
        headers,
      });

      // Refresh addresses list
      await fetchAddresses();
    } catch (err: any) {
      console.error('Failed to delete address:', err);
      error.value = err.message || 'Failed to delete address';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Set an address as default
   */
  async function setDefaultAddress(id: number): Promise<void> {
    await updateAddress(id, { isDefault: true });
  }

  /**
   * Get the default address
   */
  function getDefaultAddress(): UserAddress | undefined {
    return addresses.value.find(addr => addr.isDefault);
  }

  return {
    addresses: readonly(addresses),
    loading: readonly(loading),
    error: readonly(error),
    fetchAddresses,
    getAddress,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
}

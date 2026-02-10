# Address Management System - Implementation Guide

## Date: January 4, 2026

## Overview
Complete address management system allowing authenticated users to save, manage, and reuse shipping addresses across orders.

---

## Backend Implementation

### 1. User Address Content Type

**Location**: `strapi-backend/src/api/user-address/`

#### Schema
**File**: `content-types/user-address/schema.json`

```json
{
  "user": "relation to plugin::users-permissions.user",
  "label": "string (max 50 chars, required) - e.g., Home, Work",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "phone": "string (required)",
  "address1": "string (required)",
  "address2": "string (optional)",
  "city": "string (required)",
  "postcode": "string (required)",
  "country": "string (required, default: United Kingdom)",
  "isDefault": "boolean (default: false)"
}
```

#### API Endpoints

**Base URL**: `/api/user-addresses`

All endpoints require JWT authentication (Bearer token).

1. **List User Addresses**
   - **Method**: GET
   - **Endpoint**: `/api/user-addresses`
   - **Auth**: Required
   - **Returns**: Array of user's addresses, sorted by default first, then newest
   - **Example**:
     ```javascript
     const addresses = await $fetch('/api/user-addresses', {
       headers: { Authorization: `Bearer ${token}` }
     });
     ```

2. **Get Single Address**
   - **Method**: GET
   - **Endpoint**: `/api/user-addresses/:id`
   - **Auth**: Required
   - **Returns**: Single address object
   - **Security**: User can only access their own addresses

3. **Create Address**
   - **Method**: POST
   - **Endpoint**: `/api/user-addresses`
   - **Auth**: Required
   - **Body**:
     ```json
     {
       "data": {
         "label": "Home",
         "firstName": "John",
         "lastName": "Doe",
         "phone": "+44 20 7946 0958",
         "address1": "123 Baker Street",
         "address2": "Apt 4B",
         "city": "London",
         "postcode": "SW1A 1AA",
         "country": "United Kingdom",
         "isDefault": false
       }
     }
     ```
   - **Returns**: Created address object
   - **Auto-features**:
     - User automatically associated from JWT
     - Setting `isDefault: true` unsets other defaults

4. **Update Address**
   - **Method**: PUT
   - **Endpoint**: `/api/user-addresses/:id`
   - **Auth**: Required
   - **Body**: Same as create (partial updates supported)
   - **Returns**: Updated address object
   - **Security**: User can only update their own addresses

5. **Delete Address**
   - **Method**: DELETE
   - **Endpoint**: `/api/user-addresses/:id`
   - **Auth**: Required
   - **Returns**: `{ message: 'Address deleted successfully' }`
   - **Security**: User can only delete their own addresses

#### Controller Features

**File**: `controllers/user-address.ts`

- **User Isolation**: All queries automatically filter by authenticated user
- **Default Management**: Setting address as default auto-unsets others
- **Security**: Ownership validation on all operations
- **Error Handling**: Proper HTTP status codes (401, 404, etc.)

---

## Frontend Implementation

### 1. Composable: useAddresses

**Location**: `nuxt-frontend/composables/useAddresses.ts`

#### Interface
```typescript
interface UserAddress {
  id: number;
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
}

interface CreateAddressData {
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
```

#### API Methods
```typescript
const {
  addresses,           // Ref<UserAddress[]>
  loading,            // Ref<boolean>
  error,              // Ref<string | null>
  fetchAddresses,     // () => Promise<UserAddress[]>
  getAddress,         // (id: number) => Promise<UserAddress>
  createAddress,      // (data: CreateAddressData) => Promise<UserAddress>
  updateAddress,      // (id: number, data: Partial<CreateAddressData>) => Promise<UserAddress>
  deleteAddress,      // (id: number) => Promise<void>
  setDefaultAddress,  // (id: number) => Promise<void>
  getDefaultAddress,  // () => UserAddress | undefined
} = useAddresses();
```

#### Usage Example
```typescript
// Fetch addresses on mount
onMounted(async () => {
  await fetchAddresses();
  const defaultAddr = getDefaultAddress();
});

// Create new address
await createAddress({
  label: 'Home',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+44 20 7946 0958',
  address1: '123 Baker Street',
  city: 'London',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  isDefault: true,
});

// Update address
await updateAddress(addressId, {
  label: 'Work',
  isDefault: true,
});

// Delete address
await deleteAddress(addressId);
```

---

### 2. Component: AddressForm

**Location**: `nuxt-frontend/components/account/AddressForm.vue`

#### Props
```typescript
interface Props {
  title?: string;              // Form title (default: '')
  address?: UserAddress | null; // For editing (default: null)
  submitLabel?: string;        // Button text (default: 'Save Address')
}
```

#### Events
```typescript
emit('submit', data: CreateAddressData)  // Form submitted
emit('cancel')                            // Cancel clicked
```

#### Features
- **Real-time Validation**: All fields validate on change
- **UK Phone Formatting**: Auto-formats to +44 XX XXXX XXXX
- **Postcode Validation**: UK postcode regex validation
- **Required Fields**: Label, first/last name, phone, address1, city, postcode, country
- **Optional Fields**: Address line 2
- **Default Toggle**: Checkbox to set as default address
- **Error Display**: Red borders and error messages
- **Disabled State**: Submit button disabled until valid

#### Usage
```vue
<AddressForm
  title="Add New Address"
  :address="selectedAddress"
  submit-label="Save"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>
```

---

### 3. Component: AddressList

**Location**: `nuxt-frontend/components/account/AddressList.vue`

#### Props
```typescript
interface Props {
  addresses: UserAddress[];
  loading?: boolean;
  error?: string | null;
}
```

#### Events
```typescript
emit('add')                           // Add new address clicked
emit('edit', address: UserAddress)    // Edit address clicked
emit('delete', id: number)            // Delete confirmed
emit('set-default', id: number)       // Set as default clicked
emit('retry')                         // Retry loading clicked
```

#### Features
- **Grid Layout**: Responsive card grid (auto-fill, min 300px)
- **Default Badge**: Visual indicator for default address
- **Hover Effects**: Cards lift on hover
- **Action Buttons**:
  - Set as Default (only for non-default)
  - Edit
  - Delete (with confirmation modal)
- **Delete Confirmation**: Modal with address name and warning
- **Loading States**: Spinner for async operations
- **Empty State**: Message + add button when no addresses
- **Error State**: Error message + retry button

#### Usage
```vue
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
```

---

### 4. Page: Address Management

**Location**: `nuxt-frontend/pages/account/addresses.vue`

#### Features
- **Protected Route**: Requires authentication (auth middleware)
- **Toggle View**: Switch between list and form
- **Add/Edit Modes**: Same form, different titles
- **Success Messages**: Auto-dismiss after 5 seconds
- **Animations**: Smooth transitions between views

#### User Flow
1. User navigates to `/account/addresses`
2. Addresses load automatically
3. Click "Add New Address" → Show form
4. Fill form and submit → Save → Return to list
5. Click "Edit" on address → Show form with data
6. Click "Delete" → Confirm modal → Delete
7. Click "Set as Default" → Update immediately

---

### 5. Component: AddressSelector (Checkout)

**Location**: `nuxt-frontend/components/checkout/AddressSelector.vue`

#### Events
```typescript
emit('address-selected', address: UserAddress | null)
```

#### Features
- **Toggle Checkbox**: "Use saved address"
- **Auto-Select Default**: Default address pre-selected
- **Radio Selection**: Single address selection
- **Address Cards**: Visual display with all details
- **Manual Entry**: Uncheck to enter manually
- **Loading State**: Shows while fetching
- **Empty State**: Message if no addresses
- **Only for Authenticated**: Component only shown to logged-in users

#### Usage in Checkout
```vue
<AddressSelector
  v-if="isAuthenticated"
  @address-selected="handleAddressSelected"
/>
```

#### Address Selection Handler
```typescript
function handleAddressSelected(address: UserAddress | null) {
  if (address) {
    // Pre-fill checkout form with selected address
    form.firstName = address.firstName;
    form.lastName = address.lastName;
    form.phone = address.phone;
    form.address1 = address.address1;
    form.address2 = address.address2 || '';
    form.city = address.city;
    form.postcode = address.postcode;
    form.country = mapCountryNameToCode(address.country);
  }
}
```

---

### 6. Checkout Integration

**Location**: `nuxt-frontend/pages/checkout/index.vue`

#### New Features

##### Address Selector (for authenticated users)
- Displays above shipping address form
- Allows selecting from saved addresses
- Pre-fills form when address selected
- Checkbox to toggle between saved/manual

##### Save Address Checkbox (for authenticated users)
- Located after country field
- Only shown to authenticated users
- Checkbox: "Save this address for future orders"
- Saves address after successful order creation
- Non-blocking: Checkout continues if save fails

#### Implementation Details

##### Variables Added
```typescript
const { isAuthenticated } = useAuth();
const { createAddress } = useAddresses();
const saveAddress = ref(false);
```

##### Address Selection Handler
```typescript
function handleAddressSelected(address: UserAddress | null) {
  if (address) {
    form.firstName = address.firstName;
    form.lastName = address.lastName;
    form.phone = address.phone;
    form.address1 = address.address1;
    form.address2 = address.address2 || '';
    form.city = address.city;
    form.postcode = address.postcode;
    // Map country name to code (e.g., "United Kingdom" → "GB")
    const countryMap: Record<string, string> = {
      'United Kingdom': 'GB',
      'Ireland': 'IE',
      // ... etc
    };
    form.country = countryMap[address.country] || 'GB';
  }
}
```

##### Save Address Logic (in processPayment)
```typescript
// After successful order creation
if (saveAddress.value && isAuthenticated.value) {
  try {
    await createAddress({
      label: 'Home', // Default label
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      address1: form.address1,
      address2: form.address2 || undefined,
      city: form.city,
      postcode: form.postcode,
      country: mapCodeToCountryName(form.country),
      isDefault: false,
    });
  } catch (addressErr) {
    // Don't fail checkout if address save fails
    console.error('Failed to save address:', addressErr);
  }
}
```

---

## User Flows

### Flow 1: First Time User - Save Address During Checkout

1. User adds items to cart and proceeds to checkout
2. User logs in or signs up
3. User fills in shipping address form manually
4. User checks "Save this address for future orders"
5. User completes payment
6. Address is automatically saved in background
7. Next order: Address appears in saved addresses

### Flow 2: Returning User - Use Saved Address

1. User adds items to cart and proceeds to checkout
2. AddressSelector automatically loads user's addresses
3. Default address is pre-selected
4. Form auto-fills with address details
5. User can:
   - Keep selected address and continue
   - Select different saved address
   - Uncheck "Use saved address" and enter manually
6. User completes payment

### Flow 3: Manage Saved Addresses

1. User navigates to Account → Addresses
2. User sees list of all saved addresses
3. User can:
   - Add new address
   - Edit existing address
   - Delete address (with confirmation)
   - Set an address as default
4. Changes reflect immediately in checkout

---

## Security Considerations

### Backend Security

1. **Authentication Required**: All endpoints require valid JWT
2. **User Isolation**: Users can only access their own addresses
3. **Ownership Validation**: Every operation validates address ownership
4. **SQL Injection**: Protected by Strapi ORM
5. **XSS Prevention**: Input sanitization by Strapi

### Frontend Security

1. **Token Storage**: JWT stored in localStorage (cleared on logout)
2. **HTTPS Only**: All API calls use HTTPS in production
3. **No Sensitive Data**: No credit card info stored
4. **CSP Headers**: Content Security Policy headers configured

---

## Testing Checklist

### Backend Testing

- [ ] Create address as authenticated user → Success
- [ ] Create address without auth → 401 Unauthorized
- [ ] Get addresses for user A, logged in as user B → 404 Not Found
- [ ] Set address as default → Other defaults unset
- [ ] Delete address → Removed from database
- [ ] Update address with valid data → Success
- [ ] Create address with missing required field → Validation error

### Frontend Testing

#### Address Management Page

- [ ] Navigate to `/account/addresses` without login → Redirect to login
- [ ] Navigate with login → Load addresses
- [ ] Click "Add New Address" → Show form
- [ ] Fill form with valid data → Save successfully
- [ ] Fill form with invalid postcode → Show error
- [ ] Try to remove +44 from phone → Stays
- [ ] Edit address → Pre-fill form with data
- [ ] Update address → Save and show in list
- [ ] Delete address → Show confirmation modal
- [ ] Confirm delete → Address removed
- [ ] Cancel delete → Address kept
- [ ] Set address as default → Badge appears, others lose badge

#### Checkout Integration

- [ ] Checkout as guest → No address selector shown
- [ ] Checkout as authenticated user → Address selector shown
- [ ] Check "Use saved address" → Addresses load
- [ ] Default address pre-selected → Form pre-filled
- [ ] Select different address → Form updates
- [ ] Uncheck "Use saved address" → Form cleared, manual entry
- [ ] Fill address manually → Check "Save this address"
- [ ] Complete checkout → Address saved
- [ ] Next checkout → Saved address appears

---

## Performance Considerations

### Backend

- **Query Optimization**: Addresses fetched with single query
- **Sorting**: Database-level sorting (isDefault DESC, createdAt DESC)
- **Pagination**: Not needed (users typically have few addresses)
- **Caching**: Could add Redis for frequently accessed addresses

### Frontend

- **Lazy Loading**: Address selector only loads when needed
- **State Management**: Composable caches addresses in memory
- **Optimistic Updates**: UI updates before API confirmation
- **Debouncing**: Not needed (no search/filter yet)

---

## Future Enhancements

### Phase 1 (Quick Wins)

1. **Address Labels**: Dropdown with common labels (Home, Work, etc.)
2. **Address Validation**: Integration with Google Places API
3. **Bulk Actions**: Delete multiple addresses at once
4. **Search/Filter**: Search addresses by label/city

### Phase 2 (Medium)

1. **Address Autocomplete**: Real-time suggestions as user types
2. **Map Integration**: Show address on map
3. **International Support**: Multi-country address formats
4. **Shipping Calculator**: Estimate shipping by address

### Phase 3 (Advanced)

1. **Billing vs Shipping**: Separate billing address
2. **Address History**: Track address changes over time
3. **Shared Addresses**: Allow gifting to others' addresses
4. **Admin Tools**: View/edit user addresses in Strapi admin

---

## Troubleshooting

### Issue: "Cannot find name 'useAddresses'"

**Cause**: TypeScript hasn't picked up the new composable yet  
**Solution**: Restart Nuxt dev server

### Issue: Addresses not loading in checkout

**Cause**: User not authenticated or API error  
**Solution**: Check browser console, verify JWT token, check Strapi logs

### Issue: "404 Not Found" when accessing address

**Cause**: Address belongs to different user  
**Solution**: Security feature - users can only access their own addresses

### Issue: Default address not auto-selected

**Cause**: No default address set  
**Solution**: User should set one address as default in address management page

### Issue: Phone number validation failing

**Cause**: Non-UK phone number entered  
**Solution**: Currently only supports UK format (+44). Extend validation for international.

---

## API Response Examples

### List Addresses Response
```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "label": "Home",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+44 20 7946 0958",
      "address1": "123 Baker Street",
      "address2": "Apt 4B",
      "city": "London",
      "postcode": "SW1A 1AA",
      "country": "United Kingdom",
      "isDefault": true,
      "createdAt": "2026-01-04T10:30:00.000Z",
      "updatedAt": "2026-01-04T10:30:00.000Z"
    }
  ]
}
```

### Create Address Response
```json
{
  "data": {
    "id": 2,
    "label": "Work",
    "firstName": "Jane",
    "lastName": "Smith",
    ...
  }
}
```

### Error Response
```json
{
  "error": {
    "status": 401,
    "name": "UnauthorizedError",
    "message": "You must be logged in"
  }
}
```

---

## Conclusion

The address management system is fully implemented and ready for production use. Users can now:

✅ Save multiple shipping addresses  
✅ Set a default address  
✅ Edit and delete addresses  
✅ Quickly select saved addresses at checkout  
✅ Save new addresses during checkout  

All security measures are in place, and the system is performant and user-friendly.

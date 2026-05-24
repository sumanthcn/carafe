import { defineStore } from "pinia";
import type { CartItem, Product, ProductVariant, SubscriptionOption } from "~/types/strapi";

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
    currency: "EUR" as "EUR" | "GBP" | "USD",
    shippingCost: 0,
    taxRate: 0.2, // 20% VAT
    isOpen: false,
  }),

  getters: {
    /**
     * Total number of items in cart
     */
    itemCount: (state): number => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Subtotal before shipping and tax
     */
    subtotal: (state): number => {
      return state.items.reduce((total, item) => {
        const price = item.isSubscription && item.subscriptionUnitPrice != null
          ? item.subscriptionUnitPrice
          : item.selectedVariant
            ? (item.selectedVariant.salePrice || item.selectedVariant.price)
            : (item.product.variants?.[0]?.salePrice || item.product.variants?.[0]?.price || 0);
        return total + price * item.quantity;
      }, 0);
    },

    /**
     * Tax amount
     */
    tax(): number {
      return this.subtotal * this.taxRate;
    },

    /**
     * Total including shipping and tax
     */
    total(): number {
      return this.subtotal + this.shippingCost + this.tax;
    },

    /**
     * Check if cart is empty
     */
    isEmpty: (state): boolean => {
      return state.items.length === 0;
    },

    /**
     * Get cart for checkout
     */
    checkoutCart(): {
      items: CartItem[];
      subtotal: number;
      shipping: number;
      tax: number;
      total: number;
      currency: string;
    } {
      return {
        items: this.items,
        subtotal: this.subtotal,
        shipping: this.shippingCost,
        tax: this.tax,
        total: this.total,
        currency: this.currency,
      };
    },
  },

  actions: {
    /**
     * Add item to cart
     */
    addItem(
      product: Product,
      quantity: number = 1,
      variant?: ProductVariant,
      subscription?: SubscriptionOption
    ) {
      const isSubscription = Boolean(subscription);
      const subscriptionKey = isSubscription ? subscription?.deliveryInterval : "one-time";
      
      const existingItem = this.items.find((item) => {
        if (item.isSubscription !== isSubscription) return false;
        if ((item.subscriptionInterval || "one-time") !== subscriptionKey) return false;

        if (variant && item.selectedVariant) {
          return item.product.id === product.id && item.selectedVariant.id === variant.id;
        }
        return item.product.id === product.id && !item.selectedVariant;
      });

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        const baseUnitPrice = variant
          ? (variant.salePrice || variant.price)
          : (product.variants?.[0]?.salePrice || product.variants?.[0]?.price || 0);
        const discountPercentage = Number(subscription?.discountPercentage || 0);
        const discountedUnitPrice = isSubscription
          ? Number((baseUnitPrice * (1 - discountPercentage / 100)).toFixed(2))
          : undefined;

        this.items.push({ 
          product, 
          quantity,
          selectedVariant: variant,
          isSubscription,
          subscriptionInterval: subscription?.deliveryInterval,
          subscriptionDiscountPercentage: isSubscription ? discountPercentage : undefined,
          subscriptionOriginalUnitPrice: isSubscription ? baseUnitPrice : undefined,
          subscriptionUnitPrice: discountedUnitPrice,
        });
      }

      // Update shipping cost based on cart
      this.calculateShipping();

      // Persist to localStorage
      this.persistCart();

      // Open the cart sidebar
      this.isOpen = true;
    },

    /**
     * Remove item from cart
     */
    removeItem(productId: number, variantId?: number, subscriptionInterval?: string) {
      const index = this.items.findIndex((item) => {
        if ((item.subscriptionInterval || "") !== (subscriptionInterval || "")) {
          return false;
        }
        if (variantId && item.selectedVariant) {
          return item.product.id === productId && item.selectedVariant.id === variantId;
        }
        return item.product.id === productId && !item.selectedVariant;
      });
      if (index > -1) {
        this.items.splice(index, 1);
      }
      this.calculateShipping();
      this.persistCart();
    },

    /**
     * Update item quantity
     */
    updateQuantity(productId: number, quantity: number, variantId?: number, subscriptionInterval?: string) {
      const item = this.items.find((item) => {
        if ((item.subscriptionInterval || "") !== (subscriptionInterval || "")) {
          return false;
        }
        if (variantId && item.selectedVariant) {
          return item.product.id === productId && item.selectedVariant.id === variantId;
        }
        return item.product.id === productId && !item.selectedVariant;
      });
      if (item) {
        if (quantity <= 0) {
          this.removeItem(productId, variantId, subscriptionInterval);
        } else {
          item.quantity = quantity;
        }
      }
      this.calculateShipping();
      this.persistCart();
    },

    /**
     * Clear entire cart
     */
    clearCart() {
      this.items = [];
      this.shippingCost = 0;
      this.persistCart();
    },

    /**
     * Calculate shipping cost based on cart contents
     */
    calculateShipping() {
      // Free shipping over £50
      if (this.subtotal >= 50) {
        this.shippingCost = 0;
      } else {
        // Base shipping cost
        this.shippingCost = 4.95;
      }
    },

    /**
     * Persist cart to localStorage
     */
    persistCart() {
      if (import.meta.client) {
        const cartData = {
          items: this.items.map((item) => ({
            productId: item.product.id,
            productSlug: item.product.slug,
            quantity: item.quantity,
            variantId: item.selectedVariant?.id,
            isSubscription: item.isSubscription || false,
            subscriptionInterval: item.subscriptionInterval,
            subscriptionDiscountPercentage: item.subscriptionDiscountPercentage,
            subscriptionOriginalUnitPrice: item.subscriptionOriginalUnitPrice,
            subscriptionUnitPrice: item.subscriptionUnitPrice,
          })),
          currency: this.currency,
        };
        localStorage.setItem("carafe-cart", JSON.stringify(cartData));
      }
    },

    /**
     * Load cart from localStorage
     */
    async loadCart() {
      if (import.meta.client) {
        const savedCart = localStorage.getItem("carafe-cart");
        if (savedCart) {
          try {
            const cartData = JSON.parse(savedCart);
            const { getProductBySlug } = useStrapi();

            // Reload products to get fresh data
            const loadedItems: CartItem[] = [];
            for (const item of cartData.items) {
              const product = await getProductBySlug(item.productSlug);
              if (product) {
                // Find the variant if variantId is present
                let selectedVariant: ProductVariant | undefined = undefined;
                if (item.variantId && product.variants) {
                  selectedVariant = product.variants.find(
                    (v: ProductVariant) => v.id === item.variantId
                  );
                }

                loadedItems.push({
                  product,
                  quantity: item.quantity,
                  selectedVariant,
                  isSubscription: Boolean(item.isSubscription),
                  subscriptionInterval: item.subscriptionInterval,
                  subscriptionDiscountPercentage: item.subscriptionDiscountPercentage,
                  subscriptionOriginalUnitPrice: item.subscriptionOriginalUnitPrice,
                  subscriptionUnitPrice: item.subscriptionUnitPrice,
                });
              }
            }

            this.items = loadedItems;
            this.currency = cartData.currency || "EUR";
            this.calculateShipping();
          } catch (error) {
            console.error("Failed to load cart:", error);
            this.clearCart();
          }
        }
      }
    },

    /**
     * Format price with currency symbol
     */
    formatPrice(amount: number): string {
      const symbols: Record<string, string> = {
        EUR: "£",
        GBP: "£",
        USD: "£",
      };
      return `${symbols[this.currency]}${amount.toFixed(2)}`;
    },
  },
});

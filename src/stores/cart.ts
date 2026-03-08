import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { CartItem, CartSummary, Cart } from '@/types'

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref<CartItem[]>([])
  const summary = ref<CartSummary>({
    item_count: 0,
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    free_shipping_threshold: 100,
    amount_to_free_shipping: 100,
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.subtotal, 0))
  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  async function fetchCart() {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get<Cart>('/cart')
      items.value = data.items
      summary.value = data.summary
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch cart'
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId: number, quantity: number = 1) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post<{ item: CartItem; message: string }>('/cart', {
        product_id: productId,
        quantity,
      })

      // Update or add item in local state
      const existingIndex = items.value.findIndex(item => item.product_id === productId)
      
      if (existingIndex > -1) {
        items.value[existingIndex] = data.item
      } else {
        items.value.push(data.item)
      }

      // Refresh cart to get updated summary
      await fetchCart()

      return { success: true, message: data.message }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add item'
      return { 
        success: false, 
        message: error.value,
        available: err.response?.data?.available 
      }
    } finally {
      loading.value = false
    }
  }

  async function updateQuantity(itemId: number, quantity: number) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.patch<{ item: CartItem; message: string }>(`/cart/${itemId}`, {
        quantity,
      })

      const index = items.value.findIndex(item => item.id === itemId)
      if (index > -1) {
        items.value[index] = data.item
      }

      // Refresh cart to get updated summary
      await fetchCart()

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update quantity'
      return { 
        success: false, 
        message: error.value,
        available: err.response?.data?.available 
      }
    } finally {
      loading.value = false
    }
  }

  async function removeItem(itemId: number) {
    loading.value = true
    error.value = null

    try {
      await api.delete(`/cart/${itemId}`)
      items.value = items.value.filter(item => item.id !== itemId)
      
      // Refresh cart to get updated summary
      await fetchCart()

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove item'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    error.value = null

    try {
      await api.delete('/cart')
      items.value = []
      summary.value = {
        item_count: 0,
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        free_shipping_threshold: 100,
        amount_to_free_shipping: 100,
      }
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to clear cart'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  // Check if product is in cart
  function isInCart(productId: number): boolean {
    return items.value.some(item => item.product_id === productId)
  }

  // Get cart item by product ID
  function getCartItem(productId: number): CartItem | undefined {
    return items.value.find(item => item.product_id === productId)
  }

  // Reset cart state (for logout)
  function resetCart() {
    items.value = []
    summary.value = {
      item_count: 0,
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      free_shipping_threshold: 100,
      amount_to_free_shipping: 100,
    }
  }

  return {
    // State
    items,
    summary,
    loading,
    error,
    // Getters
    itemCount,
    subtotal,
    isEmpty,
    // Actions
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isInCart,
    getCartItem,
    resetCart,
  }
})

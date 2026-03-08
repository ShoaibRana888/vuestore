<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const canCheckout = computed(() => {
  return authStore.isAuthenticated && !cartStore.isEmpty
})

const updateQuantity = async (itemId: number, quantity: number) => {
  if (quantity < 1) return
  await cartStore.updateQuantity(itemId, quantity)
}

const removeItem = async (itemId: number) => {
  await cartStore.removeItem(itemId)
}

const proceedToCheckout = () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: '/checkout' } })
    return
  }
  router.push({ name: 'checkout' })
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="container-custom py-8">
    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
    
    <!-- Empty Cart -->
    <div v-if="cartStore.isEmpty && !cartStore.loading" class="text-center py-16">
      <svg class="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
      <p class="text-gray-500 mb-6">Looks like you haven't added any items yet.</p>
      <RouterLink to="/products" class="btn-primary">
        Start Shopping
      </RouterLink>
    </div>
    
    <!-- Cart Content -->
    <div v-else class="lg:grid lg:grid-cols-12 lg:gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-8">
        <div v-if="cartStore.loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="card p-4 animate-pulse">
            <div class="flex gap-4">
              <div class="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                <div class="h-5 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="item in cartStore.items"
            :key="item.id"
            class="card p-4"
          >
            <div class="flex gap-4">
              <!-- Product Image -->
              <RouterLink
                :to="`/products/${item.product.slug}`"
                class="w-24 h-24 flex-shrink-0"
              >
                <img
                  :src="item.product.primary_image || 'https://picsum.photos/seed/placeholder/200/200'"
                  :alt="item.product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
              </RouterLink>
              
              <!-- Product Info -->
              <div class="flex-1 min-w-0">
                <RouterLink
                  :to="`/products/${item.product.slug}`"
                  class="font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                >
                  {{ item.product.name }}
                </RouterLink>
                <p class="text-sm text-gray-500 mt-1">
                  {{ item.product.category?.name }}
                </p>
                <p class="text-lg font-semibold text-gray-900 mt-2">
                  ${{ item.product.price.toFixed(2) }}
                </p>
                
                <!-- Availability Warning -->
                <p v-if="!item.is_available" class="text-sm text-red-500 mt-1">
                  This item is no longer available
                </p>
              </div>
              
              <!-- Quantity & Actions -->
              <div class="flex flex-col items-end justify-between">
                <button
                  @click="removeItem(item.id)"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove item"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                
                <div class="flex items-center border border-gray-300 rounded-lg">
                  <button
                    @click="updateQuantity(item.id, item.quantity - 1)"
                    :disabled="item.quantity <= 1"
                    class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <span class="w-12 text-center font-medium">{{ item.quantity }}</span>
                  <button
                    @click="updateQuantity(item.id, item.quantity + 1)"
                    :disabled="item.quantity >= item.product.stock"
                    class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                
                <p class="font-semibold text-gray-900">
                  ${{ item.subtotal.toFixed(2) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="lg:col-span-4 mt-8 lg:mt-0">
        <div class="card p-6 sticky top-24">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Subtotal ({{ cartStore.summary.item_count }} items)</span>
              <span class="font-medium">${{ cartStore.summary.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Shipping</span>
              <span class="font-medium">
                {{ cartStore.summary.shipping === 0 ? 'FREE' : `$${cartStore.summary.shipping.toFixed(2)}` }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Estimated Tax</span>
              <span class="font-medium">${{ cartStore.summary.tax.toFixed(2) }}</span>
            </div>
            
            <div class="border-t border-gray-200 pt-3 mt-3">
              <div class="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${{ cartStore.summary.total.toFixed(2) }}</span>
              </div>
            </div>
          </div>
          
          <!-- Free Shipping Progress -->
          <div v-if="cartStore.summary.amount_to_free_shipping > 0" class="mt-4 p-3 bg-primary-50 rounded-lg">
            <p class="text-sm text-primary-800">
              Add <span class="font-semibold">${{ cartStore.summary.amount_to_free_shipping.toFixed(2) }}</span> more for free shipping!
            </p>
            <div class="mt-2 h-2 bg-primary-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary-600 rounded-full transition-all duration-300"
                :style="{ width: `${(cartStore.summary.subtotal / cartStore.summary.free_shipping_threshold) * 100}%` }"
              ></div>
            </div>
          </div>
          
          <button
            @click="proceedToCheckout"
            :disabled="cartStore.isEmpty"
            class="w-full btn-primary mt-6 py-3"
          >
            {{ authStore.isAuthenticated ? 'Proceed to Checkout' : 'Sign in to Checkout' }}
          </button>
          
          <RouterLink
            to="/products"
            class="block text-center mt-4 text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Continue Shopping
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

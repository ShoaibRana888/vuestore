<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'
import { useCartStore } from '@/stores/cart'

const wishlist = ref<any[]>([])
const loading = ref(true)
const cartStore = useCartStore()

const fetchWishlist = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/wishlist')
    wishlist.value = data.wishlist || data.data || []
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
  } finally {
    loading.value = false
  }
}

const removeFromWishlist = async (productId: number) => {
  try {
    await api.delete(`/wishlist/${productId}`)
    wishlist.value = wishlist.value.filter(item => item.product?.id !== productId)
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
  }
}

const moveToCart = async (productId: number) => {
  try {
    await api.post(`/wishlist/${productId}/move-to-cart`)
    wishlist.value = wishlist.value.filter(item => item.product?.id !== productId)
    await cartStore.fetchCart()
  } catch (error) {
    console.error('Failed to move to cart:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

onMounted(fetchWishlist)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>
    
    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="i in 4" :key="i" class="card p-4 animate-pulse">
        <div class="flex gap-4">
          <div class="w-24 h-24 bg-gray-200 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Wishlist Items -->
    <div v-else-if="wishlist.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="item in wishlist" :key="item.id" class="card p-4">
        <div class="flex gap-4">
          <RouterLink :to="`/products/${item.product?.slug}`" class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img 
              :src="item.product?.primary_image || 'https://via.placeholder.com/100'" 
              :alt="item.product?.name"
              class="w-full h-full object-cover"
            />
          </RouterLink>
          <div class="flex-1 min-w-0">
            <RouterLink :to="`/products/${item.product?.slug}`" class="font-medium text-gray-900 hover:text-primary-600 line-clamp-2">
              {{ item.product?.name }}
            </RouterLink>
            <p class="text-lg font-semibold text-gray-900 mt-1">
              {{ formatCurrency(item.product?.price || 0) }}
            </p>
            <p v-if="!item.product?.in_stock" class="text-sm text-red-500">Out of Stock</p>
            
            <div class="flex gap-2 mt-3">
              <button 
                v-if="item.product?.in_stock"
                @click="moveToCart(item.product?.id)"
                class="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Add to Cart
              </button>
              <button 
                @click="removeFromWishlist(item.product?.id)"
                class="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
      <p class="text-gray-500 mb-6">Save items you love by clicking the heart icon on products.</p>
      <RouterLink to="/products" class="btn-primary">
        Browse Products
      </RouterLink>
    </div>
  </div>
</template>
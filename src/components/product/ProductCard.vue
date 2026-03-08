<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import type { Product } from '@/types'

const props = defineProps<{
  product: Product
}>()

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const discountPercentage = computed(() => props.product.discount_percentage)
const isInStock = computed(() => props.product.in_stock)
const isLowStock = computed(() => props.product.low_stock)

const addToCart = async (e: Event) => {
  e.stopPropagation()
  
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/products/${props.product.slug}` } })
    return
  }
  
  const result = await cartStore.addItem(props.product.id)
  
  if (result.success) {
    // Could show a toast notification here
    console.log('Added to cart')
  } else {
    console.error(result.message)
  }
}

const viewProduct = () => {
  router.push({ name: 'product-detail', params: { slug: props.product.slug } })
}
</script>

<template>
  <article
    class="card-hover group cursor-pointer"
    @click="viewProduct"
  >
    <!-- Image -->
    <div class="aspect-square overflow-hidden bg-gray-100 relative">
      <img
        :src="product.primary_image || 'https://picsum.photos/seed/placeholder/400/400'"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      
      <!-- Badges -->
      <div class="absolute top-3 left-3 flex flex-col gap-2">
        <span
          v-if="discountPercentage > 0"
          class="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full"
        >
          -{{ discountPercentage }}%
        </span>
        <span
          v-if="product.featured"
          class="px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full"
        >
          Featured
        </span>
      </div>
      
      <!-- Quick Add Button -->
      <button
        v-if="isInStock"
        @click="addToCart"
        class="absolute bottom-3 right-3 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary-700 shadow-lg"
        title="Add to cart"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
    
    <!-- Info -->
    <div class="p-4">
      <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {{ product.category?.name || 'Uncategorized' }}
      </p>
      <h3 class="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
        {{ product.name }}
      </h3>
      
      <!-- Rating -->
      <div v-if="product.rating.count > 0" class="flex items-center gap-1 mb-2">
        <div class="flex">
          <svg
            v-for="i in 5"
            :key="i"
            class="w-4 h-4"
            :class="i <= Math.round(product.rating.average) ? 'text-yellow-400' : 'text-gray-300'"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <span class="text-xs text-gray-500">({{ product.rating.count }})</span>
      </div>
      
      <!-- Price -->
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-gray-900">
          ${{ product.price.toFixed(2) }}
        </span>
        <span
          v-if="product.compare_price"
          class="text-sm text-gray-400 line-through"
        >
          ${{ product.compare_price.toFixed(2) }}
        </span>
      </div>
      
      <!-- Stock Status -->
      <p
        v-if="!isInStock"
        class="mt-2 text-sm text-red-500 font-medium"
      >
        Out of Stock
      </p>
      <p
        v-else-if="isLowStock"
        class="mt-2 text-sm text-amber-600 font-medium"
      >
        Only {{ product.stock }} left
      </p>
    </div>
  </article>
</template>

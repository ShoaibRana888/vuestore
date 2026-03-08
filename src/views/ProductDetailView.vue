<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import ProductCard from '@/components/product/ProductCard.vue'

const props = defineProps<{ slug: string }>()
const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const quantity = ref(1)
const selectedImage = ref(0)
const addingToCart = ref(false)

const addToCart = async () => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  
  addingToCart.value = true
  await cartStore.addItem(productStore.currentProduct!.id, quantity.value)
  addingToCart.value = false
}

onMounted(() => {
  productStore.fetchProduct(props.slug)
})
</script>

<template>
  <div class="container-custom py-8">
    <div v-if="productStore.loading" class="animate-pulse">
      <div class="grid md:grid-cols-2 gap-8">
        <div class="aspect-square bg-gray-200 rounded-2xl"></div>
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
    
    <div v-else-if="productStore.currentProduct" class="grid md:grid-cols-2 gap-8">
      <!-- Images -->
      <div>
        <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4">
          <img
            :src="productStore.currentProduct.images?.[selectedImage] || productStore.currentProduct.primary_image"
            :alt="productStore.currentProduct.name"
            class="w-full h-full object-cover"
          />
        </div>
        <div v-if="productStore.currentProduct.images?.length > 1" class="flex gap-2">
          <button
            v-for="(image, index) in productStore.currentProduct.images"
            :key="index"
            @click="selectedImage = index"
            :class="['w-20 h-20 rounded-lg overflow-hidden border-2', selectedImage === index ? 'border-primary-600' : 'border-transparent']"
          >
            <img :src="image" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
      
      <!-- Info -->
      <div>
        <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">
          {{ productStore.currentProduct.category?.name }}
        </p>
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          {{ productStore.currentProduct.name }}
        </h1>
        
        <div class="flex items-center gap-4 mb-6">
          <span class="text-3xl font-bold text-gray-900">
            ${{ productStore.currentProduct.price.toFixed(2) }}
          </span>
          <span v-if="productStore.currentProduct.compare_price" class="text-xl text-gray-400 line-through">
            ${{ productStore.currentProduct.compare_price.toFixed(2) }}
          </span>
          <span v-if="productStore.currentProduct.discount_percentage" class="badge-danger">
            -{{ productStore.currentProduct.discount_percentage }}%
          </span>
        </div>
        
        <p class="text-gray-600 mb-6">{{ productStore.currentProduct.description }}</p>
        
        <div v-if="productStore.currentProduct.in_stock" class="flex items-center gap-4 mb-6">
          <div class="flex items-center border border-gray-300 rounded-lg">
            <button @click="quantity = Math.max(1, quantity - 1)" class="w-10 h-10 flex items-center justify-center">-</button>
            <span class="w-12 text-center">{{ quantity }}</span>
            <button @click="quantity = Math.min(productStore.currentProduct.stock, quantity + 1)" class="w-10 h-10 flex items-center justify-center">+</button>
          </div>
          <button @click="addToCart" :disabled="addingToCart" class="flex-1 btn-primary py-3">
            {{ addingToCart ? 'Adding...' : 'Add to Cart' }}
          </button>
        </div>
        <p v-else class="text-red-500 font-medium mb-6">Out of Stock</p>
        
        <p class="text-sm text-gray-500">SKU: {{ productStore.currentProduct.sku }}</p>
      </div>
    </div>
    
    <!-- Related Products -->
    <div v-if="productStore.relatedProducts.length" class="mt-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ProductCard v-for="product in productStore.relatedProducts" :key="product.id" :product="product" />
      </div>
    </div>
  </div>
</template>

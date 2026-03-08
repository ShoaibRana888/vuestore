<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'

const route = useRoute()
const productStore = useProductStore()

const searchQuery = ref((route.query.q as string) || '')

const performSearch = async () => {
  if (searchQuery.value.trim()) {
    await productStore.searchProducts(searchQuery.value)
  }
}

watch(() => route.query.q, (newQuery) => {
  searchQuery.value = (newQuery as string) || ''
  performSearch()
})

onMounted(() => {
  performSearch()
})
</script>

<template>
  <div class="container-custom py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Search Results
      </h1>
      <p class="text-gray-600 mt-2">
        {{ productStore.pagination.total }} results for "{{ searchQuery }}"
      </p>
    </div>

    <!-- Loading -->
    <div v-if="productStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="i in 8" :key="i" class="card animate-pulse">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-4 space-y-3">
          <div class="h-3 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          <div class="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-else-if="productStore.products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in productStore.products"
        :key="product.id"
        :product="product"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No results found</h3>
      <p class="text-gray-500">Try different keywords or browse our categories.</p>
    </div>
  </div>
</template>
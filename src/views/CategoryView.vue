<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'

const props = defineProps<{ slug: string }>()
const route = useRoute()
const productStore = useProductStore()

const category = ref<any>(null)
const sortOptions = [
  { value: 'created_at-desc', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
]
const currentSort = ref('created_at-desc')

const fetchCategory = async () => {
  try {
    const response = await fetch(`http://localhost:8000/api/v1/categories/${props.slug}`)
    const data = await response.json()
    category.value = data.category
  } catch (error) {
    console.error('Failed to fetch category:', error)
  }
}

const fetchProducts = async () => {
  const [sort, order] = currentSort.value.split('-')
  await productStore.fetchProductsByCategory(props.slug, { sort, order })
}

watch(() => props.slug, () => {
  fetchCategory()
  fetchProducts()
})

onMounted(() => {
  fetchCategory()
  fetchProducts()
})
</script>

<template>
  <div class="container-custom py-8">
    <!-- Category Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        {{ category?.name || 'Category' }}
      </h1>
      <p v-if="category?.description" class="text-gray-600 mt-2">
        {{ category.description }}
      </p>
      <p class="text-gray-500 mt-1">
        {{ productStore.pagination.total }} products
      </p>
    </div>

    <!-- Sort -->
    <div class="flex justify-between items-center mb-6">
      <div></div>
      <select
        v-model="currentSort"
        @change="fetchProducts"
        class="input w-auto"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
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
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No products found</h3>
      <p class="text-gray-500">This category doesn't have any products yet.</p>
    </div>

    <!-- Pagination -->
    <div v-if="productStore.pagination.lastPage > 1" class="mt-8 flex justify-center">
      <nav class="flex items-center gap-2">
        <button
          v-for="page in productStore.pagination.lastPage"
          :key="page"
          @click="fetchProducts()"
          :class="[
            'px-4 py-2 rounded-lg',
            page === productStore.pagination.currentPage
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]"
        >
          {{ page }}
        </button>
      </nav>
    </div>
  </div>
</template>
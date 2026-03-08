<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()

const filters = ref({
  category: (route.query.category as string) || '',
  min_price: route.query.min_price ? Number(route.query.min_price) : undefined,
  max_price: route.query.max_price ? Number(route.query.max_price) : undefined,
  in_stock: route.query.in_stock === 'true',
  featured: route.query.featured === 'true',
  sort: (route.query.sort as string) || 'created_at',
  order: (route.query.order as 'asc' | 'desc') || 'desc',
})

const sortOptions = [
  { value: 'created_at-desc', label: 'Newest' },
  { value: 'created_at-asc', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

const currentSort = ref(`${filters.value.sort}-${filters.value.order}`)

const totalProducts = computed(() => {
  return productStore.pagination.total || 0
})

const fetchProducts = async (page = 1) => {
  const params: Record<string, unknown> = { page }
  
  if (filters.value.category) params.category = filters.value.category
  if (filters.value.min_price) params.min_price = filters.value.min_price
  if (filters.value.max_price) params.max_price = filters.value.max_price
  if (filters.value.in_stock) params.in_stock = true
  if (filters.value.featured) params.featured = true
  params.sort = filters.value.sort
  params.order = filters.value.order
  
  await productStore.fetchProducts(params)
}

const updateSort = () => {
  const [sort, order] = currentSort.value.split('-')
  filters.value.sort = sort
  filters.value.order = order as 'asc' | 'desc'
  applyFilters()
}

const applyFilters = () => {
  const query: Record<string, string> = {}
  
  if (filters.value.category) query.category = filters.value.category
  if (filters.value.min_price) query.min_price = String(filters.value.min_price)
  if (filters.value.max_price) query.max_price = String(filters.value.max_price)
  if (filters.value.in_stock) query.in_stock = 'true'
  if (filters.value.featured) query.featured = 'true'
  if (filters.value.sort !== 'created_at') query.sort = filters.value.sort
  if (filters.value.order !== 'desc') query.order = filters.value.order
  
  router.push({ query })
}

const clearFilters = () => {
  filters.value = {
    category: '',
    min_price: undefined,
    max_price: undefined,
    in_stock: false,
    featured: false,
    sort: 'created_at',
    order: 'desc',
  }
  currentSort.value = 'created_at-desc'
  router.push({ query: {} })
}

const goToPage = (page: number) => {
  fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Watch for route query changes
watch(() => route.query, (newQuery) => {
  filters.value.category = (newQuery.category as string) || ''
  filters.value.min_price = newQuery.min_price ? Number(newQuery.min_price) : undefined
  filters.value.max_price = newQuery.max_price ? Number(newQuery.max_price) : undefined
  filters.value.in_stock = newQuery.in_stock === 'true'
  filters.value.featured = newQuery.featured === 'true'
  filters.value.sort = (newQuery.sort as string) || 'created_at'
  filters.value.order = (newQuery.order as 'asc' | 'desc') || 'desc'
  currentSort.value = `${filters.value.sort}-${filters.value.order}`
  fetchProducts()
}, { deep: true })

onMounted(() => {
  fetchProducts()
  productStore.fetchCategories({ withCount: true })
})
</script>

<template>
  <div class="container-custom py-8">
    <div class="flex flex-col lg:flex-row gap-8">
      <!-- Sidebar Filters -->
      <aside class="lg:w-64 flex-shrink-0">
        <div class="card p-6 sticky top-24">
          <div class="flex justify-between items-center mb-6">
            <h2 class="font-semibold text-lg">Filters</h2>
            <button
              @click="clearFilters"
              class="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear all
            </button>
          </div>
          
          <!-- Categories -->
          <div class="mb-6">
            <h3 class="font-medium text-gray-900 mb-3">Category</h3>
            <div class="space-y-2">
              <label
                v-for="category in productStore.categories"
                :key="category.id"
                class="flex items-center cursor-pointer"
              >
                <input
                  type="radio"
                  :value="category.slug"
                  v-model="filters.category"
                  @change="applyFilters"
                  class="text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-gray-700">{{ category.name }}</span>
                <span v-if="category.products_count !== undefined" class="ml-auto text-gray-400 text-sm">
                  ({{ category.products_count }})
                </span>
              </label>
            </div>
          </div>
          
          <!-- Price Range -->
          <div class="mb-6">
            <h3 class="font-medium text-gray-900 mb-3">Price Range</h3>
            <div class="flex gap-2">
              <input
                v-model.number="filters.min_price"
                type="number"
                placeholder="Min"
                class="input text-sm"
                min="0"
              />
              <input
                v-model.number="filters.max_price"
                type="number"
                placeholder="Max"
                class="input text-sm"
                min="0"
              />
            </div>
            <button
              @click="applyFilters"
              class="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              Apply
            </button>
          </div>
          
          <!-- Other Filters -->
          <div class="space-y-3">
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="filters.in_stock"
                @change="applyFilters"
                class="text-primary-600 focus:ring-primary-500 rounded"
              />
              <span class="ml-2 text-gray-700">In Stock Only</span>
            </label>
            <label class="flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="filters.featured"
                @change="applyFilters"
                class="text-primary-600 focus:ring-primary-500 rounded"
              />
              <span class="ml-2 text-gray-700">Featured Only</span>
            </label>
          </div>
        </div>
      </aside>
      
      <!-- Products Grid -->
      <div class="flex-1">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Products</h1>
            <p class="text-gray-500">
              {{ totalProducts }} products found
            </p>
          </div>
          
          <select
            v-model="currentSort"
            @change="updateSort"
            class="input w-auto"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Loading -->
        <div v-if="productStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="card animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-4 space-y-3">
              <div class="h-3 bg-gray-200 rounded w-1/3"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <div class="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        <!-- Products -->
        <div v-else-if="productStore.products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <p class="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
          <button @click="clearFilters" class="btn-primary">
            Clear Filters
          </button>
        </div>
        
        <!-- Pagination -->
        <div v-if="productStore.pagination.lastPage > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center gap-1">
            <button
              @click="goToPage(productStore.pagination.currentPage - 1)"
              :disabled="productStore.pagination.currentPage === 1"
              class="btn-outline btn-sm"
            >
              Previous
            </button>
            
            <template v-for="page in productStore.pagination.lastPage" :key="page">
              <button
                v-if="Math.abs(page - productStore.pagination.currentPage) <= 2 || page === 1 || page === productStore.pagination.lastPage"
                @click="goToPage(page)"
                :class="[
                  'btn btn-sm min-w-[40px]',
                  page === productStore.pagination.currentPage
                    ? 'bg-primary-600 text-white'
                    : 'btn-outline'
                ]"
              >
                {{ page }}
              </button>
              <span
                v-else-if="Math.abs(page - productStore.pagination.currentPage) === 3"
                class="px-2 text-gray-400"
              >
                ...
              </span>
            </template>
            
            <button
              @click="goToPage(productStore.pagination.currentPage + 1)"
              :disabled="productStore.pagination.currentPage === productStore.pagination.lastPage"
              class="btn-outline btn-sm"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
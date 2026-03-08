import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { Product, Category } from '@/types'

interface ProductFilters {
  category?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  featured?: boolean
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const featuredProducts = ref<Product[]>([])
  const currentProduct = ref<Product | null>(null)
  const relatedProducts = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 12,
    total: 0,
  })

  function extractProducts(data: any): Product[] {
    // Try different response formats
    if (Array.isArray(data)) {
      return data
    }
    if (Array.isArray(data.data)) {
      return data.data
    }
    if (Array.isArray(data.products)) {
      return data.products
    }
    return []
  }

  function extractMeta(data: any) {
    if (data.meta) {
      return {
        currentPage: data.meta.current_page || 1,
        lastPage: data.meta.last_page || 1,
        perPage: data.meta.per_page || 12,
        total: data.meta.total || 0,
      }
    }
    return null
  }

  async function fetchProducts(filters: ProductFilters = {}) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/products', { params: filters })
      
      products.value = extractProducts(data)
      
      const meta = extractMeta(data)
      if (meta) {
        pagination.value = meta
      } else {
        pagination.value.total = products.value.length
      }

      return { success: true }
    } catch (err: any) {
      console.error('Fetch products error:', err)
      error.value = err.response?.data?.message || 'Failed to fetch products'
      products.value = []
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchFeaturedProducts(limit: number = 8) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/products/featured', { params: { limit } })
      
      featuredProducts.value = extractProducts(data)
      
      return { success: true }
    } catch (err: any) {
      console.error('Fetch featured error:', err)
      error.value = err.response?.data?.message || 'Failed to fetch featured products'
      featuredProducts.value = []
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(slug: string) {
    loading.value = true
    error.value = null
    currentProduct.value = null

    try {
      const { data } = await api.get(`/products/${slug}`)

      currentProduct.value = data.product || data
      relatedProducts.value = data.related || []

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Product not found'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(query: string, perPage: number = 12) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get('/products/search', {
        params: { q: query, per_page: perPage },
      })

      products.value = extractProducts(data)
      
      const meta = extractMeta(data)
      if (meta) {
        pagination.value = meta
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Search failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories(options: { withChildren?: boolean; withCount?: boolean } = {}) {
    try {
      const { data } = await api.get('/categories', {
        params: {
          with_children: options.withChildren,
          with_count: options.withCount,
        },
      })

      if (Array.isArray(data.categories)) {
        categories.value = data.categories
      } else if (Array.isArray(data)) {
        categories.value = data
      } else {
        categories.value = []
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      return { success: false, message: error.value }
    }
  }

  async function fetchCategoryTree() {
    try {
      const { data } = await api.get('/categories/tree')
      
      if (Array.isArray(data.categories)) {
        categories.value = data.categories
      } else if (Array.isArray(data)) {
        categories.value = data
      } else {
        categories.value = []
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      return { success: false, message: error.value }
    }
  }

  async function fetchProductsByCategory(categorySlug: string, filters: ProductFilters = {}) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.get(`/categories/${categorySlug}/products`, {
        params: filters,
      })

      products.value = extractProducts(data)
      
      const meta = extractMeta(data)
      if (meta) {
        pagination.value = meta
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch products'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  function resetProducts() {
    products.value = []
    pagination.value = {
      currentPage: 1,
      lastPage: 1,
      perPage: 12,
      total: 0,
    }
  }

  return {
    products,
    featuredProducts,
    currentProduct,
    relatedProducts,
    categories,
    loading,
    error,
    pagination,
    fetchProducts,
    fetchFeaturedProducts,
    fetchProduct,
    searchProducts,
    fetchCategories,
    fetchCategoryTree,
    fetchProductsByCategory,
    resetProducts,
  }
})
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingProduct = ref<any>(null)
const saving = ref(false)

const form = ref({
  name: '',
  category_id: '',
  description: '',
  short_description: '',
  price: 0,
  compare_price: null as number | null,
  sku: '',
  stock: 0,
  images: [''],
  featured: false,
  active: true,
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/products')
    products.value = data.products
  } catch (error) {
    console.error('Failed to fetch products:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/admin/categories')
    categories.value = data.categories
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
}

const openCreateModal = () => {
  editingProduct.value = null
  form.value = {
    name: '',
    category_id: '',
    description: '',
    short_description: '',
    price: 0,
    compare_price: null,
    sku: '',
    stock: 0,
    images: [''],
    featured: false,
    active: true,
  }
  showModal.value = true
}

const openEditModal = (product: any) => {
  editingProduct.value = product
  form.value = {
    name: product.name,
    category_id: product.category?.id || '',
    description: product.description,
    short_description: product.short_description || '',
    price: product.price,
    compare_price: product.compare_price,
    sku: product.sku,
    stock: product.stock,
    images: product.images?.length ? [...product.images] : [''],
    featured: product.featured,
    active: true,
  }
  showModal.value = true
}

const addImageField = () => {
  form.value.images.push('')
}

const removeImageField = (index: number) => {
  if (form.value.images.length > 1) {
    form.value.images.splice(index, 1)
  }
}

const saveProduct = async () => {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      images: form.value.images.filter(img => img.trim() !== ''),
      category_id: Number(form.value.category_id),
    }
    
    if (editingProduct.value) {
      await api.put(`/admin/products/${editingProduct.value.id}`, payload)
    } else {
      await api.post('/admin/products', payload)
    }
    
    showModal.value = false
    fetchProducts()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to save product')
  } finally {
    saving.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  
  try {
    await api.delete(`/admin/products/${id}`)
    fetchProducts()
  } catch (error) {
    alert('Failed to delete product')
  }
}

onMounted(() => {
  fetchProducts()
  fetchCategories()
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      <button @click="openCreateModal" class="btn-primary">
        + Add Product
      </button>
    </div>
    
    <!-- Products Table -->
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">Loading...</td>
          </tr>
          <tr v-else-if="products.length === 0">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No products found</td>
          </tr>
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img 
                  :src="product.primary_image || 'https://via.placeholder.com/40'" 
                  class="w-10 h-10 rounded-lg object-cover mr-3"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.sku }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ product.category?.name || '-' }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">${{ product.price.toFixed(2) }}</td>
            <td class="px-6 py-4">
              <span :class="[
                'text-sm font-medium',
                product.stock === 0 ? 'text-red-600' :
                product.stock <= 5 ? 'text-yellow-600' :
                'text-green-600'
              ]">
                {{ product.stock }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span v-if="product.featured" class="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                Featured
              </span>
              <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                Standard
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button 
                @click="openEditModal(product)" 
                class="text-primary-600 hover:text-primary-800 mr-3"
              >
                Edit
              </button>
              <button 
                @click="deleteProduct(product.id)" 
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="showModal = false"></div>
        
        <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold">
              {{ editingProduct ? 'Edit Product' : 'Add New Product' }}
            </h2>
          </div>
          
          <div class="p-6 space-y-4">
            <!-- Name -->
            <div>
              <label class="label">Product Name *</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            
            <!-- Category -->
            <div>
              <label class="label">Category *</label>
              <select v-model="form.category_id" class="input" required>
                <option value="">Select a category</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            
            <!-- Price Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">Price *</label>
                <input v-model.number="form.price" type="number" step="0.01" min="0" class="input" required />
              </div>
              <div>
                <label class="label">Compare Price (Original)</label>
                <input v-model.number="form.compare_price" type="number" step="0.01" min="0" class="input" />
              </div>
            </div>
            
            <!-- SKU and Stock -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">SKU</label>
                <input v-model="form.sku" type="text" class="input" placeholder="Auto-generated if empty" />
              </div>
              <div>
                <label class="label">Stock *</label>
                <input v-model.number="form.stock" type="number" min="0" class="input" required />
              </div>
            </div>
            
            <!-- Description -->
            <div>
              <label class="label">Description *</label>
              <textarea v-model="form.description" rows="4" class="input" required></textarea>
            </div>
            
            <!-- Short Description -->
            <div>
              <label class="label">Short Description</label>
              <input v-model="form.short_description" type="text" class="input" />
            </div>
            
            <!-- Images -->
            <div>
              <label class="label">Image URLs</label>
              <div v-for="(img, index) in form.images" :key="index" class="flex gap-2 mb-2">
                <input 
                  v-model="form.images[index]" 
                  type="url" 
                  class="input flex-1" 
                  placeholder="https://example.com/image.jpg"
                />
                <button 
                  v-if="form.images.length > 1"
                  @click="removeImageField(index)" 
                  type="button"
                  class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <button 
                @click="addImageField" 
                type="button"
                class="text-sm text-primary-600 hover:text-primary-800"
              >
                + Add another image
              </button>
            </div>
            
            <!-- Featured -->
            <div>
              <label class="flex items-center">
                <input v-model="form.featured" type="checkbox" class="rounded text-primary-600 mr-2" />
                <span>Featured product</span>
              </label>
            </div>
          </div>
          
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button @click="showModal = false" class="btn-secondary">
              Cancel
            </button>
            <button @click="saveProduct" :disabled="saving" class="btn-primary">
              {{ saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Create Product') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const categories = ref<any[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingCategory = ref<any>(null)
const saving = ref(false)

const form = ref({
  name: '',
  description: '',
  image: '',
  parent_id: null as number | null,
  sort_order: 0,
  active: true,
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/categories')
    categories.value = data.categories
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingCategory.value = null
  form.value = { name: '', description: '', image: '', parent_id: null, sort_order: 0, active: true }
  showModal.value = true
}

const openEditModal = (category: any) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    image: category.image || '',
    parent_id: category.parent_id,
    sort_order: category.sort_order || 0,
    active: true,
  }
  showModal.value = true
}

const saveCategory = async () => {
  saving.value = true
  try {
    if (editingCategory.value) {
      await api.put(`/admin/categories/${editingCategory.value.id}`, form.value)
    } else {
      await api.post('/admin/categories', form.value)
    }
    showModal.value = false
    fetchCategories()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to save category')
  } finally {
    saving.value = false
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Are you sure? This cannot be undone.')) return
  try {
    await api.delete(`/admin/categories/${id}`)
    fetchCategories()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete category')
  }
}

onMounted(fetchCategories)
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Categories</h1>
      <button @click="openCreateModal" class="btn-primary">+ Add Category</button>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="4" class="px-6 py-8 text-center text-gray-500">Loading...</td>
          </tr>
          <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img 
                  :src="category.image || 'https://via.placeholder.com/40'" 
                  class="w-10 h-10 rounded-lg object-cover mr-3"
                />
                <div>
                  <p class="font-medium text-gray-900">{{ category.name }}</p>
                  <p class="text-sm text-gray-500">{{ category.slug }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ category.parent_id ? categories.find(c => c.id === category.parent_id)?.name : '-' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ category.products_count || 0 }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openEditModal(category)" class="text-primary-600 hover:text-primary-800 mr-3">Edit</button>
              <button @click="deleteCategory(category.id)" class="text-red-600 hover:text-red-800">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="showModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="label">Name *</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            <div>
              <label class="label">Parent Category</label>
              <select v-model="form.parent_id" class="input">
                <option :value="null">None (Top Level)</option>
                <option v-for="cat in categories.filter(c => !c.parent_id)" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="label">Description</label>
              <textarea v-model="form.description" rows="3" class="input"></textarea>
            </div>
            <div>
              <label class="label">Image URL</label>
              <input v-model="form.image" type="url" class="input" placeholder="https://..." />
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button @click="showModal = false" class="btn-secondary">Cancel</button>
            <button @click="saveCategory" :disabled="saving" class="btn-primary">
              {{ saving ? 'Saving...' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
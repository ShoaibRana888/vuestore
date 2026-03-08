<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ name: '', email: '', password: '', password_confirmation: '' })
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  errors.value = {}
  if (!form.value.name) errors.value.name = 'Name is required'
  if (!form.value.email) errors.value.email = 'Email is required'
  if (!form.value.password) errors.value.password = 'Password is required'
  if (form.value.password !== form.value.password_confirmation) errors.value.password_confirmation = 'Passwords do not match'
  
  if (Object.keys(errors.value).length > 0) return
  
  isSubmitting.value = true
  const result = await authStore.register(form.value)
  isSubmitting.value = false
  
  if (result.success) {
    router.push('/')
  } else {
    errors.value.general = result.message || 'Registration failed'
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Create account</h1>
        <p class="text-gray-600 mt-2">Join us and start shopping</p>
      </div>
      
      <div class="card p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="errors.general" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-sm text-red-600">{{ errors.general }}</p>
          </div>
          
          <div>
            <label class="label">Name</label>
            <input v-model="form.name" type="text" :class="['input', errors.name ? 'input-error' : '']" />
          </div>
          
          <div>
            <label class="label">Email</label>
            <input v-model="form.email" type="email" :class="['input', errors.email ? 'input-error' : '']" />
          </div>
          
          <div>
            <label class="label">Password</label>
            <input v-model="form.password" type="password" :class="['input', errors.password ? 'input-error' : '']" />
          </div>
          
          <div>
            <label class="label">Confirm Password</label>
            <input v-model="form.password_confirmation" type="password" :class="['input', errors.password_confirmation ? 'input-error' : '']" />
          </div>
          
          <button type="submit" :disabled="isSubmitting" class="w-full btn-primary py-3">
            {{ isSubmitting ? 'Creating account...' : 'Create account' }}
          </button>
        </form>
        
        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <RouterLink to="/login" class="text-primary-600 font-medium">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

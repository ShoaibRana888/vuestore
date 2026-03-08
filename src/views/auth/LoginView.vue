<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()

const form = ref({
  email: '',
  password: '',
  remember: false,
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const demoAccounts = [
  {
    type: 'Admin',
    email: 'admin@example.com',
    password: 'password',
    description: 'Full access to admin panel, manage products, orders & categories',
    icon: '👑',
    color: 'from-purple-500 to-indigo-600',
    features: ['Admin Dashboard', 'Product Management', 'Order Management', 'Analytics'],
  },
  {
    type: 'Customer',
    email: 'customer@example.com',
    password: 'password',
    description: 'Browse products, add to cart, place orders & manage wishlist',
    icon: '🛒',
    color: 'from-cyan-500 to-blue-600',
    features: ['Shopping Cart', 'Order History', 'Wishlist', 'Account Settings'],
  },
]

const fillCredentials = (email: string, password: string) => {
  form.value.email = email
  form.value.password = password
}

const handleSubmit = async () => {
  errors.value = {}
  
  if (!form.value.email) errors.value.email = 'Email is required'
  if (!form.value.password) errors.value.password = 'Password is required'
  
  if (Object.keys(errors.value).length > 0) return
  
  isSubmitting.value = true
  
  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password,
    remember: form.value.remember,
  })
  
  isSubmitting.value = false
  
  if (result.success) {
    await cartStore.fetchCart()
    
    // Check if user is admin and redirect accordingly
    if (authStore.user?.role === 'admin') {
      router.push('/admin')
    } else {
      // Regular user - go to redirect URL or home
      const redirect = route.query.redirect as string
      router.push(redirect || '/')
    }
  } else {
    errors.value.general = result.message || 'Login failed'
  }
}
</script>

<template>
  <div class="min-h-[80vh] py-12 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl font-bold text-gray-900">Welcome to VueStore</h1>
        <p class="text-gray-600 mt-2">Sign in to explore the full e-commerce experience</p>
      </div>
      
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Demo Accounts Section -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">🎭 Demo Accounts</h2>
          <p class="text-sm text-gray-500 mb-6">Click on any account to auto-fill credentials and explore different user experiences.</p>
          
          <div 
            v-for="account in demoAccounts" 
            :key="account.type"
            @click="fillCredentials(account.email, account.password)"
            class="card p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 border-transparent hover:border-primary-200"
          >
            <div class="flex items-start gap-4">
              <div :class="['w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl', account.color]">
                {{ account.icon }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-semibold text-gray-900">{{ account.type }} Account</h3>
                  <span class="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">
                    Click to use
                  </span>
                </div>
                <p class="text-sm text-gray-500 mb-3">{{ account.description }}</p>
                
                <!-- Credentials -->
                <div class="bg-gray-50 rounded-lg p-3 mb-3">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-500">Email:</span>
                    <code class="text-gray-700 font-mono text-xs">{{ account.email }}</code>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Password:</span>
                    <code class="text-gray-700 font-mono text-xs">{{ account.password }}</code>
                  </div>
                </div>
                
                <!-- Features -->
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="feature in account.features" 
                    :key="feature"
                    class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {{ feature }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Info Box -->
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
            <div class="flex gap-3">
              <span class="text-blue-500 text-xl">💡</span>
              <div>
                <h4 class="font-medium text-blue-900 text-sm">Testing Tip</h4>
                <p class="text-blue-700 text-sm mt-1">
                  Admin users are automatically redirected to the admin panel after login. 
                  Customers stay on the storefront with access to shopping features.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Login Form -->
        <div class="card p-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Sign In</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <div v-if="errors.general" class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600">{{ errors.general }}</p>
            </div>
            
            <div>
              <label for="email" class="label">Email address</label>
              <input 
                id="email" 
                v-model="form.email" 
                type="email" 
                :class="['input', errors.email ? 'border-red-500' : '']" 
                placeholder="you@example.com" 
              />
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>
            
            <div>
              <label for="password" class="label">Password</label>
              <input 
                id="password" 
                v-model="form.password" 
                type="password" 
                :class="['input', errors.password ? 'border-red-500' : '']" 
                placeholder="••••••••" 
              />
              <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" v-model="form.remember" class="text-primary-600 focus:ring-primary-500 rounded" />
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
            </div>
            
            <button type="submit" :disabled="isSubmitting" class="w-full btn-primary py-3">
              <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
              <span v-else>Sign in</span>
            </button>
          </form>
          
          <div class="mt-6 pt-6 border-t border-gray-100">
            <p class="text-center text-sm text-gray-600">
              Don't have an account?
              <RouterLink to="/register" class="text-primary-600 hover:text-primary-700 font-medium">
                Sign up
              </RouterLink>
            </p>
          </div>
        </div>
      </div>
      
      <!-- Feature Highlights -->
      <div class="mt-12 grid sm:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🛍️</span>
          </div>
          <h3 class="font-medium text-gray-900">Full E-Commerce</h3>
          <p class="text-sm text-gray-500 mt-1">Browse products, filter by category, add to cart & checkout</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">⚙️</span>
          </div>
          <h3 class="font-medium text-gray-900">Admin Dashboard</h3>
          <p class="text-sm text-gray-500 mt-1">Manage products, categories, orders & view analytics</p>
        </div>
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span class="text-2xl">🔐</span>
          </div>
          <h3 class="font-medium text-gray-900">Role-Based Access</h3>
          <p class="text-sm text-gray-500 mt-1">Different experiences for admins & customers</p>
        </div>
      </div>
    </div>
  </div>
</template>
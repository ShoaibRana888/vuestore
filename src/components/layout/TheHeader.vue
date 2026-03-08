<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const cartItemCount = computed(() => cartStore.itemCount)

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'search', query: { q: searchQuery.value.trim() } })
    searchQuery.value = ''
  }
}

const handleLogout = async () => {
  await authStore.logout()
  cartStore.resetCart()
  userMenuOpen.value = false
  router.push({ name: 'home' })
}
</script>

<template>
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="container-custom">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">V</span>
          </div>
          <span class="font-bold text-xl text-gray-900">VueStore</span>
        </RouterLink>

        <!-- Search Bar (Desktop) -->
        <div class="hidden md:flex flex-1 max-w-lg mx-8">
          <form @submit.prevent="handleSearch" class="w-full relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="input pl-10 pr-4"
            />
            <svg
              class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </form>
        </div>

        <!-- Navigation (Desktop) -->
        <nav class="hidden md:flex items-center space-x-6">
          <RouterLink
            to="/products"
            class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Products
          </RouterLink>

          <!-- Cart -->
          <RouterLink to="/cart" class="relative p-2 text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartItemCount > 99 ? '99+' : cartItemCount }}
            </span>
          </RouterLink>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <button
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium">
                  {{ authStore.user?.name?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200"
              >
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.user?.name }}</p>
                  <p class="text-xs text-gray-500">{{ authStore.user?.email }}</p>
                </div>
                <RouterLink
                  v-if="authStore.user?.role === 'admin'"
                  to="/admin"
                  @click="userMenuOpen = false"
                  class="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-100"
                >
                  Admin Panel
                </RouterLink>
                <RouterLink
                  to="/account/orders"
                  @click="userMenuOpen = false"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  My Orders
                </RouterLink>
                <RouterLink
                  to="/account/wishlist"
                  @click="userMenuOpen = false"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Wishlist
                </RouterLink>
                <RouterLink
                  to="/account/settings"
                  @click="userMenuOpen = false"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </RouterLink>
                <button
                  @click="handleLogout"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </Transition>
          </div>

          <!-- Auth Links (Guest) -->
          <template v-else>
            <RouterLink
              to="/login"
              class="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Sign In
            </RouterLink>
            <RouterLink to="/register" class="btn-primary">
              Get Started
            </RouterLink>
          </template>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 text-gray-600"
        >
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t border-gray-200">
          <!-- Mobile Search -->
          <form @submit.prevent="handleSearch" class="mb-4">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="input"
            />
          </form>

          <nav class="space-y-2">
            <RouterLink
              to="/products"
              @click="mobileMenuOpen = false"
              class="block py-2 text-gray-600 hover:text-gray-900"
            >
              Products
            </RouterLink>
            <RouterLink
              to="/cart"
              @click="mobileMenuOpen = false"
              class="block py-2 text-gray-600 hover:text-gray-900"
            >
              Cart ({{ cartItemCount }})
            </RouterLink>
            
            <template v-if="authStore.isAuthenticated">
              <RouterLink
                to="/account/orders"
                @click="mobileMenuOpen = false"
                class="block py-2 text-gray-600 hover:text-gray-900"
              >
                My Orders
              </RouterLink>
              <button
                @click="handleLogout"
                class="block w-full text-left py-2 text-red-600"
              >
                Sign Out
              </button>
            </template>
            <template v-else>
              <RouterLink
                to="/login"
                @click="mobileMenuOpen = false"
                class="block py-2 text-gray-600 hover:text-gray-900"
              >
                Sign In
              </RouterLink>
              <RouterLink
                to="/register"
                @click="mobileMenuOpen = false"
                class="block py-2 text-primary-600 font-medium"
              >
                Get Started
              </RouterLink>
            </template>
          </nav>
        </div>
      </Transition>
    </div>
  </header>
</template>

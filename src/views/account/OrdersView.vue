<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/services/api'

const orders = ref<any[]>([])
const loading = ref(true)

const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/orders')
    orders.value = data.orders || data.data || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric' 
  })
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
}

onMounted(fetchOrders)
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
    
    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="card p-6 animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    
    <!-- Orders List -->
    <div v-else-if="orders.length > 0" class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <p class="font-semibold text-gray-900">{{ order.order_number }}</p>
            <p class="text-sm text-gray-500">{{ formatDate(order.created_at) }}</p>
          </div>
          <div class="mt-2 sm:mt-0 flex items-center gap-3">
            <span :class="['px-3 py-1 text-xs font-medium rounded-full', statusColors[order.status] || 'bg-gray-100 text-gray-800']">
              {{ order.status }}
            </span>
            <span class="font-semibold text-gray-900">{{ formatCurrency(order.total) }}</span>
          </div>
        </div>
        
        <!-- Order Items Preview -->
        <div class="border-t border-gray-100 pt-4">
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              <div 
                v-for="(item, index) in order.items?.slice(0, 3)" 
                :key="item.id"
                class="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 overflow-hidden"
              >
                <img 
                  v-if="item.product?.primary_image" 
                  :src="item.product.primary_image" 
                  class="w-full h-full object-cover"
                />
              </div>
              <div 
                v-if="order.items?.length > 3"
                class="w-12 h-12 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600"
              >
                +{{ order.items.length - 3 }}
              </div>
            </div>
            <p class="text-sm text-gray-500">{{ order.item_count || order.items?.length }} items</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="border-t border-gray-100 pt-4 mt-4 flex gap-3">
          <RouterLink 
            :to="`/account/orders/${order.id}`" 
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Details
          </RouterLink>
          <button 
            v-if="order.status === 'delivered'"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Reorder
          </button>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="card p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
      <p class="text-gray-500 mb-6">When you place an order, it will appear here.</p>
      <RouterLink to="/products" class="btn-primary">
        Start Shopping
      </RouterLink>
    </div>
  </div>
</template>
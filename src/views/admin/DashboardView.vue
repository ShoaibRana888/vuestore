<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const stats = ref<any>(null)
const recentOrders = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/dashboard')
    stats.value = data.stats
    recentOrders.value = data.recent_orders
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
    
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div v-for="i in 4" :key="i" class="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
    
    <div v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Total Products</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats?.total_products || 0 }}</p>
          <p class="text-sm text-green-600 mt-2">{{ stats?.active_products || 0 }} active</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Total Orders</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats?.total_orders || 0 }}</p>
          <p class="text-sm text-yellow-600 mt-2">{{ stats?.pending_orders || 0 }} pending</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Revenue</p>
          <p class="text-3xl font-bold text-gray-900">{{ formatCurrency(stats?.total_revenue || 0) }}</p>
          <p class="text-sm text-gray-500 mt-2">All time</p>
        </div>
        
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <p class="text-sm text-gray-500 mb-1">Customers</p>
          <p class="text-3xl font-bold text-gray-900">{{ stats?.total_customers || 0 }}</p>
          <p class="text-sm text-gray-500 mt-2">Registered users</p>
        </div>
      </div>
      
      <!-- Alerts -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div v-if="stats?.low_stock_products > 0" class="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-yellow-800 font-medium">{{ stats.low_stock_products }} products with low stock</span>
          </div>
        </div>
        
        <div v-if="stats?.out_of_stock_products > 0" class="bg-red-50 border border-red-200 rounded-xl p-4">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span class="text-red-800 font-medium">{{ stats.out_of_stock_products }} products out of stock</span>
          </div>
        </div>
      </div>
      
      <!-- Recent Orders -->
      <div class="bg-white rounded-xl shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold">Recent Orders</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="order in recentOrders" :key="order.id">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ order.order_number }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ order.customer }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ formatCurrency(order.total) }}</td>
                <td class="px-6 py-4">
                  <span :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  ]">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ order.created_at }}</td>
              </tr>
              <tr v-if="recentOrders.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">No orders yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const order = ref<any>(null)
const loading = ref(true)

const fetchOrder = async () => {
  loading.value = true
  try {
    const { data } = await api.get(`/orders/${route.params.id}`)
    order.value = data.order || data
  } catch (error) {
    console.error('Failed to fetch order:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

onMounted(fetchOrder)
</script>

<template>
  <div>
    <RouterLink to="/account/orders" class="text-primary-600 hover:text-primary-700 text-sm mb-4 inline-flex items-center">
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
      Back to Orders
    </RouterLink>
    
    <div v-if="loading" class="card p-6 animate-pulse">
      <div class="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
    
    <div v-else-if="order" class="space-y-6">
      <!-- Order Header -->
      <div class="card p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ order.order_number }}</h1>
            <p class="text-gray-500">Placed on {{ formatDate(order.created_at) }}</p>
          </div>
          <span :class="['px-4 py-2 text-sm font-medium rounded-full mt-4 sm:mt-0', statusColors[order.status]]">
            {{ order.status }}
          </span>
        </div>
      </div>
      
      <!-- Order Items -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">Order Items</h2>
        <div class="divide-y divide-gray-100">
          <div v-for="item in order.items" :key="item.id" class="py-4 flex gap-4">
            <div class="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                v-if="item.product?.primary_image" 
                :src="item.product.primary_image" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-900">{{ item.product_name }}</p>
              <p class="text-sm text-gray-500">SKU: {{ item.product_sku }}</p>
              <p class="text-sm text-gray-500">Qty: {{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-gray-900">{{ formatCurrency(item.total) }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Subtotal</span>
            <span>{{ formatCurrency(order.subtotal) }}</span>
          </div>
          <div v-if="order.discount > 0" class="flex justify-between text-sm">
            <span class="text-gray-500">Discount</span>
            <span class="text-green-600">-{{ formatCurrency(order.discount) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Shipping</span>
            <span>{{ order.shipping === 0 ? 'Free' : formatCurrency(order.shipping) }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Tax</span>
            <span>{{ formatCurrency(order.tax) }}</span>
          </div>
          <div class="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span>{{ formatCurrency(order.total) }}</span>
          </div>
        </div>
      </div>
      
      <!-- Shipping Address -->
      <div v-if="order.shipping_address" class="card p-6">
        <h2 class="text-lg font-semibold mb-4">Shipping Address</h2>
        <div class="text-gray-600">
          <p>{{ order.shipping_address.first_name }} {{ order.shipping_address.last_name }}</p>
          <p>{{ order.shipping_address.address }}</p>
          <p>{{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.zip }}</p>
          <p>{{ order.shipping_address.country }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
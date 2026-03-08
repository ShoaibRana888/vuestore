<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const orders = ref<any[]>([])
const loading = ref(true)
const selectedOrder = ref<any>(null)
const showModal = ref(false)
const newStatus = ref('')
const updating = ref(false)

const fetchOrders = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/admin/orders')
    orders.value = data.orders
  } catch (error) {
    console.error('Failed to fetch orders:', error)
  } finally {
    loading.value = false
  }
}

const openOrderModal = (order: any) => {
  selectedOrder.value = order
  newStatus.value = order.status
  showModal.value = true
}

const updateStatus = async () => {
  if (!selectedOrder.value) return
  updating.value = true
  try {
    await api.patch(`/admin/orders/${selectedOrder.value.id}/status`, { status: newStatus.value })
    showModal.value = false
    fetchOrders()
  } catch (error) {
    alert('Failed to update order status')
  } finally {
    updating.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
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
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">Loading...</td>
          </tr>
          <tr v-else-if="orders.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">No orders yet</td>
          </tr>
          <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">{{ order.order_number }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ order.user?.name || 'Guest' }}</td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ order.item_count }} items</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ formatCurrency(order.total) }}</td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 text-xs font-medium rounded-full', statusColors[order.status]]">
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(order.created_at) }}</td>
            <td class="px-6 py-4 text-right">
              <button @click="openOrderModal(order)" class="text-primary-600 hover:text-primary-800">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Order Modal -->
    <div v-if="showModal && selectedOrder" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="showModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold">Order {{ selectedOrder.order_number }}</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-500">Customer</p>
                <p class="font-medium">{{ selectedOrder.user?.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="font-medium">{{ selectedOrder.user?.email }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Total</p>
                <p class="font-medium text-lg">{{ formatCurrency(selectedOrder.total) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Date</p>
                <p class="font-medium">{{ formatDate(selectedOrder.created_at) }}</p>
              </div>
            </div>
            
            <div class="mb-6">
              <p class="text-sm text-gray-500 mb-2">Update Status</p>
              <select v-model="newStatus" class="input">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div>
              <p class="text-sm text-gray-500 mb-2">Items</p>
              <div class="border rounded-lg divide-y">
                <div v-for="item in selectedOrder.items" :key="item.id" class="p-3 flex justify-between">
                  <div>
                    <p class="font-medium">{{ item.product_name }}</p>
                    <p class="text-sm text-gray-500">Qty: {{ item.quantity }} × {{ formatCurrency(item.price) }}</p>
                  </div>
                  <p class="font-medium">{{ formatCurrency(item.total) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button @click="showModal = false" class="btn-secondary">Close</button>
            <button @click="updateStatus" :disabled="updating" class="btn-primary">
              {{ updating ? 'Updating...' : 'Update Status' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
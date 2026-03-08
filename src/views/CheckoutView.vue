<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'
import { loadStripe } from '@stripe/stripe-js'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const step = ref(1)
const loading = ref(false)
const error = ref('')

const form = ref({
  shipping_address: {
    first_name: '', last_name: '', address: '', city: '', state: '', zip: '', country: 'US', phone: ''
  },
  billing_address: {
    first_name: '', last_name: '', address: '', city: '', state: '', zip: '', country: 'US', phone: ''
  },
  billing_same_as_shipping: true,
  coupon_code: '',
  notes: ''
})

const processPayment = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // Create payment intent
    const { data } = await api.post('/checkout/payment-intent', form.value)
    
    // Initialize Stripe
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    if (!stripe) throw new Error('Stripe failed to load')
    
    const elements = stripe.elements({ clientSecret: data.client_secret })
    const paymentElement = elements.create('payment')
    paymentElement.mount('#payment-element')
    
    step.value = 2
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Checkout failed'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (cartStore.isEmpty) router.push('/cart')
  cartStore.fetchCart()
})
</script>

<template>
  <div class="container-custom py-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
    
    <div class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="card p-6">
          <h2 class="text-lg font-semibold mb-6">Shipping Address</h2>
          
          <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {{ error }}
          </div>
          
          <form @submit.prevent="processPayment" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="label">First Name</label>
                <input v-model="form.shipping_address.first_name" type="text" class="input" required />
              </div>
              <div>
                <label class="label">Last Name</label>
                <input v-model="form.shipping_address.last_name" type="text" class="input" required />
              </div>
            </div>
            
            <div>
              <label class="label">Address</label>
              <input v-model="form.shipping_address.address" type="text" class="input" required />
            </div>
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="label">City</label>
                <input v-model="form.shipping_address.city" type="text" class="input" required />
              </div>
              <div>
                <label class="label">State</label>
                <input v-model="form.shipping_address.state" type="text" class="input" required />
              </div>
              <div>
                <label class="label">ZIP</label>
                <input v-model="form.shipping_address.zip" type="text" class="input" required />
              </div>
            </div>
            
            <label class="flex items-center mt-4">
              <input type="checkbox" v-model="form.billing_same_as_shipping" class="text-primary-600 rounded" />
              <span class="ml-2 text-sm">Billing address same as shipping</span>
            </label>
            
            <div id="payment-element" class="mt-6"></div>
            
            <button type="submit" :disabled="loading" class="w-full btn-primary py-3 mt-6">
              {{ loading ? 'Processing...' : 'Continue to Payment' }}
            </button>
          </form>
        </div>
      </div>
      
      <div>
        <div class="card p-6 sticky top-24">
          <h2 class="text-lg font-semibold mb-4">Order Summary</h2>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span>Subtotal</span>
              <span>${{ cartStore.summary.subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Shipping</span>
              <span>{{ cartStore.summary.shipping === 0 ? 'FREE' : `$${cartStore.summary.shipping.toFixed(2)}` }}</span>
            </div>
            <div class="flex justify-between">
              <span>Tax</span>
              <span>${{ cartStore.summary.tax.toFixed(2) }}</span>
            </div>
            <div class="border-t pt-3 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>${{ cartStore.summary.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

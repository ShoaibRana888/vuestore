<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const profileForm = ref({
  name: '',
  email: '',
  phone: '',
})

const passwordForm = ref({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const profileLoading = ref(false)
const passwordLoading = ref(false)
const profileMessage = ref('')
const passwordMessage = ref('')
const profileError = ref('')
const passwordError = ref('')

const updateProfile = async () => {
  profileLoading.value = true
  profileMessage.value = ''
  profileError.value = ''
  
  const result = await authStore.updateProfile(profileForm.value)
  
  if (result.success) {
    profileMessage.value = 'Profile updated successfully!'
  } else {
    profileError.value = result.message || 'Failed to update profile'
  }
  
  profileLoading.value = false
}

const updatePassword = async () => {
  passwordLoading.value = true
  passwordMessage.value = ''
  passwordError.value = ''
  
  if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
    passwordError.value = 'Passwords do not match'
    passwordLoading.value = false
    return
  }
  
  const result = await authStore.updatePassword(
    passwordForm.value.current_password,
    passwordForm.value.password,
    passwordForm.value.password_confirmation
  )
  
  if (result.success) {
    passwordMessage.value = 'Password updated successfully!'
    passwordForm.value = { current_password: '', password: '', password_confirmation: '' }
  } else {
    passwordError.value = result.message || 'Failed to update password'
  }
  
  passwordLoading.value = false
}

onMounted(() => {
  if (authStore.user) {
    profileForm.value = {
      name: authStore.user.name || '',
      email: authStore.user.email || '',
      phone: authStore.user.phone || '',
    }
  }
})
</script>

<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Account Settings</h1>
    
    <!-- Profile Settings -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Profile Information</h2>
      
      <div v-if="profileMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        {{ profileMessage }}
      </div>
      <div v-if="profileError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ profileError }}
      </div>
      
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <label class="label">Full Name</label>
          <input v-model="profileForm.name" type="text" class="input" required />
        </div>
        
        <div>
          <label class="label">Email Address</label>
          <input v-model="profileForm.email" type="email" class="input" required />
        </div>
        
        <div>
          <label class="label">Phone Number</label>
          <input v-model="profileForm.phone" type="tel" class="input" placeholder="Optional" />
        </div>
        
        <button type="submit" :disabled="profileLoading" class="btn-primary">
          {{ profileLoading ? 'Saving...' : 'Save Changes' }}
        </button>
      </form>
    </div>
    
    <!-- Password Settings -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Change Password</h2>
      
      <div v-if="passwordMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        {{ passwordMessage }}
      </div>
      <div v-if="passwordError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        {{ passwordError }}
      </div>
      
      <form @submit.prevent="updatePassword" class="space-y-4">
        <div>
          <label class="label">Current Password</label>
          <input v-model="passwordForm.current_password" type="password" class="input" required />
        </div>
        
        <div>
          <label class="label">New Password</label>
          <input v-model="passwordForm.password" type="password" class="input" required minlength="8" />
        </div>
        
        <div>
          <label class="label">Confirm New Password</label>
          <input v-model="passwordForm.password_confirmation" type="password" class="input" required />
        </div>
        
        <button type="submit" :disabled="passwordLoading" class="btn-primary">
          {{ passwordLoading ? 'Updating...' : 'Update Password' }}
        </button>
      </form>
    </div>
    
    <!-- Account Info -->
    <div class="card p-6">
      <h2 class="text-lg font-semibold mb-4">Account Information</h2>
      <div class="text-sm text-gray-600 space-y-2">
        <p><span class="text-gray-500">Account Type:</span> {{ authStore.user?.role === 'admin' ? 'Administrator' : 'Customer' }}</p>
        <p><span class="text-gray-500">Member Since:</span> {{ new Date(authStore.user?.created_at || '').toLocaleDateString() }}</p>
      </div>
    </div>
  </div>
</template>
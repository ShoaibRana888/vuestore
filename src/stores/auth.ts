import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { User } from '@/types'

interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Set token in axios headers
  const setAuthHeader = (authToken: string | null) => {
    if (authToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }

  // Initialize auth header if token exists
  if (token.value) {
    setAuthHeader(token.value)
  }

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.post('/login', credentials)

      token.value = data.token
      user.value = data.user
      
      localStorage.setItem('auth_token', data.token)
      setAuthHeader(data.token)

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/register', data)

      token.value = response.data.token
      user.value = response.data.user
      
      localStorage.setItem('auth_token', response.data.token)
      setAuthHeader(response.data.token)

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Registration failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/logout')
    } catch (err) {
      // Ignore logout errors
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      setAuthHeader(null)
    }
  }

  async function fetchUser() {
    if (!token.value) return { success: false }

    loading.value = true
    try {
      const { data } = await api.get('/user')
      user.value = data.user
      return { success: true }
    } catch (err: any) {
      // Token is invalid, clear it
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
      setAuthHeader(null)
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(profileData: Partial<User>) {
    loading.value = true
    error.value = null

    try {
      const { data } = await api.put('/user/profile', profileData)
      user.value = data.user
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Update failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updatePassword(currentPassword: string, password: string, passwordConfirmation: string) {
    loading.value = true
    error.value = null

    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: password,
        password_confirmation: passwordConfirmation,
      })
      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Password update failed'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    updatePassword,
  }
})
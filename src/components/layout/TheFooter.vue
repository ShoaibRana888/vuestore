<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="bg-gray-900 text-gray-400">
    <div class="container-custom py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="space-y-4">
          <RouterLink to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">V</span>
            </div>
            <span class="font-bold text-xl text-white">VueStore</span>
          </RouterLink>
          <p class="text-sm">
            Your one-stop shop for quality products. Built with Vue.js and Laravel.
          </p>
        </div>

        <!-- Shop -->
        <div>
          <h3 class="text-white font-semibold mb-4">Shop</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/products" class="hover:text-white transition-colors">
                All Products
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/products?featured=true" class="hover:text-white transition-colors">
                Featured
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/categories/electronics" class="hover:text-white transition-colors">
                Electronics
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/categories/clothing" class="hover:text-white transition-colors">
                Clothing
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Account -->
        <div>
          <h3 class="text-white font-semibold mb-4">Account</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <RouterLink to="/account/orders" class="hover:text-white transition-colors">
                My Orders
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/account/wishlist" class="hover:text-white transition-colors">
                Wishlist
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/cart" class="hover:text-white transition-colors">
                Cart
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/account/settings" class="hover:text-white transition-colors">
                Settings
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div>
          <h3 class="text-white font-semibold mb-4">Support</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="#" class="hover:text-white transition-colors">Help Center</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Shipping Info</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Returns</a>
            </li>
            <li>
              <a href="#" class="hover:text-white transition-colors">Contact Us</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-sm">
          &copy; {{ new Date().getFullYear() }} VueStore. All rights reserved.
        </p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
</template>

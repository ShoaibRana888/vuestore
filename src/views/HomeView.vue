<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useProductStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'

const productStore = useProductStore()

onMounted(async () => {
  await productStore.fetchFeaturedProducts(8)
  await productStore.fetchCategoryTree()
})
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div class="container-custom py-20 md:py-32">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Shop the Best Products Online
          </h1>
          <p class="text-xl text-primary-100 mb-8">
            Discover amazing deals on electronics, clothing, home goods, and more. 
            Free shipping on orders over $100.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <RouterLink
              to="/products"
              class="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              Shop Now
            </RouterLink>
            <RouterLink
              to="/products?featured=true"
              class="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
            >
              View Featured
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Free Shipping</h3>
              <p class="text-sm text-gray-500">On orders over $100</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Secure Payment</h3>
              <p class="text-sm text-gray-500">100% protected</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Easy Returns</h3>
              <p class="text-sm text-gray-500">30-day return policy</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">24/7 Support</h3>
              <p class="text-sm text-gray-500">Here to help</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="py-16">
      <div class="container-custom">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <RouterLink
            v-for="category in productStore.categories"
            :key="category.id"
            :to="`/categories/${category.slug}`"
            class="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
          >
            <img
              :src="category.image || `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop`"
              :alt="category.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-4 left-4 right-4">
              <h3 class="text-white font-semibold text-lg">{{ category.name }}</h3>
              <p v-if="category.product_count" class="text-white/80 text-sm">
                {{ category.product_count }} products
              </p>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="py-16 bg-gray-100">
      <div class="container-custom">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          <RouterLink
            to="/products?featured=true"
            class="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </RouterLink>
        </div>
        
        <div v-if="productStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="card animate-pulse">
            <div class="aspect-square bg-gray-200"></div>
            <div class="p-4 space-y-3">
              <div class="h-3 bg-gray-200 rounded w-1/3"></div>
              <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              <div class="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ProductCard
            v-for="product in productStore.featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="py-16 bg-primary-600">
      <div class="container-custom text-center">
        <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">
          Subscribe to Our Newsletter
        </h2>
        <p class="text-primary-100 mb-8 max-w-2xl mx-auto">
          Get the latest updates on new products and upcoming sales. No spam, we promise!
        </p>
        <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 input"
          />
          <button type="submit" class="btn bg-white text-primary-600 hover:bg-gray-100 px-8">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

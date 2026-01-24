<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProductFilters from '@/components/shop/ProductFilters.vue'
import CartDrawer from '@/components/shop/CartDrawer.vue' 

import { useProductsStore, useCartStore, useFavoritesStore } from '@/stores'
import { storeToRefs } from 'pinia'

// Stores
const productsStore = useProductsStore()
const cartStore = useCartStore()
const favoritesStore = useFavoritesStore()

const { loading, products, categories } = storeToRefs(productsStore)

// State
const selectedCategories = ref<string[]>([])

// Init
onMounted(() => {
  productsStore.fetchAllProducts()
})

// Filter Logic
const filteredProducts = computed(() => {
  let result = products.value
  
  if (selectedCategories.value.length > 0) {
    result = result.filter(p => p.category_name && selectedCategories.value.includes(p.category_name))
  }
  
  return result
})

// Handlers
const handleAddToCart = (product: any) => {
  cartStore.addItem(product)
}

const toggleFavorite = (product: any) => {
  favoritesStore.toggle(product.id)
}

const handleFiltersUpdate = (filters: any) => {
  selectedCategories.value = filters.categories || []
}
</script>

<template>
  <div class="products-page min-h-screen bg-dark">
    <AppHeader />
    
    <main class="pt-32 pb-20">
      <CartDrawer />

      <div class="container-custom">
        <div class="text-center mb-16">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Косметика
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">
            Премиальная мужская косметика от ведущих брендов
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-8">
          <!-- Sidebar Filters -->
          <aside class="lg:w-1/4">
             <ProductFilters 
               :categories="categories.map(c => ({ id: c, title: c }))" 
               @update:filters="handleFiltersUpdate" 
             />
          </aside>

          <!-- Product Grid -->
          <div class="lg:w-3/4">
             <!-- Loading State -->
             <div v-if="loading" class="text-center py-20">
                <span class="text-2xl text-m19-gold animate-pulse">Загрузка товаров...</span>
             </div>

             <!-- Empty State -->
             <div v-else-if="filteredProducts.length === 0" class="text-center py-20 text-white/50">
               Товары не найдены
             </div>

             <!-- Grid -->
             <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="card-premium p-0 overflow-hidden group flex flex-col"
                >
                  <!-- Image -->
                  <div class="aspect-square bg-white relative overflow-hidden">
                    <img 
                      v-if="product.image_url" 
                      :src="product.image_url" 
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-4xl">
                      🧴
                    </div>

                    <!-- Overlay Buttons -->
                    <div class="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center gap-2 bg-gradient-to-t from-dark/90 to-transparent pt-12">
                       <button 
                         @click.stop="toggleFavorite(product)"
                         class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center text-white transition-colors"
                         :class="{ 'text-red-500': favoritesStore.isFavorite(product.id) }"
                       >
                         ♥
                       </button>
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="p-6 flex-1 flex flex-col">
                    <div class="mb-auto">
                      <div class="text-xs text-m19-gold uppercase tracking-wider mb-2">{{ product.category_name }}</div>
                      <h3 class="text-lg font-heading font-bold text-white mb-2 leading-tight">
                        {{ product.title }}
                      </h3>
                      <p class="text-white/60 text-sm line-clamp-2" :title="product.description">{{ product.description }}</p>
                    </div>

                    <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div class="text-xl font-bold text-white">{{ product.price }} ₽</div>
                      <button
                        @click="handleAddToCart(product)"
                        class="px-4 py-2 bg-m19-gold text-dark font-medium rounded hover:bg-white transition-colors text-sm"
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import ProductFilters from '@/components/shop/ProductFilters.vue'
import { useToast } from '@/composables/useToast'

import { useProductsStore, useCartStore } from '@/stores'
import { storeToRefs } from 'pinia'

// Stores
const productsStore = useProductsStore()
const cartStore = useCartStore()
const { success } = useToast()

import { useHead } from '@unhead/vue'

useHead({
  title: 'Магазин косметики - M19 Barbershop',
  meta: [
    {
      name: 'description',
      content: 'Купить премиальную мужскую косметику в Ташкенте. Шампуни, средства для укладки, масло для бороды от лучших мировых брендов.'
    },
    { property: 'og:title', content: 'Магазин косметики - M19 Barbershop' },
    { property: 'og:description', content: 'Премиальная мужская косметика в Ташкенте.' },
    { property: 'og:image', content: 'https://m19barbershop.uz/barbershop-2.png' },
    { property: 'og:url', content: 'https://m19barbershop.uz/products' }
  ]
})

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

// Helpers
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('uz-UZ').format(price) + ' сум'
}

// Handlers
const handleAddToCart = (product: any) => {
  cartStore.addItem(product)
  success('Товар добавлен в корзину')
}

const handleFiltersUpdate = (filters: any) => {
  selectedCategories.value = filters.categories || []
}

// Cart Logic
const { items: cartItems } = storeToRefs(cartStore)

const getCartItem = (productId: number) => {
  return cartItems.value.find((item: any) => item.id === productId)
}

const updateItemQuantity = (productId: number, quantity: number) => {
  if (quantity <= 0) {
    cartStore.removeItem(productId)
  } else {
    cartStore.updateQuantity(productId, quantity)
  }
}
</script>

<template>
  <div class="products-page min-h-screen bg-dark">
    <AppHeader />
    
    <main class="pt-32 pb-20">

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
                       <!-- Buttons removed -->
                    </div>
                  </div>

                  <!-- Info -->
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
                      <div class="text-xl font-bold text-white">{{ formatPrice(product.price) }}</div>
                      
                      <div v-if="getCartItem(product.id)" class="flex items-center bg-premium-gold rounded text-dark overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.4)] animate-in fade-in zoom-in duration-300">
                        <button 
                          @click="updateItemQuantity(product.id, getCartItem(product.id)!.quantity - 1)"
                          class="w-8 h-full flex items-center justify-center hover:bg-black/10 active:bg-black/20 transition-colors font-bold text-lg"
                        >−</button>
                        <span class="w-8 text-center font-bold text-dark-500 leading-none">{{ getCartItem(product.id)!.quantity }}</span>
                        <button 
                          @click="updateItemQuantity(product.id, getCartItem(product.id)!.quantity + 1)"
                          class="w-8 h-full flex items-center justify-center hover:bg-black/10 active:bg-black/20 transition-colors font-bold text-lg"
                        >+</button>
                      </div>
                      
                      <button
                        v-else
                        @click="handleAddToCart(product)"
                        class="cursor-pointer px-6 py-2 bg-white hover:bg-premium-gold hover:text-dark hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] text-dark font-bold uppercase tracking-wide rounded transition-all duration-300 transform hover:-translate-y-0.5 text-xs shadow-lg"
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


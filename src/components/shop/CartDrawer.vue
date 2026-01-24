<template>
  <Teleport to="body">
    <Transition name="slide-fade">
      <div v-if="appStore.isCartOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="appStore.closeCart()"
        ></div>

        <!-- Drawer -->
        <div class="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col p-6 animate-slide-in">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-serif text-m19-dark">Корзина</h2>
            <button 
              @click="appStore.closeCart()"
              class="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Empty State -->
          <div v-if="cartStore.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-center">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p class="text-slate-500 mb-4">Ваша корзина пуста</p>
            <button 
              @click="appStore.closeCart()"
              class="text-m19-gold font-medium hover:underline"
            >
              Перейти к покупкам
            </button>
          </div>

          <!-- Items List -->
          <div v-else class="flex-1 overflow-y-auto -mx-6 px-6 space-y-4">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="flex gap-4"
            >
              <!-- Image -->
              <div class="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.image"
                  :src="item.image" 
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                  📷
                </div>
              </div>

              <!-- Info -->
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h4 class="font-medium text-m19-dark line-clamp-2">{{ item.title }}</h4>
                  <p class="text-sm text-m19-gold font-medium">{{ item.price }} ₽</p>
                </div>

                <div class="flex items-center justify-between mt-2">
                  <div class="flex items-center border border-slate-200 rounded-lg">
                    <button 
                      @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                      class="px-2 py-1 hover:bg-slate-50 text-slate-500"
                    >
                      -
                    </button>
                    <span class="px-2 text-sm">{{ item.quantity }}</span>
                    <button 
                      @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                      class="px-2 py-1 hover:bg-slate-50 text-slate-500"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    @click="cartStore.removeItem(item.id)"
                    class="text-xs text-red-500 hover:text-red-600"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer / Checkout -->
          <div v-if="cartStore.items.length > 0" class="mt-6 border-t pt-4">
            <div class="flex justify-between items-end mb-4">
              <span class="text-slate-500">Итого:</span>
              <span class="text-2xl font-serif text-m19-dark">{{ cartStore.totalPrice }} ₽</span>
            </div>

            <button 
              @click="handleCheckout"
              :disabled="loading"
              class="w-full py-3 bg-m19-dark text-white rounded-lg font-medium hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span v-if="loading" class="animate-spin">⌛</span>
              {{ loading ? 'Оформление...' : 'Оформить заказ' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore, useCartStore, useAuthStore } from '@/stores'
import { altegService } from '@/services/alteg.service'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const loading = ref(false)

const handleCheckout = async () => {
  if (!authStore.isAuthenticated) {
    appStore.closeCart()
    router.push('/login')
    return
  }

  loading.value = true
  try {
    const orderData = {
      client: authStore.user,
      items: cartStore.items,
      total: cartStore.totalPrice,
      staff_id: 0 // Technical staff
    }

    const res = await altegService.createOrder(orderData)
    
    // Clear cart
    cartStore.clearCart()
    appStore.closeCart()
    
    // Show success (Toast or Alert)
    alert(`Заказ успешно оформлен! Номер заказа: ${res.id || 'N/A'}`)
  } catch (e) {
    console.error(e)
    alert('Ошибка при оформлении заказа')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}
</style>

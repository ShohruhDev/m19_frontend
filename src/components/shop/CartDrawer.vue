<template>
  <Teleport to="body">
    <Transition name="slide-fade">
      <div v-if="appStore.isCartOpen" class="fixed inset-0 z-50 flex justify-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/60 backdrop-blur-md"
          @click="appStore.closeCart()"
        ></div>

        <!-- Drawer -->
        <div class="relative w-full max-w-lg h-full bg-dark-900 shadow-2xl flex flex-col animate-slide-in">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-white/10">
            <h2 class="text-2xl font-heading text-white">Корзина</h2>
            <button 
              @click="appStore.closeCart()"
              class="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white/70 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

            <!-- Success State -->
            <div v-if="success" class="flex-1 flex flex-col items-center justify-center text-center px-6 animate-slide-in">
              <div class="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 ring-2 ring-green-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 class="text-2xl font-heading text-white mb-2">Заказ принят!</h3>
              <p class="text-white/60 mb-6">Номер заказа: <span class="text-gold-500 font-bold">#{{ orderId }}</span></p>
              <p class="text-sm text-white/40 mb-8 max-w-xs">
                Мы свяжемся с вами в ближайшее время для подтверждения.
              </p>
              <button 
                @click="closeSuccess"
                class="px-8 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10 hover:border-white/20"
              >
                Отлично
              </button>
            </div>

            <!-- Empty State -->
            <div v-else-if="cartStore.items.length === 0" class="flex-1 flex flex-col items-center justify-center text-center px-6">
              <div class="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mb-4 backdrop-blur">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p class="text-lg text-white/60 mb-2">Ваша корзина пуста</p>
              <p class="text-sm text-white/40 mb-6">Добавьте товары для оформления заказа</p>
              <button 
                @click="appStore.closeCart()"
                class="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-dark font-heading font-medium rounded-lg transition-all duration-300"
              >
                Перейти к покупкам
              </button>
            </div>

            <!-- Items List -->
            <div v-else-if="!success" class="flex-1 overflow-y-auto px-6 py-4">
              <TransitionGroup name="cart-item" tag="div" class="space-y-4">
              <div 
                v-for="item in cartStore.items" 
                :key="item.id"
                class="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-gold-500/50 transition-all duration-300"
              >
                <div class="flex gap-4">
                  <!-- Image -->
                  <div class="relative w-24 h-24 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-white/5 group-hover:ring-gold-500/30 transition-all">
                    <img 
                      v-if="item.image"
                      :src="item.image" 
                      :alt="item.title"
                      class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                      📦
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 class="font-heading font-medium text-white text-lg line-clamp-1 mb-1">{{ item.title }}</h4>
                      <div class="flex items-baseline gap-2">
                        <span class="text-xl font-heading text-gold-500">{{ formatPrice(item.price * item.quantity) }}</span>
                        <span class="text-sm text-white/40">({{ formatPrice(item.price) }} × {{ item.quantity }})</span>
                      </div>
                    </div>

                    <div class="flex items-center justify-between mt-3">
                      <!-- Quantity Controls -->
                      <div class="flex items-center gap-2 bg-dark-800/50 border border-white/10 rounded-lg p-1">
                        <button 
                          @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                          class="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-white/70 hover:text-gold-500 transition-all font-medium"
                        >
                          −
                        </button>
                        <span class="w-8 text-center font-heading text-white">{{ item.quantity }}</span>
                        <button 
                          @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                          class="w-8 h-8 flex items-center justify-center hover:bg-white/5 rounded-md text-white/70 hover:text-gold-500 transition-all font-medium"
                        >
                          +
                        </button>
                      </div>

                      <!-- Remove Button -->
                      <button 
                        @click="cartStore.removeItem(item.id)"
                        class="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors font-medium uppercase tracking-wide"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>

            <!-- Guest Checkout Form -->
            <div v-if="cartStore.items.length > 0 && !success" class="px-6 py-4 bg-white/5 border-t border-white/10 space-y-3">
              <h3 class="text-white font-heading text-sm uppercase tracking-wide opacity-70">Контактные данные</h3>
              <div>
                <input 
                  v-model="clientName"
                  type="text" 
                  placeholder="Ваше имя"
                  class="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <input 
                  v-model="clientPhone"
                  type="tel" 
                  placeholder="+998 90 123 45 67"
                  class="w-full bg-dark-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:border-gold-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <!-- Footer / Checkout -->
            <div v-if="cartStore.items.length > 0 && !success" class="p-6 border-t border-white/10 bg-dark-900/95 backdrop-blur">
              <!-- Subtotal -->
              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-white/60">
                  <span>Товаров:</span>
                  <span>{{ cartStore.items.length }}</span>
                </div>
                <div class="flex justify-between items-baseline pt-3 border-t border-white/5">
                  <span class="text-lg text-white/80 font-heading">Итого:</span>
                  <span class="text-3xl font-heading text-gold-500">{{ formatPrice(cartStore.totalPrice) }}</span>
                </div>
              </div>

              <!-- Checkout Button -->
              <button 
                @click="handleCheckout"
                :disabled="loading || !isValidOrder"
                class="w-full py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-dark rounded-xl font-heading font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-gold-500/20 hover:shadow-gold-500/40 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span v-if="loading" class="animate-spin">⌛</span>
                {{ loading ? 'Оформляется...' : 'Оформить заказ' }}
              </button>

              <!-- Continue Shopping -->
              <button 
                @click="appStore.closeCart()"
                class="w-full mt-3 py-2 text-white/60 hover:text-gold-500 font-medium text-sm transition-colors"
              >
                Продолжить покупки
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useAppStore, useCartStore } from '@/stores'
  import { useRouter } from 'vue-router'
  
  const appStore = useAppStore()
  const cartStore = useCartStore()
  const router = useRouter()
  const loading = ref(false)
  const success = ref(false)
  const orderId = ref<string | number>('')
  
  const clientName = ref('')
  const clientPhone = ref('+998 ')
  
  const isValidOrder = computed(() => {
    return clientName.value.trim().length > 2 && clientPhone.value.length >= 9
  })
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price).replace('UZS', 'сўм')
  }
  
  const handleCheckout = async () => {
    if (!isValidOrder.value) return
  
    loading.value = true
    try {
      const orderData = {
        client_info: {
          name: clientName.value,
          phone: clientPhone.value
        },
        items: cartStore.items,
        total: cartStore.totalPrice
      }
  
      // Send to Backend API
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://m19-backend.vercel.app/api'
      const response = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })
      
      const res = await response.json()
      
      if (!res.success) {
        throw new Error(res.message || 'Ошибка оформления')
      }
      
      // Success state
      orderId.value = res.data.id
      success.value = true
      cartStore.clearCart()
      
    } catch (e: any) {
      console.error(e)
      alert('Ошибка при оформлении заказа: ' + e.message)
    } finally {
      loading.value = false
    }
  }

  const closeSuccess = () => {
    success.value = false
    appStore.closeCart()
    // Reset form
    clientName.value = ''
    clientPhone.value = '+998 '
  }
  </script>

<style scoped>
.slide-fade-enter-active {
  transition: opacity 0.3s ease;
}

.slide-fade-leave-active {
  transition: opacity 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.animate-slide-in {
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* Cart item animations */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.cart-item-move {
  transition: transform 0.3s ease;
}
</style>

<template>
  <div class="products-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom">
        <div class="text-center mb-16">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Косметика для ухода
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">
            Премиальная мужская косметика от ведущих брендов
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(product, index) in products"
            :key="index"
            class="card-premium p-0 overflow-hidden group"
          >
            <!-- Product Image -->
            <div class="aspect-square bg-dark-50 relative overflow-hidden">
              <div class="absolute inset-0 flex items-center justify-center text-6xl">
                {{ product.icon }}
              </div>
              <div
                class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent
                       opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>
            </div>

            <!-- Product Info -->
            <div class="p-6 space-y-4">
              <div>
                <div class="text-sm text-gold-500 mb-1">{{ product.brand }}</div>
                <h3 class="text-xl font-heading font-bold text-white mb-2">
                  {{ product.title }}
                </h3>
                <p class="text-white/70 text-sm">{{ product.description }}</p>
              </div>

              <div class="flex items-end justify-between pt-4 border-t border-white/10">
                <div>
                  <div class="text-2xl font-bold text-gold-500">{{ product.price }} сум</div>
                  <div
                    v-if="product.inStock"
                    class="text-xs text-green-400 mt-1"
                  >
                    В наличии
                  </div>
                  <div v-else class="text-xs text-red-400 mt-1">
                    Под заказ
                  </div>
                </div>
                <BaseButton
                  variant="secondary"
                  size="sm"
                  @click="requestProduct(product)"
                >
                  Заказать
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Order Modal -->
    <BaseModal :is-open="isOrderModalOpen" @close="isOrderModalOpen = false">
      <template #header>
        <h2 class="text-2xl font-heading font-bold text-gold-500">
          Заказ товара
        </h2>
      </template>

      <div v-if="selectedProduct" class="space-y-6">
        <div class="card-premium p-4 flex items-center gap-4">
          <div class="text-4xl">{{ selectedProduct.icon }}</div>
          <div>
            <div class="text-sm text-gold-500">{{ selectedProduct.brand }}</div>
            <div class="font-heading font-semibold text-white">{{ selectedProduct.title }}</div>
            <div class="text-gold-500 font-bold mt-1">{{ selectedProduct.price }} сум</div>
          </div>
        </div>

        <form class="space-y-4" @submit.prevent="submitOrder">
          <BaseInput
            id="order-name"
            v-model="orderForm.name"
            label="Ваше имя"
            placeholder="Введите имя"
            required
          />

          <BaseInput
            id="order-phone"
            v-model="orderForm.phone"
            type="tel"
            label="Телефон"
            placeholder="+7 (___) ___-__-__"
            required
          />

          <div class="relative w-full">
            <textarea
              id="order-comment"
              v-model="orderForm.comment"
              rows="3"
              placeholder="Комментарий к заказу (необязательно)"
              class="w-full px-6 py-4 bg-dark-50 border-2 border-white/20 text-white placeholder-white/50
                     font-sans transition-all duration-300
                     focus:outline-none focus:border-gold-500 focus:bg-dark-100 resize-none"
            ></textarea>
          </div>

          <BaseButton type="submit" variant="primary" class="w-full">
            Отправить заявку
          </BaseButton>
        </form>
      </div>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const isOrderModalOpen = ref(false)
const selectedProduct = ref<any>(null)

const orderForm = reactive({
  name: '',
  phone: '',
  comment: '',
})

const products = [
  {
    icon: '🧴',
    brand: 'American Crew',
    title: 'Формирующая паста',
    description: 'Сильная фиксация с матовым эффектом',
    price: 1200,
    inStock: true,
  },
  {
    icon: '💧',
    brand: 'Uppercut Deluxe',
    title: 'Помада для укладки',
    description: 'Средняя фиксация с естественным блеском',
    price: 1400,
    inStock: true,
  },
  {
    icon: '🧼',
    brand: 'Proraso',
    title: 'Крем для бритья',
    description: 'Классический итальянский крем с ментолом',
    price: 800,
    inStock: true,
  },
  {
    icon: '🪒',
    brand: 'The Bluebeards Revenge',
    title: 'Масло для бороды',
    description: 'Питательное масло для ухода за бородой',
    price: 1100,
    inStock: true,
  },
  {
    icon: '✨',
    brand: 'Layrite',
    title: 'Цементирующая глина',
    description: 'Супер сильная фиксация для текстурных укладок',
    price: 1500,
    inStock: false,
  },
  {
    icon: '🧴',
    brand: 'Reuzel',
    title: 'Grooming Tonic',
    description: 'Тоник для подготовки волос к укладке',
    price: 1300,
    inStock: true,
  },
]

const requestProduct = (product: any) => {
  selectedProduct.value = product
  isOrderModalOpen.value = true
}

const submitOrder = () => {
  console.log('Order submitted:', {
    product: selectedProduct.value,
    customer: orderForm,
  })

  // Здесь должна быть отправка на backend
  alert('Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.')

  isOrderModalOpen.value = false
  orderForm.name = ''
  orderForm.phone = ''
  orderForm.comment = ''
}
</script>


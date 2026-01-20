<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-heading font-bold text-gold-500 mb-6">Подтверждение записи</h2>

    <!-- Сводка записи -->
    <div class="card-premium p-6 space-y-6">
      <!-- Услуга -->
      <div class="flex items-start justify-between pb-6 border-b border-white/10">
        <div>
          <p class="text-sm text-white/50 mb-1">Услуга</p>
          <p class="text-lg font-heading font-semibold text-white">{{ selectedService?.title }}</p>
        </div>
        <div class="text-right">
          <p class="text-2xl font-bold text-gold-500">{{ formatPrice(totalPrice) }}</p>
          <p class="text-sm text-white/50">{{ estimatedDuration }} минут</p>
        </div>
      </div>

      <!-- Мастер -->
      <div class="flex items-center gap-4 pb-6 border-b border-white/10">
        <img
          v-if="selectedStaff?.avatar_url"
          :src="selectedStaff.avatar_url"
          :alt="selectedStaff.name"
          class="w-16 h-16 rounded-full object-cover"
        />
        <div
          v-else
          class="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center text-2xl font-bold text-gold-500"
        >
          {{ selectedStaff?.name.charAt(0) }}
        </div>
        <div>
          <p class="text-sm text-white/50 mb-1">Мастер</p>
          <p class="text-lg font-heading font-semibold text-white">{{ selectedStaff?.name }}</p>
        </div>
      </div>

      <!-- Дата и время -->
      <div class="pb-6 border-b border-white/10">
        <p class="text-sm text-white/50 mb-2">Дата и время</p>
        <div class="flex items-center gap-2 text-lg font-semibold text-white">
          <svg class="w-5 h-5 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ formattedDateTime?.full }}</span>
        </div>
      </div>

      <!-- Форма с данными клиента -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <BaseInput
          id="client-name"
          v-model="formData.name"
          label="Ваше имя"
          placeholder="Введите имя"
          :error="errors.name"
          required
          @blur="validateName"
        />

        <BaseInput
          id="client-phone"
          v-model="formData.phone"
          type="tel"
          label="Телефон"
          placeholder="+7 (___) ___-__-__"
          :error="errors.phone"
          required
          @blur="validatePhone"
        />

        <BaseInput
          id="client-email"
          v-model="formData.email"
          type="email"
          label="Email (необязательно)"
          placeholder="your@email.com"
          :error="errors.email"
          @blur="validateEmail"
        />

        <div class="relative w-full">
          <textarea
            id="client-comment"
            v-model="formData.comment"
            rows="3"
            placeholder="Комментарий к записи (необязательно)"
            class="w-full px-6 py-4 bg-dark-50 border-2 border-white/20 text-white placeholder-white/50
                   font-sans transition-all duration-300
                   focus:outline-none focus:border-gold-500 focus:bg-dark-100
                   resize-none"
          ></textarea>
          <label
            for="client-comment"
            class="absolute -top-3 left-4 px-2 bg-dark text-sm text-gold-500 font-medium"
          >
            Комментарий
          </label>
        </div>

        <!-- Согласие -->
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-model="formData.agreement"
            type="checkbox"
            class="mt-1 w-5 h-5 bg-dark-50 border-2 border-white/20 rounded
                   checked:bg-gold-500 checked:border-gold-500
                   focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark"
          />
          <span class="text-sm text-white/70">
            Я согласен с
            <a href="/privacy" class="text-gold-500 hover:underline">политикой конфиденциальности</a>
            и даю согласие на обработку персональных данных
          </span>
        </label>
        <p v-if="errors.agreement" class="text-sm text-red-500">{{ errors.agreement }}</p>

        <!-- Кнопки -->
        <div class="flex gap-4 pt-4">
          <BaseButton
            variant="ghost"
            class="flex-1"
            @click="$emit('back')"
          >
            Назад
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            class="flex-1"
            :loading="isSubmitting"
            :disabled="!isFormValid"
          >
            Подтвердить запись
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useBookingFlow } from '@/composables'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits<{
  back: []
  success: []
}>()

const {
  selectedService,
  selectedStaff,
  formattedDateTime,
  totalPrice,
  estimatedDuration,
  setClientInfo,
  createBooking,
} = useBookingFlow()

const formData = reactive({
  name: '',
  phone: '',
  email: '',
  comment: '',
  agreement: false,
})

const errors = reactive({
  name: '',
  phone: '',
  email: '',
  agreement: '',
})

const isSubmitting = ref(false)

const isFormValid = computed(() => {
  return (
    formData.name.trim().length >= 2 &&
    formData.phone.replace(/\D/g, '').length >= 10 &&
    formData.agreement &&
    !errors.name &&
    !errors.phone &&
    !errors.email
  )
})

const validateName = () => {
  if (formData.name.trim().length < 2) {
    errors.name = 'Имя должно содержать минимум 2 символа'
  } else {
    errors.name = ''
  }
}

const validatePhone = () => {
  const cleaned = formData.phone.replace(/\D/g, '')
  if (cleaned.length < 10) {
    errors.phone = 'Введите корректный номер телефона'
  } else {
    errors.phone = ''
  }
}

const validateEmail = () => {
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Введите корректный email'
  } else {
    errors.email = ''
  }
}

const handleSubmit = async () => {
  // Валидация
  validateName()
  validatePhone()
  validateEmail()

  if (!formData.agreement) {
    errors.agreement = 'Необходимо согласие на обработку данных'
    return
  } else {
    errors.agreement = ''
  }

  if (!isFormValid.value) {
    return
  }

  isSubmitting.value = true

  try {
    setClientInfo({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      comment: formData.comment || undefined,
    })

    const success = await createBooking()

    if (success) {
      emit('success')
    }
  } catch (error) {
    console.error('Booking error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}
</script>


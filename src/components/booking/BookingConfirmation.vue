<template>
  <div class="space-y-6">
    <h2 class="text-xl font-heading font-semibold text-primary mb-6">Подтверждение записи</h2>

    <!-- Сводка записи -->
    <Card class="bg-secondary/30 border-border">
      <CardContent class="p-6 space-y-6">
        <!-- Услуга -->
        <div class="flex items-start justify-between pb-6 border-b border-white/10">
          <div>
            <p class="text-sm text-muted-foreground mb-1">Услуга</p>
            <p class="text-lg font-heading font-medium text-foreground">{{ selectedService?.title }}</p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-primary">{{ formatPrice(totalPrice) }}</p>
            <p class="text-sm text-muted-foreground">{{ estimatedDuration }} минут</p>
          </div>
        </div>

        <!-- Мастер -->
        <div class="flex items-center gap-4 pb-6 border-b border-white/10">
          <Avatar class="h-16 w-16 border-2 border-border">
            <AvatarImage v-if="selectedStaff?.avatar_url" :src="selectedStaff.avatar_url" :alt="selectedStaff.name" class="object-cover" />
            <AvatarFallback class="text-xl font-bold bg-primary/20 text-primary">{{ selectedStaff?.name.charAt(0) }}</AvatarFallback>
          </Avatar>
          <div>
            <p class="text-sm text-muted-foreground mb-1">Мастер</p>
            <p class="text-lg font-heading font-medium text-foreground">{{ selectedStaff?.name }}</p>
          </div>
        </div>

        <!-- Дата и время -->
        <div class="pb-2">
          <p class="text-sm text-muted-foreground mb-2">Дата и время</p>
          <div class="flex items-center gap-2 text-lg font-medium text-foreground">
            <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{{ formattedDateTime?.full }}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Форма с данными клиента -->
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="grid gap-2">
        <Label for="client-name">Ваше имя</Label>
        <Input
          id="client-name"
          v-model="formData.name"
          placeholder="Введите имя"
          :class="{'border-destructive': errors.name}"
          required
          @blur="validateName"
        />
        <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
      </div>

      <div class="grid gap-2">
        <Label for="client-phone">Телефон</Label>
        <Input
          id="client-phone"
          v-model="formData.phone"
          type="tel"
          placeholder="+7 (___) ___-__-__"
          :class="{'border-destructive': errors.phone}"
          required
          @blur="validatePhone"
        />
        <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
      </div>

      <div class="grid gap-2">
        <Label for="client-email">Email (необязательно)</Label>
        <Input
          id="client-email"
          v-model="formData.email"
          type="email"
          placeholder="your@email.com"
          :class="{'border-destructive': errors.email}"
          @blur="validateEmail"
        />
        <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
      </div>

      <div class="grid gap-2">
        <Label for="client-comment">Комментарий</Label>
        <Textarea
          id="client-comment"
          v-model="formData.comment"
          placeholder="Комментарий к записи (необязательно)"
          rows="3"
          class="resize-none"
        />
      </div>

      <!-- Согласие -->
      <div class="flex items-start gap-3 pt-2">
        <Checkbox 
          id="agreement" 
          :checked="formData.agreement"
          @update:checked="(val) => formData.agreement = val"
        />
        <div class="grid gap-1.5 leading-none">
          <label
            for="agreement"
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
          >
            Я согласен с
            <a href="/privacy" class="text-primary hover:underline underline-offset-4">политикой конфиденциальности</a>
            и даю согласие на обработку персональных данных
          </label>
          <p v-if="errors.agreement" class="text-sm text-destructive">{{ errors.agreement }}</p>
        </div>
      </div>

      <!-- Кнопки -->
      <div class="flex gap-4 pt-4">
        <Button
          variant="outline"
          class="flex-1"
          type="button"
          @click="$emit('back')"
        >
          Назад
        </Button>
        <Button
          type="submit"
          class="flex-1"
          :disabled="!isFormValid || isSubmitting"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Подтвердить
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useBookingFlow } from '@/composables'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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


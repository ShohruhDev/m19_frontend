<template>
  <div class="login-page min-h-screen bg-dark flex items-center justify-center p-4">
    <AppHeader class="fixed top-0 left-0 w-full" />
    
    <Card class="w-full max-w-md border-white/10 bg-dark-50 backdrop-blur">
      <CardHeader>
        <CardTitle class="text-2xl font-heading text-white text-center">
          {{ step === 1 ? 'Вход в личный кабинет' : 'Подтверждение' }}
        </CardTitle>
        <CardDescription class="text-center text-white/60">
          {{ step === 1 ? 'Введите номер телефона для получения кода' : 'Введите код из SMS' }}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Step 1: Phone -->
          <div v-if="step === 1" class="space-y-2">
            <Label for="phone">Номер телефона</Label>
            <Input
              id="phone"
              v-model="phone"
              type="tel"
              placeholder="+998 (__) ___-__-__"
              required
              class="bg-dark/50 border-white/20 text-white"
              :disabled="isLoading"
            />
          </div>

          <!-- Step 2: Code -->
          <div v-if="step === 2" class="space-y-2">
            <Label for="code">Код из SMS</Label>
            <Input
              id="code"
              v-model="code"
              type="text"
              placeholder="Введите код"
              required
              class="bg-dark/50 border-white/20 text-white text-center text-2xl tracking-widest"
              maxlength="6"
              :disabled="isLoading"
            />
          </div>

          <div v-if="error" class="text-destructive text-sm text-center">
            {{ error }}
          </div>

          <Button 
            type="submit" 
            class="w-full bg-gold-500 hover:bg-gold-600 text-dark font-bold"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="mr-2 animate-spin">⏳</span>
            {{ step === 1 ? 'Получить код' : 'Войти' }}
          </Button>

          <div v-if="step === 2" class="text-center">
             <button 
               type="button" 
               class="text-sm text-white/50 hover:text-white"
               @click="step = 1"
               :disabled="isLoading"
             >
               Изменить номер
             </button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import AppHeader from '@/components/common/AppHeader.vue' // Assuming AppHeader is global or imported

const authStore = useAuthStore()
const router = useRouter()

const step = ref(1)
const phone = ref('+998')
const code = ref('')
const error = ref<string | null>(null)
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = null
  isLoading.value = true

  try {
    if (step.value === 1) {
      // Clean phone number if needed, basic validation
      if (phone.value.length < 9) {
        error.value = 'Введите корректный номер'
        isLoading.value = false
        return
      }
      
      const success = await authStore.requestAuthCode(phone.value)
      if (success) {
        step.value = 2
      } else {
        error.value = authStore.error || 'Не удалось отправить код'
      }
    } else {
      const success = await authStore.login(phone.value, code.value)
      if (success) {
        router.push({ name: 'Profile' }) // Redirect to profile
      } else {
        error.value = authStore.error || 'Неверный код'
      }
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>

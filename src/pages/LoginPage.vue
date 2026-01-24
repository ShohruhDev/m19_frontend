<template>
  <div class="login-page min-h-screen bg-dark flex items-center justify-center p-4">
    <AppHeader class="fixed top-0 left-0 w-full" />
    
    <Card class="w-full max-w-md border-white/10 bg-dark-50 backdrop-blur">
      <CardHeader>
        <CardTitle class="text-2xl font-heading text-white text-center">
          Вход в личный кабинет
        </CardTitle>
        <CardDescription class="text-center text-white/60">
          Введите телефон и пароль
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Phone/Email -->
          <div class="space-y-2">
            <Label for="login">Телефон или Email</Label>
            <Input
              id="login"
              v-model="login"
              type="text"
              placeholder="+998 (__) ___-__-__"
              required
              class="bg-dark/50 border-white/20 text-white"
              :disabled="isLoading"
            />
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password">Пароль</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Введите пароль"
              required
              class="bg-dark/50 border-white/20 text-white"
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
            Войти
          </Button>
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
import AppHeader from '@/components/common/AppHeader.vue'

const authStore = useAuthStore()
const router = useRouter()

const login = ref('+998')
const password = ref('')
const error = ref<string | null>(null)
const isLoading = ref(false)

const handleSubmit = async () => {
  error.value = null
  isLoading.value = true

  try {
    // Basic validation
    if (login.value.length < 5) {
      error.value = 'Введите корректный логин'
      isLoading.value = false
      return
    }

    if (password.value.length < 3) {
      error.value = 'Введите пароль'
      isLoading.value = false
      return
    }

    const success = await authStore.login(login.value, password.value)
    if (success) {
      router.push({ name: 'Profile' })
    } else {
      error.value = authStore.error || 'Неверный логин или пароль'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>

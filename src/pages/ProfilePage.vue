<template>
  <div class="profile-page min-h-screen bg-dark">
    <!-- Header -->
    <AppHeader class="fixed top-0 left-0 w-full z-50 bg-dark/80 backdrop-blur" />

    <main class="container-custom pt-32 pb-20">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-heading font-bold text-white">
          Личный кабинет
        </h1>
        <Button variant="outline" @click="handleLogout" class="text-destructive hover:text-destructive hover:bg-destructive/10">
          Выйти
        </Button>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- User Info Card -->
        <Card class="bg-dark-50 border-white/10 h-fit">
          <CardHeader>
            <CardTitle class="text-xl text-white">Мои данные</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-4">
              <Avatar class="h-16 w-16 border-2 border-gold-500">
                <AvatarImage :src="user?.avatar" />
                <AvatarFallback class="bg-gold-500/20 text-gold-500 text-xl font-bold">
                  {{ userInitials }}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h3 class="font-bold text-white text-lg">{{ user?.name || 'Гость' }}</h3>
                <p class="text-white/60">{{ user?.phone }}</p>
                <p class="text-white/60 text-sm">{{ user?.email }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Appointments Tabs -->
        <div class="lg:col-span-2">
          <div class="w-full">
            <div class="grid w-full grid-cols-2 bg-dark-50 p-1 mb-6 rounded-lg gap-2">
              <button 
                class="py-2 px-4 rounded-md text-sm font-medium transition-all"
                :class="activeTab === 'active' ? 'bg-gold-500 text-dark font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'"
                @click="activeTab = 'active'"
              >
                Предстоящие
              </button>
              <button 
                class="py-2 px-4 rounded-md text-sm font-medium transition-all"
                :class="activeTab === 'history' ? 'bg-gold-500 text-dark font-bold' : 'text-white/70 hover:text-white hover:bg-white/10'"
                @click="activeTab = 'history'"
              >
                История визитов
              </button>
            </div>
            
            <div v-if="activeTab === 'active'" class="space-y-4">
              <div v-if="loading" class="text-center py-10 text-white/50">Загрузка...</div>
              <div v-else-if="activeAppointments.length === 0" class="text-center py-10 bg-dark-50 rounded-lg border border-white/5">
                <p class="text-white/60 mb-4">У вас нет предстоящих записей</p>
                <Button @click="$router.push('/booking')">Записаться онлайн</Button>
              </div>
              <div v-else class="space-y-4">
                  <!-- Appointment Cards -->
                   <Card v-for="app in activeAppointments" :key="app.id" class="bg-dark-50 border-white/10">
                      <CardContent class="p-6">
                          <div class="flex justify-between items-start">
                              <div>
                                  <div class="text-gold-500 font-bold mb-1">{{ formatDate(app.datetime) }}</div>
                                  <h4 class="text-white font-bold text-lg">{{ app.services?.[0]?.title }}</h4>
                                  <p class="text-white/60">Мастер: {{ app.staff?.name }}</p>
                              </div>
                              <div class="text-right">
                                  <div class="text-white font-bold">{{ app.price }} сум</div>
                                  <div class="text-xs text-green-400 mt-1">Подтверждено</div>
                              </div>
                          </div>
                      </CardContent>
                   </Card>
              </div>
            </div>
            
            <div v-if="activeTab === 'history'" class="space-y-4">
               <div v-if="loading" class="text-center py-10 text-white/50">Загрузка...</div>
               <div v-else-if="historyAppointments.length === 0" class="text-center py-10 text-white/50">
                   История визитов пуста
               </div>
               <div v-else class="space-y-4">
                   <Card v-for="app in historyAppointments" :key="app.id" class="bg-dark-50 border-white/10 opacity-75 hover:opacity-100 transition-opacity">
                      <CardContent class="p-6 flex justify-between items-center">
                          <div>
                              <div class="text-white/60 text-sm mb-1">{{ formatDate(app.datetime) }}</div>
                              <div class="text-white font-semibold">{{ app.services?.[0]?.title || 'Услуга' }}</div>
                              <div class="text-white/40 text-sm">{{ app.staff?.name }}</div>
                          </div>
                          <Button variant="outline" size="sm" @click="repeatOrder(app)">
                              Повторить
                          </Button>
                      </CardContent>
                   </Card>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores'
import { altegService } from '@/services'
import AppHeader from '@/components/common/AppHeader.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('active') // 'active' | 'history'

const loading = ref(true)
const appointments = ref<any[]>([])

// Computed
const user = computed(() => authStore.user)
const userInitials = computed(() => {
  const name = user.value?.name || ''
  return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
})

const activeAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(app => new Date(app.datetime) > now)
})

const historyAppointments = computed(() => {
    const now = new Date()
    return appointments.value.filter(app => new Date(app.datetime) <= now)
})

// Methods
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('ru-RU', { 
        day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
    })
}

const repeatOrder = (_app: any) => {
    // Logic to open booking modal with pre-selected service/staff
    // This requires access to Booking Store actions
    // For now, redirect to home
    router.push('/')
}

// Fetch Data
onMounted(async () => {
    if (!authStore.isAuthenticated) {
        router.push('/login')
        return
    }
    
    // Ensure user data is loaded
    if (!user.value) {
        await authStore.loadUser()
    }
    
    // Fetch appointments
    if (authStore.token) {
        loading.value = true
        try {
            appointments.value = await altegService.getUserAppointments(authStore.token)
        } finally {
            loading.value = false
        }
    }
})
</script>

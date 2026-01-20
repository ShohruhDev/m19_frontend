<template>
  <div class="staff-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom">
        <div class="text-center mb-16">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Наши мастера
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">
            Профессионалы своего дела с многолетним опытом
          </p>
        </div>

        <div v-if="isLoading" class="flex justify-center py-20">
          <div class="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="error" class="text-center py-20 text-red-500">
          {{ error }}
        </div>

        <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(master, index) in staffMembers"
            :key="index"
            class="card-premium p-0 overflow-hidden group"
          >
            <!-- Avatar -->
            <div class="aspect-square bg-dark-50 relative overflow-hidden">
              <div
                class="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent
                       opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
              ></div>
              
              <!-- Real Image -->
              <img 
                v-if="master.avatar" 
                :src="master.avatar" 
                :alt="master.name"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              <!-- Fallback Initials -->
              <div v-else class="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gold-500/20">
                {{ master.name.charAt(0) }}
              </div>
            </div>

            <!-- Info -->
            <div class="p-6 space-y-4">
              <div>
                <h3 class="text-2xl font-heading font-bold text-white mb-1">
                  {{ master.name }}
                </h3>
                <p class="text-gold-500 font-medium">{{ master.role }}</p>
              </div>

              <p class="text-white/70 text-sm">{{ master.description }}</p>

              <!-- Stats -->
              <div class="flex items-center gap-4 text-sm text-white/50 pt-4 border-t border-white/10">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {{ master.rating }}
                </span>
                <span>{{ master.reviews }} отзывов</span>
                <span>{{ master.experience }} лет опыта</span>
              </div>

              <!-- Specializations -->
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="spec in master.specializations"
                  :key="spec"
                  class="px-3 py-1 bg-gold-500/10 border border-gold-500/30 text-gold-500 text-xs rounded-full"
                >
                  {{ spec }}
                </span>
              </div>

              <BaseButton
                variant="secondary"
                class="w-full"
                @click="bookWithMaster(master)"
              >
                Записаться к мастеру
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </main>

    <BookingFlow :is-open="isBookingOpen" @close="isBookingOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import BookingFlow from '@/components/booking/BookingFlow.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { altegService } from '@/services'
import type { AltegStaff } from '@/types'

const isBookingOpen = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)
const staffMembers = ref<any[]>([])

const fetchStaff = async () => {
  try {
    isLoading.value = true
    const staff = await altegService.fetchStaff()
    
    // Transform API data to UI format
    staffMembers.value = staff.map((master: AltegStaff) => ({
      ...master,
      // Map API fields or provide defaults for UI
      name: master.name,
      role: master.specialization || 'Барбер', 
      description: master.information || 'Профессионал своего дела',
      rating: 5.0, // API doesn't usually provide rating, default to 5
      reviews: Math.floor(Math.random() * 50) + 20, // Mock reviews count for now
      experience: 5, // Mock experience
      specializations: master.specialization ? [master.specialization] : ['Мужские стрижки'],
      avatar: master.avatar_big || master.avatar
    }))
  } catch (err) {
    console.error('Failed to load staff:', err)
    error.value = 'Не удалось загрузить список мастеров'
  } finally {
    isLoading.value = false
  }
}

const bookWithMaster = (_master: any) => {
  // In a future update we could pre-select the master
  isBookingOpen.value = true
}

onMounted(() => {
  fetchStaff()
})
</script>


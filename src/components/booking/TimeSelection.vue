<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-heading font-bold text-gold-500 mb-6">Выберите время</h2>

    <div v-if="isLoading" class="grid grid-cols-4 gap-3">
      <SkeletonLoader v-for="i in 12" :key="i" type="card" size="sm" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Временные слоты по времени суток -->
      <div v-for="period in timePeriods" :key="period.name" class="space-y-3">
        <h3 class="text-lg font-heading font-semibold text-white/70">{{ period.name }}</h3>

        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <button
            v-for="slot in period.slots"
            :key="slot.datetime"
            :class="[
              'p-4 border-2 font-semibold transition-all duration-300',
              'hover:border-gold-500 hover:bg-gold-500/10 hover:scale-105',
              selectedTime?.datetime === slot.datetime
                ? 'border-gold-500 bg-gold-500 text-dark'
                : 'border-white/20 text-white',
            ]"
            @click="selectTime(slot)"
          >
            {{ slot.time }}
          </button>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="availableSlots.length === 0" class="text-center py-12">
        <p class="text-white/50">Нет доступного времени на выбранную дату</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookingFlow } from '@/composables'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import type { AltegScheduleSlot } from '@/types'

const {
  availableSlots,
  selectedTime,
  isLoading,
  error,
  selectTime: selectTimeAction,
} = useBookingFlow()

const selectTime = (slot: AltegScheduleSlot) => {
  selectTimeAction(slot)
}

// Группировка слотов по времени суток
const timePeriods = computed(() => {
  const periods = [
    { name: 'Утро', start: 6, end: 12, slots: [] as AltegScheduleSlot[] },
    { name: 'День', start: 12, end: 18, slots: [] as AltegScheduleSlot[] },
    { name: 'Вечер', start: 18, end: 24, slots: [] as AltegScheduleSlot[] },
  ]

  availableSlots.value.forEach((slot: AltegScheduleSlot) => {
    const hour = parseInt(slot.time.split(':')[0])

    const period = periods.find((p) => hour >= p.start && hour < p.end)
    if (period) {
      period.slots.push(slot)
    }
  })

  return periods.filter((p) => p.slots.length > 0)
})
</script>


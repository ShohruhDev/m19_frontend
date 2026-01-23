<template>
  <div class="space-y-6">
    <h2 class="text-xl font-heading font-semibold text-primary mb-6">Выберите время</h2>

    <div v-if="isLoading" class="grid grid-cols-4 gap-3">
      <Skeleton v-for="i in 12" :key="i" class="h-12 w-full" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <div v-else class="space-y-6 h-[400px] overflow-y-auto pr-2 scrollbar-custom">
      <!-- Временные слоты по времени суток -->
      <div v-for="period in timePeriods" :key="period.name" class="space-y-3">
        <h3 class="text-sm font-medium text-muted-foreground">{{ period.name }}</h3>

        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          <Button
            v-for="slot in period.slots"
            :key="slot.datetime"
            :variant="selectedTime?.datetime === slot.datetime ? 'default' : 'outline'"
            class="w-full"
            @click="selectTime(slot)"
          >
            {{ slot.time }}
          </Button>
        </div>
      </div>

      <!-- Пустое состояние -->
      <div v-if="availableSlots.length === 0" class="text-center py-12">
        <p class="text-muted-foreground">Нет доступного времени на выбранную дату</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBookingFlow } from '@/composables'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
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


<template>
  <div class="space-y-6">
    <h2 class="text-2xl font-heading font-bold text-gold-500 mb-6">Выберите дату</h2>

    <div v-if="isLoading" class="grid grid-cols-7 gap-2">
      <SkeletonLoader v-for="i in 14" :key="i" type="card" size="sm" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Календарь -->
      <div class="grid grid-cols-7 gap-2">
        <button
          v-for="date in availableDates"
          :key="date.date"
          :class="[
            'p-4 border-2 transition-all duration-300 flex flex-col items-center justify-center',
            'hover:border-gold-500 hover:bg-gold-500/10',
            selectedDate === date.date
              ? 'border-gold-500 bg-gold-500/20 text-gold-500'
              : 'border-white/20 text-white',
            date.slots_count === 0 ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
          ]"
          :disabled="date.slots_count === 0"
          @click="selectDate(date.date)"
        >
          <span class="text-xs text-white/50">{{ formatDayOfWeek(date.date) }}</span>
          <span class="text-2xl font-bold">{{ formatDay(date.date) }}</span>
          <span class="text-xs">{{ formatMonth(date.date) }}</span>
          <span v-if="date.slots_count > 0" class="text-xs text-gold-500 mt-1">
            {{ date.slots_count }} {{ pluralize(date.slots_count, 'слот', 'слота', 'слотов') }}
          </span>
        </button>
      </div>

      <!-- Пустое состояние -->
      <div v-if="availableDates.length === 0" class="text-center py-12">
        <p class="text-white/50">Нет доступных дат для записи</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingFlow } from '@/composables'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'

const {
  availableDates,
  selectedDate,
  isLoading,
  error,
  selectDate: selectDateAction,
} = useBookingFlow()

const selectDate = (date: string) => {
  selectDateAction(date)
}

const formatDayOfWeek = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { weekday: 'short' })
}

const formatDay = (dateString: string) => {
  const date = new Date(dateString)
  return date.getDate()
}

const formatMonth = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { month: 'short' })
}

const pluralize = (count: number, one: string, few: string, many: string) => {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) {
    return one
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return few
  }

  return many
}
</script>


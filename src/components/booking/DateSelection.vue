<template>
  <div class="space-y-6 flex flex-col items-center">
    <div v-if="isLoading" class="grid grid-cols-7 gap-2">
      <SkeletonLoader type="card" size="sm" class="h-[300px] w-full" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
    </div>

    <div v-else class="w-full flex justify-center">
      <Calendar
        v-model="date"
        class="rounded-md border border-border bg-card shadow-sm"
        :min-value="minDate"
        :is-date-unavailable="isDateDisabled"
        @update:model-value="onDateSelect"
      />
    </div>

    <div v-if="!selectedDate" class="text-center text-muted-foreground text-sm">
      Выберите дату для записи
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useBookingFlow } from '@/composables'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import { Calendar } from '@/components/ui/calendar'
import { DateValue, getLocalTimeZone, today, CalendarDate } from '@internationalized/date'

const {
  availableDates,
  selectedDate,
  isLoading,
  error,
  selectDate: selectDateAction,
} = useBookingFlow()

// Internal state for Calendar
const date = ref<DateValue | undefined>()
const minDate = today(getLocalTimeZone())

// Sync external selectedDate to internal date
watch(() => selectedDate.value, (newVal) => {
  if (newVal) {
    // newVal is YYYY-MM-DD string
    const [y, m, d] = newVal.split('-').map(Number)
    date.value = new CalendarDate(y, m, d)
  }
}, { immediate: true })

const onDateSelect = (newDate: DateValue | undefined) => {
  if (!newDate) return
  // Convert DateValue to YYYY-MM-DD string for our store
  const y = newDate.year
  const m = String(newDate.month).padStart(2, '0')
  const d = String(newDate.day).padStart(2, '0')
  const dateString = `${y}-${m}-${d}`
  
  selectDateAction(dateString)
}

// Disable dates that are not in `availableDates` or have 0 slots
const isDateDisabled = (dateVal: DateValue) => {
  const y = dateVal.year
  const m = String(dateVal.month).padStart(2, '0')
  const d = String(dateVal.day).padStart(2, '0')
  const dateString = `${y}-${m}-${d}`

  const found = availableDates.value.find(ad => ad.date === dateString)
  if (!found) return true // Disable if not in available list
  return found.slots_count === 0
}
</script>


<template>
  <div class="space-y-8">
    <h2 class="text-xl font-heading font-semibold text-primary mb-6">Выберите время</h2>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <Skeleton class="h-[350px] w-full rounded-lg" />
      <div class="grid grid-cols-4 gap-3">
        <Skeleton v-for="i in 12" :key="i" class="h-12 w-full" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
        <svg class="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-destructive font-medium mb-2">{{ error }}</p>
      <Button variant="outline" size="sm" @click="retryLoadSlots">
        Попробовать снова
      </Button>
    </div>

    <!-- Main Content -->
    <div v-else class="space-y-6">

      <!-- Calendar Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 pb-3 border-b border-border/50">
          <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-base font-semibold text-foreground">
            {{ quickSlots.length > 0 ? 'Или выберите другую дату' : 'Выберите дату' }}
          </h3>
        </div>
        <CompactCalendar
          v-model="selectedDateValue"
          :min-date="minDate"
          @update:model-value="onDateSelect"
        />
      </div>

      <!-- Time Slots Section -->
      <Transition name="slide-down" mode="out-in">
        <div v-if="selectedDate" :key="selectedDate" class="space-y-4">
          <!-- Section Header - Selected Date Display -->
          <div class="bg-muted/30 rounded-lg p-4 border border-border/40">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs text-muted-foreground font-medium">Выбранная дата</p>
                  <h3 class="text-sm font-semibold text-foreground">{{ formatDate(selectedDate) }}</h3>
                </div>
              </div>
              <div v-if="availableSlots.length > 0" class="text-right">
                <p class="text-xs text-muted-foreground">Доступно</p>
                <span class="text-lg font-bold text-primary">{{ availableSlots.length }}</span>
              </div>
            </div>
          </div>

          <!-- Time Slots Grid with Periods -->
          <div 
            v-if="availableSlots.length > 0" 
            class="space-y-3 max-h-[320px] overflow-y-auto pr-2 scrollbar-custom"
            @wheel.stop
          >
            <Collapsible
              v-for="period in timePeriods"
              :key="period.name"
              v-model:open="openStates[period.name]"
              class="border border-border rounded-lg bg-card overflow-hidden transition-all duration-200 hover:border-primary/30"
            >
              <CollapsibleTrigger class="w-full flex items-center justify-between p-3.5 hover:bg-muted/50 transition-colors group">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <component :is="period.icon" class="w-4 h-4" />
                  </div>
                  <span class="text-sm font-semibold text-foreground">{{ period.name }}</span>
                  <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {{ period.slots.length }}
                  </span>
                </div>
                <ChevronDown
                  class="w-4 h-4 text-muted-foreground transition-transform duration-200 group-hover:text-foreground"
                  :class="{ 'rotate-180': openStates[period.name] }"
                />
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div class="p-3.5 pt-0 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                  <Button
                    v-for="slot in period.slots"
                    :key="slot.datetime"
                    :variant="selectedTime?.datetime === slot.datetime ? 'default' : 'outline'"
                    size="sm"
                    class="font-medium transition-all duration-200 hover:scale-105 h-11"
                    :class="{
                      'shadow-md shadow-primary/20': selectedTime?.datetime === slot.datetime,
                      'hover:border-primary hover:bg-primary/5': selectedTime?.datetime !== slot.datetime
                    }"
                    @click="selectTime(slot)"
                  >
                    <span>{{ slot.time }}</span>
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <!-- No Slots Available State -->
          <div v-else class="text-center py-10 space-y-4">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-2">
              <svg class="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium text-foreground">Нет доступного времени</p>
              <p class="text-xs text-muted-foreground">на {{ formatDate(selectedDate) }}</p>
            </div>
            <Button 
              variant="link" 
              class="text-primary hover:text-primary/80 font-medium" 
              @click="findNearestDate"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Найти ближайшую свободную дату
            </Button>
          </div>
        </div>

        <!-- Initial State - No Date Selected -->
        <div v-else class="text-center py-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <svg class="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-sm text-muted-foreground">Выберите дату для просмотра доступного времени</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useBookingFlow } from '@/composables'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import CompactCalendar from './CompactCalendar.vue'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { ChevronDown, Sun, Cloud, Moon } from 'lucide-vue-next'
import type { AltegScheduleSlot } from '@/types'

const {
  availableSlots,
  selectedStaff,
  selectedDate,
  selectedTime,
  isLoading,
  error,
  selectDate: selectDateAction,
  selectTime: selectTimeAction,
  loadAvailableSlots
} = useBookingFlow()

// Date picker state
const selectedDateValue = ref<Date | undefined>()
const minDate = new Date()

// State for open periods (all open by default)
const openStates = ref<Record<string, boolean>>({
  'Утро': true,
  'День': true,
  'Вечер': true
})

// Quick availability slots from selected staff's next_slots
const quickSlots = computed(() => {
  if (!selectedStaff.value?.next_slots) return []
  
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]
  
  return selectedStaff.value.next_slots.slice(0, 3).map((slot: any) => ({
    ...slot,
    datetime: `${slot.date}T${slot.time}:00`,
    dateLabel: slot.date === todayStr ? 'Сегодня' : slot.date === tomorrowStr ? 'Завтра' : formatShortDate(slot.date)
  }))
})

// Sync external selectedDate to internal date picker
watch(() => selectedDate.value, (newVal) => {
  if (newVal) {
    selectedDateValue.value = new Date(newVal)
  }
}, { immediate: true })

// Load slots when date changes
watch(() => selectedDate.value, (newDate) => {
  if (newDate) {
    loadAvailableSlots()
  }
})

const onDateSelect = (newDate: Date | undefined) => {
  if (!newDate) return
  const y = newDate.getFullYear()
  const m = String(newDate.getMonth() + 1).padStart(2, '0')
  const d = String(newDate.getDate()).padStart(2, '0')
  const dateString = `${y}-${m}-${d}`
  
  selectDateAction(dateString)
}



const selectTime = (slot: AltegScheduleSlot) => {
  selectTimeAction(slot)
}

const findNearestDate = () => {
  // For now, just set to today and try to load
  // In a more advanced implementation, we could query the API for the next available date
  const today = new Date().toISOString().split('T')[0]
  selectDateAction(today)
}

const retryLoadSlots = () => {
  if (selectedDate.value) {
    loadAvailableSlots()
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long' 
  })
}

const formatShortDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ru-RU', { 
    day: 'numeric', 
    month: 'short' 
  })
}



// Group slots by time periods
const timePeriods = computed(() => {
  const periods = [
    { 
      name: 'Утро', 
      start: 6, 
      end: 12, 
      slots: [] as AltegScheduleSlot[],
      icon: Sun
    },
    { 
      name: 'День', 
      start: 12, 
      end: 18, 
      slots: [] as AltegScheduleSlot[],
      icon: Cloud
    },
    { 
      name: 'Вечер', 
      start: 18, 
      end: 24, 
      slots: [] as AltegScheduleSlot[],
      icon: Moon
    },
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

// Initialize with today's date if not set
onMounted(() => {
  if (!selectedDate.value) {
    const today = new Date().toISOString().split('T')[0]
    selectDateAction(today)
  }
})
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide down transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom scrollbar */
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--primary) / 0.3) transparent;
}

.scrollbar-custom::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: hsl(var(--primary) / 0.3);
  border-radius: 3px;
}

.scrollbar-custom::-webkit-scrollbar-thumb:hover {
  background-color: hsl(var(--primary) / 0.5);
}

/* Enhanced calendar styling */
:deep(.rdp) {
  padding: 1.25rem;
}

:deep(.rdp-months) {
  gap: 0;
}

:deep(.rdp-month) {
  width: 100%;
}

:deep(.rdp-caption) {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid hsl(var(--border) / 0.3);
}

:deep(.rdp-table) {
  width: 100%;
}

:deep(.rdp-head_cell) {
  color: hsl(var(--muted-foreground));
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

:deep(.rdp-cell) {
  padding: 0.25rem;
}

:deep(.rdp-day) {
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 2.5rem;
  height: 2.5rem;
}

:deep(.rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected)) {
  background: hsl(var(--primary) / 0.1);
  transform: scale(1.05);
}

:deep(.rdp-day_selected) {
  background: hsl(var(--primary)) !important;
  color: hsl(var(--primary-foreground)) !important;
  box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
  transform: scale(1.1);
  font-weight: 600;
}

:deep(.rdp-day_today:not(.rdp-day_selected)) {
  border: 2px solid hsl(var(--primary) / 0.5);
  font-weight: 600;
}

:deep(.rdp-day_disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

:deep(.rdp-nav_button) {
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

:deep(.rdp-nav_button:hover) {
  background: hsl(var(--primary) / 0.1);
}
</style>

<template>
  <div class="compact-calendar">
    <!-- Header -->
    <div class="calendar-header">
      <button 
        type="button"
        class="nav-button" 
        @click="previousMonth"
        :disabled="!canGoPrevious"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <div class="month-year">
        {{ currentMonthName }} {{ currentYear }}
      </div>
      
      <button 
        type="button"
        class="nav-button" 
        @click="nextMonth"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Weekday Headers -->
    <div class="weekdays">
      <div v-for="day in weekDays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <button
        v-for="day in calendarDays"
        :key="day.key"
        type="button"
        class="calendar-day"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.isSelected,
          'disabled': day.isDisabled
        }"
        :disabled="day.isDisabled"
        @click="selectDate(day)"
      >
        {{ day.day }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface CalendarDay {
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  key: string
}

interface Props {
  modelValue?: Date | string
  minDate?: Date | string
  maxDate?: Date | string
  locale?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  minDate: undefined,
  maxDate: undefined,
  locale: 'ru-RU'
})

const emit = defineEmits<{
  'update:modelValue': [value: Date]
}>()

const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

const currentDate = ref(new Date())
const selectedDate = ref<Date | null>(
  props.modelValue ? new Date(props.modelValue) : null
)

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString(props.locale, { month: 'long' })
})

const minDateObj = computed(() => 
  props.minDate ? new Date(props.minDate) : null
)

const maxDateObj = computed(() => 
  props.maxDate ? new Date(props.maxDate) : null
)

const canGoPrevious = computed(() => {
  if (!minDateObj.value) return true
  const firstDayOfMonth = new Date(currentYear.value, currentMonth.value, 1)
  return firstDayOfMonth > minDateObj.value
})

const calendarDays = computed<CalendarDay[]>(() => {
  const days: CalendarDay[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  
  // Get the day of week for the first day (0 = Sunday)
  const firstDayOfWeek = firstDay.getDay()
  
  // Add days from previous month
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear.value, currentMonth.value - 1, prevMonthLastDay.getDate() - i)
    days.push(createCalendarDay(date, false))
  }
  
  // Add days from current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push(createCalendarDay(date, true))
  }
  
  // Add days from next month to complete the grid
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push(createCalendarDay(date, false))
  }
  
  return days
})

function createCalendarDay(date: Date, isCurrentMonth: boolean): CalendarDay {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dateOnly = new Date(date)
  dateOnly.setHours(0, 0, 0, 0)
  
  const isToday = dateOnly.getTime() === today.getTime()
  const isSelected = selectedDate.value 
    ? dateOnly.getTime() === new Date(selectedDate.value).setHours(0, 0, 0, 0)
    : false
  
  let isDisabled = false
  if (minDateObj.value) {
    const minDateOnly = new Date(minDateObj.value)
    minDateOnly.setHours(0, 0, 0, 0)
    if (dateOnly < minDateOnly) isDisabled = true
  }
  if (maxDateObj.value) {
    const maxDateOnly = new Date(maxDateObj.value)
    maxDateOnly.setHours(0, 0, 0, 0)
    if (dateOnly > maxDateOnly) isDisabled = true
  }
  
  return {
    date: dateOnly,
    day: date.getDate(),
    isCurrentMonth,
    isToday,
    isSelected,
    isDisabled,
    key: date.toISOString()
  }
}

function selectDate(day: CalendarDay) {
  if (day.isDisabled) return
  selectedDate.value = day.date
  emit('update:modelValue', day.date)
}

function previousMonth() {
  if (!canGoPrevious.value) return
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    const newDate = new Date(newValue)
    selectedDate.value = newDate
    // Update current month to show the selected date
    currentDate.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
  }
})
</script>

<style scoped>
.compact-calendar {
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  color: hsl(var(--foreground));
  transition: all 0.2s;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-button:hover:not(:disabled) {
  background: hsl(var(--muted));
}

.nav-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-year {
  font-size: 0.875rem;
  font-weight: 600;
  color: hsl(var(--foreground));
  text-transform: capitalize;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
  padding: 0.25rem;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.375rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: hsl(var(--foreground));
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.calendar-day:hover:not(.disabled):not(.other-month) {
  background: hsl(var(--primary) / 0.1);
  transform: scale(1.05);
}

.calendar-day.other-month {
  color: hsl(var(--muted-foreground) / 0.4);
}

.calendar-day.today:not(.selected) {
  color: hsl(var(--primary));
  font-weight: 700;
}

.calendar-day.today:not(.selected)::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: hsl(var(--primary));
}

.calendar-day.selected {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 600;
  box-shadow: 0 2px 8px hsl(var(--primary) / 0.3);
  transform: scale(1.05);
}

.calendar-day.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}
</style>

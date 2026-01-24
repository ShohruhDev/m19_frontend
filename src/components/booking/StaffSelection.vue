<template>
  <div class="space-y-4">
    <h2 class="text-xl font-heading font-semibold text-primary mb-4">Выберите мастера</h2>

    <div v-if="isLoading" class="grid grid-cols-2 gap-4">
      <Skeleton class="h-40 w-full" />
      <Skeleton class="h-40 w-full" />
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive">{{ error }}</p>
      <Button variant="outline" class="mt-4" @click="loadStaff">Попробовать снова</Button>
    </div>

    <ScrollArea v-else class="h-[400px] pr-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Staff List (Filtered) -->
        <SelectableCard
          v-for="member in filteredStaff"
          :key="member.id"
          :is-selected="selectedStaff?.id === member.id"
          @click="selectStaff(member)"
          class="p-4 flex flex-col items-center text-center h-full min-h-[160px]"
        >
          <div class="w-16 h-16 rounded-full overflow-hidden bg-secondary mb-3 border-2 border-border shadow-sm">
            <img 
              v-if="member.avatar" 
              :src="member.avatar" 
              :alt="member.name" 
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground">
              {{ member.name.charAt(0) }}
            </div>
          </div>
          
          <h3 class="font-heading font-medium text-foreground">{{ member.name }}</h3>
          <p class="text-xs text-muted-foreground mt-1 mb-2">
            {{ member.specialization || 'Барбер' }}
          </p>
          <div class="flex items-center gap-1 mb-3 text-xs text-yellow-500">
             <span>★</span>
             <span>{{ member.rating || '5.0' }}</span>
          </div>

          <!-- Quick Availablity Chips -->
          <div v-if="member.next_slots && member.next_slots.length > 0" class="w-full flex flex-col gap-1.5">
            <span class="text-[10px] text-muted-foreground">Ближайшее время:</span>
            <div class="flex gap-1 overflow-x-auto pb-1 no-scrollbar justify-center">
              <button 
                v-for="slot in member.next_slots" 
                :key="slot.date + slot.time"
                class="shrink-0 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 text-[10px] text-primary font-medium whitespace-nowrap border border-primary/30 transition-colors"
                @click.stop="quickBook(member, slot)"
              >
                {{ formatSlotLabel(slot) }}
              </button>
            </div>
          </div>
          <div v-else class="text-[10px] text-muted-foreground">
             Нет свободных окон на ближайшее время
          </div>
        </SelectableCard>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBookingFlow } from '@/composables'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AltegStaff } from '@/types'

const {
  staff,
  selectedStaff,
  isLoading,
  error,
  loadStaff,
  selectStaff: selectStaffAction,
  selectDate,
  selectTime,
  nextStep,
} = useBookingFlow()

const filteredStaff = computed(() => {
  return staff.value.filter(member => {
    const role = (member.specialization || 'Барбер').toLowerCase()
    return role.includes('barber') || role.includes('барбер')
  })
})

const selectStaff = (member: AltegStaff | null) => {
  if (member) {
    selectStaffAction(member)
  } else {
    // Select first available or handle "Any" logic in store
    // For now, auto-select first one to proceed
    if (filteredStaff.value.length > 0) {
      selectStaffAction(filteredStaff.value[0])
    }
  }
}

const quickBook = (member: AltegStaff, slot: any) => {
  // Select the staff member
  selectStaffAction(member)
  
  // Select the date
  selectDate(slot.date)
  
  // Select the time slot
  const timeSlot = {
    time: slot.time,
    datetime: `${slot.date}T${slot.time}:00`,
    available: true,
    staff_id: member.id
  }
  selectTime(timeSlot)
  
  // Move to next step (confirmation)
  nextStep()
  nextStep() // Skip time selection since we already selected time
}

const formatSlotLabel = (slot: any) => {
  const todayStr = new Date().toISOString().split('T')[0]
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0]
  
  const dateLabel = slot.date === todayStr ? 'Сегодня' : slot.date === tomorrowStr ? 'Завтра' : slot.date.slice(5)
  return `${dateLabel} ${slot.time}`
}

onMounted(() => {
  if (staff.value.length === 0) {
    loadStaff()
  }
})
</script>

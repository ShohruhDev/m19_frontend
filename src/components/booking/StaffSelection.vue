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
        <!-- Any Master Option -->
        <SelectableCard
          :is-selected="selectedStaff === null"
          @click="selectStaff(null)"
          class="p-4 flex flex-col items-center justify-center text-center h-full min-h-[160px]"
        >
          <div class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-3">
            <svg class="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 class="font-heading font-medium text-foreground">Любой мастер</h3>
          <p class="text-xs text-muted-foreground mt-1">Подберем ближайшее время</p>
        </SelectableCard>

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
          <p class="text-xs text-muted-foreground mt-1">
            {{ member.specialization || 'Барбер' }}
          </p>
          <div class="flex items-center gap-1 mt-2 text-xs text-yellow-500">
             <span>★</span>
             <span>{{ member.rating || '5.0' }}</span>
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

onMounted(() => {
  if (staff.value.length === 0) {
    loadStaff()
  }
})
</script>


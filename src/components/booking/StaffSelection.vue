<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-heading font-bold text-gold-500 mb-6">Выберите мастера</h2>

    <SkeletonLoader v-if="isLoading" type="card" size="md" />
    <SkeletonLoader v-if="isLoading" type="card" size="md" />

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-500">{{ error }}</p>
    </div>

    <div v-else class="grid gap-4">
      <!-- Любой мастер опция -->
      <SelectableCard
        :is-selected="selectedStaff === null"
        @click="selectStaff(null)"
      >
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gold-500/20 flex items-center justify-center">
            <svg class="w-8 h-8 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-heading font-semibold text-white">
              Любой мастер
            </h3>
            <p class="text-white/70 text-sm">
              Первый свободный специалист
            </p>
          </div>
        </div>
      </SelectableCard>

      <!-- Список мастеров -->
      <SelectableCard
        v-for="member in staff"
        :key="member.id"
        :is-selected="selectedStaff?.id === member.id"
        @click="selectStaff(member)"
      >
        <div class="flex items-start gap-4">
          <div class="relative">
            <img
              v-if="member.avatar_url || member.avatar || member.avatar_big"
              :src="member.avatar_url || member.avatar_big || member.avatar"
              :alt="member.name"
              class="w-20 h-20 rounded-full object-cover border-2 border-gold-500/30"
            />
            <div
              v-else
              class="w-20 h-20 rounded-full bg-gold-500/20 flex items-center justify-center text-2xl font-bold text-gold-500"
            >
              {{ member.name.charAt(0) }}
            </div>
          </div>

          <div class="flex-1">
            <h3 class="text-xl font-heading font-semibold text-white mb-1">
              {{ member.name }}
            </h3>
            <p v-if="member.specialization" class="text-gold-500 text-sm mb-2">
              {{ member.specialization }}
            </p>
            <p v-if="member.description" class="text-white/70 text-sm mb-3">
              {{ member.description }}
            </p>

            <div class="flex items-center gap-4 text-sm text-white/50">
              <span v-if="member.rating" class="flex items-center gap-1">
                <svg class="w-4 h-4 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ member.rating }}
              </span>
              <span v-if="member.reviews_count">
                {{ member.reviews_count }} отзыв{{ member.reviews_count > 1 ? 'а' : '' }}
              </span>
              <span v-if="member.experience_years">
                Опыт: {{ member.experience_years }} лет
              </span>
            </div>
          </div>
        </div>
      </SelectableCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingFlow } from '@/composables'
import SelectableCard from '@/components/ui/SelectableCard.vue'
import SkeletonLoader from '@/components/ui/SkeletonLoader.vue'
import type { AltegStaff } from '@/types'

const {
  staff,
  selectedStaff,
  isLoading,
  error,
  selectStaff: selectStaffAction,
} = useBookingFlow()

const selectStaff = (member: AltegStaff | null) => {
  if (member) {
    selectStaffAction(member)
  } else {
    // Выбираем первого доступного мастера
    if (staff.value.length > 0) {
      selectStaffAction(staff.value[0])
    }
  }
}
</script>


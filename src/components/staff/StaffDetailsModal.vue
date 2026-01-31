<template>
  <Dialog :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <DialogContent class="max-w-2xl max-h-[90vh] p-0 overflow-hidden bg-dark border-gold-500/30 flex flex-col gap-0">
      <DialogHeader class="p-6 pb-2 shrink-0 bg-dark z-10">
        <DialogTitle class="text-2xl font-heading text-gradient">Информация о мастере</DialogTitle>
      </DialogHeader>

      <div 
        class="flex-1 overflow-y-auto p-6 pt-2 scrollbar-custom min-h-0 overscroll-contain"
        data-lenis-prevent
      >
        <div v-if="staff" class="space-y-6">
          <!-- Avatar and Basic Info -->
          <div class="flex flex-col md:flex-row gap-6">
          <!-- Avatar -->
          <div class="w-full md:w-48 aspect-square rounded-lg overflow-hidden bg-dark-50 shrink-0">
            <img 
              v-if="staff.avatar_big || staff.avatar" 
              :src="staff.avatar_big || staff.avatar" 
              :alt="staff.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-6xl font-bold text-gold-500/20">
              {{ staff.name.charAt(0) }}
            </div>
          </div>

          <!-- Info -->
          <div class="flex-1 space-y-4">
            <div>
              <h3 class="text-3xl font-heading font-bold text-white mb-2">
                {{ staff.name }}
              </h3>
              <p class="text-gold-500 font-medium text-lg">{{ staff.specialization || 'Барбер' }}</p>
            </div>

            <!-- Stats -->
            <div class="flex flex-wrap gap-6 text-sm">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-white font-semibold">{{ staff.rating || '5.0' }}</span>
              </div>
              
              <div class="flex items-center gap-2 text-white/70">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <span>{{ staff.comments_count || 0 }} отзывов</span>
              </div>
            </div>

            <!-- Booking Button -->
            <BaseButton
              variant="primary"
              size="lg"
              class="w-full md:w-auto"
              @click="handleBooking"
            >
              Записаться к мастеру
            </BaseButton>
          </div>
        </div>

        <!-- Description -->
        <div v-if="staff.information" class="space-y-3">
          <h4 class="text-lg font-heading font-semibold text-white border-b border-gold-500/30 pb-2">
            О мастере
          </h4>
          <div 
            class="prose prose-invert prose-sm max-w-none text-white/80 leading-relaxed"
            v-html="staff.information"
          ></div>
        </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { AltegStaff } from '@/types'

interface Props {
  isOpen: boolean
  staff: AltegStaff | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:isOpen': [value: boolean]
  'book': [staff: AltegStaff]
}>()

const handleBooking = () => {
  if (props.staff) {
    emit('book', props.staff)
  }
}

// Lock body scroll when modal is open
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Custom prose styles for HTML content */
:deep(.prose) {
  color: rgba(255, 255, 255, 0.8);
}

:deep(.prose p) {
  margin-bottom: 1em;
}

:deep(.prose strong) {
  color: rgb(212, 175, 55);
  font-weight: 600;
}

:deep(.prose ul), :deep(.prose ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

:deep(.prose li) {
  margin-bottom: 0.5em;
}
</style>

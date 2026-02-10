<template>
  <Dialog :open="isOpen" @update:open="(val) => !val && handleClose()">
    <DialogContent 
      class="w-full h-full sm:h-[85vh] sm:max-w-[800px] p-0 gap-0 bg-background border-border flex flex-col overflow-hidden max-w-none sm:rounded-lg !mb-0 sm:!mb-auto rounded-none" 
      :show-close-button="false"
    >
      <!-- Header with single close button -->
      <DialogHeader class="p-4 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between space-y-0">
        <DialogTitle class="text-lg font-heading font-bold">Онлайн-запись</DialogTitle>
        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-full" @click="handleClose">
          <X class="h-4 w-4" />
        </Button>
      </DialogHeader>

      <!-- Iframe Container -->
      <AltegioWidget />
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-vue-next'
import AltegioWidget from './AltegioWidget.vue'

interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* Ensure iframe takes full height of the container */
iframe {
  display: block;
}
</style>


<template>
  <Dialog :open="isOpen" @update:open="(val) => !val && close()">
    <DialogContent 
      :class="[
        'bg-background border-border sm:rounded-lg',
        sizeClasses,
        'p-0 gap-0 overflow-hidden'
      ]"
    >
      <!-- Header -->
      <DialogHeader v-if="$slots.header" class="p-6 sm:p-8 border-b border-border">
        <DialogTitle class="text-xl font-heading font-semibold text-foreground">
          <slot name="header"></slot>
        </DialogTitle>
      </DialogHeader>

      <!-- Body -->
      <div class="p-6 sm:p-8">
        <slot></slot>
      </div>

      <!-- Footer -->
      <DialogFooter v-if="$slots.footer" class="p-6 sm:p-8 border-t border-border bg-muted/20">
        <slot name="footer"></slot>
      </DialogFooter>
      
      <!-- Close button is built-in to DialogContent usually, but we can customize or let it be. 
           Shadcn DialogContent includes a DialogClose button by default (X icon). -->
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  isOpen: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean // Handled by DialogContent default close button usually
  closeOnBackdrop?: boolean // Handled by Dialog default
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showClose: true,
  closeOnBackdrop: true,
})

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-2xl',
    lg: 'sm:max-w-4xl',
    xl: 'sm:max-w-6xl',
    full: 'sm:max-w-[100vw] h-full sm:h-auto sm:min-h-screen',
  }
  return sizes[props.size]
})
</script>


<template>
  <Button
    :variant="mappedVariant"
    :size="mappedSize"
    :disabled="disabled || loading"
    :class="[
      'font-heading font-semibold uppercase tracking-[0.05em] transition-all duration-300',
      'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      $attrs.class
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
    <slot></slot>
  </Button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from '@/components/ui/button'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const mappedVariant = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'default'
    case 'secondary':
      // Mapping secondary to 'secondary' variant (Dark bg, Gold text per our global override)
      return 'secondary'
    case 'ghost':
      return 'ghost'
    case 'outline':
      // Outline in original was Gold border/text.
      // Shadcn outline is generic border. We might want to use 'outline' but if it doesn't look gold, we can add classes.
      // But for now, standard outline uses border-input (white/10) and text-primary.
      // If we want Gold Outline, we might need a custom class or variant. 
      // Let's stick to 'outline' for now to be "Shadcn-native".
      return 'outline'
    default:
      return 'default'
  }
})

const mappedSize = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'sm'
    case 'md':
      return 'default'
    case 'lg':
      return 'lg'
    default:
      return 'default'
  }
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>


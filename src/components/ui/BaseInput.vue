<template>
  <div class="grid w-full items-center gap-2">
    <Label
      v-if="label"
      :for="id"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      :class="error ? 'text-destructive' : 'text-primary'"
    >
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>
    
    <Input
      :id="id"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'h-14 px-6 bg-secondary/50 border-input text-foreground placeholder:text-muted-foreground',
        'focus-visible:ring-primary focus-visible:border-primary',
        error ? 'border-destructive focus-visible:ring-destructive' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @blur="handleBlur"
    />
    
    <p v-if="error" class="text-sm font-medium text-destructive">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-muted-foreground">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  id: string
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'tel' | 'password' | 'number'
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => emit('update:modelValue', String(value)),
})

const handleBlur = () => {
  emit('blur')
}
</script>


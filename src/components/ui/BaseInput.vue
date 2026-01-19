<template>
  <div class="relative w-full">
    <input
      :id="id"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-6 py-4 bg-dark-50 border-2 text-white placeholder-white/50',
        'font-sans transition-all duration-300',
        'focus:outline-none focus:border-gold-500 focus:bg-dark-100',
        error ? 'border-red-500' : 'border-white/20',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @blur="handleBlur"
    />
    <label
      v-if="label"
      :for="id"
      class="absolute -top-3 left-4 px-2 bg-dark text-sm text-gold-500 font-medium"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-2 text-sm text-white/50">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  set: (value: string) => emit('update:modelValue', value),
})

const handleBlur = () => {
  emit('blur')
}
</script>


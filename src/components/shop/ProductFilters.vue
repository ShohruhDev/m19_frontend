<template>
  <div class="filters p-6 bg-dark/40 backdrop-blur-md rounded-xl border border-white/5 sticky top-32 transition-all duration-300 hover:border-white/10">
    <div class="flex items-center justify-between mb-6">
      <h3 class="font-heading font-bold text-white text-lg">Категории</h3>
      <button 
        v-if="selectedCategories.length > 0"
        @click="selectedCategories = []"
        class="text-xs text-m19-gold hover:text-white transition-colors"
      >
        Сбросить
      </button>
    </div>
    
    <div class="space-y-3">
      <label 
        v-for="cat in categories" 
        :key="cat.id" 
        class="flex items-center gap-3 cursor-pointer group"
      >
        <div class="relative flex items-center justify-center w-5 h-5">
          <input 
            type="checkbox" 
            :value="cat.title"
            v-model="selectedCategories"
            class="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
          >
          <!-- Visual Box -->
          <div 
             class="w-5 h-5 rounded border transition-all duration-200 flex items-center justify-center"
             :class="selectedCategories.includes(cat.title) ? 'bg-m19-gold border-m19-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'border-white/20 bg-dark/50 group-hover:border-white/40'"
          >
             <!-- Custom Checkmark -->
             <svg 
               v-show="selectedCategories.includes(cat.title)"
               class="w-3.5 h-3.5 text-dark pointer-events-none font-bold" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor"
               stroke-width="3"
             >
               <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
             </svg>
          </div>
        </div>
        
        <span 
          class="text-sm text-white/60 group-hover:text-white transition-colors select-none"
          :class="{ 'text-m19-gold font-bold': selectedCategories.includes(cat.title) }"
        >
          {{ cat.title }}
        </span>
      </label>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  categories: any[]
}>()

const emit = defineEmits(['update:filters'])

const selectedCategories = ref<string[]>([])

watch(selectedCategories, (newVal) => {
  emit('update:filters', { categories: newVal })
})
</script>

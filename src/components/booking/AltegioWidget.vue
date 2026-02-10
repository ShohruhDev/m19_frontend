<template>
  <div class="w-full h-full bg-black relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-background z-10">
       <Loader2 class="h-8 w-8 animate-spin text-primary" />
    </div>
    <iframe 
      :src="altegioUrl" 
      class="w-full h-full border-none"
      allow="geolocation; microphone; camera"
      @load="onIframeLoad"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const altegioUrl = 'https://n129791.alteg.io/company/138998'
const loading = ref(true)

const onIframeLoad = () => {
  loading.value = false
}
</script>

<style scoped>
iframe {
  display: block;
}
</style>

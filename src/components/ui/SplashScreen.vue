<template>
  <Transition name="fade">
    <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <div class="relative flex flex-col items-center">
        <!-- Logo Container with Glow user effect -->
        <div class="relative">
          <div class="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-slow"></div>
          <img 
            src="@/assets/logo.png" 
            alt="M19 Barbershop" 
            class="relative w-48 md:w-64 h-auto object-contain animate-logo-enter"
          />
        </div>
        
        <!-- Loading Indicator -->
        <div class="mt-8 flex gap-1">
          <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-delay-1"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-delay-2"></div>
          <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce-delay-3"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
}

defineProps<Props>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-logo-enter {
  animation: logoEnter 1s ease-out forwards;
}

.animate-bounce-delay-1 {
  animation: bounce 0.6s infinite alternate;
  animation-delay: 0s;
}
.animate-bounce-delay-2 {
  animation: bounce 0.6s infinite alternate;
  animation-delay: 0.2s;
}
.animate-bounce-delay-3 {
  animation: bounce 0.6s infinite alternate;
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.2;
    transform: scale(1.5);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.8);
  }
}

@keyframes logoEnter {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
    filter: blur(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
    filter: blur(0);
  }
}

@keyframes bounce {
  to {
    transform: translateY(-8px);
    opacity: 0.5;
  }
}
</style>

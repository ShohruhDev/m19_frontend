<template>
  <section id="reviews" class="section-padding bg-dark relative overflow-hidden">
    <!-- Background elements -->
    <div class="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
       <div class="absolute top-20 right-20 w-96 h-96 rounded-full bg-gold-500 blur-[100px]"></div>
    </div>

    <div class="container-custom relative z-10">
      <div class="text-center mb-16" data-scroll>
        <h2 class="text-display-md font-heading font-bold text-white mb-4">
          Отзывы наших клиентов
        </h2>
        <div class="w-24 h-1 bg-gold-500 mx-auto rounded-full"></div>
      </div>

      <div class="max-w-2xl mx-auto bg-dark-50 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div class="p-4 md:p-8">
           <!-- Yandex Maps Widget iframe -->
           <div style="width:100%;height:800px;overflow:hidden;position:relative;">
             <iframe 
               src="https://yandex.ru/maps-reviews-widget/204967204178?comments&theme=dark" 
               width="100%" 
               height="100%" 
               frameborder="0" 
               style="width:100%;height:100%;border:1px solid #333;border-radius:8px;box-sizing:border-box"
             ></iframe>
           </div>
           
           <div class="mt-6 text-center text-sm text-gray-500">
             <a 
               href="https://yandex.uz/maps/org/m19_barbershop/204967204178/reviews/" 
               target="_blank" 
               rel="noopener noreferrer"
               class="hover:text-gold-500 transition-colors underline underline-offset-4"
             >
               Читать все отзывы на Яндекс Картах
             </a>
           </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// No script needed for iframe embedding
</script>

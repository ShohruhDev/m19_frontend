<template>
  <footer class="bg-dark border-t border-white/5 pt-16 pb-8 text-sm">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <!-- Logo & Desc -->
        <div class="md:col-span-1">
          <div class="text-2xl font-bold font-heading text-white mb-4">M19<span class="text-m19-gold">.</span></div>
          <p class="text-white/50 max-w-xs leading-relaxed mb-6">
            Современный барбершоп в центре Ташкента
          </p>
          <div class="text-white/50 space-y-2">
             <div class="font-bold text-white">Режим работы</div>
             <div>Ежедневно с 10:00 до 22:00</div>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h4 class="font-bold text-white mb-4 uppercase tracking-wider text-xs">Навигация</h4>
          <ul class="space-y-3">
            <li><a href="#hero" class="text-white/60 hover:text-m19-gold transition-colors">Главная</a></li>
            <li><a href="#services" class="text-white/60 hover:text-m19-gold transition-colors">Услуги</a></li>
            <li><a href="#staff" class="text-white/60 hover:text-m19-gold transition-colors">Мастера</a></li>
            <li><a href="#reviews" class="text-white/60 hover:text-m19-gold transition-colors">Отзывы</a></li>
            <li><a href="#contacts" class="text-white/60 hover:text-m19-gold transition-colors">Контакты</a></li>
          </ul>
        </div>

        <!-- Contacts -->
        <div class="md:col-span-2">
          <h4 class="font-bold text-white mb-4 uppercase tracking-wider text-xs">Контакты</h4>
          <div class="grid md:grid-cols-2 gap-6">
             <ul class="space-y-3 text-white/60">
               <li class="flex items-start gap-3">
                 <span class="text-m19-gold mt-1">📍</span>
                 <a href="https://yandex.uz/maps/10335/tashkent/?text=M19%20Barbershop%20ул.%20Авлиё-Ота%2C%2036" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">
                   <div>ул. Авлиё-Ота, 36</div>
                   <div class="text-xs opacity-70">Ташкент, метро «Айбек»</div>
                 </a>
               </li>
               <li class="flex items-center gap-3">
                 <span class="text-m19-gold">✉️</span>
                 <a href="mailto:info@m19barbershop.uz" class="hover:text-white transition-colors">info@m19barbershop.uz</a>
               </li>
             </ul>
             <ul class="space-y-3 text-white/60">
               <li class="flex items-center gap-3">
                 <span class="text-m19-gold">📞</span>
                 <div class="flex flex-col">
                   <a href="tel:+998910040019" class="hover:text-white transition-colors text-lg font-bold text-white">+998 (91) 004-00-19</a>
                   <span class="text-xs">Администратор</span>
                 </div>
               </li>
             </ul>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
        <div>&copy; 2026 M19 Barbershop. Все права защищены.</div>
        <div class="flex items-center gap-6">
          <a href="https://instagram.com/m19barbershop" target="_blank" rel="noopener noreferrer" class="hover:text-m19-gold text-white/60 transition-colors" aria-label="Instagram">
            <Instagram class="w-5 h-5" />
          </a>
          <a href="https://t.me/m19barbershop" target="_blank" rel="noopener noreferrer" class="hover:text-m19-gold text-white/60 transition-colors" aria-label="Telegram">
            <Send class="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Instagram, Send } from 'lucide-vue-next'
</script>

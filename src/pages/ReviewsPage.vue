<template>
  <div class="reviews-page min-h-screen bg-dark">
    <AppHeader />

    <main class="pt-32 pb-20">
      <div class="container-custom">
        <div class="text-center mb-16">
          <h1 class="text-display-md font-heading font-bold text-gradient mb-4">
            Отзывы клиентов
          </h1>
          <p class="text-xl text-white/70 max-w-2xl mx-auto">
            Что говорят о нас наши клиенты
          </p>

          <div class="flex items-center justify-center gap-8 mt-8">
            <div class="text-center">
              <div class="text-4xl font-bold text-gold-500 mb-1">{{ BARBERSHOP_INFO.rating.score }}</div>
              <div class="flex items-center gap-1 mb-2">
                <svg v-for="i in 5" :key="i" class="w-5 h-5 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div class="text-sm text-white/50">Средний рейтинг</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-gold-500 mb-1">{{ BARBERSHOP_INFO.rating.count }}+</div>
              <div class="text-sm text-white/50">Отзывов на {{ BARBERSHOP_INFO.rating.source }}</div>
            </div>
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <div
            v-for="(review, index) in reviews"
            :key="index"
            class="card-premium p-6 space-y-4"
          >
            <!-- Header -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="w-12 h-12 rounded-full bg-gold-500/20 flex items-center justify-center
                         text-xl font-bold text-gold-500"
                >
                  {{ review.author.charAt(0) }}
                </div>
                <div>
                  <div class="font-heading font-semibold text-white">{{ review.author }}</div>
                  <div class="text-sm text-white/50">{{ review.date }}</div>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <svg
                  v-for="i in 5"
                  :key="i"
                  :class="[
                    'w-4 h-4',
                    i <= review.rating ? 'text-gold-500' : 'text-white/20',
                  ]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
            </div>

            <!-- Review text -->
            <p class="text-white/70 leading-relaxed">{{ review.text }}</p>

            <!-- Service & Master -->
            <div class="flex items-center gap-4 text-sm text-white/50 pt-4 border-t border-white/10">
              <span>{{ review.service }}</span>
              <span>•</span>
              <span>Мастер: {{ review.master }}</span>
            </div>
          </div>
        </div>

        <!-- Load More -->
        <div class="text-center mt-12">
          <BaseButton variant="ghost" size="lg">
            Загрузить ещё
          </BaseButton>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { REVIEWS, BARBERSHOP_INFO } from '@/data/m19-data'

const reviews = REVIEWS
</script>


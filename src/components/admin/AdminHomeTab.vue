<template>
  <div>
    <div class="mb-8">
      <h2 class="text-2xl font-heading font-bold text-white">Добро пожаловать 👋</h2>
      <p class="text-white/40 text-sm mt-1">M19 Barbershop — панель управления</p>
    </div>

    <!-- Quick nav cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="card in cards"
        :key="card.tab"
        @click="emit('navigate', card.tab)"
        class="home-card group text-left"
      >
        <div class="home-card-icon" :style="`background: ${card.color}15; color: ${card.color}`">
          <component :is="card.icon" class="w-6 h-6" />
        </div>
        <p class="text-white font-heading font-semibold text-sm mt-3">{{ card.title }}</p>
        <p class="text-white/40 text-xs mt-1">{{ card.desc }}</p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Tag as TagIcon,
  Package as PackageIcon,
  ClipboardList as ClipboardListIcon,
} from 'lucide-vue-next'

const emit = defineEmits<{ navigate: [tab: string] }>()

const cards = [
  { tab: 'upload',     title: 'Загрузить фото',      desc: 'Добавить новые работы в галерею',      icon: UploadIcon,        color: '#e5e4e2' },
  { tab: 'manage',     title: 'Управление галереей',  desc: 'Редактировать и удалять файлы',         icon: ImageIcon,         color: '#60a5fa' },
  { tab: 'categories', title: 'Категории галереи',    desc: 'Управлять категориями',                 icon: TagIcon,           color: '#a78bfa' },
  { tab: 'products',   title: 'Товары',               desc: 'Добавить и редактировать товары',       icon: PackageIcon,       color: '#34d399' },
  { tab: 'prod-cats',  title: 'Категории товаров',    desc: 'Управлять категориями товаров',         icon: TagIcon,           color: '#f59e0b' },
  { tab: 'orders',     title: 'Заказы',               desc: 'Просмотр и обработка заказов',          icon: ClipboardListIcon, color: '#f87171' },
]
</script>

<style scoped>
.home-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, transform 0.15s;
}
.home-card:hover {
  border-color: rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.06);
  transform: translateY(-2px);
}

.home-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

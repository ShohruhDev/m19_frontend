<template>
  <div class="gallery-page min-h-screen bg-dark">
    <AppHeader />

    <!-- Hero Banner -->
    <section class="gallery-hero relative h-[50vh] flex items-end overflow-hidden">
      <div class="absolute inset-0">
        <div class="gallery-hero-bg"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-dark"></div>
      </div>

      <!-- Floating decorative elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="deco-item deco-1">✂</div>
        <div class="deco-item deco-2">✦</div>
        <div class="deco-item deco-3">✂</div>
        <div class="deco-item deco-4">◆</div>
      </div>

      <div class="container-custom relative z-10 pb-16">
        <div class="hero-text">
          <p class="text-gold-500 font-heading text-sm uppercase tracking-[0.4em] mb-3 opacity-80">M19 Barbershop</p>
          <h1 class="text-display-lg font-heading font-bold text-white leading-tight mb-4">
            Наши <span class="text-gradient">работы</span>
          </h1>
          <p class="text-white/60 text-lg max-w-xl">
            Загляните в атмосферу настоящего мужского клуба
          </p>
        </div>
      </div>
    </section>

    <!-- Filter Tabs -->
    <section class="sticky top-20 md:top-24 z-30 bg-dark/80 backdrop-blur-xl border-b border-white/5">
      <div class="container-custom">
        <div class="flex items-center gap-1 py-4 overflow-x-auto scrollbar-none">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="switchCategory(cat.key)"
            class="filter-btn"
            :class="activeCategory === cat.key ? 'filter-btn-active' : 'filter-btn-inactive'"
          >
            <span class="filter-btn-icon">{{ cat.icon }}</span>
            {{ cat.label }}
            <span v-if="cat.key !== 'all'" class="filter-count">
              {{ getCategoryCount(cat.key) }}
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Gallery Grid -->
    <section class="section-padding pt-12">
      <div class="container-custom">

        <!-- Stats bar -->
        <div class="flex items-center justify-between mb-10">
          <p class="text-white/40 text-sm">
            Показано
            <span class="text-gold-500 font-semibold">{{ galleryItems.length }}</span>
            <span v-if="totalCount > galleryItems.length"> из {{ totalCount }}</span>
            работ
          </p>
          <div class="flex items-center gap-2 text-white/30 text-sm">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Обновлено сегодня
          </div>
        </div>

        <!-- Skeleton Loader -->
        <div v-if="isLoading && galleryItems.length === 0" class="gallery-masonry">
          <div v-for="n in 9" :key="n" class="gallery-item gallery-skeleton" :class="getSkeletonSpan(n)">
            <div class="skeleton-inner"></div>
          </div>
        </div>

        <!-- Masonry Grid -->
        <TransitionGroup v-else name="gallery" tag="div" class="gallery-masonry">
          <div
            v-for="(item, index) in galleryItems"
            :key="item.id"
            class="gallery-item"
            :class="item.span"
            @click="openLightbox(item)"
          >
            <!-- Video thumbnail -->
            <div v-if="item.type === 'video'" class="gallery-media">
              <img :src="item.thumb || item.file_url" :alt="item.title" class="gallery-img" loading="lazy" />
              <div class="video-play-overlay">
                <div class="play-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 text-dark ml-1">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <span v-if="item.duration" class="video-duration">{{ item.duration }}</span>
              </div>
            </div>

            <!-- Photo -->
            <div v-else class="gallery-media">
              <img :src="item.file_url" :alt="item.title" class="gallery-img" loading="lazy" />
            </div>

            <!-- Overlay -->
            <div class="gallery-overlay">
              <div class="gallery-overlay-content">
                <span class="gallery-tag">{{ item.category }}</span>
                <h3 class="gallery-title">{{ item.title }}</h3>
                <p v-if="item.master" class="gallery-master">Мастер: {{ item.master }}</p>
              </div>
              <div class="gallery-expand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </div>
            </div>

            <!-- Index badge -->
            <span class="gallery-index">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
        </TransitionGroup>

        <!-- Loading more spinner -->
        <div v-if="isLoading && galleryItems.length > 0" class="flex justify-center py-12">
          <div class="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <!-- Load More -->
        <div v-else-if="hasMore" class="flex justify-center pt-12">
          <button @click="loadMore" class="load-more-btn">
            <span>Показать ещё</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>

        <!-- Empty state -->
        <div v-else-if="!isLoading && galleryItems.length === 0" class="text-center py-24">
          <div class="text-6xl mb-6 opacity-20">✂</div>
          <p class="text-white/40 text-xl">Нет работ в этой категории</p>
          <p class="text-white/20 text-sm mt-2">Попробуйте выбрать другую категорию</p>
        </div>
      </div>
    </section>


    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox">
        <div
          v-if="lightboxOpen"
          class="lightbox-backdrop"
          @click.self="closeLightbox"
        >
          <div class="lightbox-container">
            <!-- Close -->
            <button class="lightbox-close" @click="closeLightbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
                <path d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- Prev / Next -->
            <button class="lightbox-nav lightbox-prev" @click="prevItem" :disabled="currentIndex === 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button class="lightbox-nav lightbox-next" @click="nextItem" :disabled="currentIndex === galleryItems.length - 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>

            <!-- Media -->
            <div class="lightbox-media">
              <Transition name="fade" mode="out-in">
                <div :key="currentItem?.id" class="w-full h-full flex items-center justify-center">
                  <video
                    v-if="currentItem?.type === 'video'"
                    :src="currentItem.file_url"
                    controls autoplay
                    class="lightbox-video"
                  ></video>
                  <img
                    v-else
                    :src="currentItem?.file_url"
                    :alt="currentItem?.title"
                    class="lightbox-img"
                  />
                </div>
              </Transition>
            </div>

            <!-- Info panel -->
            <div class="lightbox-info">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <span class="text-xs font-heading uppercase tracking-widest text-gold-500 mb-1 block">
                    {{ currentItem?.category }}
                  </span>
                  <h3 class="text-xl font-heading font-bold text-white mb-1">{{ currentItem?.title }}</h3>
                  <p v-if="currentItem?.master" class="text-white/50 text-sm">
                    Мастер: <span class="text-white/80">{{ currentItem?.master }}</span>
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <!-- Share button -->
                  <button @click="shareItem" class="lightbox-action-btn" title="Поделиться">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                  <!-- Open in tab -->
                  <a :href="currentItem?.file_url" target="_blank" class="lightbox-action-btn" title="Открыть оригинал">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                  </a>
                  <span class="text-white/20 font-heading text-xl font-bold shrink-0">
                    {{ String(currentIndex + 1).padStart(2, '0') }}/{{ String(galleryItems.length).padStart(2, '0') }}
                  </span>
                </div>
              </div>

              <!-- Thumbnail strip -->
              <div class="flex gap-2 mt-4 overflow-x-auto scrollbar-none pb-1">
                <button
                  v-for="(item, idx) in galleryItems"
                  :key="item.id"
                  @click="currentIndex = idx"
                  class="lightbox-thumb"
                  :class="idx === currentIndex ? 'lightbox-thumb-active' : 'lightbox-thumb-inactive'"
                >
                  <img :src="item.thumb || item.file_url" :alt="item.title" class="w-full h-full object-cover" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Share Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="shareToast" class="share-toast">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Ссылка скопирована!
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '@unhead/vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import { galleryService, type GalleryItem, type CategoryItem } from '@/services/gallery.service'

const route = useRoute()
const router = useRouter()

// ─── SEO ─────────────────────────────────────────────────────────────────────
useHead({
  title: 'Галерея - M19 Barbershop',
  meta: [
    { name: 'description', content: 'Галерея работ мастеров M19 Barbershop — лучшие стрижки, оформление бороды и стильные образы в Ташкенте.' },
    { name: 'keywords', content: 'галерея барбершоп, стрижки ташкент, фото барбера, m19 галерея' },
    { property: 'og:title', content: 'Галерея - M19 Barbershop' },
    { property: 'og:image', content: 'https://m19barbershop.uz/og-gallery.jpg' },
  ]
})

// ─── Categories ──────────────────────────────────────────────────────────────
const dbCategories = ref<CategoryItem[]>([])

const categories = computed(() => [
  { key: 'all', label: 'Все работы', icon: '◈' },
  ...dbCategories.value.map(c => ({ key: c.label, label: c.label, icon: c.icon })),
])

const activeCategory = ref('all')
const allItems = ref<GalleryItem[]>([]) // full list for category counts

// ─── Gallery Items (paginated) ─────────────────────────────────────────────
const galleryItems = ref<GalleryItem[]>([])
const isLoading = ref(true)
const currentPage = ref(0)
const totalCount = ref(0)
const hasMore = computed(() => galleryItems.value.length < totalCount.value)

const SPAN_PATTERN = (index: number): string => {
  if (index === 0) return 'col-span-2 row-span-2'
  if (index % 7 === 0) return 'col-span-1 row-span-2'
  if (index % 5 === 0) return 'col-span-2 row-span-1'
  return 'col-span-1 row-span-1'
}

const loadPage = async (page: number, reset = false) => {
  isLoading.value = true
  const { items, total } = await galleryService.fetchPage(page, activeCategory.value)
  totalCount.value = total
  const withSpan = items.map((item, i) => ({
    ...item,
    span: SPAN_PATTERN(reset ? i : galleryItems.value.length + i),
  }))
  if (reset) {
    galleryItems.value = withSpan
  } else {
    galleryItems.value = [...galleryItems.value, ...withSpan]
  }
  currentPage.value = page
  isLoading.value = false
}

const loadMore = () => loadPage(currentPage.value + 1, false)

const switchCategory = (catId: string) => {
  activeCategory.value = catId
  galleryItems.value = []
  currentPage.value = 0
  loadPage(0, true)
}

// Category counts from all items
const getCategoryCount = (catKey: string): number => {
  return allItems.value.filter(i => i.category === catKey).length
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────
const getSkeletonSpan = (n: number): string => SPAN_PATTERN(n - 1)

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const lightboxOpen = ref(false)
const currentIndex = ref(0)
const currentItem = computed(() => galleryItems.value[currentIndex.value] ?? null)
const shareToast = ref(false)

const openLightbox = (item: GalleryItem) => {
  currentIndex.value = galleryItems.value.findIndex(i => i.id === item.id)
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
  // Deep link
  router.replace({ query: { ...route.query, item: item.id } })
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
  router.replace({ query: { ...route.query, item: undefined } })
}

const prevItem = () => { if (currentIndex.value > 0) currentIndex.value-- }
const nextItem = () => {
  if (currentIndex.value < galleryItems.value.length - 1) {
    currentIndex.value++
  } else if (hasMore.value) {
    loadMore()
  }
}

// Share button
const shareItem = async () => {
  const url = `${window.location.origin}/gallery?item=${currentItem.value?.id}`
  try {
    await navigator.clipboard.writeText(url)
    shareToast.value = true
    setTimeout(() => { shareToast.value = false }, 2500)
  } catch {
    // fallback
    prompt('Ссылка:', url)
  }
}

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prevItem()
  if (e.key === 'ArrowRight') nextItem()
}

// Deep link: open lightbox if ?item= is in URL
const handleDeepLink = async () => {
  const itemId = route.query.item as string | undefined
  if (itemId && galleryItems.value.length > 0) {
    const idx = galleryItems.value.findIndex(i => i.id === itemId)
    if (idx !== -1) {
      currentIndex.value = idx
      lightboxOpen.value = true
      document.body.style.overflow = 'hidden'
    } else {
      // Item might not be in current page — fetch it
      const item = await galleryService.fetchById(itemId)
      if (item) {
        galleryItems.value = [{ ...item, span: 'col-span-1 row-span-1' }, ...galleryItems.value]
        currentIndex.value = 0
        lightboxOpen.value = true
        document.body.style.overflow = 'hidden'
      }
    }
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  const [cats] = await Promise.all([
    galleryService.fetchCategories(),
    galleryService.fetchItems().then(items => { allItems.value = items }),
    loadPage(0, true),
  ])
  dbCategories.value = cats
  await handleDeepLink()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* ── Hero ── */
.gallery-hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 60% at 30% 50%, rgba(229,228,226,0.08) 0%, transparent 60%),
    linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 50%, #0A0A0A 100%);
}
.hero-text { animation: slideUp 0.8s ease-out both; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Decorations ── */
.deco-item {
  position: absolute;
  color: var(--color-gold-500);
  opacity: 0.05;
  font-size: 6rem;
  pointer-events: none;
  animation: floatDeco 8s ease-in-out infinite;
}
.deco-1 { top: 10%; left: 5%; animation-delay: 0s; }
.deco-2 { top: 30%; right: 10%; animation-delay: 2s; font-size: 3rem; }
.deco-3 { bottom: 20%; left: 40%; animation-delay: 4s; font-size: 4rem; }
.deco-4 { top: 60%; right: 20%; animation-delay: 1s; font-size: 2rem; }
@keyframes floatDeco {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(10deg); }
}

/* ── Filter Buttons ── */
.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 9999px;
  font-family: var(--font-family-heading);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255,255,255,0.1);
}
.filter-btn-icon { font-size: 0.85rem; }
.filter-count {
  font-size: 0.6rem;
  background: rgba(255,255,255,0.1);
  border-radius: 9999px;
  padding: 1px 6px;
  color: rgba(255,255,255,0.4);
}
.filter-btn-active {
  background: var(--color-gold-500);
  color: var(--color-dark);
  border-color: var(--color-gold-500);
  box-shadow: 0 4px 20px rgba(229,228,226,0.3);
}
.filter-btn-active .filter-count { background: rgba(0,0,0,0.15); color: rgba(0,0,0,0.6); }
.filter-btn-inactive { color: rgba(255,255,255,0.5); background: transparent; }
.filter-btn-inactive:hover {
  border-color: rgba(229,228,226,0.4);
  color: var(--color-gold-500);
  background: rgba(229,228,226,0.05);
}

/* ── Masonry Grid ── */
.gallery-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 200px;
  gap: 12px;
}
@media (max-width: 768px) {
  .gallery-masonry { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 160px; }
}
@media (max-width: 480px) {
  .gallery-masonry { grid-template-columns: 1fr; grid-auto-rows: 220px; }
}

/* ── Skeleton ── */
.gallery-skeleton {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  overflow: hidden;
  cursor: default;
}
.skeleton-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* ── Gallery Item ── */
.gallery-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 8px;
  background: var(--color-dark-50);
  border: 1px solid rgba(255,255,255,0.06);
}
.gallery-media { width: 100%; height: 100%; position: relative; }
.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: block;
}
.gallery-item:hover .gallery-img { transform: scale(1.08); }

/* ── Video overlay ── */
.video-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.35);
  gap: 8px;
}
.play-btn {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--color-gold-500);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 0 30px rgba(229,228,226,0.4);
}
.gallery-item:hover .play-btn { transform: scale(1.1); box-shadow: 0 0 40px rgba(229,228,226,0.6); }
.video-duration {
  color: white;
  font-family: var(--font-family-heading);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  background: rgba(0,0,0,0.6);
  padding: 2px 8px;
  border-radius: 20px;
}

/* ── Hover Overlay ── */
.gallery-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
}
.gallery-item:hover .gallery-overlay { opacity: 1; }
.gallery-overlay-content { transform: translateY(8px); transition: transform 0.4s ease; }
.gallery-item:hover .gallery-overlay-content { transform: translateY(0); }

.gallery-tag {
  display: inline-block;
  background: var(--color-gold-500);
  color: var(--color-dark);
  font-family: var(--font-family-heading);
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  padding: 2px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
}
.gallery-title { font-family: var(--font-family-heading); font-size: 0.95rem; font-weight: 700; color: white; line-height: 1.3; }
.gallery-master { font-size: 0.75rem; color: rgba(255,255,255,0.6); margin-top: 2px; }

.gallery-expand-icon {
  position: absolute;
  top: 12px; right: 12px;
  width: 32px; height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transform: scale(0);
  transition: transform 0.3s ease 0.1s;
}
.gallery-item:hover .gallery-expand-icon { transform: scale(1); }

.gallery-index {
  position: absolute; top: 10px; left: 12px;
  font-family: var(--font-family-heading);
  font-size: 0.65rem; font-weight: 800;
  color: rgba(255,255,255,0.15);
  letter-spacing: 0.1em;
  transition: all 0.3s;
}
.gallery-item:hover .gallery-index { color: rgba(255,255,255,0.5); }

@media (max-width: 480px) {
  .gallery-item { grid-column: span 1 !important; grid-row: span 1 !important; }
}

/* ── Load More ── */
.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  border-radius: 9999px;
  border: 1px solid rgba(229,228,226,0.25);
  color: rgba(255,255,255,0.7);
  font-family: var(--font-family-heading);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: transparent;
  cursor: pointer;
  transition: all 0.3s;
}
.load-more-btn:hover {
  border-color: var(--color-gold-500);
  color: var(--color-gold-500);
  box-shadow: 0 0 30px rgba(229,228,226,0.1);
}

/* ── CTA ── */
.cta-bg {
  background:
    radial-gradient(ellipse 60% 80% at 50% 50%, rgba(229,228,226,0.05) 0%, transparent 70%),
    var(--color-dark);
}

/* ── Lightbox ── */
.lightbox-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.95);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.lightbox-container {
  position: relative;
  width: 100%; max-width: 1000px; max-height: 90vh;
  display: flex; flex-direction: column;
  border-radius: 12px; overflow: hidden;
  background: var(--color-dark-50);
  border: 1px solid rgba(255,255,255,0.1);
}
.lightbox-media {
  flex: 1; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  background: #000; max-height: 65vh;
}
.lightbox-img { max-width: 100%; max-height: 65vh; object-fit: contain; display: block; }
.lightbox-video { max-width: 100%; max-height: 65vh; display: block; }
.lightbox-info { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }

.lightbox-close {
  position: absolute; top: 12px; right: 12px; z-index: 10;
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
  color: white; display: flex; align-items: center; justify-content: center;
  transition: background 0.2s; cursor: pointer; border: none;
}
.lightbox-close:hover { background: rgba(255,255,255,0.2); }

.lightbox-nav {
  position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
  color: white; display: flex; align-items: center; justify-content: center;
  cursor: pointer; border: none; transition: all 0.2s;
}
.lightbox-nav:hover { background: rgba(229,228,226,0.2); }
.lightbox-nav:disabled { opacity: 0.2; cursor: default; }
.lightbox-prev { left: 12px; }
.lightbox-next { right: 12px; }

.lightbox-action-btn {
  width: 34px; height: 34px; border-radius: 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.6);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; text-decoration: none;
}
.lightbox-action-btn:hover { background: rgba(255,255,255,0.15); color: white; }

.lightbox-thumb {
  width: 52px; height: 38px; flex-shrink: 0;
  border-radius: 4px; overflow: hidden;
  border: 2px solid transparent;
  transition: all 0.2s; cursor: pointer; padding: 0;
}
.lightbox-thumb-active { border-color: var(--color-gold-500); }
.lightbox-thumb-inactive { border-color: transparent; opacity: 0.5; }
.lightbox-thumb-inactive:hover { opacity: 0.8; }

/* ── Share Toast ── */
.share-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  z-index: 10000;
  display: flex; align-items: center; gap: 8px;
  background: rgba(34,197,94,0.15);
  border: 1px solid rgba(34,197,94,0.3);
  color: #4ade80;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
}

/* ── Transitions ── */
.gallery-enter-active, .gallery-leave-active { transition: all 0.4s ease; }
.gallery-enter-from, .gallery-leave-to { opacity: 0; transform: scale(0.95); }

.lightbox-enter-active, .lightbox-leave-active { transition: all 0.3s ease; }
.lightbox-enter-from, .lightbox-leave-to { opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active { transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px) scale(0.9); }
.toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>

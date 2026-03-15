<template>
  <div class="admin-page min-h-screen bg-dark">

    <!-- ── LOGIN SCREEN ── -->
    <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center px-4">
      <div class="admin-login-card">
        <div class="text-center mb-8">
          <img src="@/assets/logo.png" alt="M19" class="h-16 w-auto mx-auto mb-4" />
          <h1 class="text-2xl font-heading font-bold text-white">Панель управления</h1>
          <p class="text-white/40 text-sm mt-1">M19 Barbershop</p>
        </div>
        <form @submit.prevent="login" class="space-y-4">
          <div>
            <label class="block text-white/60 text-sm mb-2 font-heading uppercase tracking-wider">Пароль</label>
            <input
              v-model="passwordInput"
              type="password"
              placeholder="••••••••"
              class="admin-input"
              :class="loginError ? 'border-red-500' : ''"
              autofocus
            />
            <p v-if="loginError" class="text-red-400 text-xs mt-1">Неверный пароль</p>
          </div>
          <button type="submit" class="admin-btn-primary w-full">Войти</button>
        </form>
      </div>
    </div>

    <!-- ── ADMIN PANEL ── -->
    <div v-else class="admin-layout">

      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="flex items-center gap-3 mb-8">
          <img src="@/assets/logo.png" alt="M19" class="h-10 w-auto" />
          <div>
            <p class="text-white font-heading font-bold text-sm">M19 Admin</p>
            <p class="text-white/30 text-xs">Панель управления</p>
          </div>
        </div>

        <nav class="flex-1 space-y-1">
          <button @click="activeTab = 'home'" class="admin-nav-btn mb-2" :class="activeTab === 'home' ? 'admin-nav-active' : 'admin-nav-inactive'">
            <HomeIcon class="w-4 h-4" /> Главная
          </button>

          <!-- Gallery group -->
          <Collapsible v-model:open="galleryGroupOpen">
            <CollapsibleTrigger class="admin-group-trigger">
              <div class="flex items-center gap-2">
                <ImageIcon class="w-4 h-4" />
                <span>Галерея</span>
              </div>
              <ChevronDownIcon class="w-4 h-4 transition-transform duration-200" :class="galleryGroupOpen ? 'rotate-180' : ''" />
            </CollapsibleTrigger>
            <CollapsibleContent class="pl-3 mt-1 space-y-0.5">
              <button @click="activeTab = 'upload'" class="admin-nav-btn" :class="activeTab === 'upload' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <UploadIcon class="w-4 h-4" /> Загрузить
              </button>
              <button @click="activeTab = 'manage'" class="admin-nav-btn" :class="activeTab === 'manage' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <ImageIcon class="w-4 h-4" /> Управление
              </button>
              <button @click="activeTab = 'categories'" class="admin-nav-btn" :class="activeTab === 'categories' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <TagIcon class="w-4 h-4" /> Категории
                <span v-if="galleryCategories.length" class="ml-auto bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">{{ galleryCategories.length }}</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          <!-- Cosmetics group -->
          <Collapsible v-model:open="cosmGroupOpen">
            <CollapsibleTrigger class="admin-group-trigger">
              <div class="flex items-center gap-2">
                <ShoppingBagIcon class="w-4 h-4" />
                <span>Косметика</span>
              </div>
              <ChevronDownIcon class="w-4 h-4 transition-transform duration-200" :class="cosmGroupOpen ? 'rotate-180' : ''" />
            </CollapsibleTrigger>
            <CollapsibleContent class="pl-3 mt-1 space-y-0.5">
              <button @click="activeTab = 'products'" class="admin-nav-btn" :class="activeTab === 'products' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <PackageIcon class="w-4 h-4" /> Товары
              </button>
              <button @click="activeTab = 'prod-cats'" class="admin-nav-btn" :class="activeTab === 'prod-cats' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <TagIcon class="w-4 h-4" /> Категории
              </button>
              <button @click="activeTab = 'orders'" class="admin-nav-btn" :class="activeTab === 'orders' ? 'admin-nav-active' : 'admin-nav-inactive'">
                <ClipboardListIcon class="w-4 h-4" /> Заказы
              </button>
            </CollapsibleContent>
          </Collapsible>
        </nav>

        <div class="mt-auto pt-6 border-t border-white/10">
          <button @click="logout" class="admin-nav-btn admin-nav-inactive w-full">
            <LogOutIcon class="w-4 h-4" /> Выйти
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="admin-main">
        <AdminHomeTab v-if="activeTab === 'home'" @navigate="activeTab = $event as typeof activeTab" />
        <GalleryUploadTab v-if="activeTab === 'upload'" @uploaded="activeTab = 'manage'" />
        <GalleryManageTab v-if="activeTab === 'manage'" />
        <GalleryCategoriesTab v-if="activeTab === 'categories'" />
        <ProductsTab v-if="activeTab === 'products'" />
        <ProductCategoriesTab v-if="activeTab === 'prod-cats'" />
        <OrdersTab v-if="activeTab === 'orders'" />
      </main>
    </div>

    <!-- ── TOASTS ── -->
    <Teleport to="body">
      <div class="toast-container">
        <TransitionGroup name="toast">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="toast.type === 'success' ? 'toast-success' : toast.type === 'error' ? 'toast-error' : 'toast-info'"
          >
            <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5 shrink-0" />
            <XCircleIcon v-else-if="toast.type === 'error'" class="w-5 h-5 shrink-0" />
            <InfoIcon v-else class="w-5 h-5 shrink-0" />
            <span>{{ toast.message }}</span>
          </div>
        </TransitionGroup>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, provide, watch, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import {
  Home as HomeIcon,
  Upload as UploadIcon,
  Image as ImageIcon,
  LogOut as LogOutIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Info as InfoIcon,
  Tag as TagIcon,
  ChevronDown as ChevronDownIcon,
  ShoppingBag as ShoppingBagIcon,
  Package as PackageIcon,
  ClipboardList as ClipboardListIcon,
} from 'lucide-vue-next'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { galleryService, type CategoryItem } from '@/services/gallery.service'

import AdminHomeTab from '@/components/admin/AdminHomeTab.vue'
import GalleryUploadTab from '@/components/admin/GalleryUploadTab.vue'
import GalleryManageTab from '@/components/admin/GalleryManageTab.vue'
import GalleryCategoriesTab from '@/components/admin/GalleryCategoriesTab.vue'
import ProductsTab from '@/components/admin/ProductsTab.vue'
import ProductCategoriesTab from '@/components/admin/ProductCategoriesTab.vue'
import OrdersTab from '@/components/admin/OrdersTab.vue'

useHead({ title: 'Админ — M19 Barbershop' })

// ── Auth ──────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'm19admin2024'
const isAuthenticated = ref(false)
const passwordInput = ref('')
const loginError = ref(false)

const login = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true
    sessionStorage.setItem('m19_admin', '1')
    loginError.value = false
    loadGalleryCategories()
  } else {
    loginError.value = true
  }
}

const logout = () => {
  sessionStorage.removeItem('m19_admin')
  isAuthenticated.value = false
}

onMounted(() => {
  isAuthenticated.value = sessionStorage.getItem('m19_admin') === '1'
  if (isAuthenticated.value) loadGalleryCategories()
})

// ── Gallery categories (shared across Upload + Manage + Categories tabs) ───────
const galleryCategories = ref<CategoryItem[]>([])

const loadGalleryCategories = async () => {
  galleryCategories.value = await galleryService.fetchCategories()
}

provide('galleryCategories', galleryCategories)

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref<'home' | 'upload' | 'manage' | 'categories' | 'products' | 'prod-cats' | 'orders'>('home')

const galleryGroupOpen = ref(true)
const cosmGroupOpen = ref(false)

watch(activeTab, (tab) => {
  if (['upload', 'manage', 'categories'].includes(tab)) galleryGroupOpen.value = true
  if (['products', 'prod-cats', 'orders'].includes(tab)) cosmGroupOpen.value = true
})

// ── Toasts ────────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
const toasts = ref<Toast[]>([])
let toastId = 0

const showToast = (message: string, type: Toast['type'] = 'success') => {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3500)
}

provide('showToast', showToast)
</script>

<style>
/* ── Layout ── */
.admin-layout { display: flex; min-height: 100vh; }

.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #111;
  border-right: 1px solid rgba(255,255,255,0.08);
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  overflow-y: auto;
}

.admin-main {
  margin-left: 240px;
  flex: 1;
  padding: 40px;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .admin-layout { flex-direction: column; }
  .admin-sidebar { position: relative; width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px; }
  .admin-main { margin-left: 0; padding: 20px; }
}

/* ── Login Card ── */
.admin-login-card {
  background: #111;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 380px;
}

/* ── Sidebar Nav ── */
.admin-group-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: var(--font-family-heading);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
  margin-bottom: 2px;
}
.admin-group-trigger:hover { color: rgba(255,255,255,0.8); background: rgba(255,255,255,0.04); }

.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: var(--font-family-heading);
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-align: left;
}
.admin-nav-active   { background: var(--color-gold-500); color: var(--color-dark); }
.admin-nav-inactive { color: rgba(255,255,255,0.45); background: transparent; }
.admin-nav-inactive:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }

/* ── Inputs ── */
.admin-label {
  display: block;
  font-family: var(--font-family-heading);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 6px;
}

.admin-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px;
  padding: 10px 14px;
  color: white;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  outline: none;
}
.admin-input:focus { border-color: var(--color-gold-500); }
.admin-input::placeholder { color: rgba(255,255,255,0.2); }
select.admin-input option { background: #1a1a1a; color: white; }

/* ── Checkbox ── */
.admin-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--color-gold-500);
  cursor: pointer;
}

/* ── Buttons ── */
.admin-btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-gold-500);
  color: var(--color-dark);
  font-family: var(--font-family-heading);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.admin-btn-primary:hover:not(:disabled) {
  background: var(--color-gold-400);
  box-shadow: 0 4px 20px rgba(229,228,226,0.2);
}

.admin-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.5);
  font-family: var(--font-family-heading);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  background: transparent;
  transition: all 0.2s;
}
.admin-btn-ghost:hover { border-color: rgba(255,255,255,0.3); color: white; }

/* ── Section Title ── */
.admin-section-title {
  font-family: var(--font-family-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
}

/* ── Dropzone ── */
.admin-dropzone {
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 12px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  padding: 24px;
  background: rgba(255,255,255,0.02);
}
.admin-dropzone:hover, .admin-dropzone-active { border-color: var(--color-gold-500); background: rgba(229,228,226,0.04); }
.admin-dropzone-has-file { border-color: rgba(229,228,226,0.3); border-style: solid; }

/* ── Upload queue item ── */
.upload-queue-item {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 8px 12px;
}

/* ── Media Grid ── */
.admin-media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.admin-media-card {
  position: relative;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 12px;
  transition: border-color 0.2s, transform 0.15s;
  cursor: default;
  user-select: none;
}
.admin-media-card:hover { border-color: rgba(255,255,255,0.15); }
.admin-media-card-selected { border-color: var(--color-gold-500) !important; background: rgba(229,228,226,0.05); }
.admin-media-card-dragging { opacity: 0.4; transform: scale(0.97); }

/* ── Modals ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}
.modal-card {
  background: #1a1a1a;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 16px;
  padding: 28px;
  width: 100%;
  max-width: 400px;
}

/* ── Categories ── */
.admin-cat-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 20px 24px;
}

.admin-cat-row {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 10px 16px;
  transition: border-color 0.2s;
}
.admin-cat-row:hover { border-color: rgba(255,255,255,0.14); }

/* ── Toasts ── */
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.4);
  pointer-events: all;
  max-width: 320px;
}
.toast-success { background: rgba(34,197,94,0.15);  border: 1px solid rgba(34,197,94,0.3);  color: #4ade80; }
.toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }
.toast-info    { background: rgba(229,228,226,0.1);  border: 1px solid rgba(229,228,226,0.2); color: rgba(255,255,255,0.8); }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(30px) scale(0.9); }
.toast-leave-to     { opacity: 0; transform: translateX(30px); }
</style>

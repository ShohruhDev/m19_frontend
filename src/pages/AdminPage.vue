<template>
  <div class="admin-page min-h-screen bg-dark">

    <!-- ── LOGIN SCREEN ── -->
    <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center px-4">
      <div class="admin-login-card">
        <div class="text-center mb-8">
          <img src="@/assets/logo.png" alt="M19" class="h-16 w-auto mx-auto mb-4" />
          <h1 class="text-2xl font-heading font-bold text-white">Панель управления</h1>
          <p class="text-white/40 text-sm mt-1">M19 Barbershop — Галерея</p>
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
        <div class="flex items-center gap-3 mb-10">
          <img src="@/assets/logo.png" alt="M19" class="h-10 w-auto" />
          <div>
            <p class="text-white font-heading font-bold text-sm">M19 Admin</p>
            <p class="text-white/30 text-xs">Галерея</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-2 mb-8">
          <div class="stat-chip">
            <span class="text-gold-500 font-heading font-bold text-lg">{{ items.filter(i=>i.type==='photo').length }}</span>
            <span class="text-white/30 text-xs">фото</span>
          </div>
          <div class="stat-chip">
            <span class="text-blue-400 font-heading font-bold text-lg">{{ items.filter(i=>i.type==='video').length }}</span>
            <span class="text-white/30 text-xs">видео</span>
          </div>
        </div>

        <nav class="space-y-1">
          <button @click="activeTab = 'upload'" class="admin-nav-btn" :class="activeTab === 'upload' ? 'admin-nav-active' : 'admin-nav-inactive'">
            <UploadIcon class="w-4 h-4" /> Загрузить
          </button>
          <button @click="activeTab = 'manage'" class="admin-nav-btn" :class="activeTab === 'manage' ? 'admin-nav-active' : 'admin-nav-inactive'">
            <ImageIcon class="w-4 h-4" /> Управление <span class="ml-auto bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">{{ items.length }}</span>
          </button>
          <button @click="activeTab = 'categories'" class="admin-nav-btn" :class="activeTab === 'categories' ? 'admin-nav-active' : 'admin-nav-inactive'">
            <TagIcon class="w-4 h-4" /> Категории <span class="ml-auto bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">{{ dbCategories.length }}</span>
          </button>
        </nav>

        <div class="mt-auto pt-8 border-t border-white/10 space-y-1">
          <a href="/gallery" target="_blank" class="admin-nav-btn admin-nav-inactive flex">
            <ExternalLinkIcon class="w-4 h-4" /> Открыть галерею
          </a>
          <button @click="logout" class="admin-nav-btn admin-nav-inactive w-full">
            <LogOutIcon class="w-4 h-4" /> Выйти
          </button>
        </div>
      </aside>

      <!-- Main -->
      <main class="admin-main">

        <!-- ── UPLOAD TAB ── -->
        <div v-if="activeTab === 'upload'">
          <h2 class="admin-section-title">Загрузить медиафайлы</h2>

          <div class="grid lg:grid-cols-2 gap-8">
            <!-- Drop zone -->
            <div>
              <div
                class="admin-dropzone"
                :class="{ 'admin-dropzone-active': isDragging, 'admin-dropzone-has-file': uploadQueue.length > 0 }"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="onDrop"
                @click="fileInputRef?.click()"
              >
                <input
                  ref="fileInputRef"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  class="hidden"
                  @change="onFileSelect"
                />

                <!-- Queue preview -->
                <div v-if="uploadQueue.length > 0" class="w-full space-y-2">
                  <div v-for="(qf, qi) in uploadQueue" :key="qi" class="upload-queue-item">
                    <img v-if="qf.previewUrl" :src="qf.previewUrl" class="w-10 h-10 rounded object-cover shrink-0" />
                    <FilmIcon v-else class="w-10 h-10 text-gold-500 shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-white text-xs font-medium truncate">{{ qf.file.name }}</p>
                      <p class="text-white/30 text-xs">{{ formatBytes(qf.file.size) }}</p>
                      <div v-if="qf.progress > 0" class="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div class="h-full bg-gold-500 rounded-full transition-all duration-300" :style="`width:${qf.progress}%`"></div>
                      </div>
                    </div>
                    <span v-if="qf.done" class="text-green-400"><CheckCircleIcon class="w-5 h-5" /></span>
                    <span v-else-if="qf.error" class="text-red-400"><XCircleIcon class="w-5 h-5" /></span>
                    <button v-else @click.stop="removeFromQueue(qi)" class="text-white/20 hover:text-red-400 transition-colors">
                      <XIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <button @click.stop="clearQueue" class="text-xs text-red-400 hover:text-red-300 underline mt-2">
                    Очистить очередь
                  </button>
                </div>

                <!-- Placeholder -->
                <div v-else class="flex flex-col items-center gap-4 text-center">
                  <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <UploadIcon class="w-8 h-8 text-white/30" />
                  </div>
                  <div>
                    <p class="text-white/70 font-medium">Перетащите фото или видео</p>
                    <p class="text-white/30 text-sm mt-1">или нажмите для выбора нескольких</p>
                    <p class="text-white/20 text-xs mt-2">JPG, PNG, MP4, MOV — до 50MB</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Metadata form -->
            <div class="space-y-5">
              <div>
                <label class="admin-label">Название <span class="text-white/30">(для всех файлов в очереди)</span></label>
                <input v-model="meta.title" type="text" placeholder="Классический fade" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Категория</label>
                <select v-model="meta.category" class="admin-input">
                  <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="admin-label">Мастер <span class="text-white/30">(необязательно)</span></label>
                <input v-model="meta.master" type="text" placeholder="Баходир" class="admin-input" />
              </div>
              <div v-if="uploadQueue.some(qf => qf.file.type.startsWith('video'))">
                <label class="admin-label">Длительность видео <span class="text-white/30">(напр. 1:32)</span></label>
                <input v-model="meta.duration" type="text" placeholder="1:32" class="admin-input" />
              </div>

              <!-- Overall error -->
              <p v-if="uploadError" class="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20">
                {{ uploadError }}
              </p>

              <!-- Success -->
              <div v-if="uploadSuccess" class="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-lg px-4 py-3 border border-green-500/20">
                <CheckCircleIcon class="w-5 h-5 shrink-0" /> Файлы успешно загружены!
              </div>

              <button
                @click="doUpload"
                :disabled="uploadQueue.length === 0 || isUploading"
                class="admin-btn-primary w-full"
                :class="{ 'opacity-50 cursor-not-allowed': uploadQueue.length === 0 || isUploading }"
              >
                <UploadIcon class="w-4 h-4" />
                {{ isUploading ? `Загрузка ${uploadQueue.filter(q=>q.done).length}/${uploadQueue.length}...` : `Загрузить ${uploadQueue.length || ''} файл(ов)` }}
              </button>
            </div>
          </div>
        </div>

        <!-- ── MANAGE TAB ── -->
        <div v-if="activeTab === 'manage'">
          <!-- Toolbar -->
          <div class="flex flex-wrap items-center gap-3 mb-6">
            <h2 class="admin-section-title mb-0 flex-1">Файлы галереи</h2>

            <!-- Search -->
            <div class="relative">
              <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input v-model="searchQuery" type="text" placeholder="Поиск..." class="admin-input pl-9 w-48 text-sm py-2" />
            </div>

            <!-- Category filter -->
            <select v-model="filterCategory" class="admin-input text-sm py-2 w-40">
              <option value="">Все категории</option>
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>

            <!-- Bulk delete -->
            <button
              v-if="selectedIds.size > 0"
              @click="bulkDeleteConfirm = true"
              class="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              <Trash2Icon class="w-4 h-4" /> Удалить ({{ selectedIds.size }})
            </button>

            <button @click="loadItems" class="admin-btn-ghost">
              <RefreshCwIcon class="w-4 h-4" /> Обновить
            </button>
          </div>

          <!-- Select all -->
          <div v-if="displayedItems.length > 0" class="flex items-center gap-2 mb-4">
            <input type="checkbox" id="selectAll" :checked="allSelected" @change="toggleSelectAll" class="admin-checkbox" />
            <label for="selectAll" class="text-white/40 text-xs cursor-pointer">
              {{ allSelected ? 'Снять выбор' : 'Выбрать все' }}
            </label>
            <span v-if="selectedIds.size > 0" class="text-white/30 text-xs ml-2">выбрано {{ selectedIds.size }}</span>
          </div>

          <!-- Loading -->
          <div v-if="isLoadingItems" class="grid admin-media-grid">
            <div v-for="n in 8" :key="n" class="admin-media-card animate-pulse">
              <div class="aspect-video bg-white/5 rounded-lg mb-3"></div>
              <div class="h-3 bg-white/5 rounded mb-2 w-3/4"></div>
              <div class="h-2 bg-white/5 rounded w-1/2"></div>
            </div>
          </div>

          <!-- Empty -->
          <div v-else-if="displayedItems.length === 0" class="text-center py-20">
            <ImageIcon class="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p class="text-white/30 text-lg">{{ searchQuery || filterCategory ? 'Ничего не найдено' : 'Галерея пуста' }}</p>
            <p class="text-white/20 text-sm mt-1">{{ searchQuery || filterCategory ? 'Попробуйте изменить фильтр' : 'Загрузите первый файл' }}</p>
          </div>

          <!-- Grid (drag-n-drop reorder) -->
          <div v-else class="admin-media-grid">
            <div
              v-for="item in displayedItems"
              :key="item.id"
              class="admin-media-card"
              :class="{ 'admin-media-card-selected': selectedIds.has(item.id), 'admin-media-card-dragging': dragId === item.id }"
              draggable="true"
              @dragstart="onDragStart(item)"
              @dragover.prevent="onDragOver(item)"
              @dragend="onDragEnd"
            >
              <!-- Select checkbox -->
              <div class="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(item.id)"
                  @change="toggleSelect(item.id)"
                  class="admin-checkbox"
                  @click.stop
                />
              </div>

              <!-- Drag handle -->
              <div class="absolute top-3 right-10 z-10 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors">
                <GripVerticalIcon class="w-4 h-4" />
              </div>

              <!-- Thumbnail -->
              <div class="relative aspect-video bg-dark-100 rounded-lg overflow-hidden mb-3 group">
                <img
                  v-if="item.type === 'photo'"
                  :src="item.file_url"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-dark-50">
                  <FilmIcon class="w-10 h-10 text-gold-500/50" />
                  <span v-if="item.duration" class="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">{{ item.duration }}</span>
                </div>

                <!-- Actions overlay -->
                <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    @click.stop="openEdit(item)"
                    class="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors"
                    title="Редактировать"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click.stop="confirmDelete(item)"
                    class="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 transition-colors"
                    title="Удалить"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>

                <!-- Type badge -->
                <span class="absolute top-2 left-7 text-xs font-heading font-bold px-2 py-0.5 rounded"
                  :class="item.type === 'video' ? 'bg-blue-600 text-white' : 'bg-gold-500 text-dark'">
                  {{ item.type === 'video' ? '▶ Видео' : '📷 Фото' }}
                </span>
              </div>

              <!-- Info -->
              <p class="text-white text-sm font-medium truncate pr-2">{{ item.title }}</p>
              <div class="flex items-center justify-between mt-1">
                <span class="text-white/40 text-xs">{{ item.category }}</span>
                <span v-if="item.master" class="text-white/40 text-xs">{{ item.master }}</span>
              </div>
              <p class="text-white/20 text-xs mt-1">{{ formatDate(item.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- ── CATEGORIES TAB ── -->
        <div v-if="activeTab === 'categories'">
          <h2 class="admin-section-title">Управление категориями</h2>

          <!-- Add new category -->
          <div class="admin-cat-card mb-8">
            <h3 class="text-white/70 text-xs font-heading font-semibold uppercase tracking-widest mb-4">Добавить категорию</h3>
            <div class="flex gap-3 items-end flex-wrap">
              <div class="w-24 shrink-0">
                <label class="admin-label">Иконка</label>
                <input v-model="newCatIcon" type="text" placeholder="◈" class="admin-input text-center text-xl" maxlength="4" />
              </div>
              <div class="flex-1 min-w-40">
                <label class="admin-label">Название</label>
                <input
                  v-model="newCatLabel"
                  type="text"
                  placeholder="Например: Укладка"
                  class="admin-input"
                  @keydown.enter="addCategory"
                />
              </div>
              <button
                @click="addCategory"
                :disabled="!newCatLabel.trim() || isSavingCat"
                class="admin-btn-primary shrink-0"
                :class="{ 'opacity-50 cursor-not-allowed': !newCatLabel.trim() || isSavingCat }"
              >
                <PlusIcon class="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>

          <!-- Categories list -->
          <div v-if="isLoadingCategories" class="space-y-2">
            <div v-for="n in 4" :key="n" class="h-14 bg-white/5 rounded-lg animate-pulse"></div>
          </div>

          <div v-else-if="dbCategories.length === 0" class="text-center py-16">
            <TagIcon class="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p class="text-white/30">Категорий пока нет</p>
            <p class="text-white/20 text-sm mt-1">Добавьте первую категорию выше</p>
          </div>

          <div v-else class="space-y-2">
            <div
              v-for="cat in dbCategories"
              :key="cat.id"
              class="admin-cat-row group"
            >
              <!-- View mode -->
              <template v-if="editingCat?.id !== cat.id">
                <span class="text-2xl w-10 text-center shrink-0">{{ cat.icon }}</span>
                <span class="flex-1 text-white font-medium text-sm">{{ cat.label }}</span>
                <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="startEditCat(cat)"
                    class="text-white/40 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10"
                    title="Редактировать"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteCategory(cat)"
                    :disabled="deletingCatId === cat.id"
                    class="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10 disabled:opacity-30"
                    title="Удалить"
                  >
                    <Trash2Icon class="w-4 h-4" />
                  </button>
                </div>
              </template>

              <!-- Edit mode (inline) -->
              <template v-else>
                <input v-model="editCatIcon" type="text" class="admin-input w-16 text-center text-xl py-1.5" maxlength="4" />
                <input v-model="editCatLabel" type="text" class="admin-input flex-1 py-1.5" @keydown.enter="saveEditCat" />
                <div class="flex gap-2 shrink-0">
                  <button @click="saveEditCat" :disabled="isSavingCat" class="admin-btn-primary py-1.5 px-3 text-xs">
                    Сохранить
                  </button>
                  <button @click="editingCat = null" class="admin-btn-ghost py-1.5 px-3 text-xs">
                    Отмена
                  </button>
                </div>
              </template>
            </div>
          </div>

          <p class="text-white/20 text-xs mt-6">
            Категории используются в галерее и при загрузке файлов. Удаление категории не удаляет файлы в ней.
          </p>
        </div>

      </main>
    </div>

    <!-- ── DELETE SINGLE MODAL ── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
          <div class="modal-card">
            <h3 class="text-white font-heading font-bold text-lg mb-2">Удалить файл?</h3>
            <p class="text-white/50 text-sm mb-6">«{{ deleteTarget.title }}» будет удалён из галереи и хранилища навсегда.</p>
            <div class="flex gap-3">
              <button @click="deleteTarget = null" class="admin-btn-ghost flex-1">Отмена</button>
              <button @click="doDelete" :disabled="isDeleting" class="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium text-sm transition-colors disabled:opacity-50">
                {{ isDeleting ? 'Удаление...' : 'Удалить' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── BULK DELETE MODAL ── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="bulkDeleteConfirm" class="modal-backdrop" @click.self="bulkDeleteConfirm = false">
          <div class="modal-card">
            <h3 class="text-white font-heading font-bold text-lg mb-2">Удалить {{ selectedIds.size }} файл(ов)?</h3>
            <p class="text-white/50 text-sm mb-6">Все выбранные файлы будут безвозвратно удалены из галереи и хранилища.</p>
            <div class="flex gap-3">
              <button @click="bulkDeleteConfirm = false" class="admin-btn-ghost flex-1">Отмена</button>
              <button @click="doBulkDelete" :disabled="isDeleting" class="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium text-sm transition-colors disabled:opacity-50">
                {{ isDeleting ? 'Удаление...' : 'Удалить все' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ── EDIT MODAL ── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="editTarget" class="modal-backdrop" @click.self="editTarget = null">
          <div class="modal-card max-w-md">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-white font-heading font-bold text-lg">Редактировать</h3>
              <button @click="editTarget = null" class="text-white/30 hover:text-white transition-colors">
                <XIcon class="w-5 h-5" />
              </button>
            </div>
            <div class="space-y-4">
              <div>
                <label class="admin-label">Название</label>
                <input v-model="editForm.title" type="text" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Категория</label>
                <select v-model="editForm.category" class="admin-input">
                  <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
              <div>
                <label class="admin-label">Мастер <span class="text-white/30">(необязательно)</span></label>
                <input v-model="editForm.master" type="text" class="admin-input" />
              </div>
              <div v-if="editTarget.type === 'video'">
                <label class="admin-label">Длительность</label>
                <input v-model="editForm.duration" type="text" placeholder="1:32" class="admin-input" />
              </div>
            </div>
            <div class="flex gap-3 mt-6">
              <button @click="editTarget = null" class="admin-btn-ghost flex-1">Отмена</button>
              <button @click="doEdit" :disabled="isSavingEdit" class="admin-btn-primary flex-1">
                {{ isSavingEdit ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import { ref, computed, onMounted } from 'vue'
import { useHead } from '@unhead/vue'
import {
  Upload as UploadIcon,
  Image as ImageIcon,
  Film as FilmIcon,
  Trash2 as Trash2Icon,
  RefreshCw as RefreshCwIcon,
  LogOut as LogOutIcon,
  ExternalLink as ExternalLinkIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  X as XIcon,
  Pencil as PencilIcon,
  Search as SearchIcon,
  GripVertical as GripVerticalIcon,
  Info as InfoIcon,
  Tag as TagIcon,
  Plus as PlusIcon,
} from 'lucide-vue-next'
import { galleryService, type GalleryItem, type CategoryItem } from '@/services/gallery.service'

useHead({ title: 'Админ — M19 Barbershop' })

// ── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'm19admin2024'
const isAuthenticated = ref(false)
const passwordInput = ref('')
const loginError = ref(false)

onMounted(() => {
  isAuthenticated.value = sessionStorage.getItem('m19_admin') === '1'
  if (isAuthenticated.value) {
    loadItems()
    loadCategories()
  }
})

const login = () => {
  if (passwordInput.value === ADMIN_PASSWORD) {
    isAuthenticated.value = true
    sessionStorage.setItem('m19_admin', '1')
    loginError.value = false
    loadItems()
  } else {
    loginError.value = true
  }
}

const logout = () => {
  sessionStorage.removeItem('m19_admin')
  isAuthenticated.value = false
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
const activeTab = ref<'upload' | 'manage' | 'categories'>('upload')

// ── Toasts ───────────────────────────────────────────────────────────────────
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

// ── Upload queue ──────────────────────────────────────────────────────────────
interface QueueFile { file: File; previewUrl: string | null; progress: number; done: boolean; error: boolean }
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadQueue = ref<QueueFile[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const dbCategories = ref<CategoryItem[]>([])
const categoryOptions = computed(() => dbCategories.value.map(c => c.label))
const meta = ref({ title: '', category: '', master: '', duration: '' })

const buildQueueFile = (file: File): QueueFile => ({
  file,
  previewUrl: file.type.startsWith('video') ? null : URL.createObjectURL(file),
  progress: 0,
  done: false,
  error: false,
})

const onFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  files.forEach(f => uploadQueue.value.push(buildQueueFile(f)))
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? [])
  files.forEach(f => uploadQueue.value.push(buildQueueFile(f)))
}

const removeFromQueue = (idx: number) => {
  uploadQueue.value.splice(idx, 1)
}

const clearQueue = () => {
  uploadQueue.value = []
  uploadError.value = ''
  uploadSuccess.value = false
}

const doUpload = async () => {
  if (uploadQueue.value.length === 0) return
  isUploading.value = true
  uploadError.value = ''
  uploadSuccess.value = false

  let successCount = 0
  for (const qf of uploadQueue.value) {
    if (qf.done) { successCount++; continue }
    qf.error = false
    qf.progress = 0
    try {
      await galleryService.uploadFile(
        qf.file,
        {
          title: meta.value.title || qf.file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          category: qf.file.type.startsWith('video') ? 'Видео' : meta.value.category,
          master: meta.value.master,
          duration: meta.value.duration,
        },
        (pct) => { qf.progress = pct }
      )
      qf.done = true
      qf.progress = 100
      successCount++
    } catch (err: any) {
      qf.error = true
      qf.progress = 0
    }
  }

  isUploading.value = false
  await loadItems()

  if (successCount === uploadQueue.value.length) {
    uploadSuccess.value = true
    showToast(`Загружено ${successCount} файл(ов)`, 'success')
    setTimeout(() => {
      clearQueue()
      uploadSuccess.value = false
      meta.value = { title: '', category: 'Стрижки', master: '', duration: '' }
      activeTab.value = 'manage'
    }, 1500)
  } else {
    uploadError.value = `Ошибка при загрузке ${uploadQueue.value.filter(q => q.error).length} файл(ов). Остальные загружены.`
    showToast('Некоторые файлы не загрузились', 'error')
  }
}

// ── Manage ────────────────────────────────────────────────────────────────────
const items = ref<GalleryItem[]>([])
const isLoadingItems = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')

const displayedItems = computed(() => {
  let list = items.value
  if (filterCategory.value) list = list.filter(i => i.category === filterCategory.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(q) || (i.master ?? '').toLowerCase().includes(q))
  }
  return list
})

const loadItems = async () => {
  isLoadingItems.value = true
  items.value = await galleryService.fetchItems()
  isLoadingItems.value = false
}

// ── Categories ────────────────────────────────────────────────────────────────
const isLoadingCategories = ref(false)
const newCatLabel = ref('')
const newCatIcon = ref('◈')
const isSavingCat = ref(false)
const deletingCatId = ref<string | null>(null)
const editingCat = ref<CategoryItem | null>(null)
const editCatLabel = ref('')
const editCatIcon = ref('')

const loadCategories = async () => {
  isLoadingCategories.value = true
  dbCategories.value = await galleryService.fetchCategories()
  isLoadingCategories.value = false
  if (meta.value.category === '' && dbCategories.value.length > 0) {
    meta.value.category = dbCategories.value[0].label
  }
}

const addCategory = async () => {
  const label = newCatLabel.value.trim()
  if (!label) return
  isSavingCat.value = true
  const created = await galleryService.createCategory(label, newCatIcon.value || '◈')
  if (created) {
    dbCategories.value.push(created)
    newCatLabel.value = ''
    newCatIcon.value = '◈'
    showToast('Категория добавлена', 'success')
  } else {
    showToast('Ошибка при создании категории', 'error')
  }
  isSavingCat.value = false
}

const deleteCategory = async (cat: CategoryItem) => {
  deletingCatId.value = cat.id
  await galleryService.deleteCategory(cat.id)
  dbCategories.value = dbCategories.value.filter(c => c.id !== cat.id)
  if (meta.value.category === cat.label && dbCategories.value.length > 0) {
    meta.value.category = dbCategories.value[0].label
  }
  showToast('Категория удалена', 'success')
  deletingCatId.value = null
}

const startEditCat = (cat: CategoryItem) => {
  editingCat.value = cat
  editCatLabel.value = cat.label
  editCatIcon.value = cat.icon
}

const saveEditCat = async () => {
  if (!editingCat.value) return
  isSavingCat.value = true
  const updated = await galleryService.updateCategory(editingCat.value.id, {
    label: editCatLabel.value.trim(),
    icon: editCatIcon.value || '◈',
  })
  if (updated) {
    const idx = dbCategories.value.findIndex(c => c.id === editingCat.value!.id)
    if (idx !== -1) dbCategories.value[idx] = updated
    showToast('Категория обновлена', 'success')
  } else {
    showToast('Ошибка при обновлении', 'error')
  }
  editingCat.value = null
  isSavingCat.value = false
}

// ── Selection ─────────────────────────────────────────────────────────────────
const selectedIds = ref<Set<string>>(new Set())
const allSelected = computed(() =>
  displayedItems.value.length > 0 && displayedItems.value.every(i => selectedIds.value.has(i.id))
)

const toggleSelect = (id: string) => {
  const s = new Set(selectedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selectedIds.value = s
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(displayedItems.value.map(i => i.id))
  }
}

// ── Delete single ─────────────────────────────────────────────────────────────
const deleteTarget = ref<GalleryItem | null>(null)
const isDeleting = ref(false)

const confirmDelete = (item: GalleryItem) => { deleteTarget.value = item }

const doDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  await galleryService.deleteItem(deleteTarget.value.id)
  items.value = items.value.filter(i => i.id !== deleteTarget.value!.id)
  selectedIds.value.delete(deleteTarget.value.id)
  deleteTarget.value = null
  isDeleting.value = false
  showToast('Файл удалён', 'success')
}

// ── Bulk delete ───────────────────────────────────────────────────────────────
const bulkDeleteConfirm = ref(false)

const doBulkDelete = async () => {
  isDeleting.value = true
  const toDelete = items.value.filter(i => selectedIds.value.has(i.id))
  await galleryService.bulkDelete(toDelete)
  items.value = items.value.filter(i => !selectedIds.value.has(i.id))
  const count = toDelete.length
  selectedIds.value = new Set()
  bulkDeleteConfirm.value = false
  isDeleting.value = false
  showToast(`Удалено ${count} файл(ов)`, 'success')
}

// ── Edit ──────────────────────────────────────────────────────────────────────
const editTarget = ref<GalleryItem | null>(null)
const editForm = ref({ title: '', category: '', master: '', duration: '' })
const isSavingEdit = ref(false)

const openEdit = (item: GalleryItem) => {
  editTarget.value = item
  editForm.value = {
    title: item.title,
    category: item.category,
    master: item.master ?? '',
    duration: item.duration ?? '',
  }
}

const doEdit = async () => {
  if (!editTarget.value) return
  isSavingEdit.value = true
  const updated = await galleryService.updateItem(editTarget.value.id, {
    title: editForm.value.title,
    category: editForm.value.category,
    master: editForm.value.master || null,
    duration: editForm.value.duration || null,
  })
  if (updated) {
    const idx = items.value.findIndex(i => i.id === editTarget.value!.id)
    if (idx !== -1) items.value[idx] = { ...items.value[idx], ...updated }
    showToast('Изменения сохранены', 'success')
  } else {
    showToast('Ошибка при сохранении', 'error')
  }
  isSavingEdit.value = false
  editTarget.value = null
}

// ── Drag-n-drop reorder ───────────────────────────────────────────────────────
const dragId = ref<string | null>(null)
const dragOverId = ref<string | null>(null)

const onDragStart = (item: GalleryItem) => { dragId.value = item.id }

const onDragOver = (item: GalleryItem) => {
  if (dragId.value === null || dragId.value === item.id) return
  dragOverId.value = item.id
  // Reorder locally
  const list = [...items.value]
  const fromIdx = list.findIndex(i => i.id === dragId.value)
  const toIdx = list.findIndex(i => i.id === item.id)
  if (fromIdx === -1 || toIdx === -1) return
  const [moved] = list.splice(fromIdx, 1)
  list.splice(toIdx, 0, moved)
  items.value = list
}

const onDragEnd = async () => {
  if (dragId.value === null) return
  dragId.value = null
  dragOverId.value = null
  // Save order to DB
  await galleryService.reorderItems(items.value.map(i => i.id))
  showToast('Порядок сохранён', 'info')
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
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
  .admin-sidebar { position: relative; width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 20px; flex-direction: row; flex-wrap: wrap; gap: 12px; }
  .admin-main { margin-left: 0; padding: 20px; }
}

/* ── Stat chips ── */
.stat-chip {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* ── Nav ── */
.admin-nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  font-family: var(--font-family-heading);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  text-align: left;
}
.admin-nav-active { background: var(--color-gold-500); color: var(--color-dark); }
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
.toast-success { background: rgba(34,197,94,0.15); border: 1px solid rgba(34,197,94,0.3); color: #4ade80; }
.toast-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.3);  color: #f87171; }
.toast-info    { background: rgba(229,228,226,0.1);  border: 1px solid rgba(229,228,226,0.2); color: rgba(255,255,255,0.8); }

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

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px) scale(0.9); }
.toast-leave-to   { opacity: 0; transform: translateX(30px); }
</style>

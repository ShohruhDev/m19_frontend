<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <h2 class="admin-section-title mb-0 flex-1">Файлы галереи</h2>

      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input v-model="searchQuery" type="text" placeholder="Поиск..." class="admin-input pl-9 w-48 text-sm py-2" />
      </div>

      <select v-model="filterCategory" class="admin-input text-sm py-2 w-40">
        <option value="">Все категории</option>
        <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
      </select>

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
    <div v-if="isLoading" class="grid admin-media-grid">
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

    <!-- Grid -->
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
        <div class="absolute top-3 left-3 z-10">
          <input type="checkbox" :checked="selectedIds.has(item.id)" @change="toggleSelect(item.id)" class="admin-checkbox" @click.stop />
        </div>

        <div class="absolute top-3 right-10 z-10 text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing transition-colors">
          <GripVerticalIcon class="w-4 h-4" />
        </div>

        <div class="relative aspect-video bg-dark-100 rounded-lg overflow-hidden mb-3 group">
          <img v-if="item.type === 'photo'" :src="item.file_url" :alt="item.title" class="w-full h-full object-cover" loading="lazy" />
          <div v-else class="w-full h-full flex items-center justify-center bg-dark-50">
            <FilmIcon class="w-10 h-10 text-gold-500/50" />
            <span v-if="item.duration" class="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-0.5 rounded">{{ item.duration }}</span>
          </div>

          <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button @click.stop="openEdit(item)" class="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors" title="Редактировать">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button @click.stop="confirmDelete(item)" class="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 transition-colors" title="Удалить">
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>

          <span class="absolute top-2 left-7 text-xs font-heading font-bold px-2 py-0.5 rounded"
            :class="item.type === 'video' ? 'bg-blue-600 text-white' : 'bg-gold-500 text-dark'">
            {{ item.type === 'video' ? '▶ Видео' : '📷 Фото' }}
          </span>
        </div>

        <p class="text-white text-sm font-medium truncate pr-2">{{ item.title }}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-white/40 text-xs">{{ item.category }}</span>
          <span v-if="item.master" class="text-white/40 text-xs">{{ item.master }}</span>
        </div>
        <p class="text-white/20 text-xs mt-1">{{ formatDate(item.created_at) }}</p>
      </div>
    </div>

    <!-- Delete single modal -->
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

    <!-- Bulk delete modal -->
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

    <!-- Edit modal -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import {
  Image as ImageIcon,
  Film as FilmIcon,
  Trash2 as Trash2Icon,
  RefreshCw as RefreshCwIcon,
  X as XIcon,
  Pencil as PencilIcon,
  Search as SearchIcon,
  GripVertical as GripVerticalIcon,
} from 'lucide-vue-next'
import { galleryService, type GalleryItem, type CategoryItem } from '@/services/gallery.service'

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!
const galleryCategories = inject<import('vue').Ref<CategoryItem[]>>('galleryCategories')!

const categoryOptions = computed(() => galleryCategories.value.map(c => c.label))

const items = ref<GalleryItem[]>([])
const isLoading = ref(false)
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
  isLoading.value = true
  items.value = await galleryService.fetchItems()
  isLoading.value = false
}

onMounted(loadItems)

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
  await galleryService.reorderItems(items.value.map(i => i.id))
  showToast('Порядок сохранён', 'info')
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

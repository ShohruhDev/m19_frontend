<template>
  <div>
    <h2 class="admin-section-title">Управление категориями галереи</h2>

    <!-- Add new -->
    <div class="admin-cat-card mb-8">
      <h3 class="text-white/70 text-xs font-heading font-semibold uppercase tracking-widest mb-4">Добавить категорию</h3>
      <div class="flex gap-3 items-end flex-wrap">
        <div class="w-24 shrink-0">
          <label class="admin-label">Иконка</label>
          <input v-model="newIcon" type="text" placeholder="◈" class="admin-input text-center text-xl" maxlength="4" />
        </div>
        <div class="flex-1 min-w-40">
          <label class="admin-label">Название</label>
          <input v-model="newLabel" type="text" placeholder="Например: Укладка" class="admin-input" @keydown.enter="addCategory" />
        </div>
        <button
          @click="addCategory"
          :disabled="!newLabel.trim() || isSaving"
          class="admin-btn-primary shrink-0"
          :class="{ 'opacity-50 cursor-not-allowed': !newLabel.trim() || isSaving }"
        >
          <PlusIcon class="w-4 h-4" /> Добавить
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-2">
      <div v-for="n in 4" :key="n" class="h-14 bg-white/5 rounded-lg animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="categories.length === 0" class="text-center py-16">
      <TagIcon class="w-12 h-12 text-white/10 mx-auto mb-3" />
      <p class="text-white/30">Категорий пока нет</p>
      <p class="text-white/20 text-sm mt-1">Добавьте первую категорию выше</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2">
      <div v-for="cat in categories" :key="cat.id" class="admin-cat-row group">
        <template v-if="editingCat?.id !== cat.id">
          <span class="text-2xl w-10 text-center shrink-0">{{ cat.icon }}</span>
          <span class="flex-1 text-white font-medium text-sm">{{ cat.label }}</span>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startEdit(cat)" class="text-white/40 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10" title="Редактировать">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button @click="deleteCategory(cat)" :disabled="deletingId === cat.id" class="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10 disabled:opacity-30" title="Удалить">
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </template>

        <template v-else>
          <input v-model="editIcon" type="text" class="admin-input w-16 text-center text-xl py-1.5" maxlength="4" />
          <input v-model="editLabel" type="text" class="admin-input flex-1 py-1.5" @keydown.enter="saveEdit" />
          <div class="flex gap-2 shrink-0">
            <button @click="saveEdit" :disabled="isSaving" class="admin-btn-primary py-1.5 px-3 text-xs">Сохранить</button>
            <button @click="editingCat = null" class="admin-btn-ghost py-1.5 px-3 text-xs">Отмена</button>
          </div>
        </template>
      </div>
    </div>

    <p class="text-white/20 text-xs mt-6">
      Категории используются в галерее и при загрузке файлов. Удаление категории не удаляет файлы в ней.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { Tag as TagIcon, Plus as PlusIcon, Pencil as PencilIcon, Trash2 as Trash2Icon } from 'lucide-vue-next'
import { galleryService, type CategoryItem } from '@/services/gallery.service'

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!
const galleryCategories = inject<import('vue').Ref<CategoryItem[]>>('galleryCategories')!

const categories = galleryCategories
const isLoading = ref(false)
const newLabel = ref('')
const newIcon = ref('◈')
const isSaving = ref(false)
const deletingId = ref<string | null>(null)
const editingCat = ref<CategoryItem | null>(null)
const editLabel = ref('')
const editIcon = ref('')

onMounted(async () => {
  if (categories.value.length === 0) {
    isLoading.value = true
    galleryCategories.value = await galleryService.fetchCategories()
    isLoading.value = false
  }
})

const addCategory = async () => {
  const label = newLabel.value.trim()
  if (!label) return
  isSaving.value = true
  const created = await galleryService.createCategory(label, newIcon.value || '◈')
  if (created) {
    galleryCategories.value.push(created)
    newLabel.value = ''
    newIcon.value = '◈'
    showToast('Категория добавлена', 'success')
  } else {
    showToast('Ошибка при создании категории', 'error')
  }
  isSaving.value = false
}

const deleteCategory = async (cat: CategoryItem) => {
  deletingId.value = cat.id
  await galleryService.deleteCategory(cat.id)
  galleryCategories.value = galleryCategories.value.filter(c => c.id !== cat.id)
  showToast('Категория удалена', 'success')
  deletingId.value = null
}

const startEdit = (cat: CategoryItem) => {
  editingCat.value = cat
  editLabel.value = cat.label
  editIcon.value = cat.icon
}

const saveEdit = async () => {
  if (!editingCat.value) return
  isSaving.value = true
  const updated = await galleryService.updateCategory(editingCat.value.id, {
    label: editLabel.value.trim(),
    icon: editIcon.value || '◈',
  })
  if (updated) {
    const idx = galleryCategories.value.findIndex(c => c.id === editingCat.value!.id)
    if (idx !== -1) galleryCategories.value[idx] = updated
    showToast('Категория обновлена', 'success')
  } else {
    showToast('Ошибка при обновлении', 'error')
  }
  editingCat.value = null
  isSaving.value = false
}
</script>

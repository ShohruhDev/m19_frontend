<template>
  <div>
    <h2 class="admin-section-title">Категории товаров</h2>

    <!-- Add new -->
    <div class="admin-cat-card mb-8">
      <h3 class="text-white/70 text-xs font-heading font-semibold uppercase tracking-widest mb-4">Добавить категорию</h3>
      <div class="flex gap-3 items-end flex-wrap">
        <div class="flex-1 min-w-40">
          <label class="admin-label">Название</label>
          <input
            v-model="newTitle"
            type="text"
            placeholder="Например: Шампуни"
            class="admin-input"
            @keydown.enter="addCategory"
          />
        </div>
        <button
          @click="addCategory"
          :disabled="!newTitle.trim() || isSaving"
          class="admin-btn-primary shrink-0"
          :class="{ 'opacity-50 cursor-not-allowed': !newTitle.trim() || isSaving }"
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
          <div class="flex-1 min-w-0">
            <p class="text-white font-medium text-sm">{{ cat.title }}</p>
            <p class="text-white/30 text-xs mt-0.5">slug: {{ cat.slug }}</p>
          </div>
          <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="startEdit(cat)" class="text-white/40 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10" title="Редактировать">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button
              @click="deleteCategory(cat)"
              :disabled="deletingId === cat.id"
              class="text-white/40 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-red-500/10 disabled:opacity-30"
              title="Удалить"
            >
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </template>

        <template v-else>
          <input v-model="editTitle" type="text" class="admin-input flex-1 py-1.5" @keydown.enter="saveEdit" />
          <div class="flex gap-2 shrink-0">
            <button @click="saveEdit" :disabled="isSaving" class="admin-btn-primary py-1.5 px-3 text-xs">Сохранить</button>
            <button @click="editingCat = null" class="admin-btn-ghost py-1.5 px-3 text-xs">Отмена</button>
          </div>
        </template>
      </div>
    </div>

    <p class="text-white/20 text-xs mt-6">
      Категории используются для фильтрации товаров в магазине. Удаление категории не удаляет сами товары.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { Tag as TagIcon, Plus as PlusIcon, Pencil as PencilIcon, Trash2 as Trash2Icon } from 'lucide-vue-next'
import { productsAdminService, type ProductCategory } from '@/services/products-admin.service'

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!

const categories = ref<ProductCategory[]>([])
const isLoading = ref(false)
const newTitle = ref('')
const isSaving = ref(false)
const deletingId = ref<number | null>(null)
const editingCat = ref<ProductCategory | null>(null)
const editTitle = ref('')

onMounted(async () => {
  isLoading.value = true
  categories.value = await productsAdminService.fetchCategories()
  isLoading.value = false
})

const addCategory = async () => {
  const title = newTitle.value.trim()
  if (!title) return
  isSaving.value = true
  const created = await productsAdminService.createCategory(title)
  if (created) {
    categories.value.push(created)
    newTitle.value = ''
    showToast('Категория добавлена', 'success')
  } else {
    showToast('Ошибка при создании', 'error')
  }
  isSaving.value = false
}

const deleteCategory = async (cat: ProductCategory) => {
  deletingId.value = cat.id
  await productsAdminService.deleteCategory(cat.id)
  categories.value = categories.value.filter(c => c.id !== cat.id)
  showToast('Категория удалена', 'success')
  deletingId.value = null
}

const startEdit = (cat: ProductCategory) => {
  editingCat.value = cat
  editTitle.value = cat.title
}

const saveEdit = async () => {
  if (!editingCat.value) return
  isSaving.value = true
  const updated = await productsAdminService.updateCategory(editingCat.value.id, editTitle.value.trim())
  if (updated) {
    const idx = categories.value.findIndex(c => c.id === editingCat.value!.id)
    if (idx !== -1) categories.value[idx] = updated
    showToast('Категория обновлена', 'success')
  } else {
    showToast('Ошибка при обновлении', 'error')
  }
  editingCat.value = null
  isSaving.value = false
}
</script>

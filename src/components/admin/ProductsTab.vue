<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <h2 class="admin-section-title mb-0 flex-1">Товары</h2>
      <div class="relative">
        <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input v-model="searchQuery" type="text" placeholder="Поиск..." class="admin-input pl-9 w-48 text-sm py-2" />
      </div>
      <button @click="loadProducts" class="admin-btn-ghost"><RefreshCwIcon class="w-4 h-4" /> Обновить</button>
      <button @click="openAdd" class="admin-btn-primary"><PlusIcon class="w-4 h-4" /> Добавить</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="grid admin-media-grid">
      <div v-for="n in 6" :key="n" class="admin-media-card animate-pulse">
        <div class="aspect-square bg-white/5 rounded-lg mb-3"></div>
        <div class="h-3 bg-white/5 rounded mb-2 w-3/4"></div>
        <div class="h-2 bg-white/5 rounded w-1/2"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="displayedProducts.length === 0" class="text-center py-20">
      <PackageIcon class="w-16 h-16 text-white/10 mx-auto mb-4" />
      <p class="text-white/30 text-lg">{{ searchQuery ? 'Ничего не найдено' : 'Товаров пока нет' }}</p>
      <button v-if="!searchQuery" @click="openAdd" class="admin-btn-primary mt-4">
        <PlusIcon class="w-4 h-4" /> Добавить первый товар
      </button>
    </div>

    <!-- Grid -->
    <div v-else class="admin-media-grid">
      <div v-for="product in displayedProducts" :key="product.id" class="admin-media-card group">
        <div class="relative aspect-square bg-dark-100 rounded-lg overflow-hidden mb-3">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            :alt="product.title"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <PackageIcon class="w-12 h-12 text-white/10" />
          </div>

          <!-- Active badge -->
          <span
            class="absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-heading font-bold"
            :class="product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
          >
            {{ product.is_active ? 'Активен' : 'Скрыт' }}
          </span>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button @click.stop="openEdit(product)" class="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors" title="Редактировать">
              <PencilIcon class="w-4 h-4" />
            </button>
            <button @click.stop="toggleActive(product)" class="bg-white/20 hover:bg-white/30 text-white rounded-lg p-2 transition-colors" :title="product.is_active ? 'Скрыть' : 'Показать'">
              <EyeOffIcon v-if="product.is_active" class="w-4 h-4" />
              <EyeIcon v-else class="w-4 h-4" />
            </button>
            <button @click.stop="deleteTarget = product" class="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 transition-colors" title="Удалить">
              <Trash2Icon class="w-4 h-4" />
            </button>
          </div>
        </div>

        <p class="text-white text-sm font-medium truncate">{{ product.title }}</p>
        <div class="flex items-center justify-between mt-1">
          <span class="text-gold-500 text-sm font-heading font-bold">{{ formatPrice(product.price) }}</span>
          <span class="text-white/40 text-xs truncate ml-2">{{ product.category }}</span>
        </div>
      </div>
    </div>

    <!-- Product form modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showForm" class="modal-backdrop" @click.self="showForm = false">
          <div class="modal-card" style="max-width: 520px; max-height: 90vh; overflow-y: auto;">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-white font-heading font-bold text-lg">
                {{ editTarget ? 'Редактировать товар' : 'Новый товар' }}
              </h3>
              <button @click="showForm = false" class="text-white/30 hover:text-white transition-colors">
                <XIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Image zone -->
            <div class="mb-4">
              <label class="admin-label">Изображение</label>
              <div class="admin-product-img-zone" @click="imgInputRef?.click()">
                <img v-if="formPreview" :src="formPreview" class="w-full h-full object-cover rounded-lg absolute inset-0" />
                <div v-else class="flex flex-col items-center gap-2 text-center relative z-10">
                  <ImageIcon class="w-8 h-8 text-white/20" />
                  <p class="text-white/30 text-sm">Нажмите для выбора</p>
                </div>
                <input ref="imgInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelect" />
              </div>
              <div v-if="imageProgress > 0 && imageProgress < 100" class="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-gold-500 rounded-full transition-all duration-300" :style="`width:${imageProgress}%`"></div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="admin-label">Название *</label>
                <input v-model="form.title" type="text" placeholder="Название товара" class="admin-input" />
              </div>
              <div>
                <label class="admin-label">Описание</label>
                <textarea v-model="form.description" rows="3" placeholder="Описание товара..." class="admin-input resize-none"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="admin-label">Цена (сум) *</label>
                  <input v-model.number="form.price" type="number" min="0" class="admin-input" />
                </div>
                <div>
                  <label class="admin-label">Категория</label>
                  <select v-model="form.category" class="admin-input">
                    <option value="">— без категории —</option>
                    <option v-for="cat in categories" :key="cat.id" :value="cat.title">{{ cat.title }}</option>
                  </select>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <input type="checkbox" id="isActive" v-model="form.is_active" class="admin-checkbox" />
                <label for="isActive" class="text-white/60 text-sm cursor-pointer">Активен (виден в магазине)</label>
              </div>
            </div>

            <div class="flex gap-3 mt-6">
              <button @click="showForm = false" class="admin-btn-ghost flex-1">Отмена</button>
              <button
                @click="saveProduct"
                :disabled="isSaving || !form.title"
                class="admin-btn-primary flex-1"
                :class="{ 'opacity-50 cursor-not-allowed': isSaving || !form.title }"
              >
                {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="deleteTarget" class="modal-backdrop" @click.self="deleteTarget = null">
          <div class="modal-card">
            <h3 class="text-white font-heading font-bold text-lg mb-2">Удалить товар?</h3>
            <p class="text-white/50 text-sm mb-6">«{{ deleteTarget.title }}» будет удалён навсегда.</p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import {
  Package as PackageIcon,
  RefreshCw as RefreshCwIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Pencil as PencilIcon,
  Trash2 as Trash2Icon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  X as XIcon,
  Image as ImageIcon,
} from 'lucide-vue-next'
import { productsAdminService, type AdminProduct, type ProductCategory } from '@/services/products-admin.service'

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!

const products = ref<AdminProduct[]>([])
const categories = ref<ProductCategory[]>([])
const isLoading = ref(false)
const searchQuery = ref('')

const displayedProducts = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return products.value
  return products.value.filter(p =>
    p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  )
})

const loadProducts = async () => {
  isLoading.value = true
  products.value = await productsAdminService.fetchProducts(true)
  isLoading.value = false
}

onMounted(async () => {
  await Promise.all([loadProducts(), loadCategories()])
})

const loadCategories = async () => {
  categories.value = await productsAdminService.fetchCategories()
}

// ── Form ──────────────────────────────────────────────────────────────────────
const showForm = ref(false)
const editTarget = ref<AdminProduct | null>(null)
const form = ref({ title: '', description: '', price: 0, category: '', is_active: true })
const imgInputRef = ref<HTMLInputElement | null>(null)
const formFile = ref<File | null>(null)
const formPreview = ref<string | null>(null)
const imageProgress = ref(0)
const isSaving = ref(false)

const openAdd = () => {
  editTarget.value = null
  form.value = { title: '', description: '', price: 0, category: categories.value[0]?.title ?? '', is_active: true }
  formFile.value = null
  formPreview.value = null
  imageProgress.value = 0
  showForm.value = true
}

const openEdit = (p: AdminProduct) => {
  editTarget.value = p
  form.value = {
    title: p.title,
    description: p.description ?? '',
    price: p.price,
    category: p.category,
    is_active: p.is_active,
  }
  formFile.value = null
  formPreview.value = p.image_url
  imageProgress.value = 0
  showForm.value = true
}

const onImageSelect = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  formFile.value = file
  formPreview.value = URL.createObjectURL(file)
}

const saveProduct = async () => {
  isSaving.value = true
  let imageUrl: string | null = editTarget.value?.image_url ?? null

  if (formFile.value) {
    const uploaded = await productsAdminService.uploadProductImage(formFile.value, (pct) => { imageProgress.value = pct })
    if (uploaded) imageUrl = uploaded
  }

  const payload = {
    title: form.value.title,
    description: form.value.description || null,
    price: form.value.price,
    category: form.value.category,
    image_url: imageUrl,
    is_active: form.value.is_active,
  }

  if (editTarget.value) {
    const updated = await productsAdminService.updateProduct(editTarget.value.id, payload)
    if (updated) {
      const idx = products.value.findIndex(p => p.id === editTarget.value!.id)
      if (idx !== -1) products.value[idx] = updated
      showToast('Товар обновлён', 'success')
    } else {
      showToast('Ошибка при сохранении', 'error')
    }
  } else {
    const created = await productsAdminService.createProduct(payload)
    if (created) {
      products.value.unshift(created)
      showToast('Товар добавлен', 'success')
    } else {
      showToast('Ошибка при добавлении', 'error')
    }
  }
  showForm.value = false
  isSaving.value = false
}

const toggleActive = async (p: AdminProduct) => {
  const updated = await productsAdminService.updateProduct(p.id, { is_active: !p.is_active })
  if (updated) {
    const idx = products.value.findIndex(x => x.id === p.id)
    if (idx !== -1) products.value[idx] = updated
    showToast(updated.is_active ? 'Товар активирован' : 'Товар скрыт', 'info')
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const deleteTarget = ref<AdminProduct | null>(null)
const isDeleting = ref(false)

const doDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  await productsAdminService.deleteProduct(deleteTarget.value.id)
  products.value = products.value.filter(p => p.id !== deleteTarget.value!.id)
  showToast('Товар удалён', 'success')
  deleteTarget.value = null
  isDeleting.value = false
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU').format(price) + ' сум'
</script>

<style scoped>
.admin-product-img-zone {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  border: 2px dashed rgba(255,255,255,0.15);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s;
  background: rgba(255,255,255,0.02);
}
.admin-product-img-zone:hover {
  border-color: var(--color-gold-500);
}
</style>

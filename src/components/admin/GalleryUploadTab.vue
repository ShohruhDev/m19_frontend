<template>
  <div>
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

        <p v-if="uploadError" class="text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-3 border border-red-500/20">
          {{ uploadError }}
        </p>

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
</template>

<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import {
  Upload as UploadIcon,
  Film as FilmIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  X as XIcon,
} from 'lucide-vue-next'
import { galleryService, type CategoryItem } from '@/services/gallery.service'

const emit = defineEmits<{ uploaded: [] }>()

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!
const galleryCategories = inject<import('vue').Ref<CategoryItem[]>>('galleryCategories')!

const categoryOptions = computed(() => galleryCategories.value.map(c => c.label))

interface QueueFile { file: File; previewUrl: string | null; progress: number; done: boolean; error: boolean }

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadQueue = ref<QueueFile[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const uploadError = ref('')
const uploadSuccess = ref(false)
const meta = ref({ title: '', category: '', master: '', duration: '' })

watch(categoryOptions, (opts) => {
  if (!meta.value.category && opts.length > 0) meta.value.category = opts[0]
}, { immediate: true })

const buildQueueFile = (file: File): QueueFile => ({
  file,
  previewUrl: file.type.startsWith('video') ? null : URL.createObjectURL(file),
  progress: 0, done: false, error: false,
})

const onFileSelect = (e: Event) => {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  files.forEach(f => uploadQueue.value.push(buildQueueFile(f)))
  if (fileInputRef.value) fileInputRef.value.value = ''
}

const onDrop = (e: DragEvent) => {
  isDragging.value = false
  Array.from(e.dataTransfer?.files ?? []).forEach(f => uploadQueue.value.push(buildQueueFile(f)))
}

const removeFromQueue = (idx: number) => { uploadQueue.value.splice(idx, 1) }

const clearQueue = () => { uploadQueue.value = []; uploadError.value = ''; uploadSuccess.value = false }

const doUpload = async () => {
  if (!uploadQueue.value.length) return
  isUploading.value = true; uploadError.value = ''; uploadSuccess.value = false
  let successCount = 0
  for (const qf of uploadQueue.value) {
    if (qf.done) { successCount++; continue }
    qf.error = false; qf.progress = 0
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
      qf.done = true; qf.progress = 100; successCount++
    } catch { qf.error = true; qf.progress = 0 }
  }
  isUploading.value = false
  if (successCount === uploadQueue.value.length) {
    uploadSuccess.value = true
    showToast(`Загружено ${successCount} файл(ов)`, 'success')
    setTimeout(() => { clearQueue(); uploadSuccess.value = false; emit('uploaded') }, 1500)
  } else {
    uploadError.value = `Ошибка при загрузке ${uploadQueue.value.filter(q => q.error).length} файл(ов). Остальные загружены.`
    showToast('Некоторые файлы не загрузились', 'error')
  }
}

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
</script>

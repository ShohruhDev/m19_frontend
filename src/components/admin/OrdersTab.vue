<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <h2 class="admin-section-title mb-0 flex-1">Заказы</h2>
      <button @click="loadOrders" class="admin-btn-ghost"><RefreshCwIcon class="w-4 h-4" /> Обновить</button>
    </div>

    <!-- Status filter pills -->
    <div class="flex flex-wrap gap-2 mb-6">
      <button
        v-for="f in STATUS_FILTERS"
        :key="f.value"
        @click="statusFilter = f.value"
        class="px-4 py-1.5 rounded-full text-sm font-heading font-semibold transition-all"
        :class="statusFilter === f.value ? 'bg-gold-500 text-dark' : 'bg-white/5 text-white/50 hover:bg-white/10'"
      >
        {{ f.label }}
        <span class="ml-1.5 text-xs opacity-70">
          {{ f.value === 'all' ? orders.length : orders.filter(o => o.status === f.value).length }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="n in 5" :key="n" class="h-24 bg-white/5 rounded-xl animate-pulse"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="displayedOrders.length === 0" class="text-center py-20">
      <ClipboardListIcon class="w-16 h-16 text-white/10 mx-auto mb-4" />
      <p class="text-white/30 text-lg">{{ statusFilter === 'all' ? 'Заказов пока нет' : 'Нет заказов с этим статусом' }}</p>
    </div>

    <!-- Orders list -->
    <div v-else class="space-y-3">
      <div v-for="order in displayedOrders" :key="order.id" class="order-row">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1.5">
              <span class="text-white/40 text-xs font-heading font-semibold">#{{ order.id }}</span>
              <span class="order-status-badge" :class="`order-status-${order.status}`">
                {{ STATUS_LABELS[order.status] }}
              </span>
              <span class="text-white/30 text-xs">{{ formatDate(order.created_at) }}</span>
            </div>
            <p class="text-white font-medium text-sm">{{ order.client_info.name }}</p>
            <p class="text-white/40 text-xs">{{ order.client_info.phone }}</p>
            <p class="text-white/30 text-xs mt-1.5">
              {{ order.items.map(i => `${i.title} ×${i.count}`).join(', ') }}
            </p>
          </div>

          <div class="flex flex-col items-end gap-2 shrink-0">
            <span class="text-gold-500 font-heading font-bold text-sm">{{ formatPrice(order.total) }}</span>
            <div class="flex gap-1.5 flex-wrap justify-end">
              <button
                v-if="order.status === 'new'"
                @click="setStatus(order, 'processing')"
                :disabled="updatingId === order.id"
                class="text-xs px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                В обработку
              </button>
              <button
                v-if="order.status === 'processing'"
                @click="setStatus(order, 'completed')"
                :disabled="updatingId === order.id"
                class="text-xs px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors disabled:opacity-50"
              >
                Выполнен
              </button>
              <button
                v-if="order.status !== 'cancelled' && order.status !== 'completed'"
                @click="setStatus(order, 'cancelled')"
                :disabled="updatingId === order.id"
                class="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { RefreshCw as RefreshCwIcon, ClipboardList as ClipboardListIcon } from 'lucide-vue-next'
import { productsAdminService, type AdminOrder } from '@/services/products-admin.service'

const showToast = inject<(msg: string, type?: 'success' | 'error' | 'info') => void>('showToast')!

const orders = ref<AdminOrder[]>([])
const isLoading = ref(false)
const statusFilter = ref('all')
const updatingId = ref<number | null>(null)

const STATUS_FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'processing', label: 'В обработке' },
  { value: 'completed', label: 'Выполненные' },
  { value: 'cancelled', label: 'Отменённые' },
]

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
}

const displayedOrders = computed(() => {
  if (statusFilter.value === 'all') return orders.value
  return orders.value.filter(o => o.status === statusFilter.value)
})

const loadOrders = async () => {
  isLoading.value = true
  orders.value = await productsAdminService.fetchOrders()
  isLoading.value = false
}

onMounted(loadOrders)

const setStatus = async (order: AdminOrder, status: AdminOrder['status']) => {
  updatingId.value = order.id
  const updated = await productsAdminService.updateOrderStatus(order.id, status)
  if (updated) {
    const idx = orders.value.findIndex(o => o.id === order.id)
    if (idx !== -1) orders.value[idx] = updated
    showToast('Статус обновлён', 'success')
  }
  updatingId.value = null
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('ru-RU').format(price) + ' сум'

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' })
</script>

<style scoped>
.order-row {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 16px 20px;
  transition: border-color 0.2s;
}
.order-row:hover {
  border-color: rgba(255,255,255,0.12);
}

.order-status-badge {
  font-family: var(--font-family-heading);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 8px;
  border-radius: 999px;
}
.order-status-new        { background: rgba(229,228,226,0.12); color: var(--color-gold-500); }
.order-status-processing { background: rgba(59,130,246,0.15);  color: rgb(147,197,253); }
.order-status-completed  { background: rgba(34,197,94,0.15);   color: rgb(134,239,172); }
.order-status-cancelled  { background: rgba(239,68,68,0.1);    color: rgba(239,68,68,0.7); }
</style>

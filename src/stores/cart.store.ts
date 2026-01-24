import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export interface CartItem {
    id: number | string
    title: string
    price: number
    price_max?: number // If range
    image?: string
    quantity: number
    category_id?: number
}

export const useCartStore = defineStore('cart', () => {
    const items = ref<CartItem[]>([])

    // Load from localStorage
    const loadCart = () => {
        const stored = localStorage.getItem('m19_cart')
        if (stored) {
            try {
                items.value = JSON.parse(stored)
            } catch (e) {
                console.error('Failed to parse cart', e)
                localStorage.removeItem('m19_cart')
            }
        }
    }

    // Save to localStorage
    watch(items, (newItems) => {
        localStorage.setItem('m19_cart', JSON.stringify(newItems))
    }, { deep: true })

    // Initialize
    loadCart()

    // Getters
    const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

    const totalPrice = computed(() => items.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))

    // Actions
    const addItem = (product: any, quantity: number = 1) => {
        const existing = items.value.find(i => i.id === product.id)
        if (existing) {
            existing.quantity += quantity
        } else {
            items.value.push({
                id: product.id,
                title: product.title,
                price: product.price_min || product.price || 0,
                image: product.image_url || product.image || '',
                quantity: quantity,
                category_id: product.category_id
            })
        }
    }

    const removeItem = (id: number | string) => {
        const index = items.value.findIndex(i => i.id === id)
        if (index !== -1) {
            items.value.splice(index, 1)
        }
    }

    const updateQuantity = (id: number | string, quantity: number) => {
        const item = items.value.find(i => i.id === id)
        if (item) {
            if (quantity <= 0) {
                removeItem(id)
            } else {
                item.quantity = quantity
            }
        }
    }

    const clearCart = () => {
        items.value = []
    }

    return {
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
    }
})

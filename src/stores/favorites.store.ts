import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useFavoritesStore = defineStore('favorites', () => {
    const items = ref<Set<number | string>>(new Set())

    // Load
    const loadFavorites = () => {
        const stored = localStorage.getItem('m19_favorites')
        if (stored) {
            try {
                const arr = JSON.parse(stored)
                if (Array.isArray(arr)) {
                    items.value = new Set(arr)
                }
            } catch (e) {
                console.error('Failed to parse favorites')
            }
        }
    }

    // Save
    watch(items, (newSet) => {
        localStorage.setItem('m19_favorites', JSON.stringify(Array.from(newSet)))
    }, { deep: true })

    loadFavorites()

    // Actions
    const toggle = (id: number | string) => {
        if (items.value.has(id)) {
            items.value.delete(id)
        } else {
            items.value.add(id)
        }
        // Trigger reactivity for Set by re-assigning? 
        // Set isn't deep watched well in Vue 3 unless we use ref(Set) correctly.
        // Better: items.value = new Set(items.value) to trigger watch.
        items.value = new Set(items.value)
    }

    const isFavorite = (id: number | string) => {
        return items.value.has(id)
    }

    return {
        items,
        toggle,
        isFavorite
    }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { altegService } from '@/services'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<any>(null)
    const token = ref<string | null>(localStorage.getItem('auth_token'))
    const isAuthenticated = computed(() => !!token.value)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Actions
    async function requestAuthCode(phone: string): Promise<boolean> {
        isLoading.value = true
        error.value = null
        try {
            return await altegService.requestAuthCode(phone)
        } catch (e: any) {
            error.value = e.message
            return false
        } finally {
            isLoading.value = false
        }
    }

    async function login(phone: string, code: string): Promise<boolean> {
        isLoading.value = true
        error.value = null
        try {
            const result = await altegService.authenticateUser(phone, code)
            token.value = result.token
            user.value = result.user

            localStorage.setItem('auth_token', result.token)
            return true
        } catch (e: any) {
            error.value = e.message
            return false
        } finally {
            isLoading.value = false
        }
    }

    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem('auth_token')
    }

    async function loadUser() {
        if (!token.value) return
        isLoading.value = true
        try {
            // Здесь можно будет вызвать getUserData(token.value), если нужно обновить профиль
            const userData = await altegService.getUserData(token.value)
            if (userData) {
                // Adapt response if needed
                user.value = userData
            }
        } catch (e) {
            console.error('Failed to load user', e)
            // If 401, logout?
        } finally {
            isLoading.value = false
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        requestAuthCode,
        login,
        logout,
        loadUser
    }
})

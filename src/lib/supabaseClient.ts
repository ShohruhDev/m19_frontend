/**
 * Supabase Client Configuration
 * Singleton instance для работы с Supabase
 */

import { createClient } from '@supabase/supabase-js'

// Получаем env переменные
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Валидация обязательных переменных
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Опции клиента
const supabaseOptions = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'M19 Barbershop',
    },
  },
}

// Создаем singleton instance
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
)

// Helper для проверки подключения
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('products').select('count', { count: 'exact', head: true })
    return !error
  } catch (err) {
    console.error('Supabase connection check failed:', err)
    return false
  }
}

// Export для тестирования
export const getSupabaseUrl = () => supabaseUrl
export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey)

// Не логируем ключи в production
if (import.meta.env.DEV) {
  console.log('✅ Supabase client initialized')
  console.log('📍 URL:', supabaseUrl)
  console.log('🔑 Key configured:', Boolean(supabaseAnonKey))
}


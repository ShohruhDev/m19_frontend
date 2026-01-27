import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue'),
      meta: {
        title: 'Главная - M19 Barbershop',
      },
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/pages/ProductsPage.vue'),
      meta: {
        title: 'Косметика - M19 Barbershop',
      },
    },

    {
      path: '/booking',
      name: 'booking',
      component: () => import('@/pages/BookingPage.vue'),
      meta: {
        title: 'Онлайн-запись - M19 Barbershop',
      },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// Обновление title страницы
router.beforeEach((to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }
  next()
})

export default router


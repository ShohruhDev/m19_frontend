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
      path: '/services',
      name: 'services',
      component: () => import('@/pages/ServicesPage.vue'),
      meta: {
        title: 'Услуги и цены - M19 Barbershop',
      },
    },
    {
      path: '/staff',
      name: 'staff',
      component: () => import('@/pages/StaffPage.vue'),
      meta: {
        title: 'Наши мастера - M19 Barbershop',
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
      path: '/reviews',
      name: 'reviews',
      component: () => import('@/pages/ReviewsPage.vue'),
      meta: {
        title: 'Отзывы - M19 Barbershop',
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
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/LoginPage.vue'),
      meta: {
        title: 'Вход - M19 Barbershop',
        guestOnly: true
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/pages/ProfilePage.vue'),
      meta: {
        title: 'Личный кабинет - M19 Barbershop',
        requiresAuth: true
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

// Обновление title страницы + Auth Guard
router.beforeEach(async (to, _from, next) => {
  const title = to.meta.title as string
  if (title) {
    document.title = title
  }

  // Auth Logic
  const authRequired = to.meta.requiresAuth
  const guestOnly = to.meta.guestOnly
  const token = localStorage.getItem('auth_token') // Check token directly for speed

  if (authRequired && !token) {
    return next('/login')
  }

  if (guestOnly && token) {
    return next('/profile')
  }

  next()
})

export default router


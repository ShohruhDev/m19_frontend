# 🔥 M19 Barbershop - Enterprise Frontend

**Premium барбершоп с интеграцией онлайн-записи Alteg**

Enterprise-уровневый фронтенд на Vue 3 + TypeScript с темным премиум дизайном, cinematic анимациями и полноценным booking flow.

---

## 📋 Содержание

- [Технологический стек](#технологический-стек)
- [Архитектура проекта](#архитектура-проекта)
- [UX концепция](#ux-концепция)
- [Структура проекта](#структура-проекта)
- [Установка и запуск](#установка-и-запуск)
- [Интеграция Alteg](#интеграция-alteg)
- [Анимации](#анимации)
- [Компоненты](#компоненты)
- [Booking Flow](#booking-flow)

---

## 🛠 Технологический стек

### Core
- **Vue 3** (Composition API) - реактивный фреймворк
- **Vite** - быстрый сборщик
- **TypeScript** - типизация
- **Pinia** - state management
- **Vue Router** - роутинг

### Стилизация
- **Tailwind CSS** - utility-first CSS
- **Custom CSS** - premium компоненты

### Анимации
- **GSAP** + ScrollTrigger - профессиональные анимации
- **VueUse Motion** - декларативные анимации
- **Lenis** - smooth scroll

### HTTP & API
- **Axios** - HTTP client с retry logic
- **TypeScript types** - полная типизация API

---

## 🏗 Архитектура проекта

### Паттерны
- **Atomic Design** - организация компонентов
- **Service Layer** - абстракция над API
- **Composables** - переиспользуемая логика
- **Type-safe** - полная типизация

### Принципы
- **Separation of Concerns** - разделение ответственности
- **Single Responsibility** - один компонент = одна задача
- **DRY** - Don't Repeat Yourself
- **SOLID** - объектно-ориентированное проектирование

---

## 🎨 UX концепция

### Дизайн
**Вдохновение:** https://unclechill.uz/ru/

- ✨ **Dark Premium** - темная цветовая схема с золотыми акцентами
- 📱 **Mobile-First** - адаптивный дизайн
- 🎭 **Cinematic** - плавные анимации и переходы
- ⚡ **60fps** - оптимизированная производительность

### Цветовая палитра
```css
- Dark: #0A0A0A, #1A1A1A, #0F0F0F
- Gold: #D4AF37 (premium золото)
- Accent: градиенты от gold-300 до gold-700
```

### Типографика
- **Display:** Playfair Display (serif) - заголовки
- **Heading:** Montserrat (sans-serif) - подзаголовки
- **Body:** Inter (sans-serif) - основной текст

### Анимации
- **Entrance animations** - появление секций
- **Scroll-based** - анимации при скролле
- **Parallax** - эффект параллакса
- **Hover effects** - интерактивность
- **Page transitions** - переходы между страницами
- **Micro-animations** - детальная анимация элементов

---

## 📁 Структура проекта

```
src/
├── assets/                 # Статические ресурсы
│   ├── fonts/             # Шрифты
│   └── images/            # Изображения
│
├── components/            # Компоненты
│   ├── ui/               # UI компоненты (атомы)
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   ├── BaseModal.vue
│   │   ├── SelectableCard.vue
│   │   ├── SkeletonLoader.vue
│   │   └── StepperItem.vue
│   │
│   ├── booking/          # Компоненты booking flow
│   │   ├── ServiceSelection.vue
│   │   ├── StaffSelection.vue
│   │   ├── DateSelection.vue
│   │   ├── TimeSelection.vue
│   │   ├── BookingConfirmation.vue
│   │   └── BookingFlow.vue
│   │
│   ├── sections/         # Секции страниц
│   │   └── HeroSection.vue
│   │
│   ├── common/           # Общие компоненты
│   │   └── AppHeader.vue
│   │
│   └── animations/       # Анимационные компоненты
│
├── composables/          # Переиспользуемая логика
│   ├── animations/
│   │   ├── useGSAP.ts           # GSAP анимации
│   │   ├── useSmoothScroll.ts   # Lenis smooth scroll
│   │   └── usePageTransition.ts # Page transitions
│   │
│   ├── booking/
│   │   └── useBookingFlow.ts    # Booking логика
│   │
│   └── ui/
│       └── useLoadingState.ts   # Loading states
│
├── layouts/              # Layouts (если нужны)
│
├── pages/                # Страницы
│   ├── HomePage.vue
│   ├── ServicesPage.vue
│   ├── StaffPage.vue
│   ├── ProductsPage.vue
│   ├── ReviewsPage.vue
│   └── BookingPage.vue
│
├── router/               # Vue Router
│   └── index.ts
│
├── services/             # Service layer
│   ├── http-client.ts   # Axios instance
│   ├── alteg.service.ts # Alteg API
│   └── index.ts
│
├── stores/               # Pinia stores
│   ├── app.store.ts     # Глобальный store
│   ├── booking.store.ts # Booking store
│   └── index.ts
│
├── styles/               # Глобальные стили
│   └── main.css         # Tailwind + custom
│
├── types/                # TypeScript типы
│   ├── alteg.types.ts
│   ├── booking.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                # Утилиты
│
├── App.vue               # Root component
└── main.ts               # Entry point
```

---

## 🚀 Установка и запуск

### Требования
- Node.js 18+
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
cd m19_new

# Установить зависимости
npm install

# Создать .env файл
cp .env.example .env
```

### Настройка .env

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=M19 Barbershop
VITE_APP_URL=http://localhost:3000
```

### Запуск

```bash
# Development сервер
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

---

## 🔌 Интеграция Alteg

### Концепция

**❌ НЕ хранить Alteg token на фронтенде**

**✅ Использовать backend proxy API**

### Архитектура

```
Frontend (Vue) → Backend API → Alteg API
```

### Service Layer

#### HTTP Client (`src/services/http-client.ts`)

```typescript
- Axios instance с настройками
- Retry logic (3 попытки)
- Exponential backoff
- Error normalization
- Request/Response interceptors
```

#### Alteg Service (`src/services/alteg.service.ts`)

**Методы:**

```typescript
// Услуги
fetchServices() → AltegService[]
fetchServicesByCategory() → AltegServiceCategory[]
fetchServiceById(id) → AltegService

// Сотрудники
fetchStaff(serviceId?) → AltegStaff[]
fetchStaffById(id) → AltegStaff

// Расписание
fetchAvailableDates(staffId, serviceId, fromDate?) → AltegAvailableDate[]
fetchAvailableTime(staffId, serviceId, date) → AltegScheduleSlot[]

// Запись
createBooking(payload) → AltegBookingResponse
cancelBooking(id, code) → void
```

### Типы

```typescript
// src/types/alteg.types.ts
interface AltegService {
  id: number | string
  title: string
  description?: string
  price_min: number
  price_max: number
  duration: number
  category_id?: number
  image_url?: string
}

interface AltegStaff {
  id: number | string
  name: string
  specialization?: string
  avatar_url?: string
  rating?: number
  reviews_count?: number
  experience_years?: number
}

interface AltegBookingPayload {
  service_id: number | string
  staff_id: number | string
  datetime: string
  client: {
    name: string
    phone: string
    email?: string
    comment?: string
  }
}
```

### Backend Requirements

Backend должен предоставить следующие endpoints:

```
GET    /api/alteg/services
GET    /api/alteg/services/categories
GET    /api/alteg/services/:id
GET    /api/alteg/staff
GET    /api/alteg/staff/:id
GET    /api/alteg/schedule/dates
GET    /api/alteg/schedule/slots
POST   /api/alteg/bookings
POST   /api/alteg/bookings/:id/cancel
```

---

## 🎬 Анимации

### GSAP Composables

#### useFadeIn
```typescript
useFadeIn(element, {
  duration: 1,
  delay: 0,
  ease: 'power3.out'
})
```

#### useStaggerAnimation
```typescript
useStaggerAnimation('.items', {
  duration: 0.8,
  stagger: 0.1
})
```

#### useParallax
```typescript
useParallax(imageRef, 0.5) // speed
```

#### useCounterAnimation
```typescript
useCounterAnimation(numberRef, 1000, {
  duration: 2
})
```

#### useMagneticHover
```typescript
useMagneticHover(buttonRef) // магнитный эффект
```

### Примеры использования

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import gsap from 'gsap'

const titleRef = ref<HTMLElement | null>(null)

onMounted(() => {
  const tl = gsap.timeline()
  
  tl.from(titleRef.value, {
    opacity: 0,
    y: 100,
    duration: 1,
    ease: 'power3.out'
  })
    .from('.items > *', {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.8
    }, '-=0.5')
})
</script>
```

---

## 🧩 Компоненты

### UI Components (Atomic Design)

#### BaseButton
```vue
<BaseButton 
  variant="primary|secondary|ghost|outline"
  size="sm|md|lg"
  :loading="false"
  :disabled="false"
>
  Текст кнопки
</BaseButton>
```

#### BaseInput
```vue
<BaseInput
  id="name"
  v-model="value"
  label="Имя"
  type="text|email|tel|password"
  :required="true"
  :error="errorMessage"
  hint="Подсказка"
/>
```

#### BaseModal
```vue
<BaseModal
  :is-open="isOpen"
  size="sm|md|lg|xl|full"
  :show-close="true"
  :close-on-backdrop="true"
  @close="handleClose"
>
  <template #header>Заголовок</template>
  <template #default>Контент</template>
  <template #footer>Футер</template>
</BaseModal>
```

#### SelectableCard
```vue
<SelectableCard
  :is-selected="selected"
  @click="handleSelect"
>
  Контент карточки
</SelectableCard>
```

#### SkeletonLoader
```vue
<SkeletonLoader
  type="text|avatar|card|image"
  size="sm|md|lg"
/>
```

---

## 📝 Booking Flow

### Шаги процесса записи

1. **Service Selection** - выбор услуги
2. **Staff Selection** - выбор мастера
3. **Date Selection** - выбор даты
4. **Time Selection** - выбор времени
5. **Confirmation** - подтверждение и данные клиента

### Store (Pinia)

```typescript
// src/stores/booking.store.ts

const bookingStore = useBookingStore()

// State
bookingStore.currentStep        // текущий шаг
bookingStore.selectedService    // выбранная услуга
bookingStore.selectedStaff      // выбранный мастер
bookingStore.selectedDate       // выбранная дата
bookingStore.selectedTime       // выбранное время
bookingStore.clientInfo         // данные клиента

// Computed
bookingStore.canGoNext          // можно ли идти дальше
bookingStore.canGoBack          // можно ли вернуться
bookingStore.progress           // прогресс в %

// Actions
bookingStore.loadServices()
bookingStore.loadStaff()
bookingStore.loadAvailableDates()
bookingStore.loadAvailableSlots()
bookingStore.createBooking()
bookingStore.nextStep()
bookingStore.prevStep()
bookingStore.resetBooking()
```

### Композабл

```typescript
import { useBookingFlow } from '@/composables'

const {
  // Все из store +
  stepConfig,            // конфиг текущего шага
  formattedDateTime,     // форматированные дата/время
  totalPrice,            // общая цена
  estimatedDuration,     // длительность
  isStepComplete,        // проверка завершенности шага
} = useBookingFlow()
```

### Валидация

- **Имя:** минимум 2 символа
- **Телефон:** 10-11 цифр
- **Email:** стандартная валидация
- **Согласие:** обязательно

### Optimistic UI

- Skeleton loaders во время загрузки
- Плавные переходы между шагами
- Graceful error handling
- Success modal после успешной записи

---

## 📊 Performance

### Оптимизации

- **Lazy loading** страниц через Vue Router
- **Code splitting** по роутам и библиотекам
- **Tree shaking** неиспользуемого кода
- **Minification** в production
- **GSAP** оптимизирован для 60fps
- **Lenis** hardware-accelerated smooth scroll

### Bundle анализ

```bash
npm run build
# Проверить dist/ папку
```

---

## 🔒 Security

- ❌ Нет Alteg token на фронтенде
- ✅ Все запросы через backend proxy
- ✅ Input валидация
- ✅ XSS защита через Vue
- ✅ CSRF защита на backend

---

## 🎯 Best Practices

### Vue 3
- Composition API везде
- TypeScript strict mode
- Script setup синтаксис
- Реактивность через ref/reactive

### TypeScript
- Все типизировано
- Нет any (кроме крайних случаев)
- Интерфейсы для props
- Generic types где нужно

### CSS
- Tailwind utility classes
- Scoped styles в компонентах
- CSS variables для темы
- Mobile-first подход

### Git
- Semantic commits
- Feature branches
- Pull requests

---

## 📚 Дополнительные ресурсы

- [Vue 3 Docs](https://vuejs.org/)
- [Vite Docs](https://vitejs.dev/)
- [GSAP Docs](https://greensock.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Pinia](https://pinia.vuejs.org/)

---

## 👨‍💻 Разработка

### Добавление новой страницы

1. Создать компонент в `src/pages/`
2. Добавить роут в `src/router/index.ts`
3. Добавить в навигацию `AppHeader.vue`

### Добавление нового API метода

1. Добавить тип в `src/types/`
2. Добавить метод в `src/services/alteg.service.ts`
3. Использовать в компонентах/stores

### Добавление новой анимации

1. Создать composable в `src/composables/animations/`
2. Экспортировать из `index.ts`
3. Использовать в компонентах

---

## ⚡ Следующие шаги

### Backend Integration
- Поднять backend API
- Интегрировать с Alteg
- Добавить аутентификацию (если нужно)

### Дополнительные фичи
- Отзывы с возможностью добавления
- Галерея работ
- Блог/статьи
- Личный кабинет клиента
- История записей
- Программа лояльности

### SEO
- Meta tags
- Open Graph
- Sitemap
- Structured data (Schema.org)

---

## 📄 Лицензия

Proprietary - M19 Barbershop

---

**Создано с ❤️ для M19 Barbershop**


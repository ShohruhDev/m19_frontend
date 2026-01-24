import type { CatalogItem } from '@/stores/products'

/**
 * Mock product data for testing
 * Barbershop cosmetics and grooming products
 */
export const mockProducts: CatalogItem[] = [
    {
        id: 1,
        title: 'American Crew Fiber',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 180000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop',
        description: 'Сильная фиксация с матовым эффектом. Идеально для текстурированных причесок.',
        category_name: 'Стайлинг'
    },
    {
        id: 2,
        title: 'Layrite Superhold Pomade',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 165000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        description: 'Помада с суперсильной фиксацией на водной основе. Легко смывается.',
        category_name: 'Стайлинг'
    },
    {
        id: 3,
        title: 'Uppercut Deluxe Pomade',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 150000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
        description: 'Классическая помада среднего блеска и сильной фиксации.',
        category_name: 'Стайлинг'
    },
    {
        id: 4,
        title: 'Suavecito Original Hold',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 140000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1618330925609-cfece0c745b5?w=400&h=400&fit=crop',
        description: 'Оригинальная помада со средней фиксацией и блеском.',
        category_name: 'Стайлинг'
    },
    {
        id: 5,
        title: 'Proraso Beard Oil',
        is_category: false,
        is_item: true,
        category_id: 102,
        parent_id: 0,
        price: 120000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop',
        description: 'Масло для бороды с маслом авокадо и витамином Е. Смягчает и питает.',
        category_name: 'Уход за бородой'
    },
    {
        id: 6,
        title: 'Beardbrand Beard Wash',
        is_category: false,
        is_item: true,
        category_id: 102,
        parent_id: 0,
        price: 135000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop',
        description: 'Шампунь для бороды деликатного очищения. Не пересушивает кожу.',
        category_name: 'Уход за бородой'
    },
    {
        id: 7,
        title: 'The Bluebeards Revenge Beard Balm',
        is_category: false,
        is_item: true,
        category_id: 102,
        parent_id: 0,
        price: 145000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1612933510543-5b442296703b?w=400&h=400&fit=crop',
        description: 'Бальзам для укладки и ухода за бородой. Средняя фиксация.',
        category_name: 'Уход за бородой'
    },
    {
        id: 8,
        title: 'Baxter of California Clay Pomade',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 195000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        description: 'Глиняная помада с сильной фиксацией и матовым финишем.',
        category_name: 'Стайлинг'
    },
    {
        id: 9,
        title: 'Billy Jealousy Shave Cream',
        is_category: false,
        is_item: true,
        category_id: 103,
        parent_id: 0,
        price: 110000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
        description: 'Крем для бритья с густой пеной. Защищает кожу от раздражения.',
        category_name: 'Бритье'
    },
    {
        id: 10,
        title: 'Taylor of Old Bond Street Aftershave',
        is_category: false,
        is_item: true,
        category_id: 103,
        parent_id: 0,
        price: 125000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1618330925609-cfece0c745b5?w=400&h=400&fit=crop',
        description: 'Классический лосьон после бритья с сандаловым деревом.',
        category_name: 'Бритье'
    },
    {
        id: 11,
        title: 'Jack Black Beard Lube',
        is_category: false,
        is_item: true,
        category_id: 103,
        parent_id: 0,
        price: 155000,
        amount: 0,
        image_url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop',
        description: '3-в-1: масло, кондиционер и средство для бритья.',
        category_name: 'Бритье'
    },
    {
        id: 12,
        title: 'Hanz de Fuko Claymation',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 175000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&h=400&fit=crop',
        description: 'Гибридная глина для экстрасильной фиксации и матового вида.',
        category_name: 'Стайлинг'
    },
    {
        id: 13,
        title: 'Reuzel Blue Pomade',
        is_category: false,
        is_item: true,
        category_id: 101,
        parent_id: 0,
        price: 160000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1612933510543-5b442296703b?w=400&h=400&fit=crop',
        description: 'Сильная фиксация с высоким блеском на водной основе.',
        category_name: 'Стайлинг'
    },
    {
        id: 14,
        title: 'Gentleman Jon Beard Oil',
        is_category: false,
        is_item: true,
        category_id: 102,
        parent_id: 0,
        price: 95000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
        description: 'Натуральное масло для бороды с аргановым маслом.',
        category_name: 'Уход за бородой'
    },
    {
        id: 15,
        title: 'The Art of Shaving Pre-Shave Oil',
        is_category: false,
        is_item: true,
        category_id: 103,
        parent_id: 0,
        price: 130000,
        amount: 10,
        image_url: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400&h=400&fit=crop',
        description: 'Масло перед бритьем для защиты и увлажнения кожи.',
        category_name: 'Бритье'
    }
]

export const mockCategories = [
    { id: 101, title: 'Стайлинг', icon: '💈' },
    { id: 102, title: 'Уход за бородой', icon: '🧔' },
    { id: 103, title: 'Бритье', icon: '🪒' }
]

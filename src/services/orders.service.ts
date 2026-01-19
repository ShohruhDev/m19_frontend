import type { Order, OrderInsert, OrderStatus, OrderFilters } from '@/types/database.types'

export async function listOrders(_filters: OrderFilters = {}) {
    // Mock implementation
    return { data: [] as Order[], error: null }
}

export async function getOrder(_id: string) {
    return { data: null as Order | null, error: null }
}

export async function createOrder(_order: OrderInsert) {
    return { data: null as Order | null, error: null }
}

export async function updateOrderStatus(_id: string, _status: OrderStatus) {
    return { data: null as Order | null, error: null }
}

export async function cancelOrder(_id: string) {
    return { data: null as Order | null, error: null }
}

export async function getOrderStats() {
    return {
        data: {
            total: 0,
            new: 0,
            processing: 0,
            done: 0,
            canceled: 0,
        }, error: null
    }
}

export async function getNewOrders() {
    return { data: [] as Order[], error: null }
}

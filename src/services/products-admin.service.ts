export interface ProductCategory {
    id: number;
    title: string;
    slug: string;
    created_at: string;
}

export interface AdminProduct {
    id: number;
    title: string;
    description: string | null;
    price: number;
    category: string;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
}

export interface AdminOrder {
    id: number;
    client_info: { name: string; phone: string };
    items: Array<{ title: string; count: number; price: number }>;
    total: number;
    status: 'new' | 'processing' | 'completed' | 'cancelled';
    created_at: string;
}

const PRODUCTS_URL = import.meta.env.VITE_API_BASE_URL + '/products';
const ORDERS_URL = import.meta.env.VITE_API_BASE_URL + '/orders';

class ProductsAdminService {
    async fetchProducts(admin = false): Promise<AdminProduct[]> {
        try {
            const url = admin ? `${PRODUCTS_URL}?admin=true` : PRODUCTS_URL;
            const res = await fetch(url);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch (e) {
            console.error('fetchProducts error:', e);
            return [];
        }
    }

    async createProduct(data: Omit<AdminProduct, 'id' | 'created_at'>): Promise<AdminProduct | null> {
        try {
            const res = await fetch(PRODUCTS_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('createProduct error:', e);
            return null;
        }
    }

    async updateProduct(id: number, patch: Partial<Omit<AdminProduct, 'id' | 'created_at'>>): Promise<AdminProduct | null> {
        try {
            const res = await fetch(`${PRODUCTS_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('updateProduct error:', e);
            return null;
        }
    }

    async deleteProduct(id: number): Promise<void> {
        try {
            await fetch(`${PRODUCTS_URL}/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error('deleteProduct error:', e);
        }
    }

    async uploadProductImage(file: File, onProgress?: (pct: number) => void): Promise<string | null> {
        try {
            onProgress?.(10);
            const presignRes = await fetch(`${PRODUCTS_URL}/presign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, contentType: file.type }),
            });
            const presignJson = await presignRes.json();
            if (!presignJson.success) throw new Error(presignJson.message);

            const { signedUrl, publicUrl } = presignJson.data;
            onProgress?.(30);

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', signedUrl, true);
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) onProgress?.(30 + Math.round((e.loaded / e.total) * 60));
                };
                xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error('Upload failed')));
                xhr.onerror = () => reject(new Error('Network error'));
                xhr.send(file);
            });

            onProgress?.(100);
            return publicUrl;
        } catch (e) {
            console.error('uploadProductImage error:', e);
            return null;
        }
    }

    async fetchCategories(): Promise<ProductCategory[]> {
        try {
            const res = await fetch(`${PRODUCTS_URL}/categories`);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch (e) {
            console.error('fetchCategories error:', e);
            return [];
        }
    }

    async createCategory(title: string): Promise<ProductCategory | null> {
        try {
            const res = await fetch(`${PRODUCTS_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('createCategory error:', e);
            return null;
        }
    }

    async updateCategory(id: number, title: string): Promise<ProductCategory | null> {
        try {
            const res = await fetch(`${PRODUCTS_URL}/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('updateCategory error:', e);
            return null;
        }
    }

    async deleteCategory(id: number): Promise<void> {
        try {
            await fetch(`${PRODUCTS_URL}/categories/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error('deleteCategory error:', e);
        }
    }

    async fetchOrders(status?: string): Promise<AdminOrder[]> {
        try {
            const url = status && status !== 'all' ? `${ORDERS_URL}?status=${status}` : ORDERS_URL;
            const res = await fetch(url);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch (e) {
            console.error('fetchOrders error:', e);
            return [];
        }
    }

    async updateOrderStatus(id: number, status: AdminOrder['status']): Promise<AdminOrder | null> {
        try {
            const res = await fetch(`${ORDERS_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('updateOrderStatus error:', e);
            return null;
        }
    }
}

export const productsAdminService = new ProductsAdminService();

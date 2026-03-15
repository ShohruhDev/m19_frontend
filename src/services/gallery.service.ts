export interface CategoryItem {
    id: string;
    label: string;
    icon: string;
    sort_order: number;
}

export interface GalleryItem {
    id: string;
    title: string;
    category: string;
    master: string | null;
    type: 'photo' | 'video';
    file_path: string;
    file_url: string;
    duration: string | null;
    sort_order: number;
    created_at: string;
    span?: string;
    thumb?: string;
}

export interface GalleryItemPatch {
    title?: string;
    category?: string;
    master?: string | null;
    sort_order?: number;
    duration?: string | null;
}

const PAGE_SIZE = 12;
const API_URL = import.meta.env.VITE_API_BASE_URL + '/gallery';

class GalleryService {
    /** Fetch all gallery items (for admin panel reordering) */
    async fetchItems(): Promise<GalleryItem[]> {
        try {
            const res = await fetch(`${API_URL}?all=true`);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch (e) {
            console.error('Gallery fetch error:', e);
            return [];
        }
    }

    /** Fetch items with pagination */
    async fetchPage(page: number, category?: string): Promise<{ items: GalleryItem[]; total: number }> {
        try {
            const url = new URL(API_URL);
            url.searchParams.append('page', page.toString());
            url.searchParams.append('limit', PAGE_SIZE.toString());
            if (category && category !== 'all') {
                url.searchParams.append('category', category);
            }

            const res = await fetch(url.toString());
            const json = await res.json();
            
            if (!json.success) throw new Error(json.message);
            return { items: json.data, total: json.total };
        } catch (e) {
            console.error('Gallery paginated fetch error:', e);
            return { items: [], total: 0 };
        }
    }

    /** Fetch a single item by ID */
    async fetchById(id: string): Promise<GalleryItem | null> {
        // As we don't have a specific GET /id endpoint yet, we can grab it from all items
        // or just use the page API if needed. Since deep link is an edge case, a fetch is okay.
        // For production, a GET /api/gallery/:id would be better.
        try {
            const items = await this.fetchItems();
            return items.find(i => i.id === id) || null;
        } catch (e) {
            return null;
        }
    }

    /** Upload file using presigned URL flow */
    async uploadFile(
        file: File,
        meta: { title: string; category: string; master: string; duration?: string },
        onProgress?: (pct: number) => void
    ): Promise<GalleryItem | null> {
        try {
            onProgress?.(10);

            // 1. Get presigned URL
            const presignRes = await fetch(`${API_URL}/presign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName: file.name, contentType: file.type }),
            });
            const presignJson = await presignRes.json();
            if (!presignJson.success) throw new Error(presignJson.message);

            const { signedUrl, path, publicUrl } = presignJson.data;
            onProgress?.(30);

            // 2. PUT file directly to Supabase Storage
            // Using XMLHttpRequest for upload progress tracking
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', signedUrl, true);
                
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = 30 + Math.round((e.loaded / e.total) * 50); // 30% to 80%
                        onProgress?.(percent);
                    }
                };
                
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) resolve();
                    else reject(new Error('Storage upload failed'));
                };
                
                xhr.onerror = () => reject(new Error('Storage upload network error'));
                xhr.send(file);
            });

            onProgress?.(80);

            // 3. Save metadata to DB via POST /api/gallery
            const saveRes = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: meta.title,
                    category: meta.category,
                    master: meta.master,
                    duration: meta.duration,
                    type: file.type.startsWith('video') ? 'video' : 'photo',
                    file_path: path,
                    file_url: publicUrl
                })
            });

            const saveJson = await saveRes.json();
            if (!saveJson.success) throw new Error(saveJson.message);

            onProgress?.(100);
            return saveJson.data;

        } catch (e: any) {
            console.error('Upload Error:', e);
            throw e;
        }
    }

    /** Update item metadata */
    async updateItem(id: string, patch: GalleryItemPatch): Promise<GalleryItem | null> {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch)
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('Update item error:', e);
            return null;
        }
    }

    /** Batch update sort_order */
    async reorderItems(orderedIds: string[]): Promise<void> {
        try {
            await fetch(`${API_URL}/reorder`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: orderedIds })
            });
        } catch (e) {
            console.error('Reorder error:', e);
        }
    }

    /** Delete single item */
    async deleteItem(id: string): Promise<void> {
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error('Delete error:', e);
        }
    }

    /** Bulk delete multiple items */
    async bulkDelete(items: GalleryItem[]): Promise<void> {
        try {
            await fetch(`${API_URL}/bulk`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ id: i.id, file_path: i.file_path }))
                })
            });
        } catch (e) {
            console.error('Bulk delete error:', e);
        }
    }

    /** Fetch all categories */
    async fetchCategories(): Promise<CategoryItem[]> {
        try {
            const res = await fetch(`${API_URL}/categories`);
            const json = await res.json();
            return json.success ? json.data : [];
        } catch (e) {
            console.error('Fetch categories error:', e);
            return [];
        }
    }

    /** Create a new category */
    async createCategory(label: string, icon: string): Promise<CategoryItem | null> {
        try {
            const res = await fetch(`${API_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, icon }),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('Create category error:', e);
            return null;
        }
    }

    /** Delete a category */
    async deleteCategory(id: string): Promise<void> {
        try {
            await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        } catch (e) {
            console.error('Delete category error:', e);
        }
    }

    /** Update a category */
    async updateCategory(id: string, patch: { label?: string; icon?: string; sort_order?: number }): Promise<CategoryItem | null> {
        try {
            const res = await fetch(`${API_URL}/categories/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patch),
            });
            const json = await res.json();
            return json.success ? json.data : null;
        } catch (e) {
            console.error('Update category error:', e);
            return null;
        }
    }
}

export const galleryService = new GalleryService();
export { PAGE_SIZE };

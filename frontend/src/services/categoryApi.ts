import { fetchApi } from './api';
import { Category, CreateCategoryPayload } from '../types/category';

export const categoryApi = {
  getCategories: () => fetchApi<Category[]>('/categories'),
  getCategory: (id: string) => fetchApi<Category>(`/categories/${id}`),
  createCategory: (payload: CreateCategoryPayload) =>
    fetchApi<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateCategory: (id: string, payload: CreateCategoryPayload) =>
    fetchApi<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteCategory: (id: string, reassign_to_category_id?: string) => {
    const query = reassign_to_category_id ? `?reassign_to_category_id=${reassign_to_category_id}` : '';
    return fetchApi<{ detail: string }>(`/categories/${id}${query}`, {
      method: 'DELETE'
    });
  }
};

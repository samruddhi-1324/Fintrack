import { fetchApi } from './api';
import { Expense, CreateExpensePayload, ExpenseFilterParams } from '../types/expense';

export interface PaginatedExpensesResponse {
  items: Expense[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export const expenseApi = {
  getExpenses: (params: ExpenseFilterParams = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category_id) query.append('category_id', params.category_id);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    if (params.min_amount !== undefined) query.append('min_amount', params.min_amount.toString());
    if (params.max_amount !== undefined) query.append('max_amount', params.max_amount.toString());
    if (params.payment_mode) query.append('payment_mode', params.payment_mode);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.order) query.append('order', params.order);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetchApi<PaginatedExpensesResponse>(`/expenses${queryString}`);
  },
  getExpense: (id: string) => fetchApi<Expense>(`/expenses/${id}`),
  createExpense: (payload: CreateExpensePayload) =>
    fetchApi<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateExpense: (id: string, payload: Partial<CreateExpensePayload>) =>
    fetchApi<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteExpense: (id: string) =>
    fetchApi<{ detail: string }>(`/expenses/${id}`, {
      method: 'DELETE'
    })
};

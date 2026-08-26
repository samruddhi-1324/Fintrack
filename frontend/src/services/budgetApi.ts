import { fetchApi } from './api';
import { Budget, BudgetStatus } from '../types/budget';

export interface SetBudgetPayload {
  category_id?: string | null;
  amount: number;
  period?: 'monthly';
}

export const budgetApi = {
  getBudgets: () => fetchApi<Budget[]>('/budgets'),
  getBudgetStatus: (category_id?: string) => {
    const query = category_id ? `?category_id=${category_id}` : '';
    return fetchApi<BudgetStatus>(`/budgets/status${query}`);
  },
  setBudget: (payload: SetBudgetPayload) =>
    fetchApi<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  deleteBudget: (id: string) =>
    fetchApi<{ detail: string }>(`/budgets/${id}`, {
      method: 'DELETE'
    })
};

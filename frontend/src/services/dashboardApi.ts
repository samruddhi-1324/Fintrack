import { fetchApi } from './api';
import { Expense } from '../types/expense';
import { BudgetStatus, DailyLimitStatus } from '../types/budget';

export interface CategorySpendSummary {
  category_id: string;
  category_name: string;
  amount: number;
  percentage: number;
}

export interface PaymentModeSpendSummary {
  payment_mode: string;
  total_amount: number;
  transaction_count: number;
  percentage: number;
}

export interface SpendingTrendPoint {
  date: string;
  amount: number;
}

export interface DashboardSummaryResponse {
  total_spent_overall: number;
  total_spent_current_month: number;
  budget_status: BudgetStatus;
  daily_limit_status: DailyLimitStatus;
  recent_expenses: Expense[];
  category_breakdown: CategorySpendSummary[];
  payment_mode_breakdown: PaymentModeSpendSummary[];
  spending_trend: SpendingTrendPoint[];
}

export const dashboardApi = {
  getSummary: () => fetchApi<DashboardSummaryResponse>('/dashboard/summary'),
  getCategoryBreakdown: () => fetchApi<CategorySpendSummary[]>('/dashboard/by-category'),
  getPaymentModeBreakdown: () => fetchApi<PaymentModeSpendSummary[]>('/dashboard/by-payment-mode'),
  getSpendingTrend: (days: number = 30) => fetchApi<SpendingTrendPoint[]>(`/dashboard/trend?days=${days}`),
  getMoMComparison: () => fetchApi<{
    current_month_spent: number;
    previous_month_spent: number;
    difference: number;
    percentage_change: number;
  }>('/dashboard/comparison')
};

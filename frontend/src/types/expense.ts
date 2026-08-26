export type PaymentMode = 'cash' | 'card' | 'upi';

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  category_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  payment_mode?: PaymentMode;
  created_at: string;
  updated_at: string;
}

export interface CreateExpensePayload {
  title: string;
  category_id: string;
  amount: number;
  date: string;
  notes?: string;
  payment_mode?: PaymentMode;
}

export interface ExpenseFilterParams {
  search?: string;
  category_id?: string;
  start_date?: string;
  end_date?: string;
  min_amount?: number;
  max_amount?: number;
  payment_mode?: PaymentMode;
  sort_by?: 'date' | 'amount' | 'category';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

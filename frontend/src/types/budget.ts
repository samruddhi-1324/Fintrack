export interface Budget {
  id: string;
  user_id: string;
  category_id?: string | null; // null = overall monthly budget
  amount: number;
  period: 'monthly';
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  total_budget: number;
  total_spent: number;
  remaining: number;
  percentage_used: number;
  status: 'on_track' | 'near_limit' | 'over_budget';
}

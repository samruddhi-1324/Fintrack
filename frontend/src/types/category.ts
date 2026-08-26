export interface Category {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  expense_count?: number;
  created_at: string;
}

export interface CreateCategoryPayload {
  name: string;
}

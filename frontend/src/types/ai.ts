export interface CategorizeResponse {
  category: string;
  confidence: number;
  is_new_suggested: boolean;
}

export interface NaturalLanguageExpenseResponse {
  title: string;
  amount: number;
  payment_mode: 'cash' | 'card' | 'upi';
  category?: string;
  category_id?: string;
}

export interface AIInsightItem {
  type: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  category?: string | null;
}

export interface BudgetRecommendationItem {
  category: string;
  current_spent: number;
  current_budget: number;
  recommended_budget: number;
  reason: string;
}

export interface SpendingSummaryInfo {
  total_current_month: number;
  total_previous_month: number;
  total_budget: number;
  month_over_month_change_pct: number;
}

export interface FinancialSentiment {
  mood: 'distressed' | 'over_limit' | 'cautious' | 'thriving' | 'zen';
  emoji: string;
  headline: string;
  description: string;
  burn_rate_emoji: string;
}

export interface AIInsightsResponse {
  provider: string;
  model?: string;
  sentiment?: FinancialSentiment;
  summary: SpendingSummaryInfo;
  insights: AIInsightItem[];
  budget_recommendations: BudgetRecommendationItem[];
}

export interface CategoryForecastItem {
  category: string;
  current_spent: number;
  projected_month_end: number;
  daily_burn_rate: number;
  current_budget: number;
  status: 'on_track' | 'near_limit' | 'over_budget';
  emoji: string;
}

export interface ExpenseForecastResponse {
  provider: string;
  days_elapsed: number;
  days_remaining: number;
  total_days_in_month: number;
  current_spend: number;
  daily_burn_rate: number;
  projected_month_end_spend: number;
  total_monthly_budget: number;
  projected_variance: number;
  recommended_safe_daily_spend: number;
  predicted_budget_exhaustion_day?: number | null;
  forecast_status: 'safe' | 'caution' | 'critical';
  forecast_emoji: string;
  forecast_headline: string;
  forecast_advice: string;
  category_forecasts: CategoryForecastItem[];
}

export interface FinancialHealthPillar {
  name: string;
  score: number;
  max_score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  emoji: string;
  feedback: string;
}

export interface FinancialHealthScoreResponse {
  provider: string;
  score: number;
  grade: string;
  tier: string;
  tier_emoji: string;
  summary_verdict: string;
  pillars: FinancialHealthPillar[];
  actionable_tips: string[];
}






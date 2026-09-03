from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CategorizeRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Expense title or merchant description to categorize")

class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    is_new_suggested: bool

class NaturalLanguageExpenseRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=250, description="Conversational expense sentence e.g. 'Coffee 150 with upi'")

class NaturalLanguageExpenseResponse(BaseModel):
    title: str
    amount: float
    payment_mode: str
    category: Optional[str] = None
    category_id: Optional[str] = None

class AIInsightItem(BaseModel):
    type: str
    severity: str  # "info", "warning", "danger", "success"
    title: str
    message: str
    category: Optional[str] = None

class BudgetRecommendationItem(BaseModel):
    category: str
    current_spent: float
    current_budget: float
    recommended_budget: float
    reason: str

class SpendingSummaryInfo(BaseModel):
    total_current_month: float
    total_previous_month: float
    total_budget: float
    month_over_month_change_pct: float

class FinancialSentiment(BaseModel):
    mood: str  # "distressed" | "cautious" | "balanced" | "thriving" | "zen"
    emoji: str  # "😱🚨💸" | "😬⚠️" | "🧘✨" | "🥳💰"
    headline: str
    description: str
    burn_rate_emoji: str  # "🔥 Heavy Burn" | "⚡ High" | "⚠️ Moderate" | "🌱 Safe" | "💧 Untouched"

class AIInsightsResponse(BaseModel):
    provider: str
    model: Optional[str] = None
    sentiment: FinancialSentiment
    summary: SpendingSummaryInfo
    insights: List[AIInsightItem]
    budget_recommendations: List[BudgetRecommendationItem]

class CategoryForecastItem(BaseModel):
    category: str
    current_spent: float
    projected_month_end: float
    daily_burn_rate: float
    current_budget: float
    status: str  # "on_track" | "near_limit" | "over_budget"
    emoji: str

class ExpenseForecastResponse(BaseModel):
    provider: str
    days_elapsed: int
    days_remaining: int
    total_days_in_month: int
    current_spend: float
    daily_burn_rate: float
    projected_month_end_spend: float
    total_monthly_budget: float
    projected_variance: float  # total_monthly_budget - projected_month_end_spend
    recommended_safe_daily_spend: float
    predicted_budget_exhaustion_day: Optional[int] = None
    forecast_status: str  # "safe" | "caution" | "critical"
    forecast_emoji: str   # "🔮" | "⚠️" | "🚨"
    forecast_headline: str
    forecast_advice: str
    category_forecasts: List[CategoryForecastItem]

class FinancialHealthPillar(BaseModel):
    name: str
    score: int
    max_score: int
    status: str  # "excellent" | "good" | "fair" | "poor"
    emoji: str
    feedback: str

class FinancialHealthScoreResponse(BaseModel):
    provider: str
    score: int  # 0 - 100
    grade: str  # "A+" | "A" | "B" | "C" | "D"
    tier: str   # "Financial Master" | "Disciplined Spender" | "Moderate Health" | "At Risk"
    tier_emoji: str  # "🏆" | "🌱" | "⚠️" | "🚨"
    summary_verdict: str
    pillars: List[FinancialHealthPillar]
    actionable_tips: List[str]

class ReceiptLineItem(BaseModel):
    name: str
    price: float

class ReceiptScanResponse(BaseModel):
    provider: str
    merchant: str
    amount: float
    date: Optional[str] = None  # YYYY-MM-DD
    payment_mode: str  # "cash" | "card" | "upi"
    category: str
    category_id: Optional[str] = None
    confidence: float  # 0.0 - 1.0
    line_items: List[ReceiptLineItem] = []
    raw_text: Optional[str] = None





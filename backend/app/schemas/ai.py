from pydantic import BaseModel, Field, model_validator
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

class ChatMessage(BaseModel):
    role: str = "user"  # "user" | "assistant"
    content: str

class AICopilotRequest(BaseModel):
    question: Optional[str] = Field(default=None, description="User question or query for the AI Financial Copilot")
    message: Optional[str] = Field(default=None, description="Alternative field for user question")
    chat_history: List[ChatMessage] = Field(default=[], description="Previous conversation turn history")

    @model_validator(mode="after")
    def populate_question(self):
        if not self.question and self.message:
            self.question = self.message
        if not self.question:
            self.question = "Help me understand my financial overview"
        return self

class AICopilotResponse(BaseModel):
    provider: str = "rule_based"
    answer: str
    reply: Optional[str] = None
    suggested_followups: List[str] = []
    suggested_actions: List[str] = []

    @model_validator(mode="after")
    def sync_aliases(self):
        if not self.reply:
            self.reply = self.answer
        if not self.suggested_actions and self.suggested_followups:
            self.suggested_actions = self.suggested_followups
        return self

class AnomalyItem(BaseModel):
    id: str
    type: str  # "subscription_hike" | "duplicate_charge" | "category_spike"
    severity: str  # "warning" | "danger" | "info"
    badge_emoji: str  # "📈" | "👯" | "🚨"
    title: str
    message: str
    merchant: str
    category_name: str
    current_amount: float
    previous_amount: Optional[float] = None
    change_pct: Optional[float] = None
    expense_id: Optional[str] = None
    date: str

class AnomaliesResponse(BaseModel):
    provider: str
    total_anomalies_found: int
    duplicate_count: int
    subscription_hikes_count: int
    category_spikes_count: int
    anomalies: List[AnomalyItem]
    summary_headline: str

class GroupBillParticipantShare(BaseModel):
    name: str
    share_amount: float
    share_percentage: float
    is_payer: bool = False

class DebtSettlementItem(BaseModel):
    from_name: str
    to_name: str
    amount: float
    message: str

class GroupBillSplitRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=150, description="Title of bill e.g. Dinner at Olive Bistro")
    total_amount: float = Field(..., gt=0, description="Total bill amount")
    payer_name: str = Field(default="You", description="Name of person who paid the bill upfront")
    participants: List[str] = Field(..., min_length=2, description="List of all group member names including payer")

    split_mode: str = Field(default="equal", description="Split mode: 'equal', 'percentage', or 'custom'")
    custom_shares: Dict[str, float] = Field(default={}, description="Custom amounts or percentages per participant name")
    category_name: Optional[str] = Field(default=None, description="Optional category name suggestion")

class GroupBillSplitResponse(BaseModel):
    provider: str
    title: str
    total_amount: float
    payer_name: str
    split_mode: str
    per_person_equal_share: float
    participants: List[GroupBillParticipantShare]
    settlement_transfers: List[DebtSettlementItem]
    whatsapp_summary: str
    user_personal_share: float
    category_id: Optional[str] = None
    category_name: str = "Group & Social"

class CategoryCutbackRecommendation(BaseModel):
    category_name: str
    current_monthly_spend: float
    suggested_cutback_pct: float
    monthly_savings_unlocked: float
    reason: str

class GoalSimulationRequest(BaseModel):
    goal_name: str = Field(..., min_length=1, max_length=150, description="Financial goal name e.g. Buy MacBook Pro")
    target_amount: float = Field(..., gt=0, description="Total target amount in Rupees")
    target_months: int = Field(default=6, ge=1, le=120, description="Timeline target in months")
    proposed_monthly_savings: Optional[float] = Field(default=None, description="Optional custom monthly savings contribution")
    custom_category_cuts: Dict[str, float] = Field(default={}, description="Optional category cut percentage overrides")

class GoalSimulationResponse(BaseModel):
    provider: str
    goal_name: str
    target_amount: float
    target_months: int
    required_monthly_savings: float
    current_monthly_savings_pace: float
    monthly_gap: float
    feasibility_score: int
    feasibility_grade: str
    feasibility_emoji: str
    projected_achievement_date: str
    current_pace_months_needed: int
    category_cutbacks: List[CategoryCutbackRecommendation]
    tactical_advice: List[str]
    summary_narrative: str

class SavingsChallengeItem(BaseModel):
    id: str
    title: str
    description: str
    category_name: str
    target_savings: float
    duration_days: int
    difficulty: str  # "Easy 🌱" | "Medium ⚡" | "Hard 🏆"
    reward_points: int
    badge_icon: str
    status: str  # "available" | "active" | "completed"
    progress_percentage: float = 0.0
    current_spent: float = 0.0
    allowed_max_spend: float = 0.0

class SavingsChallengesResponse(BaseModel):
    provider: str
    total_points: int
    current_streak_days: int
    level_title: str
    level_badge: str
    total_savings_unlocked: float
    active_challenges_count: int
    challenges: List[SavingsChallengeItem]
    summary_headline: str

class ClaimChallengeRequest(BaseModel):
    challenge_id: str = Field(..., min_length=1, description="ID of challenge to claim/complete")

class TaxDeductionItem(BaseModel):
    section_code: str  # e.g. "80C", "80D", "HRA Section 10(13A)", "Section 24b", "80G"
    section_name: str
    claimed_amount: float
    max_limit: float
    eligible_amount: float
    percentage_utilized: float
    status_badge: str

class GSTBreakdownItem(BaseModel):
    total_business_expenses: float
    estimated_gst_paid: float
    eligible_itc_claimable: float
    blocked_credit_17_5: float
    gst_eligible_expenses_count: int

class TaxRegimeComparison(BaseModel):
    estimated_annual_income: float
    old_regime_tax: float
    new_regime_tax: float
    recommended_regime: str  # "Old Tax Regime 📜" | "New Tax Regime ⚡"
    potential_tax_savings: float
    recommendation_reason: str

class TaxDeductibleExpense(BaseModel):
    id: str
    title: str
    amount: float
    date: str
    category_name: str
    tax_section: str
    gst_eligible: bool = False
    estimated_gst_amount: float = 0.0

class TaxAssistantResponse(BaseModel):
    provider: str
    financial_year: str
    total_tax_deductions: float
    regime_comparison: TaxRegimeComparison
    section_breakdown: List[TaxDeductionItem]
    gst_summary: GSTBreakdownItem
    deductible_transactions: List[TaxDeductibleExpense]
    summary_headline: str










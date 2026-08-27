from decimal import Decimal
from typing import List
from pydantic import BaseModel
from app.schemas.expense import ExpenseResponse
from app.schemas.budget import BudgetStatusResponse, DailyLimitStatusResponse

class CategorySpendSummary(BaseModel):
    category_id: str
    category_name: str
    amount: Decimal
    percentage: float

class PaymentModeSpendSummary(BaseModel):
    payment_mode: str
    total_amount: Decimal
    transaction_count: int
    percentage: float

class SpendingTrendPoint(BaseModel):
    date: str
    amount: Decimal

class DashboardSummaryResponse(BaseModel):
    total_spent_overall: Decimal
    total_spent_current_month: Decimal
    budget_status: BudgetStatusResponse
    daily_limit_status: DailyLimitStatusResponse
    recent_expenses: List[ExpenseResponse]
    category_breakdown: List[CategorySpendSummary]
    payment_mode_breakdown: List[PaymentModeSpendSummary]
    spending_trend: List[SpendingTrendPoint]

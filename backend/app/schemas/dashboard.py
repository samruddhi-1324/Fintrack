from decimal import Decimal
from typing import List
from pydantic import BaseModel
from app.schemas.expense import ExpenseResponse
from app.schemas.budget import BudgetStatusResponse

class CategorySpendSummary(BaseModel):
    category_id: str
    category_name: str
    amount: Decimal
    percentage: float

class SpendingTrendPoint(BaseModel):
    date: str
    amount: Decimal

class DashboardSummaryResponse(BaseModel):
    total_spent_overall: Decimal
    total_spent_current_month: Decimal
    budget_status: BudgetStatusResponse
    recent_expenses: List[ExpenseResponse]
    category_breakdown: List[CategorySpendSummary]
    spending_trend: List[SpendingTrendPoint]

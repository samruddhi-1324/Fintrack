import uuid
from datetime import date
from decimal import Decimal
from typing import List
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.expense_repository import ExpenseRepository
from app.services.budget_service import BudgetService
from app.models.expense import Expense
from app.models.category import Category
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    CategorySpendSummary,
    SpendingTrendPoint
)
from app.schemas.expense import ExpenseResponse
from app.core.config import settings

class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.expense_repo = ExpenseRepository(db)
        self.budget_service = BudgetService(db)

    async def get_summary(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> DashboardSummaryResponse:
        today = date.today()
        current_year = today.year
        current_month = today.month

        # 1. Total spent overall
        stmt_overall = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(Expense.user_id == user_id)
        total_overall = (await self.db.execute(stmt_overall)).scalar() or Decimal("0.00")

        # 2. Total spent current month
        stmt_month = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            extract("year", Expense.date) == current_year,
            extract("month", Expense.date) == current_month
        )
        total_month = (await self.db.execute(stmt_month)).scalar() or Decimal("0.00")

        # 3. Budget status
        budget_status = await self.budget_service.get_budget_status(user_id=user_id)

        # 4. Recent expenses snapshot (last 5)
        recent_expenses_raw, _ = await self.expense_repo.list_filtered(user_id=user_id, limit=5, page=1)
        recent_expenses = [ExpenseResponse(**e) for e in recent_expenses_raw]

        # 5. Category breakdown
        category_breakdown = await self.get_category_breakdown(user_id=user_id)

        # 6. Spending trend (last 30 days)
        spending_trend = await self.get_spending_trend(user_id=user_id)

        return DashboardSummaryResponse(
            total_spent_overall=total_overall,
            total_spent_current_month=total_month,
            budget_status=budget_status,
            recent_expenses=recent_expenses,
            category_breakdown=category_breakdown,
            spending_trend=spending_trend
        )

    async def get_category_breakdown(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> List[CategorySpendSummary]:
        stmt = (
            select(
                Category.id,
                Category.name,
                func.coalesce(func.sum(Expense.amount), Decimal("0.00")).label("total_amount")
            )
            .join(Expense, Category.id == Expense.category_id)
            .where(Expense.user_id == user_id)
            .group_by(Category.id, Category.name)
            .order_by(func.sum(Expense.amount).desc())
        )
        result = await self.db.execute(stmt)
        rows = result.all()

        total_all_categories = sum([r[2] for r in rows], Decimal("0.00"))
        breakdown = []
        for cat_id, cat_name, amt in rows:
            pct = float((amt / total_all_categories * 100) if total_all_categories > 0 else 0)
            breakdown.append(CategorySpendSummary(
                category_id=str(cat_id),
                category_name=cat_name,
                amount=amt,
                percentage=round(pct, 2)
            ))
        return breakdown

    async def get_spending_trend(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID, days: int = 30) -> List[SpendingTrendPoint]:
        stmt = (
            select(
                Expense.date,
                func.sum(Expense.amount).label("daily_total")
            )
            .where(Expense.user_id == user_id)
            .group_by(Expense.date)
            .order_by(Expense.date.asc())
            .limit(days)
        )
        result = await self.db.execute(stmt)
        return [
            SpendingTrendPoint(date=str(r[0]), amount=r[1])
            for r in result.all()
        ]

    async def get_mom_comparison(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> dict:
        today = date.today()
        # Current month
        stmt_curr = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            extract("year", Expense.date) == today.year,
            extract("month", Expense.date) == today.month
        )
        curr_spent = (await self.db.execute(stmt_curr)).scalar() or Decimal("0.00")

        # Previous month
        prev_month = today.month - 1 if today.month > 1 else 12
        prev_year = today.year if today.month > 1 else today.year - 1
        stmt_prev = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            extract("year", Expense.date) == prev_year,
            extract("month", Expense.date) == prev_month
        )
        prev_spent = (await self.db.execute(stmt_prev)).scalar() or Decimal("0.00")

        diff = curr_spent - prev_spent
        pct_change = float(((diff / prev_spent) * 100) if prev_spent > 0 else 0)

        return {
            "current_month_spent": curr_spent,
            "previous_month_spent": prev_spent,
            "difference": diff,
            "percentage_change": round(pct_change, 2)
        }

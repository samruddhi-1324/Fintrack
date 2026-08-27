import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import select, func, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.budget_repository import BudgetRepository
from app.repositories.category_repository import CategoryRepository
from app.models.expense import Expense
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse, BudgetStatusResponse, DailyLimitStatusResponse
from app.core.config import settings

class BudgetService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BudgetRepository(db)
        self.category_repo = CategoryRepository(db)

    async def create_or_update_budget(self, obj_in: BudgetCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> BudgetResponse:
        category = None
        if obj_in.category_id:
            category = await self.category_repo.get_by_id(obj_in.category_id, user_id=user_id)
            if not category:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced category does not exist")

        budget = await self.repo.upsert(obj_in, user_id=user_id)
        if obj_in.category_id and category:
            cat_name = category.name
        elif obj_in.period == "daily":
            cat_name = "Daily Spending Limit"
        else:
            cat_name = "Overall Monthly Budget"

        return BudgetResponse(
            id=budget.id,
            user_id=budget.user_id,
            category_id=budget.category_id,
            category_name=cat_name,
            amount=budget.amount,
            period=budget.period,
            created_at=budget.created_at,
            updated_at=budget.updated_at
        )

    async def list_budgets(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> List[BudgetResponse]:
        budgets_data = await self.repo.list_all(user_id=user_id)
        return [BudgetResponse(**b) for b in budgets_data]

    async def get_budget_status(
        self,
        category_id: Optional[uuid.UUID] = None,
        target_date: Optional[date] = None,
        user_id: uuid.UUID = settings.DEFAULT_USER_ID
    ) -> BudgetStatusResponse:
        ref_date = target_date or date.today()
        current_year = ref_date.year
        current_month = ref_date.month

        # Fetch budget rule
        budget = await self.repo.get_by_category_id(category_id, period="monthly", user_id=user_id)
        total_budget = budget.amount if budget else Decimal("0.00")

        # Sum spent for current month
        conditions = [
            Expense.user_id == user_id,
            extract("year", Expense.date) == current_year,
            extract("month", Expense.date) == current_month
        ]
        if category_id:
            conditions.append(Expense.category_id == category_id)

        stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(*conditions)
        total_spent = (await self.db.execute(stmt)).scalar() or Decimal("0.00")

        remaining = total_budget - total_spent
        percentage_used = float((total_spent / total_budget * 100) if total_budget > 0 else 0)

        # Status calculation
        if percentage_used >= 100:
            status_indicator = "over_budget"
        elif percentage_used >= 80:
            status_indicator = "near_limit"
        else:
            status_indicator = "on_track"

        return BudgetStatusResponse(
            total_budget=total_budget,
            total_spent=total_spent,
            remaining=remaining,
            percentage_used=round(percentage_used, 2),
            status=status_indicator
        )

    async def get_daily_limit_status(
        self,
        target_date: Optional[date] = None,
        user_id: uuid.UUID = settings.DEFAULT_USER_ID
    ) -> DailyLimitStatusResponse:
        ref_date = target_date or date.today()

        # Fetch daily limit budget entry (period == 'daily', category_id is None)
        budget = await self.repo.get_daily_budget(user_id=user_id)
        daily_limit = budget.amount if budget else Decimal("0.00")

        # Sum spent today
        stmt = select(func.coalesce(func.sum(Expense.amount), Decimal("0.00"))).where(
            Expense.user_id == user_id,
            Expense.date == ref_date
        )
        today_spent = (await self.db.execute(stmt)).scalar() or Decimal("0.00")

        remaining = daily_limit - today_spent
        percentage_used = float((today_spent / daily_limit * 100) if daily_limit > 0 else 0)

        if percentage_used >= 100 and daily_limit > 0:
            status_indicator = "over_budget"
        elif percentage_used >= 80 and daily_limit > 0:
            status_indicator = "near_limit"
        else:
            status_indicator = "on_track"

        return DailyLimitStatusResponse(
            daily_limit=daily_limit,
            today_spent=today_spent,
            remaining=remaining,
            percentage_used=round(percentage_used, 2),
            status=status_indicator
        )

    async def delete_budget(self, budget_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> dict:
        deleted = await self.repo.delete(budget_id, user_id=user_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found")
        return {"detail": "Budget deleted successfully"}

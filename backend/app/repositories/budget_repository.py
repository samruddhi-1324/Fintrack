import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.budget import Budget
from app.models.category import Category
from app.schemas.budget import BudgetCreate, BudgetUpdate
from app.core.config import settings

class BudgetRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, budget_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[Budget]:
        stmt = select(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_category_id(
        self,
        category_id: Optional[uuid.UUID],
        period: str = "monthly",
        user_id: uuid.UUID = settings.DEFAULT_USER_ID
    ) -> Optional[Budget]:
        if category_id is None:
            stmt = select(Budget).where(Budget.user_id == user_id, Budget.category_id.is_(None), Budget.period == period)
        else:
            stmt = select(Budget).where(Budget.user_id == user_id, Budget.category_id == category_id, Budget.period == period)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_daily_budget(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[Budget]:
        stmt = select(Budget).where(Budget.user_id == user_id, Budget.period == "daily", Budget.category_id.is_(None))
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> List[dict]:
        stmt = (
            select(Budget, Category.name.label("category_name"))
            .outerjoin(Category, Budget.category_id == Category.id)
            .where(Budget.user_id == user_id)
            .order_by(Budget.category_id.isnot(None), Category.name.asc())
        )
        result = await self.db.execute(stmt)
        budgets_list = []
        for row in result.all():
            budget, cat_name = row
            cat_label = cat_name if budget.category_id else ("Daily Spending Limit" if budget.period == "daily" else "Overall Monthly Budget")
            budgets_list.append({
                "id": budget.id,
                "user_id": budget.user_id,
                "category_id": budget.category_id,
                "category_name": cat_label,
                "amount": budget.amount,
                "period": budget.period,
                "created_at": budget.created_at,
                "updated_at": budget.updated_at
            })
        return budgets_list

    async def upsert(self, obj_in: BudgetCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Budget:
        existing = await self.get_by_category_id(obj_in.category_id, period=obj_in.period, user_id=user_id)
        if existing:
            existing.amount = obj_in.amount
            existing.period = obj_in.period
            self.db.add(existing)
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        budget = Budget(
            id=uuid.uuid4(),
            user_id=user_id,
            category_id=obj_in.category_id,
            amount=obj_in.amount,
            period=obj_in.period
        )
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        return budget

    async def update(self, budget: Budget, obj_in: BudgetUpdate) -> Budget:
        budget.amount = obj_in.amount
        self.db.add(budget)
        await self.db.commit()
        await self.db.refresh(budget)
        return budget

    async def delete(self, budget_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> bool:
        stmt = delete(Budget).where(Budget.id == budget_id, Budget.user_id == user_id)
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

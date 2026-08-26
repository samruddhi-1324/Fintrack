import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, Tuple
from sqlalchemy import select, func, and_, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.expense import Expense
from app.models.category import Category
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
from app.core.config import settings

class ExpenseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, expense_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[dict]:
        stmt = (
            select(Expense, Category.name.label("category_name"))
            .join(Category, Expense.category_id == Category.id)
            .where(Expense.id == expense_id, Expense.user_id == user_id)
        )
        result = await self.db.execute(stmt)
        row = result.first()
        if not row:
            return None
        expense, cat_name = row
        return {
            "id": expense.id,
            "user_id": expense.user_id,
            "title": expense.title,
            "category_id": expense.category_id,
            "category_name": cat_name,
            "amount": expense.amount,
            "date": expense.date,
            "notes": expense.notes,
            "payment_mode": expense.payment_mode,
            "created_at": expense.created_at,
            "updated_at": expense.updated_at
        }

    async def list_filtered(
        self,
        user_id: uuid.UUID = settings.DEFAULT_USER_ID,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        payment_mode: Optional[str] = None,
        sort_by: str = "date",
        order: str = "desc",
        page: int = 1,
        limit: int = 20
    ) -> Tuple[List[dict], int]:
        conditions = [Expense.user_id == user_id]

        if search:
            search_pattern = f"%{search.strip()}%"
            conditions.append(
                (Expense.title.ilike(search_pattern)) | (Expense.notes.ilike(search_pattern))
            )

        if category_id:
            conditions.append(Expense.category_id == category_id)

        if start_date:
            conditions.append(Expense.date >= start_date)

        if end_date:
            conditions.append(Expense.date <= end_date)

        if min_amount is not None:
            conditions.append(Expense.amount >= min_amount)

        if max_amount is not None:
            conditions.append(Expense.amount <= max_amount)

        if payment_mode:
            conditions.append(Expense.payment_mode == payment_mode)

        # Count query
        count_stmt = select(func.count(Expense.id)).where(and_(*conditions))
        total_count = (await self.db.execute(count_stmt)).scalar() or 0

        # Sort field selection
        if sort_by == "amount":
            sort_field = Expense.amount
        elif sort_by == "category":
            sort_field = Category.name
        else:
            sort_field = Expense.date

        order_clause = sort_field.asc() if order.lower() == "asc" else sort_field.desc()

        # Data query
        offset = (page - 1) * limit
        stmt = (
            select(Expense, Category.name.label("category_name"))
            .join(Category, Expense.category_id == Category.id)
            .where(and_(*conditions))
            .order_by(order_clause, Expense.created_at.desc())
            .offset(offset)
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        expenses_list = []
        for row in result.all():
            expense, cat_name = row
            expenses_list.append({
                "id": expense.id,
                "user_id": expense.user_id,
                "title": expense.title,
                "category_id": expense.category_id,
                "category_name": cat_name,
                "amount": expense.amount,
                "date": expense.date,
                "notes": expense.notes,
                "payment_mode": expense.payment_mode,
                "created_at": expense.created_at,
                "updated_at": expense.updated_at
            })

        return expenses_list, total_count

    async def create(self, obj_in: ExpenseCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Expense:
        expense = Expense(
            id=uuid.uuid4(),
            user_id=user_id,
            title=obj_in.title,
            category_id=obj_in.category_id,
            amount=obj_in.amount,
            date=obj_in.date,
            notes=obj_in.notes,
            payment_mode=obj_in.payment_mode
        )
        self.db.add(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def update(self, expense_id: uuid.UUID, obj_in: ExpenseUpdate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[Expense]:
        stmt = select(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
        result = await self.db.execute(stmt)
        expense = result.scalar_one_or_none()
        if not expense:
            return None

        update_data = obj_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(expense, key, value)

        self.db.add(expense)
        await self.db.commit()
        await self.db.refresh(expense)
        return expense

    async def delete(self, expense_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> bool:
        stmt = delete(Expense).where(Expense.id == expense_id, Expense.user_id == user_id)
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

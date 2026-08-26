import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.expense_repository import ExpenseRepository
from app.repositories.category_repository import CategoryRepository
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.core.config import settings

class ExpenseService:
    def __init__(self, db: AsyncSession):
        self.expense_repo = ExpenseRepository(db)
        self.category_repo = CategoryRepository(db)

    async def create_expense(self, obj_in: ExpenseCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> ExpenseResponse:
        # Verify category exists
        category = await self.category_repo.get_by_id(obj_in.category_id, user_id=user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced category does not exist")

        expense = await self.expense_repo.create(obj_in, user_id=user_id)
        return ExpenseResponse(
            id=expense.id,
            user_id=expense.user_id,
            title=expense.title,
            category_id=expense.category_id,
            category_name=category.name,
            amount=expense.amount,
            date=expense.date,
            notes=expense.notes,
            payment_mode=expense.payment_mode,
            created_at=expense.created_at,
            updated_at=expense.updated_at
        )

    async def get_expense_by_id(self, expense_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> ExpenseResponse:
        expense_dict = await self.expense_repo.get_by_id(expense_id, user_id=user_id)
        if not expense_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        return ExpenseResponse(**expense_dict)

    async def list_expenses(
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
    ) -> Tuple[List[ExpenseResponse], int]:
        expenses_list, total_count = await self.expense_repo.list_filtered(
            user_id=user_id,
            search=search,
            category_id=category_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            payment_mode=payment_mode,
            sort_by=sort_by,
            order=order,
            page=page,
            limit=limit
        )
        return [ExpenseResponse(**e) for e in expenses_list], total_count

    async def update_expense(self, expense_id: uuid.UUID, obj_in: ExpenseUpdate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> ExpenseResponse:
        if obj_in.category_id:
            category = await self.category_repo.get_by_id(obj_in.category_id, user_id=user_id)
            if not category:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Referenced category does not exist")

        updated = await self.expense_repo.update(expense_id, obj_in, user_id=user_id)
        if not updated:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")

        expense_dict = await self.expense_repo.get_by_id(expense_id, user_id=user_id)
        return ExpenseResponse(**expense_dict)

    async def delete_expense(self, expense_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> dict:
        deleted = await self.expense_repo.delete(expense_id, user_id=user_id)
        if not deleted:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense not found")
        return {"detail": "Expense deleted successfully"}

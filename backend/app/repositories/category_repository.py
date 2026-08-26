import uuid
from typing import List, Optional
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.category import Category
from app.models.expense import Expense
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.core.config import settings

class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, category_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[Category]:
        stmt = select(Category).where(Category.id == category_id, Category.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_name(self, name: str, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Optional[Category]:
        stmt = select(Category).where(
            Category.user_id == user_id,
            func.lower(Category.name) == name.strip().lower()
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all_with_counts(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> List[dict]:
        stmt = (
            select(
                Category,
                func.count(Expense.id).label("expense_count")
            )
            .outerjoin(Expense, Category.id == Expense.category_id)
            .where(Category.user_id == user_id)
            .group_by(Category.id)
            .order_by(Category.is_default.desc(), Category.name.asc())
        )
        result = await self.db.execute(stmt)
        categories_with_counts = []
        for row in result.all():
            cat, count = row
            cat_dict = {
                "id": cat.id,
                "user_id": cat.user_id,
                "name": cat.name,
                "is_default": cat.is_default,
                "expense_count": count,
                "created_at": cat.created_at
            }
            categories_with_counts.append(cat_dict)
        return categories_with_counts

    async def create(self, obj_in: CategoryCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> Category:
        category = Category(
            id=uuid.uuid4(),
            user_id=user_id,
            name=obj_in.name,
            is_default=False
        )
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def update(self, category: Category, obj_in: CategoryUpdate) -> Category:
        category.name = obj_in.name
        self.db.add(category)
        await self.db.commit()
        await self.db.refresh(category)
        return category

    async def delete(self, category_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID, reassign_to_category_id: Optional[uuid.UUID] = None) -> bool:
        if reassign_to_category_id:
            # Reassign linked expenses first
            stmt_reassign = (
                update(Expense)
                .where(Expense.category_id == category_id, Expense.user_id == user_id)
                .values(category_id=reassign_to_category_id)
            )
            await self.db.execute(stmt_reassign)

        stmt_delete = delete(Category).where(Category.id == category_id, Category.user_id == user_id)
        await self.db.execute(stmt_delete)
        await self.db.commit()
        return True

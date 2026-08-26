import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.core.config import settings

class CategoryService:
    def __init__(self, db: AsyncSession):
        self.repo = CategoryRepository(db)

    async def get_all_categories(self, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> List[CategoryResponse]:
        categories_data = await self.repo.list_all_with_counts(user_id=user_id)
        return [CategoryResponse(**cat) for cat in categories_data]

    async def get_category_by_id(self, category_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> CategoryResponse:
        category = await self.repo.get_by_id(category_id, user_id=user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        return CategoryResponse.model_validate(category)

    async def create_category(self, obj_in: CategoryCreate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> CategoryResponse:
        existing = await self.repo.get_by_name(obj_in.name, user_id=user_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Category with name '{obj_in.name}' already exists")
        
        category = await self.repo.create(obj_in, user_id=user_id)
        return CategoryResponse.model_validate(category)

    async def update_category(self, category_id: uuid.UUID, obj_in: CategoryUpdate, user_id: uuid.UUID = settings.DEFAULT_USER_ID) -> CategoryResponse:
        category = await self.repo.get_by_id(category_id, user_id=user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        existing = await self.repo.get_by_name(obj_in.name, user_id=user_id)
        if existing and existing.id != category_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Category with name '{obj_in.name}' already exists")

        updated = await self.repo.update(category, obj_in)
        return CategoryResponse.model_validate(updated)

    async def delete_category(self, category_id: uuid.UUID, user_id: uuid.UUID = settings.DEFAULT_USER_ID, reassign_to_category_id: Optional[uuid.UUID] = None) -> dict:
        category = await self.repo.get_by_id(category_id, user_id=user_id)
        if not category:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        # Check if linked expenses exist
        all_cats = await self.repo.list_all_with_counts(user_id=user_id)
        cat_info = next((c for c in all_cats if c["id"] == category_id), None)
        expense_count = cat_info["expense_count"] if cat_info else 0

        if expense_count > 0 and not reassign_to_category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Category has {expense_count} linked expense(s). Specify 'reassign_to_category_id' parameter to reassign expenses before deletion."
            )

        if reassign_to_category_id:
            reassign_cat = await self.repo.get_by_id(reassign_to_category_id, user_id=user_id)
            if not reassign_cat:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reassignment category not found")

        await self.repo.delete(category_id, user_id=user_id, reassign_to_category_id=reassign_to_category_id)
        return {"detail": "Category deleted successfully"}

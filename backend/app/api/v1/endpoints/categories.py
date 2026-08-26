import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.category_service import CategoryService
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter()

@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    payload: CategoryCreate,
    db: AsyncSession = Depends(get_db)
):
    service = CategoryService(db)
    return await service.create_category(payload)

@router.get("", response_model=List[CategoryResponse])
async def list_categories(
    db: AsyncSession = Depends(get_db)
):
    service = CategoryService(db)
    return await service.get_all_categories()

@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = CategoryService(db)
    return await service.get_category_by_id(category_id)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: uuid.UUID,
    payload: CategoryUpdate,
    db: AsyncSession = Depends(get_db)
):
    service = CategoryService(db)
    return await service.update_category(category_id, payload)

@router.delete("/{category_id}", status_code=status.HTTP_200_OK)
async def delete_category(
    category_id: uuid.UUID,
    reassign_to_category_id: Optional[uuid.UUID] = Query(None, description="Optional category ID to reassign linked expenses"),
    db: AsyncSession = Depends(get_db)
):
    service = CategoryService(db)
    return await service.delete_category(category_id, reassign_to_category_id=reassign_to_category_id)

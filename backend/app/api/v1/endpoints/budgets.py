import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.budget_service import BudgetService
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatusResponse, DailyLimitStatusResponse

router = APIRouter()

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.create_or_update_budget(payload, user_id=current_user.id)

@router.get("", response_model=List[BudgetResponse])
async def list_budgets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.list_budgets(user_id=current_user.id)

@router.get("/status", response_model=BudgetStatusResponse)
async def get_budget_status(
    category_id: Optional[uuid.UUID] = Query(None, description="Category ID or null for overall budget"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.get_budget_status(category_id=category_id, user_id=current_user.id)

@router.get("/daily-status", response_model=DailyLimitStatusResponse)
async def get_daily_limit_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.get_daily_limit_status(user_id=current_user.id)

@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
async def delete_budget(
    budget_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.delete_budget(budget_id, user_id=current_user.id)

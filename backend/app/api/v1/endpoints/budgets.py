import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.budget_service import BudgetService
from app.schemas.budget import BudgetCreate, BudgetResponse, BudgetStatusResponse, DailyLimitStatusResponse

router = APIRouter()

@router.post("", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    payload: BudgetCreate,
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.create_or_update_budget(payload)

@router.get("", response_model=List[BudgetResponse])
async def list_budgets(
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.list_budgets()

@router.get("/status", response_model=BudgetStatusResponse)
async def get_budget_status(
    category_id: Optional[uuid.UUID] = Query(None, description="Category ID or null for overall budget"),
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.get_budget_status(category_id=category_id)

@router.get("/daily-status", response_model=DailyLimitStatusResponse)
async def get_daily_limit_status(
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.get_daily_limit_status()

@router.delete("/{budget_id}", status_code=status.HTTP_200_OK)
async def delete_budget(
    budget_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = BudgetService(db)
    return await service.delete_budget(budget_id)

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    CategorySpendSummary,
    PaymentModeSpendSummary,
    SpendingTrendPoint
)

router = APIRouter()

@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_summary(user_id=current_user.id)

@router.get("/by-category", response_model=List[CategorySpendSummary])
async def get_dashboard_by_category(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_category_breakdown(user_id=current_user.id)

@router.get("/by-payment-mode", response_model=List[PaymentModeSpendSummary])
async def get_dashboard_by_payment_mode(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_payment_mode_breakdown(user_id=current_user.id)

@router.get("/trend", response_model=List[SpendingTrendPoint])
async def get_dashboard_trend(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_spending_trend(days=days, user_id=current_user.id)

@router.get("/comparison")
async def get_dashboard_comparison(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_mom_comparison(user_id=current_user.id)

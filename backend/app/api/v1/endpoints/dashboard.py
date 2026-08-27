from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
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
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_summary()

@router.get("/by-category", response_model=List[CategorySpendSummary])
async def get_dashboard_by_category(
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_category_breakdown()

@router.get("/by-payment-mode", response_model=List[PaymentModeSpendSummary])
async def get_dashboard_by_payment_mode(
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_payment_mode_breakdown()

@router.get("/trend", response_model=List[SpendingTrendPoint])
async def get_dashboard_trend(
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_spending_trend(days=days)

@router.get("/comparison")
async def get_dashboard_comparison(
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    return await service.get_mom_comparison()

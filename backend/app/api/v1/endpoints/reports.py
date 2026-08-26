from typing import Literal
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.dashboard_service import DashboardService

router = APIRouter()

@router.get("")
async def get_reports(
    period: Literal["daily", "weekly", "monthly"] = Query("monthly", description="Report period"),
    db: AsyncSession = Depends(get_db)
):
    service = DashboardService(db)
    summary = await service.get_summary()
    return {
        "period": period,
        "total_spent_overall": summary.total_spent_overall,
        "total_spent_current_month": summary.total_spent_current_month,
        "category_breakdown": summary.category_breakdown,
        "spending_trend": summary.spending_trend
    }

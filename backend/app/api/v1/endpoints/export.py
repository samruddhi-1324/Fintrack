import uuid
from datetime import date
from decimal import Decimal
from typing import Optional, Literal
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.services.export_service import ExportService

router = APIRouter()

@router.get("")
async def export_data(
    format: Literal["csv"] = Query("csv", description="Export file format"),
    search: Optional[str] = Query(None),
    category_id: Optional[uuid.UUID] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    min_amount: Optional[Decimal] = Query(None),
    max_amount: Optional[Decimal] = Query(None),
    payment_mode: Optional[Literal["cash", "card", "upi"]] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    service = ExportService(db)
    csv_data = await service.export_expenses_csv(
        user_id=current_user.id,
        search=search,
        category_id=category_id,
        start_date=start_date,
        end_date=end_date,
        min_amount=min_amount,
        max_amount=max_amount,
        payment_mode=payment_mode
    )
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=fintrack_expenses.csv"}
    )

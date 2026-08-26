import uuid
from datetime import date
from decimal import Decimal
from typing import List, Optional, Literal
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.expense_service import ExpenseService
from app.schemas.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter()

@router.post("", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    payload: ExpenseCreate,
    db: AsyncSession = Depends(get_db)
):
    service = ExpenseService(db)
    return await service.create_expense(payload)

@router.get("")
async def list_expenses(
    search: Optional[str] = Query(None, description="Search in title or notes"),
    category_id: Optional[uuid.UUID] = Query(None, description="Filter by category"),
    start_date: Optional[date] = Query(None, description="Filter start date"),
    end_date: Optional[date] = Query(None, description="Filter end date"),
    min_amount: Optional[Decimal] = Query(None, description="Filter min amount"),
    max_amount: Optional[Decimal] = Query(None, description="Filter max amount"),
    payment_mode: Optional[Literal["cash", "card", "upi"]] = Query(None, description="Filter payment mode"),
    sort_by: Literal["date", "amount", "category"] = Query("date", description="Sort field"),
    order: Literal["asc", "desc"] = Query("desc", description="Sort order"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db)
):
    service = ExpenseService(db)
    items, total = await service.list_expenses(
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
    return {
        "items": items,
        "meta": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if total > 0 else 0
        }
    }

@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = ExpenseService(db)
    return await service.get_expense_by_id(expense_id)

@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: uuid.UUID,
    payload: ExpenseUpdate,
    db: AsyncSession = Depends(get_db)
):
    service = ExpenseService(db)
    return await service.update_expense(expense_id, payload)

@router.delete("/{expense_id}", status_code=status.HTTP_200_OK)
async def delete_expense(
    expense_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    service = ExpenseService(db)
    return await service.delete_expense(expense_id)

import uuid
from datetime import date as date_type, datetime
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator

PaymentModeType = Literal["cash", "card", "upi"]

class ExpenseBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=50, description="Expense title")
    category_id: uuid.UUID
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Monetary spend in INR (₹)")
    date: date_type = Field(..., description="Transaction date (cannot be in the future)")
    notes: Optional[str] = Field(None, max_length=250, description="Optional notes")
    payment_mode: Optional[PaymentModeType] = Field(None, description="Payment mode")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Expense title cannot be empty or whitespace only")
        return trimmed

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: date_type) -> date_type:
        if v > date_type.today():
            raise ValueError("Expense date cannot be in the future")
        return v

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=50)
    category_id: Optional[uuid.UUID] = None
    amount: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    date: Optional[date_type] = None
    notes: Optional[str] = Field(None, max_length=250)
    payment_mode: Optional[PaymentModeType] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            trimmed = v.strip()
            if not trimmed:
                raise ValueError("Expense title cannot be empty or whitespace only")
            return trimmed
        return v

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: Optional[date_type]) -> Optional[date_type]:
        if v is not None and v > date_type.today():
            raise ValueError("Expense date cannot be in the future")
        return v

class ExpenseResponse(ExpenseBase):
    id: uuid.UUID
    user_id: uuid.UUID
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

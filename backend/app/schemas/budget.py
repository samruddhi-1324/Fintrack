import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

class BudgetBase(BaseModel):
    category_id: Optional[uuid.UUID] = Field(None, description="Category ID or null for overall budget")
    amount: Decimal = Field(..., gt=0, decimal_places=2, description="Monthly budget limit in INR (₹)")
    period: Literal["monthly"] = "monthly"

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    amount: Decimal = Field(..., gt=0, decimal_places=2)

class BudgetResponse(BudgetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class BudgetStatusResponse(BaseModel):
    total_budget: Decimal
    total_spent: Decimal
    remaining: Decimal
    percentage_used: float
    status: Literal["on_track", "near_limit", "over_budget"]

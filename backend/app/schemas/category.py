import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict, field_validator

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=30, description="Category name")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Category name cannot be empty or whitespace only")
        return trimmed

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    is_default: bool
    expense_count: Optional[int] = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

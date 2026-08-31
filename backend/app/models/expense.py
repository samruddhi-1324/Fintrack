import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Numeric, Date, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.core.config import settings

class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        default=settings.DEFAULT_USER_ID
    )
    title: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )
    date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True
    )
    notes: Mapped[Optional[str]] = mapped_column(
        String(250),
        nullable=True
    )
    payment_mode: Mapped[Optional[str]] = mapped_column(
        String(20),
        nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="expenses"
    )
    category: Mapped["Category"] = relationship(
        "Category",
        back_populates="expenses"
    )


    __table_args__ = (
        CheckConstraint("amount > 0", name="check_expense_amount_positive"),
        CheckConstraint("payment_mode IN ('cash', 'card', 'upi') OR payment_mode IS NULL", name="check_expense_payment_mode_valid"),
    )

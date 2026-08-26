import io
import csv
import uuid
from typing import Optional
from datetime import date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.expense_repository import ExpenseRepository
from app.core.config import settings

class ExportService:
    def __init__(self, db: AsyncSession):
        self.expense_repo = ExpenseRepository(db)

    async def export_expenses_csv(
        self,
        user_id: uuid.UUID = settings.DEFAULT_USER_ID,
        search: Optional[str] = None,
        category_id: Optional[uuid.UUID] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        min_amount: Optional[Decimal] = None,
        max_amount: Optional[Decimal] = None,
        payment_mode: Optional[str] = None
    ) -> str:
        # Fetch all matching expense records (large limit)
        expenses_list, _ = await self.expense_repo.list_filtered(
            user_id=user_id,
            search=search,
            category_id=category_id,
            start_date=start_date,
            end_date=end_date,
            min_amount=min_amount,
            max_amount=max_amount,
            payment_mode=payment_mode,
            limit=10000,
            page=1
        )

        output = io.StringIO()
        writer = csv.writer(output)

        # Write header
        writer.writerow(["ID", "Date", "Title", "Category", "Amount (INR)", "Payment Mode", "Notes"])

        # Write data rows
        for exp in expenses_list:
            writer.writerow([
                str(exp["id"]),
                str(exp["date"]),
                exp["title"],
                exp["category_name"],
                f"{exp['amount']:.2f}",
                exp["payment_mode"] or "",
                exp["notes"] or ""
            ])

        return output.getvalue()

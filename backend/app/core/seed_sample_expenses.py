import asyncio
import uuid
from datetime import date
from decimal import Decimal
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.category import Category
from app.models.expense import Expense

DEFAULT_USER_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")

async def add_sample_expenses():
    async with AsyncSessionLocal() as session:
        # Fetch categories
        stmt = select(Category).where(Category.user_id == DEFAULT_USER_ID)
        result = await session.execute(stmt)
        categories = result.scalars().all()
        
        cat_map = {c.name: c.id for c in categories}
        print(f"Found Categories: {list(cat_map.keys())}")

        food_id = cat_map.get("Food")
        transport_id = cat_map.get("Transport")
        utilities_id = cat_map.get("Utilities")

        # Check existing count
        count_stmt = select(Expense).where(Expense.user_id == DEFAULT_USER_ID)
        count_res = await session.execute(count_stmt)
        existing = count_res.scalars().all()

        if len(existing) == 0:
            sample_entries = [
                Expense(
                    user_id=DEFAULT_USER_ID,
                    category_id=food_id,
                    title="D-Mart Monthly Groceries",
                    amount=Decimal("4500.50"),
                    date=date.today(),
                    notes="Monthly grocery shopping for family",
                    payment_mode="upi"
                ),
                Expense(
                    user_id=DEFAULT_USER_ID,
                    category_id=transport_id,
                    title="Petrol Fuel Refill",
                    amount=Decimal("1200.00"),
                    date=date.today(),
                    notes="Full tank petrol refill",
                    payment_mode="card"
                ),
                Expense(
                    user_id=DEFAULT_USER_ID,
                    category_id=utilities_id,
                    title="Electricity Bill Payment",
                    amount=Decimal("2350.00"),
                    date=date.today(),
                    notes="Monthly electricity bill payment via UPI",
                    payment_mode="upi"
                )
            ]

            for exp in sample_entries:
                session.add(exp)
            
            await session.commit()
            print(f"SUCCESS: Inserted {len(sample_entries)} sample expenses into PostgreSQL database!")

        # Verify inserted expenses
        exp_stmt = select(Expense).where(Expense.user_id == DEFAULT_USER_ID)
        exp_result = await session.execute(exp_stmt)
        all_expenses = exp_result.scalars().all()

        print("\n--- CURRENT EXPENSES IN DATABASE ---")
        for e in all_expenses:
            print(f"ID: {e.id} | Title: {e.title} | Amount: Rs {e.amount} | Date: {e.date} | Mode: {e.payment_mode}")

if __name__ == "__main__":
    asyncio.run(add_sample_expenses())

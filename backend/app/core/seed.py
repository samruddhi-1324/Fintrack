import asyncio
import logging
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.core.config import settings
from app.models.category import Category

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

STARTER_CATEGORIES = [
    "Food",
    "Transport",
    "Rent",
    "Utilities",
    "Entertainment",
    "Shopping",
    "Health"
]

async def seed_starter_categories():
    """
    Idempotent seed script populating approved starter categories.
    Does NOT seed expenses or budgets.
    """
    async with AsyncSessionLocal() as db:
        logger.info("Checking starter categories...")
        for cat_name in STARTER_CATEGORIES:
            result = await db.execute(
                select(Category).where(
                    Category.user_id == settings.DEFAULT_USER_ID,
                    Category.name == cat_name
                )
            )
            existing = result.scalar_one_or_none()
            if not existing:
                category = Category(
                    user_id=settings.DEFAULT_USER_ID,
                    name=cat_name,
                    is_default=True
                )
                db.add(category)
                logger.info(f"Seeded category: {cat_name}")
            else:
                logger.info(f"Category already exists: {cat_name}")
        
        await db.commit()
        logger.info("Starter categories seed completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_starter_categories())

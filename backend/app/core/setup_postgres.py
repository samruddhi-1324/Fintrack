import asyncio
import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import asyncpg

from app.core.config import settings
from app.core.database import engine
from app.models import Base
from app.core.seed import seed_starter_categories

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def ensure_database_exists():
    """
    Connects to local PostgreSQL server with user postgres and password root
    to ensure database 'fintrack_db' exists.
    """
    try:
        # Connect to default postgres DB first
        conn = await asyncpg.connect(
            user="postgres",
            password="root",
            host="localhost",
            port=5432,
            database="postgres"
        )
        try:
            # Check if fintrack_db database exists
            res = await conn.fetchval("SELECT 1 FROM pg_database WHERE datname = 'fintrack_db'")
            if not res:
                logger.info("Database 'fintrack_db' does not exist. Creating 'fintrack_db'...")
                await conn.execute("CREATE DATABASE fintrack_db")
                logger.info("Database 'fintrack_db' created successfully.")
            else:
                logger.info("Database 'fintrack_db' already exists.")
        finally:
            await conn.close()
    except Exception as e:
        logger.warning(f"Could not check/create database via asyncpg: {e}. Proceeding with table creation assuming database exists.")

async def create_tables_via_orm():
    """
    Uses SQLAlchemy ORM metadata tool (Base.metadata.create_all)
    to create all tables (categories, expenses, budgets) in PostgreSQL database.
    """
    await ensure_database_exists()

    logger.info("Creating tables using SQLAlchemy ORM (Base.metadata.create_all)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Tables created successfully via ORM tool.")

    # Seed starter categories
    await seed_starter_categories()
    logger.info("PostgreSQL database setup & seeding complete.")

if __name__ == "__main__":
    asyncio.run(create_tables_via_orm())

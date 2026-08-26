import asyncio
import logging
from app.core.setup_postgres import create_tables_via_orm

if __name__ == "__main__":
    asyncio.run(create_tables_via_orm())

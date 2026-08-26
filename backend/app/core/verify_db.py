import asyncio
import asyncpg

async def verify():
    conn = await asyncpg.connect('postgresql://postgres:root@localhost:5432/fintrack_db')
    print("CURRENT CONNECTED DATABASE: fintrack_db")
    tables = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    print("TABLES IN fintrack_db:", [t['table_name'] for t in tables])
    cats = await conn.fetch("SELECT name FROM categories")
    print("SEEDED CATEGORIES:", [c['name'] for c in cats])
    await conn.close()

if __name__ == '__main__':
    asyncio.run(verify())

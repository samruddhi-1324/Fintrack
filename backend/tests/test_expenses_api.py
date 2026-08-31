import uuid
import pytest
from httpx import AsyncClient
from datetime import date

@pytest.mark.asyncio
async def test_expense_crud_flow(async_client: AsyncClient):
    email = f"expuser_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Exp User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get starter categories
    cat_resp = await async_client.get("/api/v1/categories", headers=headers)
    categories = cat_resp.json()
    food_cat = next(c for c in categories if c["name"] == "Food & Dining")

    # 2. Create expense
    payload = {
        "title": "Groceries",
        "category_id": food_cat["id"],
        "amount": 450.50,
        "date": str(date.today()),
        "notes": "Weekly groceries",
        "payment_mode": "upi"
    }
    create_resp = await async_client.post("/api/v1/expenses", headers=headers, json=payload)
    assert create_resp.status_code == 201
    expense_data = create_resp.json()
    assert expense_data["title"] == "Groceries"
    assert float(expense_data["amount"]) == 450.50

    expense_id = expense_data["id"]

    # 3. Get expense by ID
    get_resp = await async_client.get(f"/api/v1/expenses/{expense_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == expense_id

    # 4. List expenses with filter
    list_resp = await async_client.get(f"/api/v1/expenses?search=Groceries", headers=headers)
    assert list_resp.status_code == 200
    items = list_resp.json()["items"]
    assert len(items) >= 1

    # 5. Delete expense
    del_resp = await async_client.delete(f"/api/v1/expenses/{expense_id}", headers=headers)
    assert del_resp.status_code == 200

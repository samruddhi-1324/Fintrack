import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_budget_flow(async_client: AsyncClient):
    email = f"budgetuser_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Budget User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Set overall monthly budget
    payload = {
        "category_id": None,
        "amount": 15000.00,
        "period": "monthly"
    }
    budget_resp = await async_client.post("/api/v1/budgets", headers=headers, json=payload)
    assert budget_resp.status_code == 201
    data = budget_resp.json()
    assert float(data["amount"]) == 15000.00

    # Get budget status
    status_resp = await async_client.get("/api/v1/budgets/status", headers=headers)
    assert status_resp.status_code == 200
    status_data = status_resp.json()
    assert float(status_data["total_budget"]) == 15000.00
    assert "status" in status_data

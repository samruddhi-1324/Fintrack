import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_dashboard_endpoints(async_client: AsyncClient):
    email = f"dashuser_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Dash User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    summary_resp = await async_client.get("/api/v1/dashboard/summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert "total_spent_overall" in summary
    assert "budget_status" in summary

    by_cat_resp = await async_client.get("/api/v1/dashboard/by-category", headers=headers)
    assert by_cat_resp.status_code == 200

    trend_resp = await async_client.get("/api/v1/dashboard/trend", headers=headers)
    assert trend_resp.status_code == 200

    mom_resp = await async_client.get("/api/v1/dashboard/comparison", headers=headers)
    assert mom_resp.status_code == 200
    assert "current_month_spent" in mom_resp.json()

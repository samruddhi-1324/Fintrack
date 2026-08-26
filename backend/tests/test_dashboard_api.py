import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_dashboard_endpoints(async_client: AsyncClient):
    summary_resp = await async_client.get("/api/v1/dashboard/summary")
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert "total_spent_overall" in summary
    assert "budget_status" in summary

    by_cat_resp = await async_client.get("/api/v1/dashboard/by-category")
    assert by_cat_resp.status_code == 200

    trend_resp = await async_client.get("/api/v1/dashboard/trend")
    assert trend_resp.status_code == 200

    mom_resp = await async_client.get("/api/v1/dashboard/comparison")
    assert mom_resp.status_code == 200
    assert "current_month_spent" in mom_resp.json()

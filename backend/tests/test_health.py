import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_version_endpoint(async_client: AsyncClient):
    response = await async_client.get("/api/v1/version")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "FinTrack API"
    assert data["version"] == "1.0.0"

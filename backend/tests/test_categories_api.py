import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_categories(async_client: AsyncClient):
    response = await async_client.get("/api/v1/categories")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Check starter categories exist
    cat_names = [c["name"] for c in data]
    assert "Food" in cat_names
    assert "Transport" in cat_names

@pytest.mark.asyncio
async def test_create_category_duplicate_error(async_client: AsyncClient):
    # Food already exists
    response = await async_client.post("/api/v1/categories", json={"name": "Food"})
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

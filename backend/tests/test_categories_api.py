import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_categories(async_client: AsyncClient):
    email = f"catuser_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Cat User"}
    )
    token = reg.json()["access_token"]

    response = await async_client.get(
        "/api/v1/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    cat_names = [c["name"] for c in data]
    assert "Food & Dining" in cat_names
    assert "Transportation" in cat_names

@pytest.mark.asyncio
async def test_create_category_duplicate_error(async_client: AsyncClient):
    email = f"catdupuser_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Cat Dup User"}
    )
    token = reg.json()["access_token"]

    # Food & Dining already exists for this user
    response = await async_client.post(
        "/api/v1/categories",
        headers={"Authorization": f"Bearer {token}"},
        json={"name": "Food & Dining"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

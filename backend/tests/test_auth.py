import uuid
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_password_strength_validation(async_client: AsyncClient):
    # Short password (less than 8 chars) -> 422 Unprocessable Entity via Pydantic
    res_short = await async_client.post(
        "/api/v1/auth/register",
        json={"email": f"weak_{uuid.uuid4().hex[:6]}@example.com", "password": "weak", "full_name": "Weak User"}
    )
    assert res_short.status_code == 422

    # Long password but missing uppercase/special char -> 400 Bad Request via AuthService
    res_no_uppercase = await async_client.post(
        "/api/v1/auth/register",
        json={"email": f"weak2_{uuid.uuid4().hex[:6]}@example.com", "password": "lowercaseonly123", "full_name": "Weak User 2"}
    )
    assert res_no_uppercase.status_code == 400
    assert "uppercase" in res_no_uppercase.json()["detail"].lower()

@pytest.mark.asyncio
async def test_user_registration_and_login_flow(async_client: AsyncClient):
    email = f"testuser_{uuid.uuid4().hex[:6]}@example.com"
    password = "SecurePassword123!"

    # 1. Register User 1
    reg_response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Test User 1"}
    )
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert "access_token" in data
    assert data["user"]["email"] == email
    token1 = data["access_token"]

    # 2. Duplicate registration attempt
    dup_response = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "full_name": "Duplicate User"}
    )
    assert dup_response.status_code == 400
    assert "Email already registered" in dup_response.json()["detail"]

    # 3. Test /auth/me with Bearer token
    me_response = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token1}"}
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == email

    # 4. Login User 1 with correct credentials
    login_response = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

    # 5. Login with invalid password
    invalid_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword123!"}
    )
    assert invalid_login.status_code == 401

@pytest.mark.asyncio
async def test_user_data_isolation(async_client: AsyncClient):
    email_a = f"usera_{uuid.uuid4().hex[:6]}@example.com"
    email_b = f"userb_{uuid.uuid4().hex[:6]}@example.com"

    # Register User A
    user_a_res = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email_a, "password": "UserAPassword123!", "full_name": "User A"}
    )
    token_a = user_a_res.json()["access_token"]

    # Register User B
    user_b_res = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email_b, "password": "UserBPassword123!", "full_name": "User B"}
    )
    token_b = user_b_res.json()["access_token"]

    # Get User A's categories
    cats_a_res = await async_client.get(
        "/api/v1/categories",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert cats_a_res.status_code == 200
    cats_a = cats_a_res.json()
    assert len(cats_a) > 0
    cat_a_id = cats_a[0]["id"]

    # Create an expense for User A
    exp_a_res = await async_client.post(
        "/api/v1/expenses",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "title": "User A Private Expense",
            "category_id": cat_a_id,
            "amount": 500.00,
            "date": "2026-08-31",
            "payment_mode": "upi"
        }
    )
    assert exp_a_res.status_code == 201
    exp_a_id = exp_a_res.json()["id"]

    # Verify User A can fetch expense
    fetch_a = await async_client.get(
        f"/api/v1/expenses/{exp_a_id}",
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert fetch_a.status_code == 200

    # User B attempts to access User A's expense -> MUST return 404 Not Found (Data Isolation)
    fetch_b = await async_client.get(
        f"/api/v1/expenses/{exp_a_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert fetch_b.status_code == 404

    # User B attempts to edit User A's expense -> MUST return 404 Not Found
    update_b = await async_client.put(
        f"/api/v1/expenses/{exp_a_id}",
        headers={"Authorization": f"Bearer {token_b}"},
        json={"title": "Hacked Title"}
    )
    assert update_b.status_code == 404

    # User B attempts to delete User A's expense -> MUST return 404 Not Found
    delete_b = await async_client.delete(
        f"/api/v1/expenses/{exp_a_id}",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert delete_b.status_code == 404

    # User B listing expenses should return EMPTY list
    list_b = await async_client.get(
        "/api/v1/expenses",
        headers={"Authorization": f"Bearer {token_b}"}
    )
    assert list_b.status_code == 200
    assert list_b.json()["meta"]["total"] == 0

@pytest.mark.asyncio
async def test_forgot_and_reset_password(async_client: AsyncClient):
    email = f"forgotuser_{uuid.uuid4().hex[:6]}@example.com"
    old_pw = "OldPassword123!"
    new_pw = "NewSecurePassword456!"

    await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": old_pw, "full_name": "Reset User"}
    )

    # Request password reset
    forgot_res = await async_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": email}
    )
    assert forgot_res.status_code == 200
    reset_token = forgot_res.json().get("reset_token")
    assert reset_token is not None

    # Reset password
    reset_res = await async_client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "new_password": new_pw}
    )
    assert reset_res.status_code == 200

    # Old password fails
    old_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": old_pw}
    )
    assert old_login.status_code == 401

    # New password succeeds
    new_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": new_pw}
    )
    assert new_login.status_code == 200

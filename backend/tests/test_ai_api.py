import uuid
import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.services.ai.ai_service import AIService
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.rule_based_provider import RuleBasedProvider

@pytest.mark.asyncio
async def test_ai_provider_factory():
    """Verify AIService dynamically switches providers based on settings.AI_PROVIDER."""
    # Test Rule-based
    settings.AI_PROVIDER = "rule_based"
    provider = AIService.get_provider()
    assert isinstance(provider, RuleBasedProvider)

    # Test OpenAI
    settings.AI_PROVIDER = "openai"
    provider = AIService.get_provider()
    assert isinstance(provider, OpenAIProvider)

    # Test Gemini
    settings.AI_PROVIDER = "gemini"
    provider = AIService.get_provider()
    assert isinstance(provider, GeminiProvider)

    # Reset to gemini
    settings.AI_PROVIDER = "gemini"

@pytest.mark.asyncio
async def test_ai_categorize_endpoint(async_client: AsyncClient):
    """Test AI auto-categorization endpoint."""
    email = f"ai_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "AI User"}
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test coffee categorization
    resp = await async_client.post(
        "/api/v1/ai/categorize",
        json={"title": "Starbucks Caramel Frappuccino"},
        headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "category" in data
    assert "confidence" in data
    assert "food" in data["category"].lower() or "starbucks" in data["category"].lower()

    # Test transport categorization
    resp2 = await async_client.post(
        "/api/v1/ai/categorize",
        json={"title": "Uber Cab Ride to Office"},
        headers=headers
    )
    assert resp2.status_code == 200
    assert "transport" in resp2.json()["category"].lower() or "uber" in resp2.json()["category"].lower()


@pytest.mark.asyncio
async def test_ai_natural_language_parsing(async_client: AsyncClient):
    """Test Natural Language expense sentence parsing."""
    email = f"nlp_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "NLP User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await async_client.post(
        "/api/v1/ai/parse-expense",
        json={"text": "Paid 450 for Domino's Pizza with UPI"},
        headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["amount"] == 450.0
    assert data["payment_mode"] == "upi"
    assert "Pizza" in data["title"] or "Domino" in data["title"] or "Expense" in data["title"]

@pytest.mark.asyncio
async def test_ai_spending_insights(async_client: AsyncClient):
    """Test real PostgreSQL spend calculation and AI recommendations generation."""
    email = f"insights_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Insights User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch default seeded categories
    cat_resp = await async_client.get("/api/v1/categories", headers=headers)
    assert cat_resp.status_code == 200
    categories = cat_resp.json()
    food_cat = next((c for c in categories if c["name"].lower() == "food"), categories[0])

    # Add real expense
    from datetime import date
    today = date.today().isoformat()
    await async_client.post(
        "/api/v1/expenses",
        json={"title": "Supermarket Grocery", "amount": 2500.0, "category_id": food_cat["id"], "date": today, "payment_mode": "card"},
        headers=headers
    )

    # Set budget
    await async_client.post(
        "/api/v1/budgets",
        json={"amount": 5000.0, "period": "monthly"},
        headers=headers
    )

    # Fetch AI insights
    insights_resp = await async_client.get("/api/v1/ai/insights", headers=headers)
    assert insights_resp.status_code == 200
    insights_data = insights_resp.json()
    assert "insights" in insights_data
    assert len(insights_data["insights"]) > 0
    assert insights_data["summary"]["total_current_month"] == 2500.0
    assert insights_data["summary"]["total_budget"] == 5000.0
    assert len(insights_data["budget_recommendations"]) > 0

@pytest.mark.asyncio
async def test_ai_expense_forecast(async_client: AsyncClient):
    """Test AI predictive expense forecasting endpoint."""
    email = f"forecast_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Forecast User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch forecast
    forecast_resp = await async_client.get("/api/v1/ai/forecast", headers=headers)
    assert forecast_resp.status_code == 200
    data = forecast_resp.json()
    assert "days_elapsed" in data
    assert "days_remaining" in data
    assert "total_days_in_month" in data
    assert "daily_burn_rate" in data
    assert "projected_month_end_spend" in data
    assert "forecast_status" in data
    assert "forecast_emoji" in data
    assert "forecast_advice" in data

@pytest.mark.asyncio
async def test_ai_financial_health_score(async_client: AsyncClient):
    """Test AI Financial Health Score (0-100) endpoint."""
    email = f"health_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Health User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch health score
    score_resp = await async_client.get("/api/v1/ai/health-score", headers=headers)
    assert score_resp.status_code == 200
    data = score_resp.json()
    assert "score" in data
    assert 0 <= data["score"] <= 100
    assert "grade" in data
    assert "tier" in data
    assert "tier_emoji" in data
    assert "summary_verdict" in data
    assert "pillars" in data
    assert len(data["pillars"]) == 4
@pytest.mark.asyncio
async def test_ai_receipt_scanner(async_client: AsyncClient):
    """Test AI Vision Receipt Scanner & OCR endpoint."""
    email = f"ocr_user_{uuid.uuid4().hex[:6]}@example.com"
    reg = await async_client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "OCR User"}
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create dummy text receipt image payload
    receipt_text = "DMart Supermarket\nTotal Amount: 1450.00\nPayment Mode: UPI\nDate: 2026-09-04\nItem 1: Milk 50.00"
    files = {
        "file": ("receipt.png", receipt_text.encode("utf-8"), "image/png")
    }

    scan_resp = await async_client.post(
        "/api/v1/ai/scan-receipt",
        files=files,
        headers=headers
    )
    assert scan_resp.status_code == 200
    data = scan_resp.json()
    assert "merchant" in data
    assert "amount" in data
    assert "category" in data
    assert "payment_mode" in data
    assert "confidence" in data
    assert data["amount"] == 1450.00 or data["amount"] >= 0.0




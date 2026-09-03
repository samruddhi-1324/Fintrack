import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.ai import (
    CategorizeRequest,
    CategorizeResponse,
    NaturalLanguageExpenseRequest,
    NaturalLanguageExpenseResponse,
    AIInsightsResponse,
    ExpenseForecastResponse,
    FinancialHealthScoreResponse
)
from app.services.ai.ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health-score", response_model=FinancialHealthScoreResponse, summary="Get 0-100 AI Financial Health Score & Pillar Breakdown")
async def get_financial_health_score(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates authentic transaction records across 4 financial pillars
    (Budget Adherence, Burn Velocity, Concentration Risk, MoM Progression)
    and computes a holistic 0-100 financial health score with actionable tips.
    """
    try:
        score_data = await AIService.get_financial_health_score(current_user.id, db)
        return FinancialHealthScoreResponse(**score_data)
    except Exception as e:
        logger.error(f"Error calculating financial health score: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate financial health score."
        )

@router.get("/forecast", response_model=ExpenseForecastResponse, summary="Get AI predictive expense forecast & month-end projections")
async def get_expense_forecast(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Computes daily burn rates, predicted month-end spending, budget exhaustion day,
    and safe daily spending allowances based on authentic user transaction data.
    """
    try:
        forecast_data = await AIService.get_expense_forecast(current_user.id, db)
        return ExpenseForecastResponse(**forecast_data)
    except Exception as e:
        logger.error(f"Error calculating AI expense forecast: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate AI expense forecast."
        )

@router.post("/categorize", response_model=CategorizeResponse, summary="Predict category for expense title")
async def categorize_expense(
    payload: CategorizeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes an expense title or merchant name and predicts the best matching category
    from the authenticated user's actual categories list.
    """
    try:
        result = await AIService.categorize_title(payload.title, current_user.id, db)
        return CategorizeResponse(**result)
    except Exception as e:
        logger.error(f"Error predicting category: {str(e)}", exc_info=True)
        return CategorizeResponse(category="Miscellaneous", confidence=0.0, is_new_suggested=False)

@router.get("/insights", response_model=AIInsightsResponse, summary="Get real-time AI spending insights & recommendations")
async def get_ai_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Calculates spending metrics directly from the authenticated user's PostgreSQL records
    and generates personalized financial insights, overspending alerts, and budget suggestions.
    """
    try:
        insights_data = await AIService.get_user_spending_insights(current_user.id, db)
        return AIInsightsResponse(**insights_data)
    except Exception as e:
        logger.error(f"Error generating AI spending insights: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate AI financial insights."
        )

@router.post("/parse-expense", response_model=NaturalLanguageExpenseResponse, summary="Parse natural language expense into structured fields")
async def parse_expense_nlp(
    payload: NaturalLanguageExpenseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Converts a single natural-language sentence (e.g. 'Dinner with friends 1200 upi')
    into structured Title, Amount, Payment Mode, and matched Category.
    """
    try:
        parsed_data = await AIService.parse_natural_language(payload.text, current_user.id, db)
        return NaturalLanguageExpenseResponse(**parsed_data)
    except Exception as e:
        logger.error(f"Error parsing natural language expense: {str(e)}", exc_info=True)
        return NaturalLanguageExpenseResponse(
            title="Expense",
            amount=0.0,
            payment_mode="upi",
            category="Miscellaneous",
            category_id=None
        )


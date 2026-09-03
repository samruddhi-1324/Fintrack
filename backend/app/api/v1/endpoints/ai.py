import logging
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
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
    FinancialHealthScoreResponse,
    ReceiptScanResponse,
    AICopilotRequest,
    AICopilotResponse
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

@router.post("/scan-receipt", response_model=ReceiptScanResponse, summary="Scan receipt image via AI Vision OCR")
async def scan_receipt_ocr(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyzes an uploaded receipt image (JPEG, PNG, WEBP) using AI Vision OCR
    and extracts merchant name, total amount, transaction date, payment mode,
    matched category, line items, and raw text.
    """
    # 1. Validate MIME type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/pjpeg", "image/x-png"]
    content_type = file.content_type or "image/jpeg"
    
    if content_type.lower() not in allowed_types and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPEG, PNG, WEBP."
        )

    # 2. Read file bytes and check max file size (10 MB)
    image_bytes = await file.read()
    max_bytes = 10 * 1024 * 1024  # 10 MB
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10 MB."
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    try:
        parsed_receipt = await AIService.scan_receipt_image(current_user.id, image_bytes, content_type, db)
        return ReceiptScanResponse(**parsed_receipt)
    except Exception as e:
        logger.error(f"Error scanning receipt image: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process receipt image via AI Vision OCR: {str(e)}"
        )

@router.post("/copilot", response_model=AICopilotResponse, summary="Conversational AI Financial Copilot Q&A Assistant")
async def ask_financial_copilot(
    payload: AICopilotRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Interactive conversational assistant that evaluates authentic user PostgreSQL metrics
    (spend, budgets, burn rate, health score, top transactions) to answer financial questions.
    """
    try:
        history_dicts = [{"role": msg.role, "content": msg.content} for msg in payload.chat_history]
        copilot_response = await AIService.ask_copilot(
            current_user.id,
            payload.question,
            history_dicts,
            db
        )
        return AICopilotResponse(**copilot_response)
    except Exception as e:
        logger.error(f"Error querying AI Financial Copilot: {str(e)}", exc_info=True)
        return AICopilotResponse(
            provider="rule_based",
            answer="I encountered an issue analyzing your request. Please try asking again!",
            suggested_followups=["How's my health score?", "Where am I spending most?"]
        )




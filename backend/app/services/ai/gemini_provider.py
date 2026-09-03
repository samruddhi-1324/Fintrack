import json
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.rule_based_provider import RuleBasedProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseAIProvider):
    """
    Google Gemini Provider for FinTrack AI Recommendations and NLP.
    Uses structured prompt engineering with fallback to RuleBasedProvider.
    """

    def __init__(self):
        self.fallback = RuleBasedProvider()
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel(self.model_name)
                logger.info(f"Initialized GeminiProvider with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini SDK: {e}. Falling back to RuleBasedProvider.")
                self.model = None
        else:
            self.model = None

    async def categorize_expense(self, title: str, categories: List[str]) -> Dict[str, Any]:
        if not self.model or not self.api_key:
            return await self.fallback.categorize_expense(title, categories)

        prompt = f"""
        You are a financial categorization assistant for an expense tracker.
        Analyze the following expense title and pick the most appropriate category from the available categories list.
        If none of the available categories fit well, suggest a new concise category name (1-2 words).

        Expense Title: "{title}"
        Available Categories: {json.dumps(categories)}

        Respond ONLY with a valid JSON object matching this exact schema:
        {{
            "category": "Selected Category Name",
            "confidence": 0.95,
            "is_new_suggested": false
        }}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            data = json.loads(response.text)
            return {
                "category": data.get("category", categories[0] if categories else "Miscellaneous"),
                "confidence": float(data.get("confidence", 0.9)),
                "is_new_suggested": bool(data.get("is_new_suggested", False))
            }
        except Exception as e:
            logger.warning(f"Gemini categorization failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.categorize_expense(title, categories)

    async def generate_insights(self, spending_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.model or not self.api_key:
            return await self.fallback.generate_insights(spending_summary)

        # Sanitize summary - strictly numerical totals and category names, zero PII
        clean_summary = {
            "total_current_month": spending_summary.get("total_current_month", 0.0),
            "total_previous_month": spending_summary.get("total_previous_month", 0.0),
            "total_budget": spending_summary.get("total_budget", 0.0),
            "category_totals": spending_summary.get("category_totals", {}),
            "category_budgets": spending_summary.get("category_budgets", {})
        }

        prompt = f"""
        You are a smart personal finance advisor.
        Analyze this user's monthly spending summary (in INR ₹) and generate 2 to 4 actionable, encouraging, and highly specific financial insights.
        Highlight overspending risks, positive savings trends, and practical budgeting tips based ONLY on the numbers provided.

        Spending Data:
        {json.dumps(clean_summary, indent=2)}

        Respond ONLY with a valid JSON array of insight objects:
        [
            {{
                "type": "budget_alert" | "spending_spike" | "savings_win" | "category_concentration" | "general_tip",
                "severity": "info" | "warning" | "danger" | "success",
                "title": "Short punchy title (max 5 words)",
                "message": "1-2 sentence actionable message with specific ₹ values and percentages if applicable.",
                "category": "Category Name or null"
            }}
        ]
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            insights = json.loads(response.text)
            if isinstance(insights, list) and len(insights) > 0:
                return insights
            return await self.fallback.generate_insights(spending_summary)
        except Exception as e:
            logger.warning(f"Gemini insights generation failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.generate_insights(spending_summary)

    async def parse_natural_language_expense(self, text: str, categories: List[str]) -> Dict[str, Any]:
        if not self.model or not self.api_key:
            return await self.fallback.parse_natural_language_expense(text, categories)

        prompt = f"""
        Extract structured expense details from this single-sentence user input in an Indian context.
        Available categories: {json.dumps(categories)}
        Payment mode must be strictly one of: "cash", "card", or "upi" (default to "upi" if unspecified).

        Input: "{text}"

        Respond ONLY with a valid JSON object matching this schema:
        {{
            "title": "Clean concise expense title (e.g. Starbucks Coffee, Lunch, Uber Ride)",
            "amount": 450.00,
            "payment_mode": "upi",
            "category": "Matched Category Name from available categories or best fit"
        }}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            data = json.loads(response.text)
            return {
                "title": str(data.get("title", "Expense")),
                "amount": float(data.get("amount", 0.0)),
                "payment_mode": str(data.get("payment_mode", "upi")).lower(),
                "category": data.get("category", categories[0] if categories else "Miscellaneous")
            }
        except Exception as e:
            logger.warning(f"Gemini natural language parsing failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.parse_natural_language_expense(text, categories)

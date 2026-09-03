import json
import logging
from typing import List, Dict, Any, Optional
from openai import AsyncOpenAI
from app.core.config import settings
from app.services.ai.base import BaseAIProvider
from app.services.ai.rule_based_provider import RuleBasedProvider

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseAIProvider):
    """
    OpenAI / ChatGPT Provider for FinTrack AI Recommendations and NLP.
    Compatible with gpt-4o-mini, gpt-4o, and other OpenAI models.
    """

    def __init__(self):
        self.fallback = RuleBasedProvider()
        self.api_key = settings.OPENAI_API_KEY
        self.model_name = settings.OPENAI_MODEL or "gpt-4o-mini"
        
        if self.api_key:
            try:
                self.client = AsyncOpenAI(api_key=self.api_key)
                logger.info(f"Initialized OpenAIProvider with model: {self.model_name}")
            except Exception as e:
                logger.warning(f"Failed to configure OpenAI client: {e}. Falling back to RuleBasedProvider.")
                self.client = None
        else:
            self.client = None

    async def categorize_expense(self, title: str, categories: List[str]) -> Dict[str, Any]:
        if not self.client or not self.api_key:
            return await self.fallback.categorize_expense(title, categories)

        prompt = f"""
        You are a financial categorization assistant. Pick the best category for this expense title.
        Expense Title: "{title}"
        Available Categories: {json.dumps(categories)}

        Respond ONLY in JSON format:
        {{
            "category": "Selected Category Name",
            "confidence": 0.95,
            "is_new_suggested": false
        }}
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            data = json.loads(response.choices[0].message.content)
            return {
                "category": data.get("category", categories[0] if categories else "Miscellaneous"),
                "confidence": float(data.get("confidence", 0.9)),
                "is_new_suggested": bool(data.get("is_new_suggested", False))
            }
        except Exception as e:
            logger.warning(f"OpenAI categorization failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.categorize_expense(title, categories)

    async def generate_insights(self, spending_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        if not self.client or not self.api_key:
            return await self.fallback.generate_insights(spending_summary)

        clean_summary = {
            "total_current_month": spending_summary.get("total_current_month", 0.0),
            "total_previous_month": spending_summary.get("total_previous_month", 0.0),
            "total_budget": spending_summary.get("total_budget", 0.0),
            "category_totals": spending_summary.get("category_totals", {}),
            "category_budgets": spending_summary.get("category_budgets", {})
        }

        prompt = f"""
        You are a smart personal finance advisor.
        Analyze this user's monthly spending summary (in INR ₹) and generate 2 to 4 actionable, encouraging, and specific financial insights.
        Spending Data:
        {json.dumps(clean_summary, indent=2)}

        Respond in JSON with a root key "insights":
        {{
            "insights": [
                {{
                    "type": "budget_alert" | "spending_spike" | "savings_win" | "category_concentration" | "general_tip",
                    "severity": "info" | "warning" | "danger" | "success",
                    "title": "Short punchy title (max 5 words)",
                    "message": "1-2 sentence actionable message with specific ₹ values.",
                    "category": "Category Name or null"
                }}
            ]
        }}
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.3
            )
            data = json.loads(response.choices[0].message.content)
            insights = data.get("insights", [])
            if isinstance(insights, list) and len(insights) > 0:
                return insights
            return await self.fallback.generate_insights(spending_summary)
        except Exception as e:
            logger.warning(f"OpenAI insights generation failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.generate_insights(spending_summary)

    async def parse_natural_language_expense(self, text: str, categories: List[str]) -> Dict[str, Any]:
        if not self.client or not self.api_key:
            return await self.fallback.parse_natural_language_expense(text, categories)

        prompt = f"""
        Extract structured expense details from this input.
        Available categories: {json.dumps(categories)}
        Payment mode must be: "cash", "card", or "upi".

        Input: "{text}"

        Respond in JSON format:
        {{
            "title": "Clean expense title",
            "amount": 450.00,
            "payment_mode": "upi",
            "category": "Matched Category Name"
        }}
        """

        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0.1
            )
            data = json.loads(response.choices[0].message.content)
            return {
                "title": str(data.get("title", "Expense")),
                "amount": float(data.get("amount", 0.0)),
                "payment_mode": str(data.get("payment_mode", "upi")).lower(),
                "category": data.get("category", categories[0] if categories else "Miscellaneous")
            }
        except Exception as e:
            logger.warning(f"OpenAI natural language parsing failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.parse_natural_language_expense(text, categories)

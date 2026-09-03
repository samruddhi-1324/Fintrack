import json
import re
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

    async def scan_receipt(self, image_bytes: bytes, mime_type: str, categories: List[str]) -> Dict[str, Any]:
        if not self.model or not self.api_key:
            return await self.fallback.scan_receipt(image_bytes, mime_type, categories)

        prompt = f"""
        You are an expert AI Receipt & Invoice OCR Parser for personal finance tracking in India.
        Analyze this receipt image carefully and extract all transaction details.

        Available User Categories: {json.dumps(categories)}
        Payment mode MUST be strictly one of: "cash", "card", or "upi" (default to "card" or "upi" if detected).

        CRITICAL INSTRUCTIONS FOR TOTAL AMOUNT:
        - The "amount" field MUST strictly be the FINAL GRAND TOTAL / NET AMOUNT PAID on the receipt (including all taxes, GST, service charges, tips, and after applying any discounts).
        - Look specifically for keywords like "GRAND TOTAL", "TOTAL AMOUNT PAID", "NET TOTAL", "TOTAL DUE", "FINAL TOTAL", "AMOUNT PAID", "BILL TOTAL", or "TOTAL".
        - NEVER use the Subtotal, CGST/SGST Tax amount, Savings amount, or an individual line item price as the overall "amount".

        Respond ONLY with a valid JSON object matching this exact schema:
        {{
            "merchant": "Store or Merchant Name (e.g. Starbucks, DMart, Shell Fuel)",
            "amount": 1250.50,
            "date": "YYYY-MM-DD" or null,
            "payment_mode": "card",
            "category": "Best matching category name from available categories list",
            "confidence": 0.95,
            "line_items": [
                {{"name": "Item Description", "price": 450.00}}
            ],
            "raw_text": "Brief extracted text transcript summary"
        }}
        """

        try:
            image_part = {
                "mime_type": mime_type,
                "data": image_bytes
            }
            response = self.model.generate_content(
                [prompt, image_part],
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            data = json.loads(response.text)
            
            raw_category = data.get("category", categories[0] if categories else "Miscellaneous")
            matched_category = raw_category
            if raw_category not in categories:
                for c in categories:
                    if c.lower() in raw_category.lower() or raw_category.lower() in c.lower():
                        matched_category = c
                        break

            # Parse and clean extracted amount safely
            raw_amount = data.get("amount", 0.0)
            parsed_amount = 0.0
            if isinstance(raw_amount, (int, float)):
                parsed_amount = float(raw_amount)
            elif isinstance(raw_amount, str):
                try:
                    parsed_amount = float(re.sub(r'[^\d.]', '', raw_amount.replace(',', '')))
                except ValueError:
                    parsed_amount = 0.0

            line_items = data.get("line_items", [])
            # Fallback to sum of line items if total amount is 0
            if parsed_amount == 0.0 and line_items:
                total_items = 0.0
                for item in line_items:
                    if isinstance(item, dict):
                        p = item.get("price", 0.0)
                        if isinstance(p, (int, float)):
                            total_items += float(p)
                        elif isinstance(p, str):
                            try:
                                total_items += float(re.sub(r'[^\d.]', '', p.replace(',', '')))
                            except ValueError:
                                pass
                if total_items > 0:
                    parsed_amount = round(total_items, 2)

            return {
                "merchant": str(data.get("merchant", "Receipt Store")),
                "amount": parsed_amount,
                "date": data.get("date"),
                "payment_mode": str(data.get("payment_mode", "card")).lower(),
                "category": matched_category,
                "confidence": float(data.get("confidence", 0.90)),
                "line_items": line_items,
                "raw_text": data.get("raw_text", "Scanned via Gemini AI Vision OCR")
            }

        except Exception as e:
            logger.warning(f"Gemini receipt scanning failed: {e}. Falling back to rule-based scanner.", exc_info=False)
            return await self.fallback.scan_receipt(image_bytes, mime_type, categories)

    async def ask_copilot(
        self,
        question: str,
        chat_history: List[Dict[str, str]],
        financial_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not self.model or not self.api_key:
            return await self.fallback.ask_copilot(question, chat_history, financial_context)

        prompt = f"""
        You are FinTrack AI Copilot — an expert, encouraging, and highly intelligent personal finance assistant for users in India.
        Answer the user's question accurately using ONLY the authentic user financial context provided below (in INR ₹).
        
        Authentic User Financial Context:
        {json.dumps(financial_context, indent=2)}

        Recent Conversation History:
        {json.dumps(chat_history[-6:] if chat_history else [], indent=2)}

        User Question: "{question}"

        Guidelines:
        1. Keep answers concise, clear, and structured with clean markdown (bullet points, bold text for ₹ values).
        2. Give actionable financial advice tailored specifically to their numbers.
        3. Include 2-3 relevant follow-up questions the user might ask next.

        Respond ONLY in valid JSON matching this schema:
        {{
            "answer": "Structured markdown answer with specific ₹ numbers and advice.",
            "suggested_followups": ["Followup question 1?", "Followup question 2?", "Followup question 3?"]
        }}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )
            data = json.loads(response.text)
            return {
                "answer": str(data.get("answer", "Here is your financial update.")),
                "suggested_followups": data.get("suggested_followups", ["How's my health score?", "Where did I spend most?"])
            }
        except Exception as e:
            logger.warning(f"Gemini copilot query failed: {e}. Falling back to rule-based.", exc_info=False)
            return await self.fallback.ask_copilot(question, chat_history, financial_context)



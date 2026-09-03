from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class BaseAIProvider(ABC):
    """
    Abstract Base Class for all AI recommendation and NLP providers in FinTrack.
    Any provider (Gemini, OpenAI, Anthropic, Local) must implement these methods.
    """

    @abstractmethod
    async def categorize_expense(self, title: str, categories: List[str]) -> Dict[str, Any]:
        """
        Given an expense title and list of available category names,
        predicts the best category and confidence score.
        Returns: {"category": str, "confidence": float, "is_new_suggested": bool}
        """
        pass

    @abstractmethod
    async def generate_insights(self, spending_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Given real user financial aggregates (current month spend, category totals,
        previous month spend, budget utilization), generates actionable recommendations,
        overspending alerts, and saving opportunities.
        Returns: list of {"type": str, "title": str, "message": str, "severity": str, "category": Optional[str]}
        """
        pass

    @abstractmethod
    async def parse_natural_language_expense(self, text: str, categories: List[str]) -> Dict[str, Any]:
        """
        Parses a natural language expense sentence (e.g., 'Paid 450 for coffee with card')
        into structured fields.
        Returns: {"title": str, "amount": float, "payment_mode": Optional[str], "category": Optional[str]}
        """
        pass

    @abstractmethod
    async def scan_receipt(self, image_bytes: bytes, mime_type: str, categories: List[str]) -> Dict[str, Any]:
        """
        Performs AI Vision OCR on a receipt image to extract merchant, total amount,
        transaction date, payment mode, matched category, line items, and confidence.
        Returns: {
            "merchant": str,
            "amount": float,
            "date": Optional[str],
            "payment_mode": str,
            "category": str,
            "confidence": float,
            "line_items": List[Dict[str, Any]],
            "raw_text": Optional[str]
        }
        """
        pass


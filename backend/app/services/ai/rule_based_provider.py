import re
from typing import List, Dict, Any, Optional
from app.services.ai.base import BaseAIProvider

class RuleBasedProvider(BaseAIProvider):
    """
    Deterministic rule-based and statistical provider.
    Used when AI_PROVIDER='rule_based' or as an instant offline fallback when
    external LLM API keys are not configured or rate-limited.
    """

    KEYWORD_CATEGORY_MAP = {
        "food": [
            "starbucks", "coffee", "tea", "cafe", "mcdonalds", "burger", "pizza",
            "dominos", "swiggy", "zomato", "restaurant", "dinner", "lunch",
            "breakfast", "snack", "grocery", "groceries", "supermarket", "milk",
            "vegetables", "fruits", "meat", "biscuit", "subway", "barbeque", "dhaba"
        ],
        "transport": [
            "uber", "ola", "rapido", "cab", "taxi", "metro", "bus", "train",
            "railway", "irctc", "flight", "airways", "fuel", "petrol", "diesel",
            "cng", "parking", "toll", "auto", "rickshaw", "scooter"
        ],
        "utilities": [
            "electricity", "power", "water", "gas", "cylinder", "wifi",
            "broadband", "internet", "recharge", "jio", "airtel", "vi",
            "mobile bill", "maintenance", "dth", "tata play"
        ],
        "entertainment": [
            "netflix", "amazon prime", "hotstar", "spotify", "apple music",
            "movie", "cinema", "theatre", "pvr", "inox", "game", "steam",
            "playstation", "party", "club", "concert", "outing"
        ],
        "housing": [
            "rent", "society", "maintenance", "repair", "plumber", "electrician",
            "furniture", "decor", "appliance", "cleaning", "maid"
        ],
        "health": [
            "doctor", "hospital", "clinic", "pharmacy", "medicine", "chemist",
            "apollo", "test", "lab", "dentist", "gym", "fitness", "supplements"
        ],
        "shopping": [
            "amazon", "flipkart", "myntra", "zara", "h&m", "clothes", "shoes",
            "electronics", "mall", "cosmetics", "skincare", "gift"
        ],
        "miscellaneous": [
            "donation", "charity", "fine", "penalty", "fees", "stationery", "books"
        ]
    }

    async def categorize_expense(self, title: str, categories: List[str]) -> Dict[str, Any]:
        title_lower = (title or "").lower().strip()
        if not title_lower:
            return {"category": categories[0] if categories else "Miscellaneous", "confidence": 0.0, "is_new_suggested": False}

        # 1. Exact or partial match with user categories
        for cat in categories:
            if cat.lower() in title_lower or title_lower in cat.lower():
                return {"category": cat, "confidence": 0.95, "is_new_suggested": False}

        # 2. Match against keyword mappings
        for canonical_cat, keywords in self.KEYWORD_CATEGORY_MAP.items():
            for kw in keywords:
                if kw in title_lower:
                    # Find if user has a category that matches canonical name
                    for user_cat in categories:
                        if canonical_cat in user_cat.lower() or user_cat.lower() in canonical_cat:
                            return {"category": user_cat, "confidence": 0.85, "is_new_suggested": False}
                    # User doesn't have it, suggest canonical category
                    return {"category": canonical_cat.capitalize(), "confidence": 0.75, "is_new_suggested": True}

        # Fallback default
        default_cat = next((c for c in categories if "misc" in c.lower()), categories[0] if categories else "Miscellaneous")
        return {"category": default_cat, "confidence": 0.40, "is_new_suggested": False}

    async def generate_insights(self, spending_summary: Dict[str, Any]) -> List[Dict[str, Any]]:
        insights = []
        total_spent = spending_summary.get("total_current_month", 0.0)
        category_totals = spending_summary.get("category_totals", {})
        total_budget = spending_summary.get("total_budget", 0.0)
        prev_month_total = spending_summary.get("total_previous_month", 0.0)

        # 1. Budget utilization insight
        if total_budget > 0:
            utilization = (total_spent / total_budget) * 100
            if utilization > 100:
                insights.append({
                    "type": "budget_alert",
                    "severity": "danger",
                    "title": "😱 Monthly Budget Exceeded 💸",
                    "message": f"😱 You have exceeded your monthly budget of ₹{total_budget:,.2f} by ₹{(total_spent - total_budget):,.2f} ({utilization:.1f}% spent). Consider pausing non-essential spends. 🛑",
                    "category": None
                })
            elif utilization >= 80:
                insights.append({
                    "type": "budget_warning",
                    "severity": "warning",
                    "title": "😬 Approaching Monthly Budget Limit ⚠️",
                    "message": f"😬 You have utilized {utilization:.1f}% of your ₹{total_budget:,.2f} monthly budget with ₹{(total_budget - total_spent):,.2f} remaining. ⏳",
                    "category": None
                })
            else:
                insights.append({
                    "type": "budget_health",
                    "severity": "success",
                    "title": "🥳 Budget on Track 💰",
                    "message": f"🥳 Your spending is healthy at {utilization:.1f}% of your ₹{total_budget:,.2f} limit. ₹{(total_budget - total_spent):,.2f} remaining this month. 🌟",
                    "category": None
                })

        # 2. Month-over-month comparison insight
        if prev_month_total > 0 and total_spent > 0:
            diff_pct = ((total_spent - prev_month_total) / prev_month_total) * 100
            if diff_pct > 20:
                insights.append({
                    "type": "spending_spike",
                    "severity": "warning",
                    "title": "📈 Spending Surge vs Last Month ⚡",
                    "message": f"📈 Your current spend is {abs(diff_pct):.1f}% higher compared to last month (₹{total_spent:,.2f} vs ₹{prev_month_total:,.2f}). Watch your daily burn rate! 🔥",
                    "category": None
                })
            elif diff_pct < -10:
                insights.append({
                    "type": "savings_win",
                    "severity": "success",
                    "title": "🎉 Great Progress on Savings! 🏆",
                    "message": f"🎉 You are spending {abs(diff_pct):.1f}% less compared to last month. Keep up the disciplined budgeting! 💚",
                    "category": None
                })

        # 3. Top category insight
        if category_totals:
            sorted_cats = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
            top_cat, top_amount = sorted_cats[0]
            top_pct = (top_amount / total_spent * 100) if total_spent > 0 else 0
            if top_pct >= 40:
                insights.append({
                    "type": "category_concentration",
                    "severity": "info",
                    "title": f"📊 High Spend in {top_cat} 🔍",
                    "message": f"💡 {top_cat} makes up {top_pct:.1f}% (₹{top_amount:,.2f}) of your total expenditures. Setting a specific category budget will optimize your savings.",
                    "category": top_cat
                })

        # 4. Default welcome/encouragement if empty data
        if not insights:
            insights.append({
                "type": "general_tip",
                "severity": "info",
                "title": "Track Daily for AI Insights",
                "message": "Log your daily transactions and set monthly budgets to unlock personalized spending optimization tips.",
                "category": None
            })

        return insights

    async def parse_natural_language_expense(self, text: str, categories: List[str]) -> Dict[str, Any]:
        text_clean = (text or "").strip()
        if not text_clean:
            return {"title": "Expense", "amount": 0.0, "payment_mode": "upi", "category": categories[0] if categories else "Miscellaneous"}

        # Extract amount (e.g. 450, 450.50, rs 450, ₹450)
        amount = 0.0
        amount_match = re.search(r'(?:rs\.?|₹|inr)?\s*(\d+(?:\.\d{1,2})?)', text_clean, re.IGNORECASE)
        if amount_match:
            try:
                amount = float(amount_match.group(1))
            except ValueError:
                amount = 0.0

        # Extract payment mode
        payment_mode = "upi"
        text_lower = text_clean.lower()
        if any(w in text_lower for w in ["cash", "notes"]):
            payment_mode = "cash"
        elif any(w in text_lower for w in ["card", "credit", "debit", "visa", "mastercard"]):
            payment_mode = "card"
        elif any(w in text_lower for w in ["upi", "gpay", "phonepe", "paytm", "scan"]):
            payment_mode = "upi"

        # Determine Title (remove extracted amount and payment words)
        clean_title = re.sub(r'(?:paid|spent|bought|for|with|via|using|rs\.?|₹|inr|\d+(?:\.\d{1,2})?|cash|card|upi|credit|debit|gpay|phonepe|paytm|today|yesterday)', '', text_clean, flags=re.IGNORECASE)
        clean_title = re.sub(r'\s+', ' ', clean_title).strip()
        if not clean_title or len(clean_title) < 2:
            clean_title = "Expense"

        # Auto-categorize title
        cat_result = await self.categorize_expense(clean_title or text_clean, categories)

        return {
            "title": clean_title.title(),
            "amount": amount,
            "payment_mode": payment_mode,
            "category": cat_result.get("category")
        }

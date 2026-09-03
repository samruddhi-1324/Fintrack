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

        # Extract amount (e.g. 450, 450.50, rs 450, 450 rupees, ₹450, 450 bucks)
        amount = 0.0
        amount_match = re.search(r'(?:rs\.?|₹|inr|rupees|bucks)?\s*(\d+(?:\.\d{1,2})?)\s*(?:rs\.?|₹|inr|rupees|bucks)?', text_clean, re.IGNORECASE)
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
        clean_title = re.sub(r'(?:paid|spent|bought|for|with|via|using|rs\.?|₹|inr|rupees|bucks|\d+(?:\.\d{1,2})?|cash|card|upi|credit|debit|gpay|phonepe|paytm|today|yesterday|amount)', '', text_clean, flags=re.IGNORECASE)
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

    async def scan_receipt(self, image_bytes: bytes, mime_type: str, categories: List[str]) -> Dict[str, Any]:
        """
        Deterministic fallback OCR / Receipt scanner.
        Used when LLM keys are unavailable or for test execution.
        Attempts basic text pattern parsing if string bytes provided, or returns structured default.
        """
        raw_text_sample = ""
        try:
            import io
            from PIL import Image
            img = Image.open(io.BytesIO(image_bytes))
            try:
                import pytesseract
                raw_text_sample = pytesseract.image_to_string(img)
            except Exception:
                raw_text_sample = ""
        except Exception:
            raw_text_sample = ""

        if not raw_text_sample:
            try:
                raw_text_sample = image_bytes.decode("utf-8", errors="ignore")
            except Exception:
                raw_text_sample = ""

        # Default fallback values
        merchant = "Store / Restaurant"
        amount = 0.0
        payment_mode = "card"
        date_str = None
        line_items = []

        if raw_text_sample:
            # 1. Search for explicit GRAND TOTAL / NET AMOUNT keywords first
            grand_total_match = re.search(
                r'(?:grand\s*total|net\s*total|total\s*amount\s*paid|net\s*amount|final\s*total|total\s*due|amount\s*paid|bill\s*total)\s*[:=]?\s*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{1,2})?)',
                raw_text_sample,
                re.IGNORECASE
            )
            if grand_total_match:
                try:
                    clean_str = grand_total_match.group(1).replace(',', '')
                    amount = float(clean_str)
                except ValueError:
                    amount = 0.0

            # 2. If grand total keyword not found, search for generic TOTAL (search from bottom up)
            if amount == 0.0:
                tot_matches = re.findall(
                    r'(?:total)\s*[:=]?\s*(?:rs\.?|₹|inr)?\s*([\d,]+(?:\.\d{1,2})?)',
                    raw_text_sample,
                    re.IGNORECASE
                )
                if tot_matches:
                    for m in reversed(tot_matches):
                        try:
                            v = float(m.replace(',', ''))
                            if v > 0:
                                amount = v
                                break
                        except ValueError:
                            pass

            # 3. Fallback to largest valid number in text
            if amount == 0.0:
                all_nums = re.findall(r'\b\d+(?:\.\d{1,2})?\b', raw_text_sample)
                valid_nums = []
                for n in all_nums:
                    try:
                        v = float(n)
                        if 0 < v < 1000000:
                            valid_nums.append(v)
                    except ValueError:
                        pass
                if valid_nums:
                    amount = max(valid_nums)

            # Extract merchant name (first non-empty line)
            lines = [line.strip() for line in raw_text_sample.splitlines() if line.strip()]
            if lines:
                merchant = lines[0][:40]

            # Extract date (YYYY-MM-DD or DD/MM/YYYY)
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})|(\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})', raw_text_sample)
            if date_match:
                date_str = date_match.group(0)

            # Payment mode
            raw_lower = raw_text_sample.lower()
            if "upi" in raw_lower or "gpay" in raw_lower or "phonepe" in raw_lower:
                payment_mode = "upi"
            elif "cash" in raw_lower:
                payment_mode = "cash"

        cat_res = await self.categorize_expense(merchant, categories)

        return {
            "merchant": merchant,
            "amount": amount,
            "date": date_str,
            "payment_mode": payment_mode,
            "category": cat_res.get("category", categories[0] if categories else "Miscellaneous"),
            "confidence": 0.65 if amount > 0 else 0.40,
            "line_items": line_items,
            "raw_text": raw_text_sample if len(raw_text_sample) < 500 else raw_text_sample[:500] + "..."
        }

    async def ask_copilot(
        self,
        question: str,
        chat_history: List[Dict[str, str]],
        financial_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Rule-based Copilot assistant. Answers user queries by evaluating authentic financial context.
        """
        q_lower = (question or "").lower()

        curr_month_spent = financial_context.get("total_current_month", 0.0)
        total_budget = financial_context.get("total_budget", 0.0)
        daily_burn = financial_context.get("daily_burn_rate", 0.0)
        safe_daily = financial_context.get("recommended_safe_daily_spend", 0.0)
        health_score = financial_context.get("health_score", 0)
        health_grade = financial_context.get("health_grade", "B")
        category_totals = financial_context.get("category_totals", {})
        top_expenses = financial_context.get("top_expenses", [])

        # 1. Health Score Queries
        if any(w in q_lower for w in ["health", "score", "grade", "audit", "status"]):
            answer = (
                f"📊 Your **AI Financial Health Score is {health_score}/100** (Grade **{health_grade}**).\n\n"
                f"* **Current Month Spend**: ₹{curr_month_spent:,.2f}\n"
                f"* **Monthly Budget Limit**: ₹{total_budget:,.2f}\n"
                f"* **Daily Burn Velocity**: ₹{daily_burn:,.2f}/day\n\n"
                f"Keep your daily burn close to your safe daily allowance of **₹{safe_daily:,.2f}/day** to maintain a high score!"
            )
            followups = ["Where am I spending the most?", "What is my safe daily limit?", "How can I improve my health score?"]

        # 2. Category / Top Spend Queries
        elif any(w in q_lower for w in ["where", "most", "category", "highest", "top"]):
            if category_totals:
                sorted_cats = sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
                top_cat, top_amt = sorted_cats[0]
                top_pct = (top_amt / curr_month_spent * 100) if curr_month_spent > 0 else 0
                answer = (
                    f"💸 Your highest spending category this month is **{top_cat}** at **₹{top_amt:,.2f}** ({top_pct:.1f}% of total spend).\n\n"
                    f"**Category Breakdown:**\n" +
                    "\n".join([f"* **{c}**: ₹{a:,.2f}" for c, a in sorted_cats[:4]])
                )
            elif top_expenses:
                top_exp = top_expenses[0]
                answer = (
                    f"💸 Your highest logged expense is **{top_exp['title']}** ({top_exp['category']}) at **₹{top_exp['amount']:,.2f}**.\n\n"
                    f"**Top Logged Expenses:**\n" +
                    "\n".join([f"* **{e['title']}** ({e['category']}): ₹{e['amount']:,.2f}" for e in top_expenses[:4]])
                )
            else:
                answer = "You haven't logged any expenses yet this month. Add an expense or scan a receipt to unlock spending breakdown analytics!"

            followups = ["What is my total spend this month?", "How's my monthly budget doing?", "Give me budget tips"]

        # 3. Daily Limit / Burn Pace Queries
        elif any(w in q_lower for w in ["burn", "daily", "limit", "pace", "safe"]):
            answer = (
                f"⚡ Your current spending pace is **₹{daily_burn:,.2f}/day**.\n\n"
                f"* **Recommended Safe Daily Cap**: ₹{safe_daily:,.2f}/day\n"
                f"* **Total Spent This Month**: ₹{curr_month_spent:,.2f}\n\n"
                f"Staying within ₹{safe_daily:,.2f}/day ensures you finish the month with a healthy financial surplus!"
            )
            followups = ["How's my health score?", "Where is most of my money going?", "Can I afford to spend ₹1000 today?"]

        # 4. Budget / Total Spend Queries
        elif any(w in q_lower for w in ["budget", "total", "spent", "spent this month", "balance"]):
            if total_budget > 0:
                rem = total_budget - curr_month_spent
                answer = (
                    f"💰 You have spent **₹{curr_month_spent:,.2f}** out of your **₹{total_budget:,.2f}** monthly budget limit.\n\n"
                    f"* **Remaining Budget Buffer**: ₹{rem:,.2f}\n"
                    f"* **Utilization**: {(curr_month_spent / total_budget * 100):.1f}%\n"
                )
            else:
                answer = f"💰 You have spent **₹{curr_month_spent:,.2f}** this month. You haven't set an overall monthly budget cap yet. Setting a budget goal helps prevent overruns!"

            followups = ["What is my daily burn pace?", "How's my health score?", "Suggest category budgets"]

        # 5. General Savings Advice / Default
        else:
            answer = (
                f"🤖 **FinTrack AI Copilot Overview**:\n\n"
                f"Here is a real-time summary of your finances:\n"
                f"* 🎯 **Total Spent This Month**: ₹{curr_month_spent:,.2f}\n"
                f"* 🏆 **Health Score**: {health_score}/100 (Grade {health_grade})\n"
                f"* ⚡ **Daily Pace**: ₹{daily_burn:,.2f}/day (Safe Cap: ₹{safe_daily:,.2f}/day)\n\n"
                f"Ask me anything specific about your spending, categories, budget caps, or savings tips!"
            )
            followups = ["How's my health score?", "Where did I spend the most?", "What is my daily burn rate?"]

        return {
            "answer": answer,
            "suggested_followups": followups
        }




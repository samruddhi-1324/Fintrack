import logging
from typing import List, Dict, Any, Optional
import uuid
import calendar
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract

from app.core.config import settings
from app.models.expense import Expense
from app.models.category import Category
from app.models.budget import Budget
from app.services.ai.base import BaseAIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.rule_based_provider import RuleBasedProvider

logger = logging.getLogger(__name__)

class AIService:
    """
    Central AI Recommendation & Insights Service.
    Acts as a factory and facade orchestrating real database aggregates
    and the configured AI Provider (Gemini / OpenAI / Rule-Based).
    """

    _provider_instance: Optional[BaseAIProvider] = None

    @classmethod
    def get_provider(cls) -> BaseAIProvider:
        """Dynamically instantiate or return configured AI Provider."""
        provider_name = (settings.AI_PROVIDER or "gemini").lower().strip()

        if provider_name == "openai":
            return OpenAIProvider()
        elif provider_name == "rule_based":
            return RuleBasedProvider()
        else: # Default: 'gemini'
            return GeminiProvider()

    @classmethod
    async def categorize_title(cls, title: str, user_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """Fetch user's actual categories from PostgreSQL and suggest matching category."""
        # 1. Fetch categories for this user
        result = await db.execute(
            select(Category).where(Category.user_id == user_id).order_by(Category.name.asc())
        )
        categories = [c.name for c in result.scalars().all()]
        if not categories:
            categories = ["Food", "Transport", "Utilities", "Entertainment", "Housing", "Miscellaneous"]

        provider = cls.get_provider()
        return await provider.categorize_expense(title, categories)

    @classmethod
    async def parse_natural_language(cls, text: str, user_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """Fetch categories and parse natural language sentence into structured expense."""
        result = await db.execute(
            select(Category).where(Category.user_id == user_id).order_by(Category.name.asc())
        )
        categories = [c.name for c in result.scalars().all()]
        if not categories:
            categories = ["Food", "Transport", "Utilities", "Entertainment", "Housing", "Miscellaneous"]

        provider = cls.get_provider()
        parsed = await provider.parse_natural_language_expense(text, categories)

        # Match category name to category_id if available
        matched_cat = None
        for cat in result.scalars().all():
            if cat.name.lower() == str(parsed.get("category", "")).lower():
                matched_cat = cat
                break
        
        parsed["category_id"] = str(matched_cat.id) if matched_cat else None
        return parsed

    @classmethod
    async def get_user_spending_insights(cls, user_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """
        Aggregate 100% REAL user transaction data from PostgreSQL:
        - Current month total
        - Previous month total
        - Category-wise totals
        - Category & Overall budgets
        - Budget recommendations
        """
        today = date.today()
        current_year = today.year
        current_month = today.month

        # Calculate previous month & year
        prev_month = 12 if current_month == 1 else current_month - 1
        prev_year = current_year - 1 if current_month == 1 else current_year

        # 1. Current Month Total Spend
        curr_month_total_query = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
        )
        curr_month_total = float(curr_month_total_query.scalar() or 0.0)

        # 2. Previous Month Total Spend
        prev_month_total_query = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                extract("year", Expense.date) == prev_year,
                extract("month", Expense.date) == prev_month
            )
        )
        prev_month_total = float(prev_month_total_query.scalar() or 0.0)

        # 3. Category-wise Spending in Current Month
        cat_spending_query = await db.execute(
            select(Category.name, Category.id, func.coalesce(func.sum(Expense.amount), 0).label("total_spent"))
            .join(Expense, Expense.category_id == Category.id)
            .where(
                Category.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
            .group_by(Category.name, Category.id)
        )
        cat_rows = cat_spending_query.all()
        category_totals = {row[0]: float(row[2]) for row in cat_rows}

        # 4. Budgets
        budgets_query = await db.execute(
            select(Budget).where(Budget.user_id == user_id)
        )
        budgets = budgets_query.scalars().all()
        total_budget = 0.0
        category_budgets = {}

        # Fetch category map
        all_cats_query = await db.execute(select(Category).where(Category.user_id == user_id))
        cat_map = {c.id: c.name for c in all_cats_query.scalars().all()}

        for b in budgets:
            if b.category_id is None:
                total_budget = float(b.amount)
            elif b.category_id in cat_map:
                category_budgets[cat_map[b.category_id]] = float(b.amount)

        # 5. Build Spending Summary Payload
        spending_summary = {
            "total_current_month": curr_month_total,
            "total_previous_month": prev_month_total,
            "total_budget": total_budget,
            "category_totals": category_totals,
            "category_budgets": category_budgets
        }

        # 6. Generate Insights via Active Provider
        provider = cls.get_provider()
        insights = await provider.generate_insights(spending_summary)

        # 7. Generate Budget Recommendations based on real category spend averages
        budget_recommendations = []
        # First add categories with active spending
        for cat_name, spent in category_totals.items():
            current_cap = category_budgets.get(cat_name, 0.0)
            suggested_cap = round((spent * 1.15) / 100) * 100
            if suggested_cap < 500:
                suggested_cap = 500.0

            budget_recommendations.append({
                "category": cat_name,
                "current_spent": spent,
                "current_budget": current_cap,
                "recommended_budget": float(suggested_cap),
                "reason": f"Based on ₹{spent:,.2f} spent this month, a ₹{suggested_cap:,.2f} monthly cap offers a balanced 15% buffer."
            })

        # If user has few category spends, provide starter targets for their other categories
        for cat_id, cat_name in cat_map.items():
            if cat_name not in category_totals and len(budget_recommendations) < 4:
                cat_lower = cat_name.lower()
                baseline_cap = 5000.0 if "food" in cat_lower else (3000.0 if "transport" in cat_lower else (4000.0 if "util" in cat_lower else 2500.0))
                budget_recommendations.append({
                    "category": cat_name,
                    "current_spent": 0.0,
                    "current_budget": category_budgets.get(cat_name, 0.0),
                    "recommended_budget": baseline_cap,
                    "reason": f"Recommended baseline cap for {cat_name} based on balanced 50/30/20 budgeting rule."
                })


        # 8. Financial Sentiment Analysis with Emojis
        if total_budget > 0:
            utilization = (curr_month_total / total_budget) * 100
            if utilization > 120:
                sentiment = {
                    "mood": "distressed",
                    "emoji": "😱 🚨 💸",
                    "headline": "Budget Overrun Critical! 😱",
                    "description": f"You are at {utilization:.1f}% of your budget! Exceeded limit by ₹{(curr_month_total - total_budget):,.2f}. Spending freeze advised!",
                    "burn_rate_emoji": "🔥 Critical Burn"
                }
            elif utilization > 100:
                sentiment = {
                    "mood": "over_limit",
                    "emoji": "💸 💔 ⚠️",
                    "headline": "Monthly Budget Exceeded 💔",
                    "description": f"You've crossed your monthly limit by ₹{(curr_month_total - total_budget):,.2f} ({utilization:.1f}% spent). Trim discretionary expenses.",
                    "burn_rate_emoji": "⚡ High Spend"
                }
            elif utilization >= 80:
                sentiment = {
                    "mood": "cautious",
                    "emoji": "😬 ⚠️ ⏳",
                    "headline": "Approaching Budget Limit 😬",
                    "description": f"Caution: {utilization:.1f}% of monthly limit used. ₹{(total_budget - curr_month_total):,.2f} buffer remaining.",
                    "burn_rate_emoji": "⚠️ Moderate"
                }
            elif curr_month_total > 0:
                sentiment = {
                    "mood": "thriving",
                    "emoji": "🥳 💰 🎯",
                    "headline": "Healthy & Disciplined Spending 🥳",
                    "description": f"Awesome job! Spending is well-controlled at {utilization:.1f}% with ₹{(total_budget - curr_month_total):,.2f} safety buffer.",
                    "burn_rate_emoji": "🌱 Safe & Green"
                }
            else:
                sentiment = {
                    "mood": "zen",
                    "emoji": "🧘 ✨ 💚",
                    "headline": "Clean Financial Slate 🧘",
                    "description": "No spending recorded yet this month. Ready for disciplined budgeting!",
                    "burn_rate_emoji": "💧 Untouched"
                }
        else:
            if curr_month_total > 10000:
                sentiment = {
                    "mood": "cautious",
                    "emoji": "🧐 📊 💡",
                    "headline": "Uncapped Spending Tracked 🧐",
                    "description": f"You've spent ₹{curr_month_total:,.2f} without a monthly budget cap. Set a budget to maintain savings control!",
                    "burn_rate_emoji": "⚡ High Activity"
                }
            else:
                sentiment = {
                    "mood": "zen",
                    "emoji": "🧘 🌟 🎯",
                    "headline": "Financial Tracking Active 🧘",
                    "description": "Log daily expenses and set budget caps to unlock personalized emoji sentiment analysis.",
                    "burn_rate_emoji": "🌱 Balanced"
                }

        return {
            "provider": settings.AI_PROVIDER,
            "model": settings.GEMINI_MODEL if settings.AI_PROVIDER == "gemini" else settings.OPENAI_MODEL,
            "sentiment": sentiment,
            "category_totals": category_totals,
            "summary": {
                "total_current_month": curr_month_total,
                "total_previous_month": prev_month_total,
                "total_budget": total_budget,
                "month_over_month_change_pct": round(((curr_month_total - prev_month_total) / prev_month_total * 100), 1) if prev_month_total > 0 else 0.0
            },
            "insights": insights,
            "budget_recommendations": budget_recommendations
        }


    @classmethod
    async def get_expense_forecast(cls, user_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """
        AI Predictive Expense Forecasting:
        - Daily Burn Rate calculation
        - Month-End Projected Spend
        - Safe Daily Spending Allowance
        - Predicted Budget Exhaustion Day
        - Category-level Month-End Run Rates
        """
        today = date.today()
        current_year = today.year
        current_month = today.month
        days_elapsed = max(today.day, 1)
        total_days_in_month = calendar.monthrange(current_year, current_month)[1]
        days_remaining = max(total_days_in_month - days_elapsed, 0)

        # 1. Total Current Month Spend
        curr_month_total_query = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
        )
        curr_month_total = float(curr_month_total_query.scalar() or 0.0)

        # 2. Overall Budget & Category Budgets
        budgets_query = await db.execute(select(Budget).where(Budget.user_id == user_id))
        budgets = budgets_query.scalars().all()
        total_monthly_budget = 0.0
        category_budgets = {}

        all_cats_query = await db.execute(select(Category).where(Category.user_id == user_id))
        cat_map = {c.id: c.name for c in all_cats_query.scalars().all()}

        for b in budgets:
            if b.category_id is None:
                total_monthly_budget = float(b.amount)
            elif b.category_id in cat_map:
                category_budgets[cat_map[b.category_id]] = float(b.amount)

        # 3. Category Breakdown
        cat_spending_query = await db.execute(
            select(Category.name, Category.id, func.coalesce(func.sum(Expense.amount), 0).label("total_spent"))
            .join(Expense, Expense.category_id == Category.id)
            .where(
                Category.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
            .group_by(Category.name, Category.id)
        )
        cat_rows = cat_spending_query.all()
        category_totals = {row[0]: float(row[2]) for row in cat_rows}

        # 4. Burn Rate & Month-End Projection Calculations
        daily_burn_rate = round(curr_month_total / days_elapsed, 2)
        projected_month_end_spend = round(curr_month_total + (daily_burn_rate * days_remaining), 2)
        projected_variance = round(total_monthly_budget - projected_month_end_spend, 2) if total_monthly_budget > 0 else 0.0

        remaining_budget = max(total_monthly_budget - curr_month_total, 0.0) if total_monthly_budget > 0 else 0.0
        recommended_safe_daily_spend = round(remaining_budget / max(days_remaining, 1), 2) if total_monthly_budget > 0 else daily_burn_rate

        predicted_budget_exhaustion_day = None
        if total_monthly_budget > 0 and daily_burn_rate > 0:
            exhaust_day = int(total_monthly_budget / daily_burn_rate)
            predicted_budget_exhaustion_day = min(max(exhaust_day, 1), total_days_in_month)

        # 5. Determine Status & Narrative Advice
        if total_monthly_budget > 0:
            if projected_month_end_spend > (total_monthly_budget * 1.15):
                forecast_status = "critical"
                forecast_emoji = "🚨 💸 📉"
                forecast_headline = f"Predicted Month-End Budget Overrun of ₹{abs(projected_variance):,.2f}! 🚨"
                forecast_advice = (
                    f"At your current burn rate of ₹{daily_burn_rate:,.2f}/day, your spend will reach ₹{projected_month_end_spend:,.2f} by Day {total_days_in_month}. "
                    f"To stay within budget, reduce your daily spend to ₹{recommended_safe_daily_spend:,.2f}/day for the remaining {days_remaining} days."
                )
            elif projected_month_end_spend > total_monthly_budget:
                forecast_status = "caution"
                forecast_emoji = "⚠️ 😬 ⚡"
                forecast_headline = f"Approaching Deficit: Projected ₹{abs(projected_variance):,.2f} Over Limit ⚠️"
                forecast_advice = (
                    f"Your spending pace (₹{daily_burn_rate:,.2f}/day) is tracking slightly above budget. "
                    f"Trim ₹{(daily_burn_rate - recommended_safe_daily_spend):,.2f}/day to finish with a surplus."
                )
            else:
                forecast_status = "safe"
                forecast_emoji = "🔮 🥳 💰"
                forecast_headline = f"On Track for ₹{projected_variance:,.2f} Month-End Surplus! 🥳"
                forecast_advice = (
                    f"Excellent spending pace! Maintaining your ₹{daily_burn_rate:,.2f}/day rate will keep you ₹{projected_variance:,.2f} under budget by Day {total_days_in_month}."
                )
        else:
            forecast_status = "caution" if daily_burn_rate > 500 else "safe"
            forecast_emoji = "🔮 📊 💡"
            forecast_headline = f"Projected Month-End Spend: ₹{projected_month_end_spend:,.2f} 🔮"
            forecast_advice = (
                f"Based on {days_elapsed} days of spending, your current run rate is ₹{daily_burn_rate:,.2f}/day. "
                f"Setting an overall monthly budget cap will unlock target surplus tracking."
            )

        # 6. Category-level Month-End Forecasts
        category_forecasts = []
        for cat_name, spent in category_totals.items():
            cat_burn = round(spent / days_elapsed, 2)
            cat_projected = round(spent + (cat_burn * days_remaining), 2)
            cat_budget = category_budgets.get(cat_name, 0.0)

            if cat_budget > 0 and cat_projected > cat_budget:
                cat_status = "over_budget"
                cat_emoji = "🚨"
            elif cat_budget > 0 and cat_projected >= (cat_budget * 0.85):
                cat_status = "near_limit"
                cat_emoji = "⚠️"
            else:
                cat_status = "on_track"
                cat_emoji = "🌱"

            category_forecasts.append({
                "category": cat_name,
                "current_spent": spent,
                "projected_month_end": cat_projected,
                "daily_burn_rate": cat_burn,
                "current_budget": cat_budget,
                "status": cat_status,
                "emoji": cat_emoji
            })

        return {
            "provider": settings.AI_PROVIDER,
            "days_elapsed": days_elapsed,
            "days_remaining": days_remaining,
            "total_days_in_month": total_days_in_month,
            "current_spend": curr_month_total,
            "daily_burn_rate": daily_burn_rate,
            "projected_month_end_spend": projected_month_end_spend,
            "total_monthly_budget": total_monthly_budget,
            "projected_variance": projected_variance,
            "recommended_safe_daily_spend": recommended_safe_daily_spend,
            "predicted_budget_exhaustion_day": predicted_budget_exhaustion_day,
            "forecast_status": forecast_status,
            "forecast_emoji": forecast_emoji,
            "forecast_headline": forecast_headline,
            "forecast_advice": forecast_advice,
            "category_forecasts": category_forecasts
        }

    @classmethod
    async def get_financial_health_score(cls, user_id: uuid.UUID, db: AsyncSession) -> Dict[str, Any]:
        """
        Calculates a 0-100 Financial Health Score based on 4 pillars:
        1. Budget Adherence (30 pts)
        2. Spending Velocity & Burn Pace (25 pts)
        3. Category Concentration Risk (25 pts)
        4. Month-over-Month Savings Progression (20 pts)
        """
        today = date.today()
        current_year = today.year
        current_month = today.month
        days_elapsed = max(today.day, 1)
        total_days_in_month = calendar.monthrange(current_year, current_month)[1]

        prev_month = 12 if current_month == 1 else current_month - 1
        prev_year = current_year - 1 if current_month == 1 else current_year

        # 1. Total Current Month Spend
        curr_month_total_query = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
        )
        curr_month_total = float(curr_month_total_query.scalar() or 0.0)

        # 2. Total Previous Month Spend
        prev_month_total_query = await db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                Expense.user_id == user_id,
                extract("year", Expense.date) == prev_year,
                extract("month", Expense.date) == prev_month
            )
        )
        prev_month_total = float(prev_month_total_query.scalar() or 0.0)

        # 3. Overall Monthly Budget
        budgets_query = await db.execute(select(Budget).where(Budget.user_id == user_id))
        budgets = budgets_query.scalars().all()
        total_monthly_budget = 0.0
        for b in budgets:
            if b.category_id is None and b.period == "monthly":
                total_monthly_budget = float(b.amount)
                break

        # 4. Category Spending Breakdown
        cat_spending_query = await db.execute(
            select(Category.name, func.coalesce(func.sum(Expense.amount), 0).label("total_spent"))
            .join(Expense, Expense.category_id == Category.id)
            .where(
                Category.user_id == user_id,
                extract("year", Expense.date) == current_year,
                extract("month", Expense.date) == current_month
            )
            .group_by(Category.name)
        )
        cat_rows = cat_spending_query.all()
        category_totals = {row[0]: float(row[1]) for row in cat_rows}

        actionable_tips = []

        # --- PILLAR 1: Budget Adherence (30 pts) ---
        if total_monthly_budget > 0:
            utilization = (curr_month_total / total_monthly_budget) * 100
            if utilization <= 80:
                p1_score = 30
                p1_status = "excellent"
                p1_emoji = "🏆"
                p1_feedback = f"Optimal control! Spending is at {utilization:.1f}% of your monthly limit."
            elif utilization <= 100:
                p1_score = 24
                p1_status = "good"
                p1_emoji = "🌱"
                p1_feedback = f"Approaching limit ({utilization:.1f}% used). Minor buffer remaining."
            elif utilization <= 115:
                p1_score = 12
                p1_status = "fair"
                p1_emoji = "⚠️"
                p1_feedback = f"Exceeded monthly budget by {utilization - 100:.1f}%. Spending discipline needed."
                actionable_tips.append("Pause discretionary expenses to prevent deeper budget deficit.")
            else:
                p1_score = 5
                p1_status = "poor"
                p1_emoji = "🚨"
                p1_feedback = f"Severe budget overrun ({utilization:.1f}% spent). Over by ₹{(curr_month_total - total_monthly_budget):,.2f}."
                actionable_tips.append("Immediately freeze non-essential spending to recover budget balance.")
        else:
            p1_score = 15
            p1_status = "fair"
            p1_emoji = "💡"
            p1_feedback = "No overall monthly budget set. Setting a budget earns +15 health points."
            actionable_tips.append("Set an overall monthly spending budget goal to boost your score by +15 pts.")

        # --- PILLAR 2: Spending Velocity & Burn Rate (25 pts) ---
        daily_burn_rate = curr_month_total / days_elapsed
        expected_daily_pace = (total_monthly_budget / total_days_in_month) if total_monthly_budget > 0 else 1000.0
        burn_ratio = daily_burn_rate / expected_daily_pace if expected_daily_pace > 0 else 1.0

        if burn_ratio <= 0.85:
            p2_score = 25
            p2_status = "excellent"
            p2_emoji = "⚡"
            p2_feedback = f"Low burn rate (₹{daily_burn_rate:,.2f}/day). Spending pace is well-controlled."
        elif burn_ratio <= 1.05:
            p2_score = 20
            p2_status = "good"
            p2_emoji = "🌱"
            p2_feedback = f"Balanced pace (₹{daily_burn_rate:,.2f}/day). Aligns with monthly projection."
        elif burn_ratio <= 1.3:
            p2_score = 12
            p2_status = "fair"
            p2_emoji = "⚠️"
            p2_feedback = f"Accelerated burn pace (₹{daily_burn_rate:,.2f}/day). Above recommended daily allowance."
            actionable_tips.append(f"Cap daily expenditure at ₹{expected_daily_pace:,.2f}/day to restore green burn velocity.")
        else:
            p2_score = 5
            p2_status = "poor"
            p2_emoji = "🔥"
            p2_feedback = f"High burn velocity (₹{daily_burn_rate:,.2f}/day). Risk of early budget exhaustion."
            actionable_tips.append("Cut daily burn pace by at least 25% for the remaining days of the month.")

        # --- PILLAR 3: Category Diversification & Concentration Risk (25 pts) ---
        if category_totals and curr_month_total > 0:
            top_cat, top_spent = max(category_totals.items(), key=lambda x: x[1])
            concentration_pct = (top_spent / curr_month_total) * 100

            if concentration_pct <= 40:
                p3_score = 25
                p3_status = "excellent"
                p3_emoji = "📊"
                p3_feedback = "Well-diversified! No single category dominates your monthly expenditures."
            elif concentration_pct <= 60:
                p3_score = 18
                p3_status = "good"
                p3_emoji = "⚖️"
                p3_feedback = f"{top_cat} accounts for {concentration_pct:.1f}% of spending. Moderate concentration."
                actionable_tips.append(f"Set a dedicated category limit for {top_cat} to protect remaining categories.")
            else:
                p3_score = 10
                p3_status = "poor"
                p3_emoji = "🚨"
                p3_feedback = f"High concentration in {top_cat} ({concentration_pct:.1f}% of total spend)."
                actionable_tips.append(f"Diversify spending: {top_cat} absorbs >60% of your money. Optimize {top_cat} expenses.")
        else:
            p3_score = 25
            p3_status = "excellent"
            p3_emoji = "✨"
            p3_feedback = "Balanced category distribution."

        # --- PILLAR 4: Month-over-Month Savings Progression (20 pts) ---
        if prev_month_total > 0 and curr_month_total > 0:
            mom_pct = ((curr_month_total - prev_month_total) / prev_month_total) * 100
            if mom_pct <= -10:
                p4_score = 20
                p4_status = "excellent"
                p4_emoji = "💰"
                p4_feedback = f"Outstanding progress! Spending is {abs(mom_pct):.1f}% lower than last month."
            elif mom_pct <= 10:
                p4_score = 16
                p4_status = "good"
                p4_emoji = "🌱"
                p4_feedback = "Consistent baseline with last month's spending patterns."
            elif mom_pct <= 30:
                p4_score = 10
                p4_status = "fair"
                p4_emoji = "⚠️"
                p4_feedback = f"Spending increased by {mom_pct:.1f}% compared to last month."
                actionable_tips.append("Review recent spikes to match last month's lower spending totals.")
            else:
                p4_score = 5
                p4_status = "poor"
                p4_emoji = "📈"
                p4_feedback = f"Spike detected (+{mom_pct:.1f}% MoM). Notable jump in monthly outflow."
                actionable_tips.append("Perform a monthly expense audit to pinpoint areas where spending jumped.")
        else:
            p4_score = 16
            p4_status = "good"
            p4_emoji = "🧘"
            p4_feedback = "Initial tracking period active. Establish continuous logs for MoM comparisons."

        # --- Total Score Calculation & Grading ---
        total_score = min(max(p1_score + p2_score + p3_score + p4_score, 0), 100)

        if total_score >= 85:
            grade = "A+"
            tier = "Financial Master"
            tier_emoji = "🏆"
            verdict = "Outstanding financial health! Your budgeting, burn velocity, and diversification are exemplary."
        elif total_score >= 70:
            grade = "A"
            tier = "Disciplined Spender"
            tier_emoji = "🌱"
            verdict = "Strong financial health. Keep maintaining your daily run rates and category balance."
        elif total_score >= 55:
            grade = "B"
            tier = "Moderate Health"
            tier_emoji = "⚖️"
            verdict = "Fair financial habits. Fine-tuning daily limits and high-spend categories will elevate your score to Grade A."
        elif total_score >= 40:
            grade = "C"
            tier = "Needs Optimization"
            tier_emoji = "⚠️"
            verdict = "Budget pressure detected. Applying AI budget recommendations will rapidly boost your financial health."
        else:
            grade = "D"
            tier = "Budget at Risk"
            tier_emoji = "🚨"
            verdict = "Critical budget alert. Implement recommended spending freezes to regain financial equilibrium."

        if not actionable_tips:
            actionable_tips.append("Maintain your current daily spending cadence to preserve your Grade A+ health rating!")

        return {
            "provider": settings.AI_PROVIDER,
            "score": total_score,
            "grade": grade,
            "tier": tier,
            "tier_emoji": tier_emoji,
            "summary_verdict": verdict,
            "pillars": [
                {
                    "name": "Budget Adherence",
                    "score": p1_score,
                    "max_score": 30,
                    "status": p1_status,
                    "emoji": p1_emoji,
                    "feedback": p1_feedback
                },
                {
                    "name": "Daily Burn Velocity",
                    "score": p2_score,
                    "max_score": 25,
                    "status": p2_status,
                    "emoji": p2_emoji,
                    "feedback": p2_feedback
                },
                {
                    "name": "Category Diversification",
                    "score": p3_score,
                    "max_score": 25,
                    "status": p3_status,
                    "emoji": p3_emoji,
                    "feedback": p3_feedback
                },
                {
                    "name": "MoM Savings Progression",
                    "score": p4_score,
                    "max_score": 20,
                    "status": p4_status,
                    "emoji": p4_emoji,
                    "feedback": p4_feedback
                }
            ],
            "actionable_tips": actionable_tips
        }

    @classmethod
    async def scan_receipt_image(cls, user_id: uuid.UUID, image_bytes: bytes, mime_type: str, db: AsyncSession) -> Dict[str, Any]:
        """
        Fetch authentic user categories and scan receipt image via active AI Vision provider.
        Resolves category UUID if available.
        """
        result = await db.execute(
            select(Category).where(Category.user_id == user_id).order_by(Category.name.asc())
        )
        user_categories = result.scalars().all()
        category_names = [c.name for c in user_categories]
        if not category_names:
            category_names = ["Food", "Transport", "Utilities", "Entertainment", "Housing", "Miscellaneous"]

        provider = cls.get_provider()
        parsed_receipt = await provider.scan_receipt(image_bytes, mime_type, category_names)

        # Match category name to category_id
        matched_cat_id = None
        predicted_cat_name = parsed_receipt.get("category", "")
        for cat in user_categories:
            if cat.name.lower() == predicted_cat_name.lower():
                matched_cat_id = str(cat.id)
                break

        parsed_receipt["category_id"] = matched_cat_id
        parsed_receipt["provider"] = settings.AI_PROVIDER
        return parsed_receipt

    @classmethod
    async def ask_copilot(
        cls,
        user_id: uuid.UUID,
        question: str,
        chat_history: List[Dict[str, str]],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Gathers 100% authentic user financial context from PostgreSQL:
        - Spend aggregates & MoM change
        - Active category budgets & total budget
        - Daily burn rate & safe daily allowance
        - Financial Health Score (0-100) & Grade
        - Top recent transactions
        Passes context to the active AI Provider.
        """
        # Fetch insights & forecast aggregates
        insights_data = await cls.get_user_spending_insights(user_id, db)
        forecast_data = await cls.get_expense_forecast(user_id, db)
        health_data = await cls.get_financial_health_score(user_id, db)

        # Fetch top 5 recent expenses
        top_exp_query = await db.execute(
            select(Expense, Category.name.label("category_name"))
            .join(Category, Expense.category_id == Category.id)
            .where(Expense.user_id == user_id)
            .order_by(Expense.amount.desc())
            .limit(5)
        )
        top_expenses = [
            {
                "title": exp.title,
                "amount": float(exp.amount),
                "category": cat_name,
                "date": exp.date.isoformat(),
                "payment_mode": exp.payment_mode
            }
            for exp, cat_name in top_exp_query.all()
        ]

        cat_totals = insights_data.get("category_totals", {})
        if not cat_totals:
            all_time_query = await db.execute(
                select(Category.name, func.coalesce(func.sum(Expense.amount), 0).label("total_spent"))
                .join(Expense, Expense.category_id == Category.id)
                .where(Category.user_id == user_id)
                .group_by(Category.name)
            )
            cat_totals = {row[0]: float(row[1]) for row in all_time_query.all() if float(row[1]) > 0}

        financial_context = {
            "total_current_month": insights_data["summary"]["total_current_month"],
            "total_previous_month": insights_data["summary"]["total_previous_month"],
            "total_budget": insights_data["summary"]["total_budget"],
            "category_totals": cat_totals,
            "daily_burn_rate": forecast_data["daily_burn_rate"],
            "recommended_safe_daily_spend": forecast_data["recommended_safe_daily_spend"],
            "health_score": health_data["score"],
            "health_grade": health_data["grade"],
            "health_tier": health_data["tier"],
            "top_expenses": top_expenses
        }

        provider = cls.get_provider()
        res = await provider.ask_copilot(question, chat_history, financial_context)

        res["provider"] = settings.AI_PROVIDER
        return res






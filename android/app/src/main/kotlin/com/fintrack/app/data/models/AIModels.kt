package com.fintrack.app.data.models

import com.google.gson.annotations.SerializedName

// 1. Health Score
data class HealthScoreResponse(
    @SerializedName("score") val score: Int,
    @SerializedName("grade") val grade: String,
    @SerializedName("tier_title") val tierTitle: String,
    @SerializedName("headline") val headline: String,
    @SerializedName("pillars") val pillars: Map<String, PillarDetail> = emptyMap(),
    @SerializedName("recommendations") val recommendations: List<String> = emptyList()
)

data class PillarDetail(
    @SerializedName("name") val name: String,
    @SerializedName("score") val score: Int,
    @SerializedName("max_score") val maxScore: Int,
    @SerializedName("emoji") val emoji: String,
    @SerializedName("status") val status: String,
    @SerializedName("feedback") val feedback: String
)

// 2. Forecast
data class ForecastResponse(
    @SerializedName("current_spend") val currentSpend: Double,
    @SerializedName("daily_burn_rate") val dailyBurnRate: Double,
    @SerializedName("projected_month_end_spend") val projectedMonthEndSpend: Double,
    @SerializedName("monthly_budget") val monthlyBudget: Double,
    @SerializedName("projected_variance") val projectedVariance: Double,
    @SerializedName("is_projected_over_budget") val isProjectedOverBudget: Boolean,
    @SerializedName("recommended_daily_spend") val recommendedDailySpend: Double,
    @SerializedName("predicted_exhaustion_day") val predictedExhaustionDay: Int? = null,
    @SerializedName("status") val status: String,
    @SerializedName("headline") val headline: String,
    @SerializedName("narrative") val narrative: String
)

// 3. Receipt Scan OCR
data class ReceiptScanResponse(
    @SerializedName("merchant") val merchant: String? = null,
    @SerializedName("amount") val amount: Double? = null,
    @SerializedName("date") val date: String? = null,
    @SerializedName("payment_mode") val paymentMode: String = "cash",
    @SerializedName("category") val category: String? = null,
    @SerializedName("line_items") val lineItems: List<ReceiptLineItem> = emptyList(),
    @SerializedName("confidence") val confidence: Double = 0.0,
    @SerializedName("raw_text") val rawText: String? = null
)

data class ReceiptLineItem(
    @SerializedName("name") val name: String,
    @SerializedName("price") val price: Double
)

// 4. NLP Parsing
data class NLPParseRequest(
    @SerializedName("text") val text: String
)

data class NLPParseResponse(
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("category") val category: String? = null,
    @SerializedName("category_id") val categoryId: String? = null,
    @SerializedName("payment_mode") val paymentMode: String = "upi",
    @SerializedName("date") val date: String? = null,
    @SerializedName("confidence") val confidence: Double = 1.0
)

// 5. Copilot Chat
data class AICopilotChatMessage(
    @SerializedName("role") val role: String = "user",
    @SerializedName("content") val content: String
)

data class AICopilotRequest(
    @SerializedName("question") val question: String? = null,
    @SerializedName("message") val message: String? = null,
    @SerializedName("chat_history") val chatHistory: List<AICopilotChatMessage> = emptyList()
)

data class AICopilotResponse(
    @SerializedName("provider") val provider: String = "rule_based",
    @SerializedName("answer") val answer: String? = null,
    @SerializedName("reply") val reply: String? = null,
    @SerializedName("suggested_followups") val suggestedFollowups: List<String> = emptyList(),
    @SerializedName("suggested_actions") val suggestedActions: List<String> = emptyList()
) {
    val displayReply: String
        get() = reply ?: answer ?: "Here is your financial update."

    val displayActions: List<String>
        get() = if (suggestedFollowups.isNotEmpty()) suggestedFollowups else suggestedActions
}

// 6. Anomalies
data class AnomalyDetectionResponse(
    @SerializedName("has_anomalies") val hasAnomalies: Boolean = false,
    @SerializedName("anomalies_count") val anomaliesCount: Int = 0,
    @SerializedName("subscription_hikes") val subscriptionHikes: List<SubscriptionHike> = emptyList(),
    @SerializedName("duplicate_charges") val duplicateCharges: List<DuplicateCharge> = emptyList(),
    @SerializedName("category_spikes") val categorySpikes: List<CategorySpike> = emptyList()
)

data class SubscriptionHike(
    @SerializedName("merchant") val merchant: String,
    @SerializedName("previous_amount") val previousAmount: Double,
    @SerializedName("current_amount") val currentAmount: Double,
    @SerializedName("percentage_hike") val percentageHike: Double
)

data class DuplicateCharge(
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("date") val date: String,
    @SerializedName("count") val count: Int
)

data class CategorySpike(
    @SerializedName("category_name") val categoryName: String,
    @SerializedName("current_spend") val currentSpend: Double,
    @SerializedName("average_spend") val averageSpend: Double,
    @SerializedName("percentage_increase") val percentageIncrease: Double
)

// 7. Group Bill Splitter
data class SplitBillRequest(
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("title") val title: String,
    @SerializedName("paid_by") val paidBy: String,
    @SerializedName("participants") val participants: List<String>,
    @SerializedName("split_type") val splitType: String = "equal",
    @SerializedName("custom_shares") val customShares: Map<String, Double>? = null
)

data class SplitBillResponse(
    @SerializedName("title") val title: String,
    @SerializedName("total_amount") val totalAmount: Double,
    @SerializedName("paid_by") val paidBy: String,
    @SerializedName("shares") val shares: Map<String, Double>,
    @SerializedName("settlements") val settlements: List<DebtSettlement>,
    @SerializedName("whatsapp_summary") val whatsappSummary: String
)

data class DebtSettlement(
    @SerializedName("from_person") val fromPerson: String,
    @SerializedName("to_person") val toPerson: String,
    @SerializedName("amount") val amount: Double
)

// 8. Tax Assistant (Indian Context)
data class TaxAssistantResponse(
    @SerializedName("financial_year") val financialYear: String,
    @SerializedName("regime_recommendation") val regimeRecommendation: TaxRegimeRecommendation,
    @SerializedName("deductions") val deductions: List<TaxDeductionItem>,
    @SerializedName("gst_itc_breakdown") val gstItcBreakdown: GSTITCBreakdown,
    @SerializedName("deductible_expenses") val deductibleExpenses: List<TaxDeductibleExpense>
)

data class TaxRegimeRecommendation(
    @SerializedName("recommended_regime") val recommendedRegime: String,
    @SerializedName("estimated_tax_old") val estimatedTaxOld: Double,
    @SerializedName("estimated_tax_new") val estimatedTaxNew: Double,
    @SerializedName("estimated_savings") val estimatedSavings: Double,
    @SerializedName("summary") val summary: String
)

data class TaxDeductionItem(
    @SerializedName("section") val section: String,
    @SerializedName("limit") val limit: Double,
    @SerializedName("claimed_amount") val claimedAmount: Double,
    @SerializedName("remaining_limit") val remainingLimit: Double,
    @SerializedName("utilization_percentage") val utilizationPercentage: Double
)

data class GSTITCBreakdown(
    @SerializedName("total_gst_paid") val totalGstPaid: Double,
    @SerializedName("eligible_itc") val eligibleItc: Double,
    @SerializedName("blocked_itc") val blockedItc: Double
)

data class TaxDeductibleExpense(
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("date") val date: String,
    @SerializedName("section") val section: String,
    @SerializedName("is_gst_eligible") val isGstEligible: Boolean
)

// 9. Savings Challenges
data class SavingsChallengesResponse(
    @SerializedName("streak_days") val streakDays: Int = 0,
    @SerializedName("total_xp") val totalXp: Int = 0,
    @SerializedName("current_level") val currentLevel: String = "Novice Saver",
    @SerializedName("challenges") val challenges: List<SavingsChallengeItem> = emptyList()
)

data class SavingsChallengeItem(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("target_amount") val targetAmount: Double,
    @SerializedName("current_progress") val currentProgress: Double,
    @SerializedName("xp_reward") val xpReward: Int,
    @SerializedName("is_completed") val isCompleted: Boolean,
    @SerializedName("is_claimed") val isClaimed: Boolean
)

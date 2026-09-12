package com.fintrack.app.data.models

import com.google.gson.annotations.SerializedName

data class BudgetResponse(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("category_id") val categoryId: String? = null,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("amount") val amount: Double,
    @SerializedName("spent") val spent: Double = 0.0,
    @SerializedName("remaining") val remaining: Double = 0.0,
    @SerializedName("percentage_used") val percentageUsed: Double = 0.0,
    @SerializedName("period") val period: String = "monthly",
    @SerializedName("created_at") val createdAt: String? = null
)

data class BudgetCreateRequest(
    @SerializedName("category_id") val categoryId: String? = null,
    @SerializedName("amount") val amount: Double,
    @SerializedName("period") val period: String = "monthly"
)

data class BudgetUpdateRequest(
    @SerializedName("category_id") val categoryId: String? = null,
    @SerializedName("amount") val amount: Double? = null,
    @SerializedName("period") val period: String? = null
)

data class BudgetSummaryResponse(
    @SerializedName("total_budget") val totalBudget: Double = 0.0,
    @SerializedName("total_spent") val totalSpent: Double = 0.0,
    @SerializedName("total_remaining") val totalRemaining: Double = 0.0,
    @SerializedName("overall_percentage") val overallPercentage: Double = 0.0,
    @SerializedName("budgets") val budgets: List<BudgetResponse> = emptyList()
)

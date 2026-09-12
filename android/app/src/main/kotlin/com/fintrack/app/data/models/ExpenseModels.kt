package com.fintrack.app.data.models

import com.google.gson.annotations.SerializedName

data class ExpenseResponse(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("category_id") val categoryId: String,
    @SerializedName("category_name") val categoryName: String? = null,
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("date") val date: String,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("payment_mode") val paymentMode: String = "cash",
    @SerializedName("created_at") val createdAt: String? = null
)

data class ExpenseCreateRequest(
    @SerializedName("category_id") val categoryId: String,
    @SerializedName("title") val title: String,
    @SerializedName("amount") val amount: Double,
    @SerializedName("date") val date: String,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("payment_mode") val paymentMode: String = "cash"
)

data class ExpenseUpdateRequest(
    @SerializedName("category_id") val categoryId: String? = null,
    @SerializedName("title") val title: String? = null,
    @SerializedName("amount") val amount: Double? = null,
    @SerializedName("date") val date: String? = null,
    @SerializedName("notes") val notes: String? = null,
    @SerializedName("payment_mode") val paymentMode: String? = null
)

data class ExpenseListResponse(
    @SerializedName("items") val items: List<ExpenseResponse> = emptyList(),
    @SerializedName("total") val total: Int = 0,
    @SerializedName("page") val page: Int = 1,
    @SerializedName("page_size") val pageSize: Int = 20,
    @SerializedName("total_pages") val totalPages: Int = 1,
    @SerializedName("total_amount") val totalAmount: Double = 0.0
)

data class DashboardSummaryResponse(
    @SerializedName("total_expenses_this_month") val totalExpensesThisMonth: Double = 0.0,
    @SerializedName("total_expenses_last_month") val totalExpensesLastMonth: Double = 0.0,
    @SerializedName("mom_percentage_change") val momPercentageChange: Double? = null,
    @SerializedName("recent_expenses") val recentExpenses: List<ExpenseResponse> = emptyList(),
    @SerializedName("spending_by_category") val spendingByCategory: Map<String, Double> = emptyMap(),
    @SerializedName("spending_by_payment_mode") val spendingByPaymentMode: Map<String, Double> = emptyMap()
)

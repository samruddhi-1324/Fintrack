package com.fintrack.app.data.repository

import com.fintrack.app.data.client.ApiClient
import com.fintrack.app.data.models.*

class ExpenseRepository {

    private val expenseApi get() = ApiClient.expenseApi
    private val categoryApi get() = ApiClient.categoryApi

    suspend fun getExpenses(
        page: Int = 1,
        pageSize: Int = 20,
        categoryId: String? = null,
        paymentMode: String? = null,
        startDate: String? = null,
        endDate: String? = null,
        search: String? = null
    ): Result<ExpenseListResponse> {
        return try {
            val response = expenseApi.getExpenses(
                page = page,
                pageSize = pageSize,
                categoryId = categoryId,
                paymentMode = paymentMode,
                startDate = startDate,
                endDate = endDate,
                search = search
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch expenses"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createExpense(
        title: String,
        amount: Double,
        categoryId: String,
        date: String,
        notes: String?,
        paymentMode: String
    ): Result<ExpenseResponse> {
        return try {
            val request = ExpenseCreateRequest(
                categoryId = categoryId,
                title = title.trim(),
                amount = amount,
                date = date,
                notes = notes?.trim(),
                paymentMode = paymentMode
            )
            val response = expenseApi.createExpense(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to create expense"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateExpense(
        id: String,
        title: String?,
        amount: Double?,
        categoryId: String?,
        date: String?,
        notes: String?,
        paymentMode: String?
    ): Result<ExpenseResponse> {
        return try {
            val request = ExpenseUpdateRequest(
                categoryId = categoryId,
                title = title?.trim(),
                amount = amount,
                date = date,
                notes = notes?.trim(),
                paymentMode = paymentMode
            )
            val response = expenseApi.updateExpense(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to update expense"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteExpense(id: String): Result<String> {
        return try {
            val response = expenseApi.deleteExpense(id)
            if (response.isSuccessful) {
                Result.success(response.body()?.message ?: "Expense deleted successfully")
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to delete expense"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getCategories(): Result<List<CategoryResponse>> {
        return try {
            val response = categoryApi.getCategories()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch categories"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getDashboardSummary(): Result<DashboardSummaryResponse> {
        return try {
            val response = expenseApi.getDashboardSummary()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to load dashboard summary"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

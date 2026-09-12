package com.fintrack.app.data.repository

import com.fintrack.app.data.client.ApiClient
import com.fintrack.app.data.models.*

class BudgetRepository {

    private val budgetApi get() = ApiClient.budgetApi

    suspend fun getBudgets(): Result<List<BudgetResponse>> {
        return try {
            val response = budgetApi.getBudgets()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch budgets"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getBudgetSummary(): Result<BudgetSummaryResponse> {
        return try {
            val response = budgetApi.getBudgetSummary()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to fetch budget summary"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createBudget(amount: Double, categoryId: String?, period: String = "monthly"): Result<BudgetResponse> {
        return try {
            val request = BudgetCreateRequest(categoryId = categoryId, amount = amount, period = period)
            val response = budgetApi.createBudget(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to set budget"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun deleteBudget(id: String): Result<String> {
        return try {
            val response = budgetApi.deleteBudget(id)
            if (response.isSuccessful) {
                Result.success(response.body()?.message ?: "Budget removed")
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to delete budget"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

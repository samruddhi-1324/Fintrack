package com.fintrack.app.data.api

import com.fintrack.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface BudgetApi {

    @GET("budgets")
    suspend fun getBudgets(): Response<List<BudgetResponse>>

    @GET("budgets/summary")
    suspend fun getBudgetSummary(): Response<BudgetSummaryResponse>

    @POST("budgets")
    suspend fun createBudget(@Body request: BudgetCreateRequest): Response<BudgetResponse>

    @PUT("budgets/{id}")
    suspend fun updateBudget(
        @Path("id") id: String,
        @Body request: BudgetUpdateRequest
    ): Response<BudgetResponse>

    @DELETE("budgets/{id}")
    suspend fun deleteBudget(@Path("id") id: String): Response<MessageResponse>
}

package com.fintrack.app.data.api

import com.fintrack.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ExpenseApi {

    @GET("expenses")
    suspend fun getExpenses(
        @Query("page") page: Int = 1,
        @Query("page_size") pageSize: Int = 20,
        @Query("category_id") categoryId: String? = null,
        @Query("payment_mode") paymentMode: String? = null,
        @Query("start_date") startDate: String? = null,
        @Query("end_date") endDate: String? = null,
        @Query("search") search: String? = null,
        @Query("sort_by") sortBy: String = "date",
        @Query("sort_order") sortOrder: String = "desc"
    ): Response<ExpenseListResponse>

    @GET("expenses/{id}")
    suspend fun getExpenseById(@Path("id") id: String): Response<ExpenseResponse>

    @POST("expenses")
    suspend fun createExpense(@Body request: ExpenseCreateRequest): Response<ExpenseResponse>

    @PUT("expenses/{id}")
    suspend fun updateExpense(
        @Path("id") id: String,
        @Body request: ExpenseUpdateRequest
    ): Response<ExpenseResponse>

    @DELETE("expenses/{id}")
    suspend fun deleteExpense(@Path("id") id: String): Response<MessageResponse>

    @GET("dashboard/summary")
    suspend fun getDashboardSummary(): Response<DashboardSummaryResponse>
}

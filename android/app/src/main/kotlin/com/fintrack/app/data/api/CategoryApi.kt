package com.fintrack.app.data.api

import com.fintrack.app.data.models.CategoryCreateRequest
import com.fintrack.app.data.models.CategoryResponse
import com.fintrack.app.data.models.CategoryUpdateRequest
import com.fintrack.app.data.models.MessageResponse
import retrofit2.Response
import retrofit2.http.*

interface CategoryApi {

    @GET("categories")
    suspend fun getCategories(): Response<List<CategoryResponse>>

    @POST("categories")
    suspend fun createCategory(@Body request: CategoryCreateRequest): Response<CategoryResponse>

    @PUT("categories/{id}")
    suspend fun updateCategory(
        @Path("id") id: String,
        @Body request: CategoryUpdateRequest
    ): Response<CategoryResponse>

    @DELETE("categories/{id}")
    suspend fun deleteCategory(@Path("id") id: String): Response<MessageResponse>
}

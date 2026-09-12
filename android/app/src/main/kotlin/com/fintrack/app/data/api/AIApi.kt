package com.fintrack.app.data.api

import com.fintrack.app.data.models.*
import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.*

interface AIApi {

    @GET("ai/health-score")
    suspend fun getHealthScore(): Response<HealthScoreResponse>

    @GET("ai/forecast")
    suspend fun getForecast(): Response<ForecastResponse>

    @POST("ai/parse-expense")
    suspend fun parseNLP(@Body request: NLPParseRequest): Response<NLPParseResponse>

    @Multipart
    @POST("ai/scan-receipt")
    suspend fun scanReceipt(@Part image: MultipartBody.Part): Response<ReceiptScanResponse>

    @POST("ai/copilot")
    suspend fun sendCopilotMessage(@Body request: AICopilotRequest): Response<AICopilotResponse>

    @GET("ai/anomalies")
    suspend fun getAnomalies(): Response<AnomalyDetectionResponse>

    @POST("ai/split-bill")
    suspend fun splitBill(@Body request: SplitBillRequest): Response<SplitBillResponse>

    @GET("ai/tax-assistant")
    suspend fun getTaxAssistant(): Response<TaxAssistantResponse>

    @GET("ai/challenges")
    suspend fun getSavingsChallenges(): Response<SavingsChallengesResponse>

    @POST("ai/challenges/{id}/claim")
    suspend fun claimSavingsChallenge(@Path("id") challengeId: String): Response<MessageResponse>
}

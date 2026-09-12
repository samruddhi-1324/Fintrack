package com.fintrack.app.data.repository

import com.fintrack.app.data.client.ApiClient
import com.fintrack.app.data.models.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

class AIRepository {

    private val aiApi get() = ApiClient.aiApi

    suspend fun getHealthScore(): Result<HealthScoreResponse> {
        return try {
            val response = aiApi.getHealthScore()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to calculate Health Score"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getForecast(): Result<ForecastResponse> {
        return try {
            val response = aiApi.getForecast()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to compute forecast"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun parseNLP(text: String): Result<NLPParseResponse> {
        return try {
            val response = aiApi.parseNLP(NLPParseRequest(text))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to parse text with AI"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun scanReceipt(imageFile: File): Result<ReceiptScanResponse> {
        return try {
            val requestFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
            val part = MultipartBody.Part.createFormData("file", imageFile.name, requestFile)
            val response = aiApi.scanReceipt(part)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Receipt scanning failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun sendCopilotMessage(
        message: String,
        chatHistory: List<AICopilotChatMessage> = emptyList()
    ): Result<AICopilotResponse> {
        return try {
            val response = aiApi.sendCopilotMessage(
                AICopilotRequest(
                    question = message,
                    message = message,
                    chatHistory = chatHistory
                )
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                val errorMsg = response.errorBody()?.string() ?: "Copilot query failed (${response.code()})"
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAnomalies(): Result<AnomalyDetectionResponse> {
        return try {
            val response = aiApi.getAnomalies()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Anomaly detection failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun splitBill(
        title: String,
        totalAmount: Double,
        paidBy: String,
        participants: List<String>,
        splitType: String = "equal",
        customShares: Map<String, Double>? = null
    ): Result<SplitBillResponse> {
        return try {
            val request = SplitBillRequest(
                totalAmount = totalAmount,
                title = title,
                paidBy = paidBy,
                participants = participants,
                splitType = splitType,
                customShares = customShares
            )
            val response = aiApi.splitBill(request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Bill split failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getTaxAssistant(): Result<TaxAssistantResponse> {
        return try {
            val response = aiApi.getTaxAssistant()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Tax assistant failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSavingsChallenges(): Result<SavingsChallengesResponse> {
        return try {
            val response = aiApi.getSavingsChallenges()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Savings challenges failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun claimSavingsChallenge(challengeId: String): Result<String> {
        return try {
            val response = aiApi.claimSavingsChallenge(challengeId)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.message)
            } else {
                Result.failure(Exception(response.errorBody()?.string() ?: "Failed to claim reward"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

package com.fintrack.app.data.repository

import com.fintrack.app.data.client.ApiClient
import com.fintrack.app.data.local.TokenManager
import com.fintrack.app.data.models.*
import kotlinx.coroutines.flow.Flow
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException

class AuthRepository(private val tokenManager: TokenManager) {

    private val authApi get() = ApiClient.authApi

    val isLoggedIn: Flow<Boolean> = tokenManager.isLoggedIn

    private fun parseErrorMessage(rawError: String?, fallback: String): String {
        if (rawError.isNullOrBlank()) return fallback
        return try {
            val json = JSONObject(rawError)
            if (json.has("detail")) {
                val detail = json.get("detail")
                if (detail is JSONArray && detail.length() > 0) {
                    val first = detail.getJSONObject(0)
                    first.optString("msg", fallback)
                } else {
                    detail.toString()
                }
            } else {
                fallback
            }
        } catch (e: Exception) {
            rawError.take(120)
        }
    }

    suspend fun login(email: String, password: String): Result<TokenResponse> {
        return try {
            val response = authApi.login(LoginRequest(email.trim(), password))
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                tokenManager.saveTokens(
                    tokenResponse.accessToken,
                    tokenResponse.refreshToken ?: tokenResponse.accessToken
                )
                tokenResponse.user?.let {
                    tokenManager.saveUser(it.email, it.fullName)
                }
                Result.success(tokenResponse)
            } else {
                val raw = response.errorBody()?.string()
                val errorMsg = parseErrorMessage(raw, "Invalid email or password.")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(IOException("Cannot connect to server. Check your network or server URL.", e))
        }
    }

    suspend fun register(email: String, password: String, fullName: String?): Result<TokenResponse> {
        return try {
            val response = authApi.register(RegisterRequest(email.trim(), password, fullName?.trim()?.ifBlank { null }))
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                tokenManager.saveTokens(
                    tokenResponse.accessToken,
                    tokenResponse.refreshToken ?: tokenResponse.accessToken
                )
                tokenResponse.user?.let {
                    tokenManager.saveUser(it.email, it.fullName)
                }
                Result.success(tokenResponse)
            } else {
                val raw = response.errorBody()?.string()
                val errorMsg = parseErrorMessage(raw, "Registration failed (${response.code()})")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(IOException("Cannot connect to server. Check your network or server URL.", e))
        }
    }

    suspend fun googleLogin(credential: String): Result<TokenResponse> {
        return try {
            val response = authApi.googleAuth(GoogleAuthRequest(credential = credential))
            if (response.isSuccessful && response.body() != null) {
                val tokenResponse = response.body()!!
                tokenManager.saveTokens(
                    tokenResponse.accessToken,
                    tokenResponse.refreshToken ?: tokenResponse.accessToken
                )
                tokenResponse.user?.let {
                    tokenManager.saveUser(it.email, it.fullName)
                }
                Result.success(tokenResponse)
            } else {
                val raw = response.errorBody()?.string()
                val errorMsg = parseErrorMessage(raw, "Google authentication failed (${response.code()})")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Result.failure(IOException("Cannot connect to server. Check your network or server URL.", e))
        }
    }

    suspend fun forgotPassword(email: String): Result<String> {
        return try {
            val response = authApi.forgotPassword(ForgotPasswordRequest(email.trim()))
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.message)
            } else {
                val raw = response.errorBody()?.string()
                Result.failure(Exception(parseErrorMessage(raw, "Failed to send reset link")))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        try {
            authApi.logout()
        } catch (ignored: Exception) {
        } finally {
            tokenManager.clearSession()
        }
    }
}

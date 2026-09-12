package com.fintrack.app.data.client

import com.fintrack.app.data.local.TokenManager
import com.fintrack.app.data.models.RefreshTokenRequest
import com.fintrack.app.data.models.TokenResponse
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody

class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {

    private val gson = Gson()

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        val accessToken = tokenManager.getAccessToken()

        // If no token exists or this is an unauthenticated endpoint (login/register), proceed normally
        if (accessToken.isNullOrEmpty() || isAuthEndpoint(originalRequest)) {
            return chain.proceed(originalRequest)
        }

        // Attach Authorization header
        val authenticatedRequest = originalRequest.newBuilder()
            .header("Authorization", "Bearer $accessToken")
            .build()

        val response = chain.proceed(authenticatedRequest)

        // If HTTP 401 Unauthorized, attempt auto-refresh
        if (response.code == 401) {
            synchronized(this) {
                val refreshToken = tokenManager.getRefreshToken()
                if (!refreshToken.isNullOrEmpty()) {
                    response.close() // Close initial 401 response

                    val refreshSuccess = attemptTokenRefresh(chain, refreshToken)
                    if (refreshSuccess) {
                        val newAccessToken = tokenManager.getAccessToken()
                        val retryRequest = originalRequest.newBuilder()
                            .header("Authorization", "Bearer $newAccessToken")
                            .build()
                        return chain.proceed(retryRequest)
                    } else {
                        // Refresh token expired or revoked -> clear session
                        tokenManager.clearSession()
                    }
                }
            }
        }

        return response
    }

    private fun isAuthEndpoint(request: Request): Boolean {
        val path = request.url.encodedPath
        return path.contains("/auth/login") ||
               path.contains("/auth/register") ||
               path.contains("/auth/refresh") ||
               path.contains("/auth/forgot-password") ||
               path.contains("/auth/reset-password") ||
               path.contains("/auth/google")
    }

    private fun attemptTokenRefresh(chain: Interceptor.Chain, refreshToken: String): Boolean {
        return try {
            val refreshUrl = tokenManager.getCustomApiUrl() + "auth/refresh"
            val body = gson.toJson(RefreshTokenRequest(refreshToken))
                .toRequestBody("application/json".toMediaType())

            val refreshRequest = Request.Builder()
                .url(refreshUrl)
                .post(body)
                .build()

            val refreshResponse = chain.proceed(refreshRequest)
            if (refreshResponse.isSuccessful) {
                val responseBody = refreshResponse.body?.string()
                val tokenResponse = gson.fromJson(responseBody, TokenResponse::class.java)
                if (tokenResponse != null) {
                    val newAccess = tokenResponse.accessToken
                    val newRefresh = tokenResponse.refreshToken ?: refreshToken
                    tokenManager.saveTokens(newAccess, newRefresh)
                    refreshResponse.close()
                    return true
                }
            }
            refreshResponse.close()
            false
        } catch (e: Exception) {
            false
        }
    }
}

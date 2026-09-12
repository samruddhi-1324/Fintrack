package com.fintrack.app.data.client

import com.fintrack.app.data.api.*
import com.fintrack.app.data.local.TokenManager
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    private lateinit var tokenManager: TokenManager
    private var retrofit: Retrofit? = null

    fun initialize(manager: TokenManager) {
        tokenManager = manager
        buildRetrofit()
    }

    private fun buildRetrofit() {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val okHttpClient = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(tokenManager))
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        retrofit = Retrofit.Builder()
            .baseUrl(tokenManager.getCustomApiUrl())
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    fun updateBaseUrl() {
        buildRetrofit()
    }

    val authApi: AuthApi
        get() = retrofit!!.create(AuthApi::class.java)

    val expenseApi: ExpenseApi
        get() = retrofit!!.create(ExpenseApi::class.java)

    val categoryApi: CategoryApi
        get() = retrofit!!.create(CategoryApi::class.java)

    val budgetApi: BudgetApi
        get() = retrofit!!.create(BudgetApi::class.java)

    val aiApi: AIApi
        get() = retrofit!!.create(AIApi::class.java)
}

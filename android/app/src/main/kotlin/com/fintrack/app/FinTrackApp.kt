package com.fintrack.app

import android.app.Application
import com.fintrack.app.data.client.ApiClient
import com.fintrack.app.data.local.TokenManager

class FinTrackApp : Application() {

    companion object {
        lateinit var instance: FinTrackApp
            private set
    }

    lateinit var tokenManager: TokenManager
        private set

    override fun onCreate() {
        super.onCreate()
        instance = this
        tokenManager = TokenManager(applicationContext)
        ApiClient.initialize(tokenManager)
    }
}

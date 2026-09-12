package com.fintrack.app.utils

object Constants {
    // Production Live Render Backend (100% cloud connected with Supabase PostgreSQL)
    const val DEFAULT_BASE_URL = "https://fintrack-backend-hmc6.onrender.com/api/v1/"
    const val PROD_BASE_URL = "https://fintrack-backend-hmc6.onrender.com/api/v1/"
    const val USB_BASE_URL = "http://127.0.0.1:8000/api/v1/"
    const val LAN_BASE_URL = "http://10.88.244.110:8000/api/v1/"
    const val EMULATOR_BASE_URL = "http://10.0.2.2:8000/api/v1/"

    // Google OAuth 2.0 Client ID (Matches backend settings.GOOGLE_CLIENT_ID)
    const val GOOGLE_WEB_CLIENT_ID = "17877033371-j5iqsr8ag9mc0j61fhd69lhvplleb9rj.apps.googleusercontent.com"
    
    // Preference Keys
    const val PREFS_NAME = "fintrack_secure_prefs"
    const val KEY_ACCESS_TOKEN = "access_token"
    const val KEY_REFRESH_TOKEN = "refresh_token"
    const val KEY_USER_EMAIL = "user_email"
    const val KEY_USER_NAME = "user_name"
    const val KEY_CUSTOM_API_URL = "custom_api_url"

    // Supported Payment Modes
    val PAYMENT_MODES = listOf("cash", "card", "upi")
}


package com.fintrack.app.data.local

import android.content.Context
import android.content.SharedPreferences
import com.fintrack.app.utils.Constants
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class TokenManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        Constants.PREFS_NAME,
        Context.MODE_PRIVATE
    )

    private val _isLoggedIn = MutableStateFlow(!getAccessToken().isNullOrEmpty())
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    fun getAccessToken(): String? {
        return prefs.getString(Constants.KEY_ACCESS_TOKEN, null)
    }

    fun getRefreshToken(): String? {
        return prefs.getString(Constants.KEY_REFRESH_TOKEN, null)
    }

    fun getUserEmail(): String? {
        return prefs.getString(Constants.KEY_USER_EMAIL, null)
    }

    fun getUserName(): String? {
        return prefs.getString(Constants.KEY_USER_NAME, null)
    }

    fun getCustomApiUrl(): String {
        val saved = prefs.getString(Constants.KEY_CUSTOM_API_URL, null)
        if (saved == null || saved.contains("192.168.0.111") || saved.contains("10.88.244.110") || saved.contains("10.0.2.2") || saved.contains("127.0.0.1")) {
            return Constants.DEFAULT_BASE_URL
        }
        return saved
    }

    fun saveTokens(accessToken: String, refreshToken: String) {
        prefs.edit()
            .putString(Constants.KEY_ACCESS_TOKEN, accessToken)
            .putString(Constants.KEY_REFRESH_TOKEN, refreshToken)
            .apply()
        _isLoggedIn.value = true
    }

    fun saveUser(email: String, name: String?) {
        prefs.edit()
            .putString(Constants.KEY_USER_EMAIL, email)
            .putString(Constants.KEY_USER_NAME, name)
            .apply()
    }

    fun setCustomApiUrl(url: String) {
        val formatted = if (url.endsWith("/")) url else "$url/"
        prefs.edit().putString(Constants.KEY_CUSTOM_API_URL, formatted).apply()
    }

    fun clearSession() {
        prefs.edit()
            .remove(Constants.KEY_ACCESS_TOKEN)
            .remove(Constants.KEY_REFRESH_TOKEN)
            .remove(Constants.KEY_USER_EMAIL)
            .remove(Constants.KEY_USER_NAME)
            .apply()
        _isLoggedIn.value = false
    }
}

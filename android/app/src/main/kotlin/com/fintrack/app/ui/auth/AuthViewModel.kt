package com.fintrack.app.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fintrack.app.FinTrackApp
import com.fintrack.app.data.repository.AuthRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AuthUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    val isAuthenticated: Boolean = false
)

class AuthViewModel : ViewModel() {

    private val authRepository = AuthRepository(FinTrackApp.instance.tokenManager)

    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.isLoggedIn.collect { loggedIn ->
                _uiState.value = _uiState.value.copy(isAuthenticated = loggedIn)
            }
        }
    }

    fun login(email: String, pass: String) {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()
        if (trimmedEmail.isBlank() || trimmedPass.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please fill in all fields.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val result = authRepository.login(trimmedEmail, trimmedPass)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, isAuthenticated = true)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Authentication failed. Check your credentials."
                )
            }
        }
    }

    fun register(email: String, pass: String, confirmPass: String, name: String?) {
        val trimmedEmail = email.trim()
        val trimmedPass = pass.trim()
        val trimmedConfirm = confirmPass.trim()

        if (trimmedEmail.isBlank() || trimmedPass.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Email and password are required.")
            return
        }
        if (!trimmedEmail.contains("@") || !trimmedEmail.contains(".")) {
            _uiState.value = _uiState.value.copy(error = "Please enter a valid email address.")
            return
        }
        if (trimmedPass.length < 8) {
            _uiState.value = _uiState.value.copy(error = "Password must be at least 8 characters long.")
            return
        }
        if (!trimmedPass.any { it.isUpperCase() }) {
            _uiState.value = _uiState.value.copy(error = "Password must contain at least one uppercase letter (A-Z).")
            return
        }
        if (!trimmedPass.any { it.isLowerCase() }) {
            _uiState.value = _uiState.value.copy(error = "Password must contain at least one lowercase letter (a-z).")
            return
        }
        if (!trimmedPass.any { it.isDigit() }) {
            _uiState.value = _uiState.value.copy(error = "Password must contain at least one digit (0-9).")
            return
        }
        if (!trimmedPass.any { "!@#$%^&*()_+-=[]{};':\"\\|,.<>/?".contains(it) }) {
            _uiState.value = _uiState.value.copy(error = "Password must contain at least one special character (!@#$%...).")
            return
        }
        if (trimmedPass != trimmedConfirm) {
            _uiState.value = _uiState.value.copy(error = "Passwords do not match.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val result = authRepository.register(trimmedEmail, trimmedPass, name)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, isAuthenticated = true)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Registration failed."
                )
            }
        }
    }

    fun googleLogin(credential: String) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val result = authRepository.googleLogin(credential)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isLoading = false, isAuthenticated = true)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Google authentication failed."
                )
            }
        }
    }

    fun forgotPassword(email: String) {
        if (email.isBlank()) {
            _uiState.value = _uiState.value.copy(error = "Please enter your email.")
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val result = authRepository.forgotPassword(email)
            result.onSuccess { msg ->
                _uiState.value = _uiState.value.copy(isLoading = false, successMessage = msg)
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = err.message ?: "Failed to send reset link."
                )
            }
        }
    }

    fun setError(message: String) {
        _uiState.value = _uiState.value.copy(error = message, isLoading = false)
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }

    fun setServerUrl(url: String) {
        FinTrackApp.instance.tokenManager.setCustomApiUrl(url)
        com.fintrack.app.data.client.ApiClient.updateBaseUrl()
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            _uiState.value = AuthUiState()
        }
    }
}

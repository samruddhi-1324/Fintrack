package com.fintrack.app.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fintrack.app.data.models.*
import com.fintrack.app.data.repository.AIRepository
import com.fintrack.app.data.repository.BudgetRepository
import com.fintrack.app.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DashboardUiState(
    val isLoading: Boolean = false,
    val summary: DashboardSummaryResponse? = null,
    val budgetSummary: BudgetSummaryResponse? = null,
    val healthScore: HealthScoreResponse? = null,
    val forecast: ForecastResponse? = null,
    val anomalies: AnomalyDetectionResponse? = null,
    val error: String? = null
)

class DashboardViewModel : ViewModel() {

    private val expenseRepository = ExpenseRepository()
    private val budgetRepository = BudgetRepository()
    private val aiRepository = AIRepository()

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    fun loadDashboardData() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            try {
                val summaryRes = expenseRepository.getDashboardSummary()
                val budgetRes = budgetRepository.getBudgetSummary()
                val healthRes = aiRepository.getHealthScore()
                val forecastRes = aiRepository.getForecast()
                val anomalyRes = aiRepository.getAnomalies()

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    summary = summaryRes.getOrNull(),
                    budgetSummary = budgetRes.getOrNull(),
                    healthScore = healthRes.getOrNull(),
                    forecast = forecastRes.getOrNull(),
                    anomalies = anomalyRes.getOrNull()
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.localizedMessage ?: "Failed to refresh dashboard"
                )
            }
        }
    }
}

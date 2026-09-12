package com.fintrack.app.ui.budgets

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fintrack.app.data.models.BudgetResponse
import com.fintrack.app.data.models.BudgetSummaryResponse
import com.fintrack.app.data.models.CategoryResponse
import com.fintrack.app.data.repository.BudgetRepository
import com.fintrack.app.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class BudgetsUiState(
    val isLoading: Boolean = false,
    val summary: BudgetSummaryResponse? = null,
    val budgets: List<BudgetResponse> = emptyList(),
    val categories: List<CategoryResponse> = emptyList(),
    val error: String? = null,
    val isCreating: Boolean = false
)

class BudgetsViewModel : ViewModel() {

    private val budgetRepository = BudgetRepository()
    private val expenseRepository = ExpenseRepository()

    private val _uiState = MutableStateFlow(BudgetsUiState())
    val uiState: StateFlow<BudgetsUiState> = _uiState.asStateFlow()

    fun loadData() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val sumRes = budgetRepository.getBudgetSummary()
            val budRes = budgetRepository.getBudgets()
            val catRes = expenseRepository.getCategories()

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                summary = sumRes.getOrNull(),
                budgets = budRes.getOrDefault(emptyList()),
                categories = catRes.getOrDefault(emptyList())
            )
        }
    }

    fun setBudget(amount: Double, categoryId: String?, onSuccess: () -> Unit) {
        _uiState.value = _uiState.value.copy(isCreating = true)
        viewModelScope.launch {
            val result = budgetRepository.createBudget(amount, categoryId)
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isCreating = false)
                loadData()
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isCreating = false,
                    error = err.message ?: "Failed to set budget."
                )
            }
        }
    }

    fun deleteBudget(id: String) {
        viewModelScope.launch {
            budgetRepository.deleteBudget(id)
            loadData()
        }
    }
}

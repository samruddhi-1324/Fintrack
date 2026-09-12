package com.fintrack.app.ui.expenses

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.fintrack.app.data.models.CategoryResponse
import com.fintrack.app.data.models.ExpenseResponse
import com.fintrack.app.data.repository.AIRepository
import com.fintrack.app.data.repository.ExpenseRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ExpensesUiState(
    val isLoading: Boolean = false,
    val expenses: List<ExpenseResponse> = emptyList(),
    val categories: List<CategoryResponse> = emptyList(),
    val totalAmount: Double = 0.0,
    val selectedCategoryId: String? = null,
    val selectedPaymentMode: String? = null,
    val searchQuery: String = "",
    val error: String? = null,
    val isSubmitting: Boolean = false
)

class ExpensesViewModel : ViewModel() {

    private val expenseRepository = ExpenseRepository()
    private val aiRepository = AIRepository()

    private val _uiState = MutableStateFlow(ExpensesUiState())
    val uiState: StateFlow<ExpensesUiState> = _uiState.asStateFlow()

    fun loadData() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val catRes = expenseRepository.getCategories()
            val expRes = expenseRepository.getExpenses(
                categoryId = _uiState.value.selectedCategoryId,
                paymentMode = _uiState.value.selectedPaymentMode,
                search = if (_uiState.value.searchQuery.isBlank()) null else _uiState.value.searchQuery
            )

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                categories = catRes.getOrDefault(emptyList()),
                expenses = expRes.getOrNull()?.items ?: emptyList(),
                totalAmount = expRes.getOrNull()?.totalAmount ?: 0.0
            )
        }
    }

    fun setFilterCategory(categoryId: String?) {
        _uiState.value = _uiState.value.copy(selectedCategoryId = categoryId)
        loadData()
    }

    fun setFilterPaymentMode(mode: String?) {
        _uiState.value = _uiState.value.copy(selectedPaymentMode = mode)
        loadData()
    }

    fun setSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadData()
    }

    fun addExpense(
        title: String,
        amount: Double,
        categoryId: String,
        date: String,
        notes: String?,
        paymentMode: String,
        onSuccess: () -> Unit
    ) {
        _uiState.value = _uiState.value.copy(isSubmitting = true)
        viewModelScope.launch {
            val result = expenseRepository.createExpense(
                title = title,
                amount = amount,
                categoryId = categoryId,
                date = date,
                notes = notes,
                paymentMode = paymentMode
            )
            result.onSuccess {
                _uiState.value = _uiState.value.copy(isSubmitting = false)
                loadData()
                onSuccess()
            }.onFailure { err ->
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    error = err.message ?: "Failed to log expense."
                )
            }
        }
    }

    fun deleteExpense(id: String) {
        viewModelScope.launch {
            expenseRepository.deleteExpense(id)
            loadData()
        }
    }

    suspend fun parseNLP(text: String) = aiRepository.parseNLP(text)
}

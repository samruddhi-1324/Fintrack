package com.fintrack.app.ui.expenses

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fintrack.app.data.models.CategoryResponse
import com.fintrack.app.data.models.ExpenseResponse
import com.fintrack.app.data.repository.ExpenseRepository
import com.fintrack.app.ui.components.FinTrackButton
import com.fintrack.app.ui.components.FinTrackTextField
import com.fintrack.app.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddExpenseBottomSheet(
    categories: List<CategoryResponse>,
    initialExpense: ExpenseResponse? = null,
    onDismiss: () -> Unit,
    onSaveSuccess: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val expenseRepository = remember { ExpenseRepository() }
    val todayDate = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()) }

    var title by remember { mutableStateOf(initialExpense?.title ?: "") }
    var amountText by remember { mutableStateOf(initialExpense?.amount?.toString() ?: "") }
    var selectedCategoryId by remember { mutableStateOf(initialExpense?.categoryId ?: categories.firstOrNull()?.id ?: "") }
    var date by remember { mutableStateOf(initialExpense?.date ?: todayDate) }
    var notes by remember { mutableStateOf(initialExpense?.notes ?: "") }
    var paymentMode by remember { mutableStateOf(initialExpense?.paymentMode ?: "UPI") }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(top = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
            )
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(EmeraldSecondary)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = if (initialExpense == null) "LOG TRANSACTION" else "EDIT TRANSACTION",
                        style = Typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.08.sp
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Icon(Icons.Filled.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(16.dp))
                }
            }

            if (errorMessage != null) {
                Text(
                    text = errorMessage!!,
                    style = Typography.bodySmall,
                    color = CoralTertiary
                )
            }

            // Title Field
            FinTrackTextField(
                value = title,
                onValueChange = { title = it },
                label = "Merchant / Description",
                placeholder = "e.g., Starbucks Reserve",
                leadingIcon = {
                    Icon(Icons.Filled.Storefront, contentDescription = null, tint = EmeraldSecondary)
                }
            )

            // Amount Field
            FinTrackTextField(
                value = amountText,
                onValueChange = { amountText = it },
                label = "Amount (INR)",
                placeholder = "0.00",
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                leadingIcon = {
                    Text(
                        text = "₹",
                        style = Typography.titleLarge,
                        color = EmeraldSecondary,
                        fontWeight = FontWeight.Bold
                    )
                }
            )

            // Category Selector
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "CATEGORY ALLOCATION",
                    style = Typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp,
                    letterSpacing = 0.08.sp
                )
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(categories) { category ->
                        val isSelected = selectedCategoryId == category.id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant)
                                .border(1.dp, if (isSelected) EmeraldSecondary else Color.Transparent, RoundedCornerShape(8.dp))
                                .clickable { selectedCategoryId = category.id }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = category.name,
                                style = Typography.labelSmall,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }

            // Payment Modality
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "DISBURSEMENT ACCOUNT",
                    style = Typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 10.sp,
                    letterSpacing = 0.08.sp
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf("UPI", "CARD", "CASH").forEach { mode ->
                        val isSelected = paymentMode.equals(mode, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)
                                .border(1.dp, if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent, RoundedCornerShape(8.dp))
                                .clickable { paymentMode = mode }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = mode,
                                style = Typography.labelMedium,
                                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }
            }

            // Notes Field
            FinTrackTextField(
                value = notes,
                onValueChange = { notes = it },
                label = "Notes / Tag (Optional)",
                placeholder = "Add telemetry remarks..."
            )

            // Primary Log Action
            FinTrackButton(
                text = if (isSubmitting) "COMMITTING TO POSTGRES..." else "⚡ LOG EXPENSE IMMEDIATELY",
                isLoading = isSubmitting,
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    if (title.isBlank()) {
                        errorMessage = "Merchant title is required"
                        return@FinTrackButton
                    }
                    if (amount == null || amount <= 0.0) {
                        errorMessage = "Please enter a valid positive amount"
                        return@FinTrackButton
                    }
                    isSubmitting = true
                    errorMessage = null
                    coroutineScope.launch {
                        try {
                            if (initialExpense == null) {
                                expenseRepository.createExpense(
                                    title = title.trim(),
                                    amount = amount,
                                    categoryId = selectedCategoryId,
                                    date = date,
                                    paymentMode = paymentMode.lowercase(),
                                    notes = notes.ifBlank { null }
                                )
                            } else {
                                expenseRepository.updateExpense(
                                    id = initialExpense.id,
                                    title = title.trim(),
                                    amount = amount,
                                    categoryId = selectedCategoryId,
                                    date = date,
                                    paymentMode = paymentMode.lowercase(),
                                    notes = notes.ifBlank { null }
                                )
                            }
                            isSubmitting = false
                            onSaveSuccess()
                        } catch (e: Exception) {
                            isSubmitting = false
                            errorMessage = e.message ?: "Failed to log transaction"
                        }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

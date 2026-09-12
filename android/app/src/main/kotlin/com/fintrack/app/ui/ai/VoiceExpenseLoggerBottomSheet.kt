package com.fintrack.app.ui.ai

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fintrack.app.data.models.CategoryResponse
import com.fintrack.app.data.models.NLPParseResponse
import com.fintrack.app.data.repository.AIRepository
import com.fintrack.app.data.repository.ExpenseRepository
import com.fintrack.app.ui.components.FinTrackButton
import com.fintrack.app.ui.components.FinTrackTextField
import com.fintrack.app.ui.components.GlassmorphicCard
import com.fintrack.app.ui.theme.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceExpenseLoggerBottomSheet(
    categories: List<CategoryResponse>,
    onDismiss: () -> Unit,
    onExpenseLoggedSuccess: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val aiRepository = remember { AIRepository() }
    val expenseRepository = remember { ExpenseRepository() }
    val todayDate = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()) }

    var spokenTranscript by remember { mutableStateOf("") }
    var isListening by remember { mutableStateOf(false) }
    var isParsing by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }
    var parseResult by remember { mutableStateOf<NLPParseResponse?>(null) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Extracted & Editable Fields
    var title by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf(categories.firstOrNull()?.id ?: "") }
    var selectedPaymentMode by remember { mutableStateOf("UPI") }
    var notes by remember { mutableStateOf("") }

    // Pulsing animation for microphone button
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.25f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    // Speech Recognizer Intent Launcher
    val speechRecognizerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isListening = false
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val spokenResults = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val recognizedText = spokenResults?.firstOrNull() ?: ""
            if (recognizedText.isNotBlank()) {
                spokenTranscript = recognizedText
                // Automatically parse speech transcript using AI
                coroutineScope.launch {
                    isParsing = true
                    errorMessage = null
                    val parseRes = aiRepository.parseNLP(recognizedText)
                    isParsing = false
                    parseRes.onSuccess { data ->
                        parseResult = data
                        title = data.title
                        amountText = if (data.amount > 0) data.amount.toString() else ""
                        selectedPaymentMode = data.paymentMode.uppercase()
                        notes = "Voice Logged: \"$recognizedText\""

                        // Auto-match category
                        if (!data.categoryId.isNullOrEmpty()) {
                            selectedCategoryId = data.categoryId
                        } else if (!data.category.isNullOrEmpty()) {
                            val matched = categories.find {
                                it.name.contains(data.category, ignoreCase = true) ||
                                data.category.contains(it.name, ignoreCase = true)
                            }
                            if (matched != null) {
                                selectedCategoryId = matched.id
                            }
                        }
                    }.onFailure { err ->
                        errorMessage = "AI Parsing notice: ${err.message}. You can review the fields manually."
                        title = recognizedText
                    }
                }
            }
        }
    }

    fun launchVoiceRecognition() {
        errorMessage = null
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak expense (e.g., 'Paid 450 for coffee via UPI')")
            }
            isListening = true
            speechRecognizerLauncher.launch(intent)
        } catch (e: Exception) {
            isListening = false
            Toast.makeText(context, "Speech recognition is unavailable: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // Auto-launch speech recognizer when bottom sheet opens
    LaunchedEffect(Unit) {
        launchVoiceRecognition()
    }

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
                .padding(horizontal = 20.dp, vertical = 10.dp)
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
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(EmeraldSecondary)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "🎙️ AI VOICE EXPENSE LOGGER",
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
                    Icon(
                        imageVector = Icons.Filled.Close,
                        contentDescription = "Close",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Interactive Microphone Pulse Box
            GlassmorphicCard(
                backgroundColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
                borderColor = MaterialTheme.colorScheme.outline,
                cornerRadius = 18.dp,
                contentPadding = 16.dp
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .scale(pulseScale)
                            .clip(CircleShape)
                            .background(
                                if (isListening) CoralTertiary.copy(alpha = 0.2f)
                                else EmeraldSecondary.copy(alpha = 0.15f)
                            )
                            .border(
                                2.dp,
                                if (isListening) CoralTertiary else EmeraldSecondary,
                                CircleShape
                            )
                            .clickable { launchVoiceRecognition() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Filled.MicOff else Icons.Filled.Mic,
                            contentDescription = "Tap to Speak",
                            tint = if (isListening) CoralTertiary else EmeraldSecondary,
                            modifier = Modifier.size(36.dp)
                        )
                    }

                    Text(
                        text = if (isListening) "Listening... Speak naturally" else "Tap microphone to record voice",
                        style = Typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        fontWeight = FontWeight.SemiBold
                    )

                    Text(
                        text = "Say e.g., \"Spent 350 for lunch with friends via UPI\" or \"Taxi 200 cash\"",
                        style = Typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 11.sp
                    )
                }
            }

            // Spoken Transcript Input Field
            FinTrackTextField(
                value = spokenTranscript,
                onValueChange = { spokenTranscript = it },
                label = "Spoken / Typed Phrase",
                placeholder = "e.g., Starbucks coffee 350 upi",
                leadingIcon = {
                    Icon(Icons.Filled.RecordVoiceOver, contentDescription = null, tint = EmeraldSecondary)
                },
                trailingIcon = {
                    IconButton(
                        onClick = {
                            if (spokenTranscript.isNotBlank()) {
                                coroutineScope.launch {
                                    isParsing = true
                                    errorMessage = null
                                    val parseRes = aiRepository.parseNLP(spokenTranscript)
                                    isParsing = false
                                    parseRes.onSuccess { data ->
                                        parseResult = data
                                        title = data.title
                                        amountText = if (data.amount > 0) data.amount.toString() else ""
                                        selectedPaymentMode = data.paymentMode.uppercase()
                                        notes = "Voice Logged: \"$spokenTranscript\""
                                        if (!data.categoryId.isNullOrEmpty()) {
                                            selectedCategoryId = data.categoryId
                                        }
                                    }.onFailure { err ->
                                        errorMessage = err.message
                                    }
                                }
                            }
                        }
                    ) {
                        if (isParsing) {
                            CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = EmeraldSecondary)
                        } else {
                            Icon(Icons.Filled.AutoAwesome, contentDescription = "Parse with AI", tint = EmeraldSecondary)
                        }
                    }
                }
            )

            if (errorMessage != null) {
                Surface(
                    color = CoralTertiary.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, CoralTertiary.copy(alpha = 0.4f)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Filled.Warning, contentDescription = null, tint = CoralTertiary, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = errorMessage!!,
                            color = CoralTertiary,
                            style = Typography.bodySmall
                        )
                    }
                }
            }

            // Structured Parsed Fields Section
            Text(
                text = "TRANSACTION DETAILS (AUTOFILLED BY AI)",
                style = Typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.08.sp
            )

            // Merchant Title Field
            FinTrackTextField(
                value = title,
                onValueChange = { title = it },
                label = "Merchant / Description",
                placeholder = "e.g., Starbucks",
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

            // Category Selector Chips
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

            // Payment Modality Chips
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "PAYMENT METHOD",
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
                        val isSelected = selectedPaymentMode.equals(mode, ignoreCase = true)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant)
                                .border(1.dp, if (isSelected) MaterialTheme.colorScheme.primary else Color.Transparent, RoundedCornerShape(8.dp))
                                .clickable { selectedPaymentMode = mode }
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

            // Notes
            FinTrackTextField(
                value = notes,
                onValueChange = { notes = it },
                label = "Notes (Optional)",
                placeholder = "Add remarks..."
            )

            // Primary Log Action
            FinTrackButton(
                text = if (isSubmitting) "COMMITTING TO POSTGRES..." else "⚡ LOG EXPENSE NOW",
                isLoading = isSubmitting,
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    if (title.isBlank()) {
                        errorMessage = "Title / Merchant description is required"
                        return@FinTrackButton
                    }
                    if (amount == null || amount <= 0.0) {
                        errorMessage = "Please specify a valid expense amount greater than 0"
                        return@FinTrackButton
                    }
                    isSubmitting = true
                    errorMessage = null
                    coroutineScope.launch {
                        try {
                            val createRes = expenseRepository.createExpense(
                                title = title.trim(),
                                amount = amount,
                                categoryId = selectedCategoryId,
                                date = todayDate,
                                paymentMode = selectedPaymentMode.lowercase(),
                                notes = notes.ifBlank { null }
                            )
                            isSubmitting = false
                            if (createRes.isSuccess) {
                                Toast.makeText(context, "✨ Expense logged successfully via Voice!", Toast.LENGTH_SHORT).show()
                                onExpenseLoggedSuccess()
                                onDismiss()
                            } else {
                                errorMessage = createRes.exceptionOrNull()?.message ?: "Failed to log expense"
                            }
                        } catch (e: Exception) {
                            isSubmitting = false
                            errorMessage = e.message ?: "Failed to save transaction"
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

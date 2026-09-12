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
fun VoiceLoggerScreen(
    onNavigateBack: () -> Unit,
    onExpenseLogged: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val aiRepository = remember { AIRepository() }
    val expenseRepository = remember { ExpenseRepository() }
    val todayDate = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date()) }

    var categories by remember { mutableStateOf<List<CategoryResponse>>(emptyList()) }
    var spokenTranscript by remember { mutableStateOf("") }
    var isListening by remember { mutableStateOf(false) }
    var isParsing by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // Extracted / Editable transaction fields
    var title by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var selectedCategoryId by remember { mutableStateOf("") }
    var selectedPaymentMode by remember { mutableStateOf("UPI") }
    var date by remember { mutableStateOf(todayDate) }
    var notes by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        val catRes = expenseRepository.getCategories()
        val loadedCategories = catRes.getOrNull() ?: emptyList()
        categories = loadedCategories
        if (selectedCategoryId.isEmpty() && loadedCategories.isNotEmpty()) {
            selectedCategoryId = loadedCategories.first().id
        }
    }

    // Microphone Pulse Animation
    val infiniteTransition = rememberInfiniteTransition(label = "micPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.25f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    // Speech Recognizer Launcher
    val speechLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isListening = false
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val spokenList = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            val recognizedText = spokenList?.firstOrNull() ?: ""
            if (recognizedText.isNotBlank()) {
                spokenTranscript = recognizedText
                // Automatic AI Parsing
                coroutineScope.launch {
                    isParsing = true
                    errorMessage = null
                    val parseRes = aiRepository.parseNLP(recognizedText)
                    isParsing = false
                    parseRes.onSuccess { data ->
                        title = data.title
                        amountText = if (data.amount > 0) data.amount.toString() else ""
                        selectedPaymentMode = data.paymentMode.uppercase()
                        notes = "Voice Logged: \"$recognizedText\""

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
                        title = recognizedText
                        errorMessage = "AI Notice: ${err.message}. You can verify and fill details below."
                    }
                }
            }
        }
    }

    fun startListening() {
        errorMessage = null
        try {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak expense e.g., 'Paid 450 for coffee via UPI'")
            }
            isListening = true
            speechLauncher.launch(intent)
        } catch (e: Exception) {
            isListening = false
            Toast.makeText(context, "Speech recognizer unavailable: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    // Auto-launch speech recognizer on screen open
    LaunchedEffect(Unit) {
        startListening()
    }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Voice Expense Logger",
                            style = Typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "AI Natural Language Speech Ingestion",
                            style = Typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(modifier = Modifier.height(4.dp))

            // 1. Microphone Pulsing Hero Card
            GlassmorphicCard(
                backgroundColor = MaterialTheme.colorScheme.surface,
                borderColor = if (isListening) CoralTertiary.copy(alpha = 0.6f) else MaterialTheme.colorScheme.outline,
                cornerRadius = 22.dp,
                contentPadding = 20.dp
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(80.dp)
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
                            .clickable { startListening() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Filled.MicOff else Icons.Filled.Mic,
                            contentDescription = "Tap to Record",
                            tint = if (isListening) CoralTertiary else EmeraldSecondary,
                            modifier = Modifier.size(40.dp)
                        )
                    }

                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = if (isListening) "🎙️ Listening... Speak naturally" else "Tap to Record Voice",
                            style = Typography.titleMedium,
                            color = MaterialTheme.colorScheme.onSurface,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Say e.g., \"Spent 350 for lunch with friends using UPI\"",
                            style = Typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 11.sp
                        )
                    }
                }
            }

            // 2. Transcript & AI Parse Status
            FinTrackTextField(
                value = spokenTranscript,
                onValueChange = { spokenTranscript = it },
                label = "Spoken / Typed Transcript",
                placeholder = "Spoken text will appear here (or type sentence)...",
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
                                    val res = aiRepository.parseNLP(spokenTranscript)
                                    isParsing = false
                                    res.onSuccess { data ->
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

            // 3. AI Extracted Structured Ledger Details
            GlassmorphicCard(
                backgroundColor = MaterialTheme.colorScheme.surface,
                borderColor = MaterialTheme.colorScheme.outline,
                cornerRadius = 18.dp,
                contentPadding = 16.dp
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
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
                                text = "STRUCTURED DETAILS",
                                style = Typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.08.sp
                            )
                        }
                        Text(
                            text = "Auto-Filled by AI",
                            style = Typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            fontSize = 10.sp
                        )
                    }

                    // Merchant / Title Field
                    FinTrackTextField(
                        value = title,
                        onValueChange = { title = it },
                        label = "Merchant / Title",
                        placeholder = "e.g., Starbucks",
                        leadingIcon = {
                            Icon(Icons.Filled.Storefront, contentDescription = null, tint = EmeraldSecondary)
                        }
                    )

                    // Amount (INR) Field
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
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
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
                        label = "Remarks / Notes",
                        placeholder = "Telemetry notes..."
                    )
                }
            }

            // 4. Primary Ingestion Button
            FinTrackButton(
                text = if (isSubmitting) "COMMITTING TO POSTGRES..." else "⚡ LOG EXPENSE IMMEDIATELY",
                isLoading = isSubmitting,
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    if (title.isBlank()) {
                        errorMessage = "Merchant / Title is required"
                        return@FinTrackButton
                    }
                    if (amount == null || amount <= 0.0) {
                        errorMessage = "Please enter a valid amount greater than 0"
                        return@FinTrackButton
                    }
                    isSubmitting = true
                    errorMessage = null
                    coroutineScope.launch {
                        try {
                            val res = expenseRepository.createExpense(
                                title = title.trim(),
                                amount = amount,
                                categoryId = selectedCategoryId,
                                date = date,
                                paymentMode = selectedPaymentMode.lowercase(),
                                notes = notes.ifBlank { null }
                            )
                            isSubmitting = false
                            if (res.isSuccess) {
                                Toast.makeText(context, "✨ Expense logged successfully!", Toast.LENGTH_SHORT).show()
                                onExpenseLogged()
                            } else {
                                errorMessage = res.exceptionOrNull()?.message ?: "Failed to log expense"
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

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

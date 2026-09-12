package com.fintrack.app.ui.ai

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fintrack.app.data.models.SplitBillResponse
import com.fintrack.app.data.repository.AIRepository
import com.fintrack.app.ui.components.FinTrackButton
import com.fintrack.app.ui.components.FinTrackTextField
import com.fintrack.app.ui.components.GlassmorphicCard
import com.fintrack.app.ui.theme.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

@Composable
fun SplitBillScreen(onNavigateBack: () -> Unit) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val aiRepository = remember { AIRepository() }
    val indianCurrency = remember { NumberFormat.getCurrencyInstance(Locale("en", "IN")) }
    val userName = remember { com.fintrack.app.FinTrackApp.instance.tokenManager.getUserName() ?: "You" }

    var title by remember { mutableStateOf("") }
    var totalAmount by remember { mutableStateOf("") }
    var paidBy by remember { mutableStateOf(userName) }
    var participantsText by remember { mutableStateOf(userName) }

    var splitResult by remember { mutableStateOf<SplitBillResponse?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.surface)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Filled.ArrowBack, contentDescription = "Back", tint = MaterialTheme.colorScheme.onSurface)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "AI Group Bill & Debt Splitter",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            GlassmorphicCard {
                FinTrackTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = "Bill Description",
                    placeholder = "Dinner, Trip, Movie..."
                )

                Spacer(modifier = Modifier.height(12.dp))

                FinTrackTextField(
                    value = totalAmount,
                    onValueChange = { totalAmount = it },
                    label = "Total Amount (₹)",
                    placeholder = "1200",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal)
                )

                Spacer(modifier = Modifier.height(12.dp))

                FinTrackTextField(
                    value = paidBy,
                    onValueChange = { paidBy = it },
                    label = "Paid By (Person Name)",
                    placeholder = "Samruddhi"
                )

                Spacer(modifier = Modifier.height(12.dp))

                FinTrackTextField(
                    value = participantsText,
                    onValueChange = { participantsText = it },
                    label = "Participants (Comma-separated)",
                    placeholder = "Samruddhi, Rahul, Priya"
                )

                Spacer(modifier = Modifier.height(20.dp))

                FinTrackButton(
                    text = "Calculate Debt Matrix",
                    onClick = {
                        val amount = totalAmount.toDoubleOrNull() ?: 0.0
                        val parts = participantsText.split(",").map { it.trim() }.filter { it.isNotBlank() }
                        if (amount > 0 && parts.isNotEmpty()) {
                            isLoading = true
                            coroutineScope.launch {
                                val result = aiRepository.splitBill(
                                    title = title,
                                    totalAmount = amount,
                                    paidBy = paidBy.trim(),
                                    participants = parts
                                )
                                isLoading = false
                                result.onSuccess { splitResult = it }
                            }
                        }
                    },
                    isLoading = isLoading
                )
            }

            // Results Matrix
            splitResult?.let { res ->
                Spacer(modifier = Modifier.height(20.dp))

                GlassmorphicCard {
                    Text(
                        text = "Settlement Matrix",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldSecondary
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    res.settlements.forEach { set ->
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 6.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "${set.fromPerson} owes ${set.toPerson}",
                                    color = MaterialTheme.colorScheme.onSurface,
                                    fontSize = 13.sp
                                )
                                Text(
                                    text = indianCurrency.format(set.amount),
                                    color = EmeraldSecondary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Share on WhatsApp
                    FinTrackButton(
                        text = "Share on WhatsApp",
                        onClick = {
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, res.whatsappSummary)
                                type = "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share Bill Summary"))
                        },
                        backgroundColor = EmeraldSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}

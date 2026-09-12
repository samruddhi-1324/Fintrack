package com.fintrack.app.ui.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fintrack.app.data.models.TaxAssistantResponse
import com.fintrack.app.data.repository.AIRepository
import com.fintrack.app.ui.components.GlassmorphicCard
import com.fintrack.app.ui.theme.*
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.util.Locale

@Composable
fun TaxAssistantScreen(onNavigateBack: () -> Unit) {
    val coroutineScope = rememberCoroutineScope()
    val aiRepository = remember { AIRepository() }
    val indianCurrency = remember { NumberFormat.getCurrencyInstance(Locale("en", "IN")) }

    var taxData by remember { mutableStateOf<TaxAssistantResponse?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        coroutineScope.launch {
            val res = aiRepository.getTaxAssistant()
            isLoading = false
            taxData = res.getOrNull()
        }
    }

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
                    text = "AI Tax & GST Assistant",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        }
    ) { paddingValues ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
        } else if (taxData != null) {
            val data = taxData!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                // Regime Recommendation Banner
                GlassmorphicCard(
                    borderColor = EmeraldSecondary.copy(alpha = 0.5f),
                    backgroundColor = EmeraldSecondary.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = "Recommendation: ${data.regimeRecommendation.recommendedRegime}",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = EmeraldSecondary
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Estimated Tax Savings: ${indianCurrency.format(data.regimeRecommendation.estimatedSavings)}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = data.regimeRecommendation.summary,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Section Deductions (80C, 80D, HRA)
                Text(
                    text = "Income Tax Deductions (${data.financialYear})",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(10.dp))

                data.deductions.forEach { item ->
                    GlassmorphicCard(modifier = Modifier.padding(bottom = 8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = item.section, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                            Text(
                                text = "${indianCurrency.format(item.claimedAmount)} / ${indianCurrency.format(item.limit)}",
                                color = EmeraldSecondary,
                                fontSize = 13.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = (item.utilizationPercentage / 100f).toFloat(),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = EmeraldSecondary,
                            trackColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // GST Input Tax Credit (ITC)
                Text(
                    text = "CGST Input Tax Credit (ITC)",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )

                Spacer(modifier = Modifier.height(10.dp))

                GlassmorphicCard {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Eligible ITC (Claimable):", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 13.sp)
                        Text(
                            text = indianCurrency.format(data.gstItcBreakdown.eligibleItc),
                            color = EmeraldSecondary,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Blocked ITC (u/s 17(5)):", color = MaterialTheme.colorScheme.onSurfaceVariant, fontSize = 12.sp)
                        Text(
                            text = indianCurrency.format(data.gstItcBreakdown.blockedItc),
                            color = CoralTertiary,
                            fontSize = 12.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(40.dp))
            }
        }
    }
}

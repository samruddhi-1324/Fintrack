package com.fintrack.app.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fintrack.app.FinTrackApp
import com.fintrack.app.ui.auth.AuthViewModel
import com.fintrack.app.ui.components.FinTrackButton
import com.fintrack.app.ui.components.FinTrackTextField
import com.fintrack.app.ui.components.GlassmorphicCard
import com.fintrack.app.ui.theme.*

@Composable
fun SettingsScreen(
    authViewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val tokenManager = FinTrackApp.instance.tokenManager
    var customUrl by remember { mutableStateOf(tokenManager.getCustomApiUrl()) }
    var saveMessage by remember { mutableStateOf<String?>(null) }

    val userEmail = tokenManager.getUserEmail() ?: "user@fintrack.app"
    val userName = tokenManager.getUserName() ?: "Samruddhi"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Settings & Profile",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(20.dp))

        // Profile Card
        GlassmorphicCard {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = MaterialTheme.colorScheme.primary,
                    shape = androidx.compose.foundation.shape.CircleShape,
                    modifier = Modifier.size(52.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = userName.take(1).uppercase(),
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.width(16.dp))

                Column {
                    Text(
                        text = userName,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = userEmail,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Network Endpoint Configuration (For easy switching between Emulator and Physical Phone)
        Text(
            text = "Backend Connection",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Spacer(modifier = Modifier.height(8.dp))

        GlassmorphicCard {
            Text(
                text = "FastAPI Server URL",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Live Cloud: Render + Supabase\nLocal: USB (127.0.0.1) or Emulator (10.0.2.2)",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Quick preset chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = {
                        customUrl = com.fintrack.app.utils.Constants.PROD_BASE_URL
                        tokenManager.setCustomApiUrl(customUrl)
                        com.fintrack.app.data.client.ApiClient.updateBaseUrl()
                        saveMessage = "Connected to Live Render Cloud!"
                    },
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                ) {
                    Text("🌐 Live Cloud", fontSize = 11.sp, maxLines = 1)
                }

                OutlinedButton(
                    onClick = {
                        customUrl = com.fintrack.app.utils.Constants.USB_BASE_URL
                        tokenManager.setCustomApiUrl(customUrl)
                        com.fintrack.app.data.client.ApiClient.updateBaseUrl()
                        saveMessage = "Connected to Local USB Loopback!"
                    },
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(horizontal = 4.dp, vertical = 6.dp)
                ) {
                    Text("🔌 Local USB", fontSize = 11.sp, maxLines = 1)
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            FinTrackTextField(
                value = customUrl,
                onValueChange = { customUrl = it; saveMessage = null },
                label = "API Base URL",
                placeholder = com.fintrack.app.utils.Constants.PROD_BASE_URL
            )

            if (!saveMessage.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = saveMessage!!, color = EmeraldSecondary, fontSize = 12.sp)
            }

            Spacer(modifier = Modifier.height(16.dp))

            FinTrackButton(
                text = "Save Server URL",
                onClick = {
                    tokenManager.setCustomApiUrl(customUrl)
                    com.fintrack.app.data.client.ApiClient.updateBaseUrl()
                    saveMessage = "Server URL saved successfully!"
                }
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Logout Button
        FinTrackButton(
            text = "Log Out",
            onClick = {
                authViewModel.logout()
                onLogout()
            },
            backgroundColor = CoralTertiary
        )

        Spacer(modifier = Modifier.height(80.dp))
    }
}

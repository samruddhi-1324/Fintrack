package com.fintrack.app.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String = "") {
    // Auth Flow
    object Login : Screen("login", "Login")
    object Register : Screen("register", "Register")
    object ForgotPassword : Screen("forgot_password", "Forgot Password")

    // Main App Flow (Bottom Navigation Tabs)
    object Dashboard : Screen("dashboard", "Dashboard")
    object Expenses : Screen("expenses", "Expenses")
    object Budgets : Screen("budgets", "Budgets")
    object AIHub : Screen("ai_hub", "AI Insights")
    object Settings : Screen("settings", "Settings")

    // AI Feature Sub-screens
    object ReceiptScanner : Screen("receipt_scanner", "Scan Receipt")
    object CopilotChat : Screen("copilot_chat", "AI Copilot")
    object SplitBill : Screen("split_bill", "Split Bill")
    object TaxAssistant : Screen("tax_assistant", "Tax & GST")
}

data class BottomNavItem(
    val route: String,
    val title: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem(
        route = Screen.Dashboard.route,
        title = "Dashboard",
        selectedIcon = Icons.Filled.Dashboard,
        unselectedIcon = Icons.Outlined.Dashboard
    ),
    BottomNavItem(
        route = Screen.Expenses.route,
        title = "Expenses",
        selectedIcon = Icons.Filled.ReceiptLong,
        unselectedIcon = Icons.Outlined.ReceiptLong
    ),
    BottomNavItem(
        route = Screen.Budgets.route,
        title = "Budgets",
        selectedIcon = Icons.Filled.AccountBalanceWallet,
        unselectedIcon = Icons.Outlined.AccountBalanceWallet
    ),
    BottomNavItem(
        route = Screen.AIHub.route,
        title = "AI Hub",
        selectedIcon = Icons.Filled.AutoAwesome,
        unselectedIcon = Icons.Outlined.AutoAwesome
    ),
    BottomNavItem(
        route = Screen.Settings.route,
        title = "Settings",
        selectedIcon = Icons.Filled.Settings,
        unselectedIcon = Icons.Outlined.Settings
    )
)

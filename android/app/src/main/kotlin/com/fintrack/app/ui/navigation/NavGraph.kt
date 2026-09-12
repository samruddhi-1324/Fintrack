package com.fintrack.app.ui.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import com.fintrack.app.FinTrackApp
import com.fintrack.app.ui.ai.*
import com.fintrack.app.ui.auth.*
import com.fintrack.app.ui.budgets.*
import com.fintrack.app.ui.dashboard.*
import com.fintrack.app.ui.expenses.*
import com.fintrack.app.ui.settings.*
import androidx.compose.material3.MaterialTheme

@Composable
fun FinTrackNavGraph(navController: NavHostController) {
    val authViewModel: AuthViewModel = viewModel()
    val dashboardViewModel: DashboardViewModel = viewModel()
    val expensesViewModel: ExpensesViewModel = viewModel()
    val budgetsViewModel: BudgetsViewModel = viewModel()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val isLoggedIn = FinTrackApp.instance.tokenManager.getAccessToken() != null
    val startDestination = if (isLoggedIn) Screen.Dashboard.route else Screen.Login.route

    val showBottomBar = currentRoute in listOf(
        Screen.Dashboard.route,
        Screen.Expenses.route,
        Screen.Budgets.route,
        Screen.AIHub.route,
        Screen.Settings.route
    )

    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            if (showBottomBar) {
                BottomNavBar(
                    navController = navController,
                    onQuickAddClick = { navController.navigate(Screen.ReceiptScanner.route) }
                )
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(paddingValues)
        ) {
            // Auth Routes
            composable(Screen.Login.route) {
                LoginScreen(
                    viewModel = authViewModel,
                    onNavigateToRegister = { navController.navigate(Screen.Register.route) },
                    onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Register.route) {
                RegisterScreen(
                    viewModel = authViewModel,
                    onNavigateToLogin = { navController.popBackStack() },
                    onRegisterSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.ForgotPassword.route) {
                ForgotPasswordScreen(
                    viewModel = authViewModel,
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Main App Tabs
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    viewModel = dashboardViewModel,
                    onNavigateToExpenses = { navController.navigate(Screen.Expenses.route) },
                    onNavigateToCopilot = { navController.navigate(Screen.CopilotChat.route) },
                    onNavigateToReceiptScanner = { navController.navigate(Screen.ReceiptScanner.route) },
                    onNavigateToSplitBill = { navController.navigate(Screen.SplitBill.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Settings.route) }
                )
            }

            composable(Screen.Expenses.route) {
                ExpensesScreen(
                    viewModel = expensesViewModel,
                    onNavigateToReceiptScanner = { navController.navigate(Screen.ReceiptScanner.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Settings.route) }
                )
            }

            composable(Screen.Budgets.route) {
                BudgetsScreen(
                    viewModel = budgetsViewModel,
                    onNavigateToCopilot = { navController.navigate(Screen.CopilotChat.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Settings.route) }
                )
            }

            composable(Screen.AIHub.route) {
                AIHubScreen(
                    onNavigateToReceiptScanner = { navController.navigate(Screen.ReceiptScanner.route) },
                    onNavigateToCopilot = { navController.navigate(Screen.CopilotChat.route) },
                    onNavigateToSplitBill = { navController.navigate(Screen.SplitBill.route) },
                    onNavigateToTaxAssistant = { navController.navigate(Screen.TaxAssistant.route) },
                    onNavigateToProfile = { navController.navigate(Screen.Settings.route) }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    authViewModel = authViewModel,
                    onLogout = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }

            // AI Sub-screens
            composable(Screen.ReceiptScanner.route) {
                ReceiptScannerScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onExpenseLogged = {
                        expensesViewModel.loadData()
                        dashboardViewModel.loadDashboardData()
                        navController.popBackStack()
                    }
                )
            }

            composable(Screen.CopilotChat.route) {
                AICopilotScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(Screen.SplitBill.route) {
                SplitBillScreen(onNavigateBack = { navController.popBackStack() })
            }

            composable(Screen.TaxAssistant.route) {
                TaxAssistantScreen(onNavigateBack = { navController.popBackStack() })
            }
        }
    }
}

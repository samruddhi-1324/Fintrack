package com.fintrack.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.navigation.compose.rememberNavController
import com.fintrack.app.ui.navigation.FinTrackNavGraph
import com.fintrack.app.ui.theme.FinTrackTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FinTrackTheme {
                val navController = rememberNavController()
                FinTrackNavGraph(navController = navController)
            }
        }
    }
}

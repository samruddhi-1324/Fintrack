package com.fintrack.app.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.ui.graphics.Color

private val FinTrackLightColorScheme = lightColorScheme(
    primary = SapphirePrimary,
    onPrimary = Color.White,
    primaryContainer = SapphirePrimaryContainer,
    onPrimaryContainer = SapphirePrimary,
    secondary = LightTextSecondary,
    onSecondary = Color.White,
    secondaryContainer = LightSurfaceContainerLow,
    onSecondaryContainer = LightTextPrimary,
    tertiary = LightEmerald,
    onTertiary = Color.White,
    tertiaryContainer = LightEmeraldContainer,
    onTertiaryContainer = LightEmerald,
    background = LightBg,
    onBackground = LightTextPrimary,
    surface = LightSurface,
    onSurface = LightTextPrimary,
    surfaceVariant = LightSurfaceContainerLow,
    onSurfaceVariant = LightTextSecondary,
    surfaceTint = SapphirePrimaryLight,
    outline = LightCardBorder,
    outlineVariant = LightSurfaceContainerHigh,
    error = LightCoral,
    onError = Color.White,
    errorContainer = LightCoralContainer,
    onErrorContainer = LightCoral
)

private val FinTrackDarkColorScheme = darkColorScheme(
    primary = PrimaryLight,
    onPrimary = OnPrimary,
    primaryContainer = PrimaryContainer,
    onPrimaryContainer = OnPrimaryContainer,
    secondary = EmeraldLight,
    onSecondary = OnSecondary,
    secondaryContainer = SecondaryContainer,
    onSecondaryContainer = OnSecondaryContainer,
    tertiary = CoralLight,
    onTertiary = OnTertiary,
    tertiaryContainer = TertiaryContainer,
    onTertiaryContainer = OnTertiaryContainer,
    background = DarkBg,
    onBackground = TextPrimary,
    surface = DarkSurfaceTier1,
    onSurface = TextPrimary,
    surfaceVariant = DarkSurfaceTier2,
    onSurfaceVariant = TextSecondary,
    surfaceTint = PrimaryLight,
    outline = OutlineColor,
    outlineVariant = OutlineVariant,
    error = CoralTertiary,
    onError = TextPrimary,
    errorContainer = TertiaryContainer,
    onErrorContainer = OnTertiaryContainer
)

@Composable
fun FinTrackTheme(
    darkTheme: Boolean = false, // Set to false to showcase the pristine Light Theme
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) FinTrackDarkColorScheme else FinTrackLightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            val bgArgb = if (darkTheme) DarkBg.toArgb() else LightBg.toArgb()
            window.statusBarColor = bgArgb
            window.navigationBarColor = bgArgb
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}


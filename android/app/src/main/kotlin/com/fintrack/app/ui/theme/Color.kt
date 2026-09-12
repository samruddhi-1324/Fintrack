package com.fintrack.app.ui.theme

import androidx.compose.ui.graphics.Color

// ==========================================
// FinTrack Design System: Obsidian Kinetic Finance
// ==========================================

// Primary Palette: Electric Indigo
val IndigoPrimary = Color(0xFF6366F1)
val PrimaryLight = Color(0xFFC0C1FF)
val PrimaryContainer = Color(0xFF8083FF)
val PrimaryDark = Color(0xFF4F46E5)
val OnPrimary = Color(0xFFFFFFFF)
val OnPrimaryContainer = Color(0xFF0D0096)

// Secondary Palette: Neon Emerald (Inflows / Positive / Surplus)
val EmeraldSecondary = Color(0xFF10B981)
val EmeraldLight = Color(0xFF4EDEA3)
val SecondaryContainer = Color(0xFF00A572)
val OnSecondary = Color(0xFF003824)
val OnSecondaryContainer = Color(0xFF00311F)

// Tertiary Palette: Crimson Coral (Outflows / Deficit / Alerts)
val CoralTertiary = Color(0xFFF43F5E)
val CoralLight = Color(0xFFFFB2B7)
val TertiaryContainer = Color(0xFFFF516A)
val OnTertiary = Color(0xFF67001B)
val OnTertiaryContainer = Color(0xFF5B0017)

// Canvas & Multi-Tier Dark Surfaces (Obsidian Stack)
val DarkBg = Color(0xFF0B0F19)              // Level 0: Canvas Void
val DarkCanvas = Color(0xFF0F131D)          // Canvas Baseline
val DarkSurfaceTier1 = Color(0xFF111827)    // Level 1: Docked surfaces / Card base
val DarkSurfaceTier2 = Color(0xFF1C1F2A)    // Level 2: Standard glass cards
val DarkSurfaceTier3 = Color(0xFF313540)    // Level 3: Modals / High elevation
val DarkSurfaceBright = Color(0xFF353944)
val DarkSurfaceContainerLowest = Color(0xFF0A0E18)
val DarkSurfaceContainerLow = Color(0xFF171B26)

// Glassmorphism Fills
val GlassCardFill = Color(0xB31E293B)       // rgba(30, 41, 59, 0.70)
val GlassModalFill = Color(0xE01E293B)      // rgba(30, 41, 59, 0.88)
val GlassButtonFill = Color(0xCC1E293B)     // rgba(30, 41, 59, 0.80)

// Borders & Outlines
val DarkCardBorder = Color(0x8C334155)      // rgba(51, 65, 85, 0.55)
val OutlineColor = Color(0xFF908FA0)
val OutlineVariant = Color(0xFF464554)
val SpecularHighlight = Color(0x14FFFFFF)   // 1px top highlight rgba(255, 255, 255, 0.08)

// Text & Content
val TextPrimary = Color(0xFFF8FAFC)         // 98% luminance on dark
val TextSecondary = Color(0xFF94A3B8)       // WCAG AA compliant on slate
val TextMuted = Color(0xFF475569)

// Semantic Glow Colors
val PrimaryGlow = Color(0x596366F1)
val PositiveGlow = Color(0x4010B981)
val NegativeGlow = Color(0x40F43F5E)

// ==========================================
// FinTrack Light Theme: Porcelain Sapphire
// ==========================================
val LightBg = Color(0xFFF8F9FF)              // Pristine Porcelain background
val LightSurface = Color(0xFFFFFFFF)         // Pure white card surfaces
val LightSurfaceContainerLow = Color(0xFFEFF4FF) // Ice Slate
val LightSurfaceContainer = Color(0xFFE5EEFF)
val LightSurfaceContainerHigh = Color(0xFFDCE9FF)
val LightSurfaceContainerHighest = Color(0xFFD3E4FE)

val LightTextPrimary = Color(0xFF0B1C30)     // Deep Ink Navy (#0F172A)
val LightTextSecondary = Color(0xFF444653)   // Slate Grey (#334155)
val LightTextMuted = Color(0xFF757684)

val SapphirePrimary = Color(0xFF1E40AF)      // Royal Sapphire Blue
val SapphirePrimaryLight = Color(0xFF2563EB)
val SapphirePrimaryContainer = Color(0xFFDCE9FF)

val LightEmerald = Color(0xFF00563A)         // Soft Emerald
val LightEmeraldContainer = Color(0xFFD1FAE5)

val LightCoral = Color(0xFFBA1A1A)           // Warm Coral
val LightCoralContainer = Color(0xFFFFDAD6)

val LightCardBorder = Color(0xFFE2E8F0)      // Subtle border for light cards
val LightCardShadow = Color(0x0A0B1C30)

// Backward Compatibility Aliases
val Emerald400 = EmeraldLight
val Emerald500 = IndigoPrimary              // Default accent transitioned to Electric Indigo
val Emerald600 = PrimaryDark
val Emerald200 = PrimaryLight
val Emerald900 = PrimaryContainer
val Emerald50 = Color(0xFFECFDF5)
val Emerald100 = Color(0xFFD1FAE5)
val Emerald700 = Color(0xFF047857)
val DarkSurface = DarkSurfaceTier1
val DarkSurfaceElevated = DarkSurfaceTier2
val RedAccent = CoralTertiary
val AmberAccent = Color(0xFFF59E0B)
val BlueAccent = IndigoPrimary
val PurpleAccent = Color(0xFF8B5CF6)



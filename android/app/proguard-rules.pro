# Proguard rules for FinTrack Android
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.fintrack.app.data.models.** { *; }
-keep class com.google.gson.** { *; }
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }

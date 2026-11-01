# QuickTalk Proguard Rules

# Keep Google Play Services Nearby Connections
-keep class com.google.android.gms.nearby.** { *; }

# Keep Room Database entities & DAOs
-keep class com.neartalk.data.local.** { *; }
-dontwarn androidx.room.paging.**

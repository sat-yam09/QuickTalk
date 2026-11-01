import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, FileCode, Folder } from 'lucide-react';

interface AndroidSourceInspectorProps {
  onBack: () => void;
}

const ANDROID_FILES: { name: string; path: string; category: string; content: string }[] = [
  {
    name: 'Color.kt',
    path: 'app/src/main/java/com/quicktalk/ui/theme/Color.kt',
    category: 'Theme',
    content: `package com.quicktalk.ui.theme

import androidx.compose.ui.graphics.Color

// Minimalist Black & White Palette (Zero Neon Colors)
val DarkBackground = Color(0xFF000000)
val DarkSurface = Color(0xFF111111)
val DarkSurfaceVariant = Color(0xFF1E1E1E)
val DarkAccent = Color(0xFFFFFFFF)
val DarkOnAccent = Color(0xFF000000)
val DarkTextPrimary = Color(0xFFFFFFFF)
val DarkTextSecondary = Color(0xFF8E8E93)
val DarkTextDisabled = Color(0xFF48484A)
val DarkError = Color(0xFFE5E5EA)

val LightBackground = Color(0xFFFFFFFF)
val LightSurface = Color(0xFFF4F4F5)
val LightSurfaceVariant = Color(0xFFE4E4E7)
val LightAccent = Color(0xFF09090B)
val LightOnAccent = Color(0xFFFFFFFF)
val LightTextPrimary = Color(0xFF09090B)
val LightTextSecondary = Color(0xFF71717A)
val LightTextDisabled = Color(0xFFA1A1AA)
val LightError = Color(0xFF27272A)

val StatusReady = Color(0xFFFFFFFF)
val StatusOff = Color(0xFF48484A)
val StatusProblem = Color(0xFF8E8E93)`
  },
  {
    name: 'Type.kt',
    path: 'app/src/main/java/com/neartalk/ui/theme/Type.kt',
    category: 'Theme',
    content: `package com.neartalk.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val Typography = Typography(
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = (-0.2).sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 18.sp,
        lineHeight = 24.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 22.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 13.sp,
        lineHeight = 18.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 11.sp,
        lineHeight = 14.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 34.sp,
        letterSpacing = 1.sp
    )
)`
  },
  {
    name: 'Shape.kt',
    path: 'app/src/main/java/com/neartalk/ui/theme/Shape.kt',
    category: 'Theme',
    content: `package com.neartalk.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val Shapes = Shapes(
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(16.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(999.dp)
)

val PillShape = RoundedCornerShape(999.dp)
val CardShape = RoundedCornerShape(16.dp)
val BubbleRadius = 18.dp
val BubbleTightRadius = 6.dp`
  },
  {
    name: 'Theme.kt',
    path: 'app/src/main/java/com/neartalk/ui/theme/Theme.kt',
    category: 'Theme',
    content: `package com.neartalk.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = DarkAccent,
    onPrimary = DarkOnAccent,
    background = DarkBackground,
    surface = DarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onBackground = DarkTextPrimary,
    onSurface = DarkTextPrimary,
    onSurfaceVariant = DarkTextSecondary,
    error = DarkError
)

private val LightColorScheme = lightColorScheme(
    primary = LightAccent,
    onPrimary = LightOnAccent,
    background = LightBackground,
    surface = LightSurface,
    surfaceVariant = LightSurfaceVariant,
    onBackground = LightTextPrimary,
    onSurface = LightTextPrimary,
    onSurfaceVariant = LightTextSecondary,
    error = LightError
)

enum class ThemeMode { SYSTEM, LIGHT, DARK }

@Composable
fun NearTalkTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit
) {
    val darkTheme = when (themeMode) {
        ThemeMode.SYSTEM -> isSystemInDarkTheme()
        ThemeMode.LIGHT -> false
        ThemeMode.DARK -> true
    }

    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window ?: return@SideEffect
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).apply {
                isAppearanceLightStatusBars = !darkTheme
                isAppearanceLightNavigationBars = !darkTheme
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}`
  },
  {
    name: 'NearbyConnectionsManager.kt',
    path: 'app/src/main/java/com/neartalk/nearby/NearbyConnectionsManager.kt',
    category: 'Nearby Connections',
    content: `// Google Nearby Connections P2P Transport Layer
// Using Strategy.P2P_POINT_TO_POINT for zero-cloud offline messaging
// Handles endpoint discovery, advertising, connection auth tokens, and payload transfer.`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'app/src/main/AndroidManifest.xml',
    category: 'Manifest & Config',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />
    <uses-feature android:name="android.hardware.bluetooth" android:required="true" />
    <uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
</manifest>`
  }
];

export const AndroidSourceInspector: React.FC<AndroidSourceInspectorProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[var(--bg-color)] screen-enter">
      {/* Top Header */}
      <div className="w-full px-3 py-2.5 flex items-center justify-between border-b border-[var(--surface-variant)]/40 bg-[var(--bg-color)] shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] cursor-pointer active:opacity-70"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[17px] font-semibold text-[var(--text-primary)]">
              Android Source Code
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Jetpack Compose & Nearby Connections
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] bg-[var(--surface-variant)] text-[var(--text-primary)] cursor-pointer active:opacity-80"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[var(--accent-color)]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* File Selector Tabs */}
      <div className="flex overflow-x-auto gap-2 p-3 border-b border-[var(--surface-variant)]/30 no-scrollbar shrink-0 bg-[var(--surface-color)]">
        {ANDROID_FILES.map((file) => (
          <button
            key={file.name}
            type="button"
            onClick={() => setSelectedFile(file)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
              selectedFile.name === file.name
                ? 'bg-[var(--accent-color)] text-[var(--on-accent-color)]'
                : 'bg-[var(--surface-variant)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* Code Viewer */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[12px] leading-[18px] text-[var(--text-primary)] select-text bg-[var(--bg-color)]">
        <div className="text-[11px] text-[var(--text-secondary)] mb-3 pb-2 border-b border-[var(--surface-variant)]/40 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[var(--accent-color)]" />
          <span>{selectedFile.path}</span>
        </div>
        <pre className="whitespace-pre-wrap">{selectedFile.content}</pre>
      </div>
    </div>
  );
};

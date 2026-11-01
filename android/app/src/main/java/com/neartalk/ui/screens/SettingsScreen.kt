package com.neartalk.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Casino
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.neartalk.ui.components.SettingsRow
import com.neartalk.ui.theme.*

/**
 * Screen E: Settings
 */
@Composable
fun SettingsScreen(
    currentUsername: String,
    isDiscoveryVisible: Boolean,
    currentThemeMode: ThemeMode,
    isBluetoothGranted: Boolean,
    isNearbyDevicesGranted: Boolean,
    onUsernameRegenerate: () -> Unit,
    onToggleVisibility: (Boolean) -> Unit,
    onSelectTheme: (ThemeMode) -> Unit,
    onRequestPermissions: () -> Unit,
    onClearChatHistory: () -> Unit,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showClearConfirmDialog by remember { mutableStateOf(false) }

    if (showClearConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showClearConfirmDialog = false },
            title = {
                Text(
                    text = "Clear all chat history?",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
            },
            text = {
                Text(
                    text = "This will permanently remove all stored local conversations and messages from this device.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        onClearChatHistory()
                        showClearConfirmDialog = false
                    }
                ) {
                    Text(
                        text = "Clear",
                        color = MaterialTheme.colorScheme.error,
                        fontWeight = FontWeight.Medium
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { showClearConfirmDialog = false }) {
                    Text(
                        text = "Cancel",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            },
            containerColor = MaterialTheme.colorScheme.surface,
            shape = RoundedCornerShape(16.dp)
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .windowInsetsPadding(WindowInsets.safeDrawing)
    ) {
        // Top Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack, modifier = Modifier.size(40.dp)) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = MaterialTheme.colorScheme.onBackground
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Settings",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground
            )
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Section: PROFILE
            SettingsSection(title = "PROFILE") {
                SettingsRow(
                    title = currentUsername,
                    subtitle = "Tap dice to regenerate your temporary name",
                    trailingContent = {
                        IconButton(onClick = onUsernameRegenerate) {
                            Icon(
                                imageVector = Icons.Default.Casino,
                                contentDescription = "Regenerate name",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                )
            }

            // Section: PRIVACY
            SettingsSection(title = "PRIVACY") {
                SettingsRow(
                    title = "Discovery Visibility",
                    subtitle = if (isDiscoveryVisible) "Nearby devices can discover you" else "Hidden from nearby devices",
                    trailingContent = {
                        Switch(
                            checked = isDiscoveryVisible,
                            onCheckedChange = onToggleVisibility,
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = MaterialTheme.colorScheme.onPrimary,
                                checkedTrackColor = MaterialTheme.colorScheme.primary,
                                uncheckedThumbColor = MaterialTheme.colorScheme.onSurfaceVariant,
                                uncheckedTrackColor = MaterialTheme.colorScheme.surfaceVariant
                            )
                        )
                    }
                )
            }

            // Section: APPEARANCE
            SettingsSection(title = "APPEARANCE") {
                ThemeOptionRow(
                    label = "System Default",
                    isSelected = currentThemeMode == ThemeMode.SYSTEM,
                    onClick = { onSelectTheme(ThemeMode.SYSTEM) }
                )
                ThemeOptionRow(
                    label = "Dark Theme",
                    isSelected = currentThemeMode == ThemeMode.DARK,
                    onClick = { onSelectTheme(ThemeMode.DARK) }
                )
                ThemeOptionRow(
                    label = "Light Theme",
                    isSelected = currentThemeMode == ThemeMode.LIGHT,
                    onClick = { onSelectTheme(ThemeMode.LIGHT) }
                )
            }

            // Section: PERMISSIONS
            SettingsSection(title = "PERMISSIONS") {
                SettingsRow(
                    title = "Bluetooth & Nearby Devices",
                    subtitle = if (isBluetoothGranted && isNearbyDevicesGranted) "Active and granted" else "Required to discover and pair with nearby devices",
                    trailingContent = {
                        if (!isBluetoothGranted || !isNearbyDevicesGranted) {
                            TextButton(onClick = onRequestPermissions) {
                                Text(
                                    text = "Fix",
                                    color = MaterialTheme.colorScheme.primary,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        } else {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Granted",
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                )
            }

            // Section: DATA
            SettingsSection(title = "DATA") {
                SettingsRow(
                    title = "Clear chat history",
                    subtitle = "Permanently wipe local conversation database",
                    onClick = { showClearConfirmDialog = true },
                    isDestructive = true
                )
            }

            // Section: ABOUT
            SettingsSection(title = "ABOUT") {
                SettingsRow(
                    title = "QuickTalk v1.0.0",
                    subtitle = "Messages go directly between devices. No servers."
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
private fun SettingsSection(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(start = 12.dp, bottom = 6.dp)
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(MaterialTheme.colorScheme.surface)
        ) {
            content()
        }
    }
}

@Composable
private fun ThemeOptionRow(
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    SettingsRow(
        title = label,
        onClick = onClick,
        trailingContent = {
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Selected",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    )
}

@Preview(name = "Settings - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun SettingsScreenDarkPreview() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        SettingsScreen(
            currentUsername = "SwiftFox83",
            isDiscoveryVisible = true,
            currentThemeMode = ThemeMode.DARK,
            isBluetoothGranted = true,
            isNearbyDevicesGranted = true,
            onUsernameRegenerate = {},
            onToggleVisibility = {},
            onSelectTheme = {},
            onRequestPermissions = {},
            onClearChatHistory = {},
            onBack = {}
        )
    }
}

@Preview(name = "Settings - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun SettingsScreenLightPreview() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        SettingsScreen(
            currentUsername = "SwiftFox83",
            isDiscoveryVisible = false,
            currentThemeMode = ThemeMode.LIGHT,
            isBluetoothGranted = false,
            isNearbyDevicesGranted = false,
            onUsernameRegenerate = {},
            onToggleVisibility = {},
            onSelectTheme = {},
            onRequestPermissions = {},
            onClearChatHistory = {},
            onBack = {}
        )
    }
}

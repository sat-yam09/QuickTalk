package com.neartalk.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Casino
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.neartalk.ui.components.PrimaryButton
import com.neartalk.ui.theme.*

/**
 * Screen A: Welcome / Identity Setup
 * Minimal welcome experience with radar mark, display name input, and random generation.
 */
@Composable
fun WelcomeScreen(
    currentUsername: String,
    onUsernameChange: (String) -> Unit,
    onRegenerateUsername: () -> Unit,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        // Center Content: Logo, App Name, Description, Avatar, Field
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Small logo mark: radar-wave icon in a rounded square
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.GraphicEq,
                    contentDescription = "QuickTalk Radar Logo",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "QuickTalk",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onBackground
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Private messaging with people nearby. No internet, no phone number.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 24.dp)
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Avatar preview
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = currentUsername.take(2).uppercase(),
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Username input field with dice icon to regenerate
            OutlinedTextField(
                value = currentUsername,
                onValueChange = onUsernameChange,
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = MaterialTheme.colorScheme.primary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.surfaceVariant,
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface,
                    cursorColor = MaterialTheme.colorScheme.primary
                ),
                trailingIcon = {
                    IconButton(onClick = onRegenerateUsername) {
                        Icon(
                            imageVector = Icons.Default.Casino,
                            contentDescription = "Regenerate random username",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 56.dp)
            )
        }

        // Bottom section: Continue pill button + privacy caption
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            PrimaryButton(
                text = "Continue",
                onClick = onContinue,
                enabled = currentUsername.isNotBlank()
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Your name is stored only on this device.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Preview(name = "Welcome - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun WelcomeScreenDarkPreview() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        WelcomeScreen(
            currentUsername = "SwiftFox83",
            onUsernameChange = {},
            onRegenerateUsername = {},
            onContinue = {}
        )
    }
}

@Preview(name = "Welcome - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun WelcomeScreenLightPreview() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        WelcomeScreen(
            currentUsername = "SwiftFox83",
            onUsernameChange = {},
            onRegenerateUsername = {},
            onContinue = {}
        )
    }
}

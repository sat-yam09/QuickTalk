package com.neartalk.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Link
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.neartalk.ui.theme.*

/**
 * StatusDot: Indicates peer discovery or connection readiness
 * Teal = ready, Grey = off, Soft Red = problem
 */
@Composable
fun StatusDot(
    status: StatusDotState,
    modifier: Modifier = Modifier
) {
    val color = when (status) {
        StatusDotState.READY -> StatusReady
        StatusDotState.OFF -> StatusOff
        StatusDotState.PROBLEM -> StatusProblem
    }
    Box(
        modifier = modifier
            .size(8.dp)
            .clip(CircleShape)
            .background(color)
    )
}

enum class StatusDotState {
    READY,
    OFF,
    PROBLEM
}

/**
 * PrimaryButton: 999dp pill filled accent button with onAccent text
 */
@Composable
fun PrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = PillShape,
        colors = ButtonDefaults.buttonColors(
            containerColor = MaterialTheme.colorScheme.primary,
            contentColor = MaterialTheme.colorScheme.onPrimary,
            disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
            disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.38f)
        ),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium)
        )
    }
}

/**
 * SecondaryButton: 999dp outlined neutral button (never red)
 */
@Composable
fun SecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    OutlinedButton(
        onClick = onClick,
        enabled = enabled,
        shape = PillShape,
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = MaterialTheme.colorScheme.onBackground
        ),
        border = ButtonDefaults.outlinedButtonBorder.copy(
            brush = SolidColor(MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.3f))
        ),
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 48.dp)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium)
        )
    }
}

/**
 * DeviceRow: Row for discovered nearby peer with avatar (40dp), username, status line, Connect pill
 */
@Composable
fun DeviceRow(
    username: String,
    statusText: String,
    avatarText: String,
    onConnect: () -> Unit,
    modifier: Modifier = Modifier,
    isConnecting: Boolean = false,
    isConnected: Boolean = false
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            // Avatar (40dp)
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = avatarText.take(2).uppercase(),
                    style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onBackground
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column {
                Text(
                    text = username,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Medium),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    when {
                        isConnected -> {
                            Icon(
                                imageVector = Icons.Default.Link,
                                contentDescription = "Connected",
                                tint = MaterialTheme.colorScheme.onBackground,
                                modifier = Modifier.size(13.dp)
                            )
                        }
                        isConnecting -> {
                            CircularProgressIndicator(
                                modifier = Modifier.size(12.dp),
                                strokeWidth = 1.5.dp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        else -> {
                            Icon(
                                imageVector = Icons.Default.GraphicEq,
                                contentDescription = "Available",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(13.dp)
                            )
                        }
                    }
                    Text(
                        text = statusText,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Connect pill button
        Button(
            onClick = onConnect,
            enabled = !isConnecting && !isConnected,
            shape = PillShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isConnected) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.primary,
                contentColor = if (isConnected) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onPrimary
            ),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
            modifier = Modifier.heightIn(min = 36.dp)
        ) {
            Text(
                text = when {
                    isConnected -> "Connected"
                    isConnecting -> "Connecting…"
                    else -> "Connect"
                },
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium)
            )
        }
    }
}

/**
 * MessageBubble:
 * Mine = accent background with onAccent text.
 * Theirs = surface background.
 * 18dp radius with sender-nearest corner squared to 6dp.
 * Max width 75%. Timestamp 11sp inside bubble bottom-right.
 */
@Composable
fun MessageBubble(
    text: String,
    timestamp: String,
    isFromMe: Boolean,
    deliveryStatus: String = "sent",
    modifier: Modifier = Modifier
) {
    val bubbleShape = if (isFromMe) {
        RoundedCornerShape(
            topStart = BubbleRadius,
            topEnd = BubbleRadius,
            bottomStart = BubbleRadius,
            bottomEnd = BubbleTightRadius
        )
    } else {
        RoundedCornerShape(
            topStart = BubbleRadius,
            topEnd = BubbleRadius,
            bottomStart = BubbleTightRadius,
            bottomEnd = BubbleRadius
        )
    }

    val backgroundColor = if (isFromMe) {
        MaterialTheme.colorScheme.primary
    } else {
        MaterialTheme.colorScheme.surface
    }

    val textColor = if (isFromMe) {
        MaterialTheme.colorScheme.onPrimary
    } else {
        MaterialTheme.colorScheme.onBackground
    }

    val timeColor = if (isFromMe) {
        MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.7f)
    } else {
        MaterialTheme.colorScheme.onSurfaceVariant
    }

    Column(
        modifier = modifier.fillMaxWidth(),
        horizontalAlignment = if (isFromMe) Alignment.End else Alignment.Start
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth(0.75f)
                .clip(bubbleShape)
                .background(backgroundColor)
                .padding(horizontal = 14.dp, vertical = 10.dp)
        ) {
            Column {
                Text(
                    text = text,
                    style = MaterialTheme.typography.bodyLarge,
                    color = textColor
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = timestamp,
                        style = MaterialTheme.typography.labelSmall,
                        color = timeColor
                    )
                    if (isFromMe) {
                        Spacer(modifier = Modifier.width(4.dp))
                        when (deliveryStatus) {
                            "sending" -> Text(
                                text = "Sending",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                color = timeColor
                            )
                            "failed" -> Text(
                                text = "Failed (tap)",
                                style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                                color = MaterialTheme.colorScheme.error
                            )
                            else -> Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Sent",
                                tint = timeColor,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

/**
 * Composer:
 * Pinned bottom, rounded 24dp field on surfaceVariant, multiline up to 5 lines,
 * circular 44dp accent send button (disabled and muted when empty).
 */
@Composable
fun Composer(
    value: String,
    onValueChange: (String) -> Unit,
    onSend: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.Bottom
    ) {
        Box(
            modifier = Modifier
                .weight(1f)
                .clip(RoundedCornerShape(24.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            if (value.isEmpty()) {
                Text(
                    text = "Message…",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                )
            }
            BasicTextField(
                value = value,
                onValueChange = onValueChange,
                textStyle = MaterialTheme.typography.bodyLarge.copy(
                    color = MaterialTheme.colorScheme.onBackground
                ),
                maxLines = 5,
                cursorBrush = SolidColor(MaterialTheme.colorScheme.primary),
                modifier = Modifier.fillMaxWidth()
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Circular 44dp accent send button
        val isSendEnabled = value.isNotBlank()
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(CircleShape)
                .background(
                    if (isSendEnabled) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.surfaceVariant
                )
                .clickable(enabled = isSendEnabled, onClick = onSend),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.AutoMirrored.Filled.Send,
                contentDescription = "Send message",
                tint = if (isSendEnabled) MaterialTheme.colorScheme.onPrimary
                else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.38f),
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

/**
 * SettingsRow:
 * Plain grouped list row on surface color, 56dp minimum height.
 */
@Composable
fun SettingsRow(
    title: String,
    subtitle: String? = null,
    onClick: (() -> Unit)? = null,
    trailingContent: @Composable (() -> Unit)? = null,
    isDestructive: Boolean = false,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .clickable(enabled = onClick != null, onClick = { onClick?.invoke() })
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge.copy(
                    color = if (isDestructive) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onBackground,
                    fontWeight = FontWeight.Medium
                )
            )
            if (subtitle != null) {
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        if (trailingContent != null) {
            Spacer(modifier = Modifier.width(8.dp))
            trailingContent()
        }
    }
}

/**
 * ErrorCard:
 * Rounded 16dp card with plain-English sentence and single action button.
 */
@Composable
fun ErrorCard(
    message: String,
    actionText: String,
    onAction: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp)
    ) {
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(12.dp))
        Button(
            onClick = onAction,
            shape = PillShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary
            ),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
        ) {
            Text(
                text = actionText,
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium)
            )
        }
    }
}

// Previews
@Preview(name = "Components - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun ComponentsPreviewDark() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PrimaryButton(text = "Start discovery", onClick = {})
            SecondaryButton(text = "Stop", onClick = {})
            DeviceRow(username = "SwiftFox83", statusText = "Available", avatarText = "SF", onConnect = {})
            MessageBubble(text = "Hello! Are you nearby?", timestamp = "10:42 AM", isFromMe = true)
            MessageBubble(text = "Yes, right in the same room!", timestamp = "10:43 AM", isFromMe = false)
        }
    }
}

@Preview(name = "Components - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun ComponentsPreviewLight() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            PrimaryButton(text = "Continue", onClick = {})
            SecondaryButton(text = "Reject", onClick = {})
            DeviceRow(username = "NeonHawk42", statusText = "Connecting…", avatarText = "NH", onConnect = {}, isConnecting = true)
        }
    }
}

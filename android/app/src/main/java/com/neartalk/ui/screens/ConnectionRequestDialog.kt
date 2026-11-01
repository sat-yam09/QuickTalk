package com.neartalk.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.neartalk.ui.components.PrimaryButton
import com.neartalk.ui.components.SecondaryButton
import com.neartalk.ui.theme.*

/**
 * Screen C: Connection Request / Authentication Verification
 * Centered modal card or bottom sheet displaying avatars joined by a line,
 * 28sp verification code, accept/reject buttons, and peer state.
 */
@Composable
fun ConnectionRequestCard(
    myUsername: String,
    peerUsername: String,
    verificationCode: String,
    statusLine: String = "Check that this code matches on both devices.",
    isIncoming: Boolean = true,
    isConnecting: Boolean = false,
    onAccept: () -> Unit,
    onReject: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Dual Avatars joined by thin line
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                // My Avatar
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = myUsername.take(2).uppercase(),
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                // Connecting thin line
                Box(
                    modifier = Modifier
                        .width(48.dp)
                        .height(2.dp)
                        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.5f))
                )

                // Peer Avatar
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = peerUsername.take(2).uppercase(),
                        style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Title
            Text(
                text = if (isIncoming) "$peerUsername wants to connect" else "Connecting to $peerUsername",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 28sp Verification Code
            Text(
                text = verificationCode,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Check that this code matches on both devices.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(modifier = Modifier.weight(1f)) {
                    SecondaryButton(
                        text = "Reject",
                        onClick = onReject
                    )
                }
                Box(modifier = Modifier.weight(1f)) {
                    PrimaryButton(
                        text = if (isConnecting) "Connecting…" else "Accept",
                        onClick = onAccept,
                        enabled = !isConnecting
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Status Line below
            Text(
                text = statusLine,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Preview(name = "Connection Request - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun ConnectionRequestDarkPreview() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        ConnectionRequestCard(
            myUsername = "SwiftFox83",
            peerUsername = "NeonHawk42",
            verificationCode = "482 910",
            statusLine = "Waiting for NeonHawk42…",
            onAccept = {},
            onReject = {}
        )
    }
}

@Preview(name = "Connection Request - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun ConnectionRequestLightPreview() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        ConnectionRequestCard(
            myUsername = "SwiftFox83",
            peerUsername = "NeonHawk42",
            verificationCode = "482 910",
            statusLine = "Waiting for NeonHawk42…",
            onAccept = {},
            onReject = {}
        )
    }
}

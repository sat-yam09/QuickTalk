package com.neartalk.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.neartalk.ui.components.*
import com.neartalk.ui.theme.*

data class PeerUiModel(
    val endpointId: String,
    val username: String,
    val avatarInitials: String,
    val statusText: String,
    val isConnecting: Boolean = false,
    val isConnected: Boolean = false
)

enum class DiscoveryState {
    IDLE,
    SCANNING,
    EMPTY,
    ERROR
}

/**
 * Screen B: Home / Nearby Discovery
 */
@Composable
fun HomeScreen(
    myUsername: String,
    discoveryState: DiscoveryState,
    discoveredPeers: List<PeerUiModel>,
    statusDotState: StatusDotState,
    errorMessage: String? = null,
    errorActionText: String? = null,
    onErrorAction: () -> Unit = {},
    onStartDiscovery: () -> Unit,
    onStopDiscovery: () -> Unit,
    onConnectToPeer: (PeerUiModel) -> Unit,
    onOpenSettings: () -> Unit,
    onOpenProfile: () -> Unit,
    modifier: Modifier = Modifier
) {
    // 2s calm pulsing radar circle animation when scanning
    val infiniteTransition = rememberInfiniteTransition(label = "RadarPulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.25f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseScale"
    )
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.25f,
        targetValue = 0.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "PulseAlpha"
    )

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar: logo + "NearTalk" + status dot | avatar chip + settings icon
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.GraphicEq,
                        contentDescription = "QuickTalk",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Text(
                    text = "QuickTalk",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Spacer(modifier = Modifier.width(8.dp))

                // Tiny status dot (teal = ready, grey = off, soft red = problem)
                StatusDot(status = statusDotState)
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                // User profile avatar chip
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .clickable(onClick = onOpenProfile),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = myUsername.take(2).uppercase(),
                        style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                        color = MaterialTheme.colorScheme.primary
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = onOpenSettings,
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings",
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Main section
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            if (discoveredPeers.isEmpty()) {
                // Vertically centered hero when list is empty
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    // Pulsing radar circle
                    Box(
                        modifier = Modifier.size(130.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        if (discoveryState == DiscoveryState.SCANNING) {
                            Box(
                                modifier = Modifier
                                    .size(120.dp)
                                    .scale(pulseScale)
                                    .clip(CircleShape)
                                    .background(MaterialTheme.colorScheme.primary.copy(alpha = pulseAlpha))
                            )
                        }

                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.GraphicEq,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Looking for people nearby",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onBackground,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "Discover and connect with nearby devices.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    when (discoveryState) {
                        DiscoveryState.SCANNING -> {
                            Text(
                                text = "Searching…",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        DiscoveryState.EMPTY -> {
                            Text(
                                text = "No one nearby yet",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        DiscoveryState.ERROR -> {
                            if (errorMessage != null && errorActionText != null) {
                                ErrorCard(
                                    message = errorMessage,
                                    actionText = errorActionText,
                                    onAction = onErrorAction
                                )
                            }
                        }
                        else -> Unit
                    }
                }
            } else {
                // Discovered peers list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        Text(
                            text = if (discoveryState == DiscoveryState.SCANNING) "Searching for nearby devices…" else "Nearby devices",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                    }

                    items(discoveredPeers, key = { it.endpointId }) { peer ->
                        DeviceRow(
                            username = peer.username,
                            statusText = peer.statusText,
                            avatarText = peer.avatarInitials,
                            onConnect = { onConnectToPeer(peer) },
                            isConnecting = peer.isConnecting,
                            isConnected = peer.isConnected
                        )
                    }
                }
            }
        }

        // Bottom Action Button: Start discovery / Stop
        Box(modifier = Modifier.padding(top = 16.dp)) {
            if (discoveryState == DiscoveryState.SCANNING) {
                SecondaryButton(
                    text = "Stop",
                    onClick = onStopDiscovery
                )
            } else {
                PrimaryButton(
                    text = "Start discovery",
                    onClick = onStartDiscovery
                )
            }
        }
    }
}

@Preview(name = "Home - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun HomeScreenDarkPreview() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        HomeScreen(
            myUsername = "SwiftFox83",
            discoveryState = DiscoveryState.IDLE,
            discoveredPeers = emptyList(),
            statusDotState = StatusDotState.READY,
            onStartDiscovery = {},
            onStopDiscovery = {},
            onConnectToPeer = {},
            onOpenSettings = {},
            onOpenProfile = {}
        )
    }
}

@Preview(name = "Home With Peers - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun HomeScreenPeersLightPreview() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        HomeScreen(
            myUsername = "SwiftFox83",
            discoveryState = DiscoveryState.SCANNING,
            discoveredPeers = listOf(
                PeerUiModel("1", "NeonHawk42", "NH", "Available"),
                PeerUiModel("2", "CalmOtter19", "CO", "Available")
            ),
            statusDotState = StatusDotState.READY,
            onStartDiscovery = {},
            onStopDiscovery = {},
            onConnectToPeer = {},
            onOpenSettings = {},
            onOpenProfile = {}
        )
    }
}

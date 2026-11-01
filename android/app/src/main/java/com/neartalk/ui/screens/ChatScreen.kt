package com.neartalk.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.neartalk.ui.components.Composer
import com.neartalk.ui.components.MessageBubble
import com.neartalk.ui.components.StatusDot
import com.neartalk.ui.components.StatusDotState
import com.neartalk.ui.theme.*
import kotlinx.coroutines.launch

data class MessageUiModel(
    val messageId: String,
    val senderId: String,
    val isFromMe: Boolean,
    val content: String,
    val timestamp: String,
    val rawTimestamp: Long,
    val deliveryStatus: String = "sent" // sending, sent, failed
)

/**
 * Screen D: Private Chat
 */
@Composable
fun ChatScreen(
    peerUsername: String,
    peerAvatarInitials: String,
    connectionStatusText: String, // "Connected", "Reconnecting…", "Disconnected"
    isPeerConnected: Boolean,
    messages: List<MessageUiModel>,
    currentDraft: String,
    onDraftChange: (String) -> Unit,
    onSendMessage: () -> Unit,
    onBack: () -> Unit,
    onMoreOptions: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Auto-scroll to newest message on change
    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) {
            coroutineScope.launch {
                listState.animateScrollToItem(messages.size - 1)
            }
        }
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

            Spacer(modifier = Modifier.width(4.dp))

            // Avatar 32dp
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = peerAvatarInitials.take(2).uppercase(),
                    style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.primary
                )
            }

            Spacer(modifier = Modifier.width(10.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = peerUsername,
                    style = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onBackground
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    StatusDot(
                        status = if (isPeerConnected) StatusDotState.READY else StatusDotState.OFF,
                        modifier = Modifier.padding(end = 6.dp)
                    )
                    Text(
                        text = connectionStatusText,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            IconButton(onClick = onMoreOptions, modifier = Modifier.size(40.dp)) {
                Icon(
                    imageVector = Icons.Default.MoreVert,
                    contentDescription = "More options",
                    tint = MaterialTheme.colorScheme.onBackground
                )
            }
        }

        // Chat Body
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
        ) {
            if (messages.isEmpty()) {
                // Empty state: centered muted text
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Say hello. Messages stay on your devices.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.Top
                ) {
                    itemsIndexed(messages, key = { _, item -> item.messageId }) { index, msg ->
                        // Calculate spacing: consecutive messages from same sender within 2 min have tighter 2dp gap, otherwise 8dp
                        val prevMsg = if (index > 0) messages[index - 1] else null
                        val isConsecutive = prevMsg != null &&
                                prevMsg.senderId == msg.senderId &&
                                (msg.rawTimestamp - prevMsg.rawTimestamp < 120_000)

                        val topPadding = if (index == 0) 8.dp else if (isConsecutive) 2.dp else 8.dp

                        Box(modifier = Modifier.padding(top = topPadding)) {
                            MessageBubble(
                                text = msg.content,
                                timestamp = msg.timestamp,
                                isFromMe = msg.isFromMe,
                                deliveryStatus = msg.deliveryStatus
                            )
                        }
                    }
                }
            }
        }

        // Composer pinned bottom, sits above keyboard with imePadding
        Composer(
            value = currentDraft,
            onValueChange = onDraftChange,
            onSend = onSendMessage,
            modifier = Modifier.imePadding()
        )
    }
}

@Preview(name = "Chat - Dark", showBackground = true, backgroundColor = 0xFF0B0F14)
@Composable
fun ChatScreenDarkPreview() {
    NearTalkTheme(themeMode = ThemeMode.DARK) {
        ChatScreen(
            peerUsername = "NeonHawk42",
            peerAvatarInitials = "NH",
            connectionStatusText = "Connected",
            isPeerConnected = true,
            messages = listOf(
                MessageUiModel("1", "NeonHawk42", false, "Hey! Offline Nearby connection works!", "10:41 AM", 1),
                MessageUiModel("2", "SwiftFox83", true, "Yes! Zero internet, direct peer-to-peer.", "10:42 AM", 2),
                MessageUiModel("3", "SwiftFox83", true, "Fast and private.", "10:42 AM", 3)
            ),
            currentDraft = "",
            onDraftChange = {},
            onSendMessage = {},
            onBack = {}
        )
    }
}

@Preview(name = "Chat - Light", showBackground = true, backgroundColor = 0xFFF7F9FB)
@Composable
fun ChatScreenLightPreview() {
    NearTalkTheme(themeMode = ThemeMode.LIGHT) {
        ChatScreen(
            peerUsername = "NeonHawk42",
            peerAvatarInitials = "NH",
            connectionStatusText = "Connected",
            isPeerConnected = true,
            messages = emptyList(),
            currentDraft = "Hi there!",
            onDraftChange = {},
            onSendMessage = {},
            onBack = {}
        )
    }
}

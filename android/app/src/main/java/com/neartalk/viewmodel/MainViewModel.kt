package com.neartalk.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.neartalk.data.local.MessageEntity
import com.neartalk.data.repository.ChatRepository
import com.neartalk.data.repository.UserRepository
import com.neartalk.nearby.NearbyConnectionsManager
import com.neartalk.nearby.NearbyEvent
import com.neartalk.ui.components.StatusDotState
import com.neartalk.ui.screens.DiscoveryState
import com.neartalk.ui.screens.MessageUiModel
import com.neartalk.ui.screens.PeerUiModel
import com.neartalk.ui.theme.ThemeMode
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

sealed class Screen {
    object Welcome : Screen()
    object Home : Screen()
    data class Chat(val endpointId: String, val peerName: String) : Screen()
    object Settings : Screen()
}

data class ConnectionRequestState(
    val endpointId: String,
    val peerName: String,
    val authCode: String,
    val isIncoming: Boolean,
    val isConnecting: Boolean = false
)

class MainViewModel(
    private val userRepository: UserRepository,
    private val chatRepository: ChatRepository,
    private val nearbyManager: NearbyConnectionsManager
) : ViewModel() {

    private val _currentScreen = MutableStateFlow<Screen>(Screen.Welcome)
    val currentScreen: StateFlow<Screen> = _currentScreen

    private val _username = MutableStateFlow("SwiftFox83")
    val username: StateFlow<String> = _username

    private val _themeMode = MutableStateFlow(ThemeMode.SYSTEM)
    val themeMode: StateFlow<ThemeMode> = _themeMode

    private val _isDiscoveryVisible = MutableStateFlow(true)
    val isDiscoveryVisible: StateFlow<Boolean> = _isDiscoveryVisible

    private val _discoveryState = MutableStateFlow(DiscoveryState.IDLE)
    val discoveryState: StateFlow<DiscoveryState> = _discoveryState

    private val _statusDotState = MutableStateFlow(StatusDotState.READY)
    val statusDotState: StateFlow<StatusDotState> = _statusDotState

    private val _discoveredPeers = MutableStateFlow<List<PeerUiModel>>(emptyList())
    val discoveredPeers: StateFlow<List<PeerUiModel>> = _discoveredPeers

    private val _connectionRequest = MutableStateFlow<ConnectionRequestState?>(null)
    val connectionRequest: StateFlow<ConnectionRequestState?> = _connectionRequest

    private val _activeChatPeer = MutableStateFlow<PeerUiModel?>(null)
    val activeChatPeer: StateFlow<PeerUiModel?> = _activeChatPeer

    private val _messages = MutableStateFlow<List<MessageUiModel>>(emptyList())
    val messages: StateFlow<List<MessageUiModel>> = _messages

    private val _currentDraft = MutableStateFlow("")
    val currentDraft: StateFlow<String> = _currentDraft

    private val timeFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

    init {
        viewModelScope.launch {
            userRepository.currentUser.collect { user ->
                if (user != null) {
                    _username.value = user.displayName
                    if (_currentScreen.value is Screen.Welcome) {
                        _currentScreen.value = Screen.Home
                    }
                }
            }
        }

        observeNearbyEvents()
    }

    private fun observeNearbyEvents() {
        viewModelScope.launch {
            nearbyManager.events.collect { event ->
                when (event) {
                    is NearbyEvent.EndpointFound -> {
                        val newPeer = PeerUiModel(
                            endpointId = event.endpointId,
                            username = event.endpointInfo.endpointName,
                            avatarInitials = event.endpointInfo.endpointName.take(2).uppercase(),
                            statusText = "Available"
                        )
                        _discoveredPeers.update { current ->
                            if (current.none { it.endpointId == event.endpointId }) current + newPeer else current
                        }
                    }
                    is NearbyEvent.EndpointLost -> {
                        _discoveredPeers.update { current ->
                            current.filterNot { it.endpointId == event.endpointId }
                        }
                    }
                    is NearbyEvent.ConnectionInitiated -> {
                        _connectionRequest.value = ConnectionRequestState(
                            endpointId = event.endpointId,
                            peerName = event.connectionInfo.endpointName,
                            authCode = event.connectionInfo.authenticationDigits ?: "482 910",
                            isIncoming = event.connectionInfo.isIncomingConnection
                        )
                    }
                    is NearbyEvent.ConnectionResultReceived -> {
                        _connectionRequest.value = null
                        if (event.resolution.isSuccess) {
                            val peer = _discoveredPeers.value.find { it.endpointId == event.endpointId }
                                ?: PeerUiModel(event.endpointId, "Nearby Peer", "NP", "Connected", isConnected = true)
                            _activeChatPeer.value = peer
                            _currentScreen.value = Screen.Chat(event.endpointId, peer.username)
                        }
                    }
                    is NearbyEvent.Disconnected -> {
                        if (_activeChatPeer.value?.endpointId == event.endpointId) {
                            _activeChatPeer.update { it?.copy(statusText = "Disconnected", isConnected = false) }
                        }
                    }
                    is NearbyEvent.MessageReceived -> {
                        val newMsg = MessageUiModel(
                            messageId = "msg_" + UUID.randomUUID().toString(),
                            senderId = event.endpointId,
                            isFromMe = false,
                            content = event.messageText,
                            timestamp = timeFormat.format(Date()),
                            rawTimestamp = System.currentTimeMillis()
                        )
                        _messages.update { it + newMsg }
                        viewModelScope.launch {
                            chatRepository.saveMessage(
                                MessageEntity(
                                    messageId = newMsg.messageId,
                                    conversationId = event.endpointId,
                                    senderId = event.endpointId,
                                    messageContent = newMsg.content,
                                    timestamp = newMsg.rawTimestamp
                                )
                            )
                        }
                    }
                    is NearbyEvent.Error -> {
                        _statusDotState.value = StatusDotState.PROBLEM
                    }
                }
            }
        }
    }

    fun setUsername(name: String) {
        _username.value = name
    }

    fun regenerateUsername() {
        val adjectives = listOf("Swift", "Neon", "Calm", "Brave", "Quiet", "Solar", "Lunar", "Silver")
        val nouns = listOf("Fox", "Hawk", "Otter", "Wolf", "Falcon", "Deer", "Lynx", "Badger")
        val num = (10..99).random()
        _username.value = "${adjectives.random()}${nouns.random()}$num"
    }

    fun saveUserAndProceed() {
        viewModelScope.launch {
            userRepository.saveUser(_username.value, _username.value.take(2))
            _currentScreen.value = Screen.Home
        }
    }

    fun startDiscovery() {
        _discoveryState.value = DiscoveryState.SCANNING
        nearbyManager.startDiscovery()
        if (_isDiscoveryVisible.value) {
            nearbyManager.startAdvertising(_username.value)
        }
    }

    fun stopDiscovery() {
        _discoveryState.value = DiscoveryState.IDLE
        nearbyManager.stopDiscovery()
        nearbyManager.stopAdvertising()
    }

    fun connectToPeer(peer: PeerUiModel) {
        _discoveredPeers.update { list ->
            list.map { if (it.endpointId == peer.endpointId) it.copy(isConnecting = true, statusText = "Connecting…") else it }
        }
        nearbyManager.requestConnection(_username.value, peer.endpointId)
    }

    fun acceptConnection(endpointId: String) {
        _connectionRequest.update { it?.copy(isConnecting = true) }
        nearbyManager.acceptConnection(endpointId)
    }

    fun rejectConnection(endpointId: String) {
        _connectionRequest.value = null
        nearbyManager.rejectConnection(endpointId)
    }

    fun updateDraft(text: String) {
        _currentDraft.value = text
    }

    fun sendMessage() {
        val text = _currentDraft.value.trim()
        val peer = _activeChatPeer.value ?: return
        if (text.isEmpty()) return

        val msgId = "msg_" + UUID.randomUUID().toString()
        val timestamp = System.currentTimeMillis()
        val newMsg = MessageUiModel(
            messageId = msgId,
            senderId = "me",
            isFromMe = true,
            content = text,
            timestamp = timeFormat.format(Date(timestamp)),
            rawTimestamp = timestamp,
            deliveryStatus = "sent"
        )

        _messages.update { it + newMsg }
        _currentDraft.value = ""

        nearbyManager.sendMessage(peer.endpointId, text)

        viewModelScope.launch {
            chatRepository.saveMessage(
                MessageEntity(
                    messageId = msgId,
                    conversationId = peer.endpointId,
                    senderId = "me",
                    messageContent = text,
                    timestamp = timestamp
                )
            )
        }
    }

    fun setThemeMode(mode: ThemeMode) {
        _themeMode.value = mode
    }

    fun setDiscoveryVisible(visible: Boolean) {
        _isDiscoveryVisible.value = visible
        if (!visible) {
            nearbyManager.stopAdvertising()
        } else if (_discoveryState.value == DiscoveryState.SCANNING) {
            nearbyManager.startAdvertising(_username.value)
        }
    }

    fun clearChatHistory() {
        viewModelScope.launch {
            chatRepository.clearHistory()
            _messages.value = emptyList()
        }
    }

    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }
}

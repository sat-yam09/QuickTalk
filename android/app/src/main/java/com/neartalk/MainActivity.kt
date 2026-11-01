package com.neartalk

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.neartalk.data.local.AppDatabase
import com.neartalk.data.repository.ChatRepository
import com.neartalk.data.repository.UserRepository
import com.neartalk.nearby.NearbyConnectionsManager
import com.neartalk.nearby.NearbyPermissionHelper
import com.neartalk.ui.screens.*
import com.neartalk.ui.theme.NearTalkTheme
import com.neartalk.viewmodel.MainViewModel
import com.neartalk.viewmodel.Screen

class MainActivity : ComponentActivity() {

    private lateinit var nearbyManager: NearbyConnectionsManager

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // Permissions updated
    }

    private val viewModel: MainViewModel by viewModels {
        object : ViewModelProvider.Factory {
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                val db = AppDatabase.getDatabase(applicationContext)
                val userRepo = UserRepository(db.userDao())
                val chatRepo = ChatRepository(db.conversationDao(), db.messageDao())
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(userRepo, chatRepo, nearbyManager) as T
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        nearbyManager = NearbyConnectionsManager(applicationContext)

        checkAndRequestPermissions()

        setContent {
            val themeMode by viewModel.themeMode.collectAsState()
            val currentScreen by viewModel.currentScreen.collectAsState()
            val username by viewModel.username.collectAsState()
            val discoveryState by viewModel.discoveryState.collectAsState()
            val statusDotState by viewModel.statusDotState.collectAsState()
            val discoveredPeers by viewModel.discoveredPeers.collectAsState()
            val connectionRequest by viewModel.connectionRequest.collectAsState()
            val activeChatPeer by viewModel.activeChatPeer.collectAsState()
            val messages by viewModel.messages.collectAsState()
            val currentDraft by viewModel.currentDraft.collectAsState()
            val isDiscoveryVisible by viewModel.isDiscoveryVisible.collectAsState()

            NearTalkTheme(themeMode = themeMode) {
                Surface(modifier = Modifier.fillMaxSize()) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        when (val screen = currentScreen) {
                            is Screen.Welcome -> {
                                WelcomeScreen(
                                    currentUsername = username,
                                    onUsernameChange = { viewModel.setUsername(it) },
                                    onRegenerateUsername = { viewModel.regenerateUsername() },
                                    onContinue = { viewModel.saveUserAndProceed() }
                                )
                            }
                            is Screen.Home -> {
                                HomeScreen(
                                    myUsername = username,
                                    discoveryState = discoveryState,
                                    discoveredPeers = discoveredPeers,
                                    statusDotState = statusDotState,
                                    onStartDiscovery = { viewModel.startDiscovery() },
                                    onStopDiscovery = { viewModel.stopDiscovery() },
                                    onConnectToPeer = { viewModel.connectToPeer(it) },
                                    onOpenSettings = { viewModel.navigateTo(Screen.Settings) },
                                    onOpenProfile = { viewModel.navigateTo(Screen.Settings) }
                                )
                            }
                            is Screen.Chat -> {
                                ChatScreen(
                                    peerUsername = screen.peerName,
                                    peerAvatarInitials = screen.peerName.take(2),
                                    connectionStatusText = if (activeChatPeer?.isConnected == true) "Connected" else "Disconnected",
                                    isPeerConnected = activeChatPeer?.isConnected == true,
                                    messages = messages,
                                    currentDraft = currentDraft,
                                    onDraftChange = { viewModel.updateDraft(it) },
                                    onSendMessage = { viewModel.sendMessage() },
                                    onBack = { viewModel.navigateTo(Screen.Home) }
                                )
                            }
                            is Screen.Settings -> {
                                SettingsScreen(
                                    currentUsername = username,
                                    isDiscoveryVisible = isDiscoveryVisible,
                                    currentThemeMode = themeMode,
                                    isBluetoothGranted = NearbyPermissionHelper.hasBluetoothPermission(this@MainActivity),
                                    isNearbyDevicesGranted = NearbyPermissionHelper.hasAllPermissions(this@MainActivity),
                                    onUsernameRegenerate = { viewModel.regenerateUsername() },
                                    onToggleVisibility = { viewModel.setDiscoveryVisible(it) },
                                    onSelectTheme = { viewModel.setThemeMode(it) },
                                    onRequestPermissions = { checkAndRequestPermissions() },
                                    onClearChatHistory = { viewModel.clearChatHistory() },
                                    onBack = { viewModel.navigateTo(Screen.Home) }
                                )
                            }
                        }

                        // Overlay Connection Request Dialog if present
                        connectionRequest?.let { req ->
                            ConnectionRequestCard(
                                myUsername = username,
                                peerUsername = req.peerName,
                                verificationCode = req.authCode,
                                isIncoming = req.isIncoming,
                                isConnecting = req.isConnecting,
                                onAccept = { viewModel.acceptConnection(req.endpointId) },
                                onReject = { viewModel.rejectConnection(req.endpointId) }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun checkAndRequestPermissions() {
        if (!NearbyPermissionHelper.hasAllPermissions(this)) {
            permissionLauncher.launch(NearbyPermissionHelper.getRequiredPermissions())
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        nearbyManager.stopAllEndpoints()
    }
}

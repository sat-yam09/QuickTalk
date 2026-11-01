import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './theme/ThemeContext.tsx';
import { WelcomeScreen } from './screens/WelcomeScreen.tsx';
import { HomeScreen, HomeDiscoveryState } from './screens/HomeScreen.tsx';
import { ConnectionRequestDialog } from './screens/ConnectionRequestDialog.tsx';
import { ChatScreen } from './screens/ChatScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';
import { AndroidSourceInspector } from './screens/AndroidSourceInspector.tsx';
import { QrHandshakeModal } from './screens/QrHandshakeModal.tsx';
import { StatusDotState } from './components/CommonComponents.tsx';
import {
  UserProfile,
  DiscoveredPeer,
  ChatMessage,
  FileMetadata,
  DisappearingTimerOption,
  calculateMessageExpiration,
  filterExpiredMessages,
  generateDeviceId,
  generateRandomUsername,
  generateMessageId,
} from './logic/nearTalkLogic.ts';
import { storageService } from './services/storageService.ts';
import { nearbyService, NearbyServiceEvent } from './services/nearbyService.ts';
import { haptics } from './utils/haptics.ts';

type ActiveScreen = 'welcome' | 'home' | 'chat' | 'settings' | 'inspector';

interface PendingConnection {
  endpointId: string;
  peerName: string;
  authCode: string;
  isIncoming: boolean;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    return storageService.getUser();
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>(() => {
    const saved = storageService.getUser();
    return saved ? 'home' : 'welcome';
  });

  // Discovery & Nearby State
  const [discoveryState, setDiscoveryState] = useState<HomeDiscoveryState>('idle');
  const [discoveredPeers, setDiscoveredPeers] = useState<DiscoveredPeer[]>([]);
  const [statusDotState, setStatusDotState] = useState<StatusDotState>('ready');
  const [isDiscoveryVisible, setIsDiscoveryVisible] = useState(true);

  // Connection Handshake State
  const [pendingConnection, setPendingConnection] = useState<PendingConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // QR Handshake Modal
  const [showQrModal, setShowQrModal] = useState(false);

  // Active Chat State
  const [activePeer, setActivePeer] = useState<DiscoveredPeer | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [disappearingOption, setDisappearingOption] = useState<DisappearingTimerOption>('off');

  // Synchronize nearby service with currentUser
  useEffect(() => {
    if (currentUser) {
      nearbyService.setUser(currentUser);
      if (isDiscoveryVisible) {
        nearbyService.startAdvertising();
      }
    }
  }, [currentUser, isDiscoveryVisible]);

  // Periodic cleanup for expiring messages (Disappearing Messages feature)
  useEffect(() => {
    const purgeInterval = setInterval(() => {
      setMessages((prev) => {
        const filtered = filterExpiredMessages(prev, Date.now());
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(purgeInterval);
  }, []);

  // Subscribe to NearbyService events
  useEffect(() => {
    const unsubscribe = nearbyService.subscribe((event: NearbyServiceEvent) => {
      switch (event.type) {
        case 'peer_found': {
          setDiscoveredPeers((prev) => {
            const exists = prev.some((p) => p.endpointId === event.peer.endpointId);
            if (exists) {
              return prev.map((p) => (p.endpointId === event.peer.endpointId ? event.peer : p));
            }
            return [...prev, event.peer];
          });
          break;
        }
        case 'peer_lost': {
          setDiscoveredPeers((prev) => prev.filter((p) => p.endpointId !== event.endpointId));
          break;
        }
        case 'connection_initiated': {
          setPendingConnection({
            endpointId: event.endpointId,
            peerName: event.peerName,
            authCode: event.authCode,
            isIncoming: event.isIncoming,
          });
          break;
        }
        case 'connection_result': {
          setIsConnecting(false);
          if (event.success) {
            haptics.success();
            // Find or build peer object
            const peer =
              discoveredPeers.find((p) => p.endpointId === event.endpointId) ||
              (pendingConnection
                ? {
                    endpointId: pendingConnection.endpointId,
                    deviceId: pendingConnection.endpointId,
                    displayName: pendingConnection.peerName,
                    avatarIdentifier: pendingConnection.peerName.slice(0, 2).toUpperCase(),
                    status: 'connected' as const,
                    lastSeen: Date.now(),
                  }
                : null);

            if (peer) {
              const connectedPeer: DiscoveredPeer = { ...peer, status: 'connected' };
              setActivePeer(connectedPeer);
              setDiscoveredPeers((prev) => {
                const exists = prev.some((p) => p.endpointId === connectedPeer.endpointId);
                if (exists) {
                  return prev.map((p) =>
                    p.endpointId === connectedPeer.endpointId ? connectedPeer : p
                  );
                }
                return [connectedPeer, ...prev];
              });
              setMessages(storageService.getMessages(connectedPeer.endpointId));
              setActiveScreen('chat');
            }
            setPendingConnection(null);
          } else {
            haptics.warning();
            setPendingConnection(null);
            setDiscoveredPeers((prev) =>
              prev.map((p) =>
                p.endpointId === event.endpointId ? { ...p, status: 'available' } : p
              )
            );
          }
          break;
        }
        case 'message_received': {
          const newMsg: ChatMessage = {
            messageId: generateMessageId(),
            conversationId: event.endpointId,
            senderId: event.endpointId,
            messageContent: event.text,
            timestamp: event.timestamp || Date.now(),
            deliveryStatus: 'sent',
            messageType: event.messageType || 'text',
            fileMetadata: event.fileMetadata,
            expiresAt: event.expiresAt,
          };
          setMessages((prev) => [...prev, newMsg]);
          storageService.saveMessage(newMsg);
          haptics.selection();
          break;
        }
        case 'disconnected': {
          if (activePeer?.endpointId === event.endpointId) {
            setActivePeer((prev) => (prev ? { ...prev, status: 'available' } : null));
          }
          setDiscoveredPeers((prev) =>
            prev.map((p) =>
              p.endpointId === event.endpointId ? { ...p, status: 'available' } : p
            )
          );
          break;
        }
        case 'error': {
          setStatusDotState('problem');
          break;
        }
      }
    });

    return () => unsubscribe();
  }, [discoveredPeers, activePeer, pendingConnection]);

  // Handlers
  const handleUserSetup = (displayName: string) => {
    const user: UserProfile = {
      deviceId: generateDeviceId(),
      displayName,
      avatarIdentifier: displayName.slice(0, 2).toUpperCase(),
      createdAt: Date.now(),
    };
    storageService.saveUser(user);
    setCurrentUser(user);
    setActiveScreen('home');
  };

  const handleStartDiscovery = () => {
    setDiscoveryState('scanning');
    nearbyService.startDiscovery();
  };

  const handleStopDiscovery = () => {
    setDiscoveryState(discoveredPeers.length === 0 ? 'empty' : 'idle');
    nearbyService.stopDiscovery();
  };

  const handleConnectToPeer = (peer: DiscoveredPeer) => {
    setDiscoveredPeers((prev) =>
      prev.map((p) => (p.endpointId === peer.endpointId ? { ...p, status: 'connecting' } : p))
    );
    nearbyService.requestConnection(peer.endpointId);
  };

  const handleAcceptConnection = () => {
    if (!pendingConnection) return;
    setIsConnecting(true);
    nearbyService.acceptConnection(pendingConnection.endpointId);
  };

  const handleRejectConnection = () => {
    if (!pendingConnection) return;
    nearbyService.rejectConnection(pendingConnection.endpointId);
    setPendingConnection(null);
    setIsConnecting(false);
  };

  // QR Handshake Fast Pairing Handler
  const handlePairFromQr = (peer: { deviceId: string; displayName: string; code: string }) => {
    const newPeer: DiscoveredPeer = {
      endpointId: peer.deviceId,
      deviceId: peer.deviceId,
      displayName: peer.displayName,
      avatarIdentifier: peer.displayName.slice(0, 2).toUpperCase(),
      status: 'connecting',
      lastSeen: Date.now(),
    };

    setDiscoveredPeers((prev) => [newPeer, ...prev.filter((p) => p.endpointId !== newPeer.endpointId)]);
    setPendingConnection({
      endpointId: peer.deviceId,
      peerName: peer.displayName,
      authCode: peer.code,
      isIncoming: false,
    });
    nearbyService.requestConnection(peer.deviceId);
  };

  const handleSendMessage = (text: string) => {
    if (!activePeer || !currentUser) return;
    const msgId = generateMessageId();
    const expiration = calculateMessageExpiration(disappearingOption);

    const newMsg: ChatMessage = {
      messageId: msgId,
      conversationId: activePeer.endpointId,
      senderId: currentUser.deviceId,
      messageContent: text,
      timestamp: Date.now(),
      deliveryStatus: 'sent',
      messageType: 'text',
      expiresAt: expiration.expiresAt,
      burnOnDisconnect: expiration.burnOnDisconnect,
    };

    setMessages((prev) => [...prev, newMsg]);
    storageService.saveMessage(newMsg);
    nearbyService.sendMessage(activePeer.endpointId, text, 'text', undefined, expiration.expiresAt);
  };

  // Offline Photo & File Transfer (Without Quality Loss)
  const handleSendFile = (file: File) => {
    if (!activePeer || !currentUser) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const isImage = file.type.startsWith('image/');
      const msgId = generateMessageId();
      const expiration = calculateMessageExpiration(disappearingOption);

      const fileMetadata: FileMetadata = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileData: base64Data,
        transferProgress: 100, // instant local transfer
      };

      const newMsg: ChatMessage = {
        messageId: msgId,
        conversationId: activePeer.endpointId,
        senderId: currentUser.deviceId,
        messageContent: '',
        timestamp: Date.now(),
        deliveryStatus: 'sent',
        messageType: isImage ? 'image' : 'file',
        fileMetadata,
        expiresAt: expiration.expiresAt,
        burnOnDisconnect: expiration.burnOnDisconnect,
      };

      setMessages((prev) => [...prev, newMsg]);
      storageService.saveMessage(newMsg);
      nearbyService.sendMessage(
        activePeer.endpointId,
        '',
        isImage ? 'image' : 'file',
        fileMetadata,
        expiration.expiresAt
      );
    };

    reader.readAsDataURL(file);
  };

  const handleClearHistory = () => {
    storageService.clearAllData();
    setMessages([]);
    setDiscoveredPeers([]);
    setActivePeer(null);
  };

  const handleRegenerateName = () => {
    if (!currentUser) return;
    const newName = generateRandomUsername();
    const updated: UserProfile = {
      ...currentUser,
      displayName: newName,
      avatarIdentifier: newName.slice(0, 2).toUpperCase(),
    };
    storageService.saveUser(updated);
    setCurrentUser(updated);
  };

  const handleLeaveChat = () => {
    if (disappearingOption === 'disconnect' && activePeer) {
      // Burn on disconnect: wipe messages immediately
      setMessages([]);
    }
    setActiveScreen('home');
  };

  return (
    <ThemeProvider>
      <div className="w-full h-screen max-w-[420px] mx-auto flex flex-col bg-[var(--bg-color)] overflow-hidden relative select-none">
        {/* Active Screen View */}
        {activeScreen === 'welcome' && (
          <WelcomeScreen
            initialUsername={currentUser?.displayName || ''}
            onContinue={handleUserSetup}
          />
        )}

        {activeScreen === 'home' && currentUser && (
          <HomeScreen
            myUsername={currentUser.displayName}
            discoveryState={discoveryState}
            discoveredPeers={discoveredPeers}
            statusDotState={statusDotState}
            onStartDiscovery={handleStartDiscovery}
            onStopDiscovery={handleStopDiscovery}
            onConnectToPeer={handleConnectToPeer}
            onOpenSettings={() => setActiveScreen('settings')}
            onOpenProfile={() => setActiveScreen('settings')}
            onOpenQrHandshake={() => setShowQrModal(true)}
          />
        )}

        {activeScreen === 'chat' && currentUser && activePeer && (
          <ChatScreen
            peerName={activePeer.displayName}
            peerAvatar={activePeer.avatarIdentifier}
            isConnected={activePeer.status === 'connected'}
            connectionStatusText={
              activePeer.status === 'connected' ? 'Connected' : 'Disconnected'
            }
            messages={messages}
            currentUserId={currentUser.deviceId}
            disappearingOption={disappearingOption}
            onSetDisappearingOption={setDisappearingOption}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onBack={handleLeaveChat}
            onClearChat={() => {
              setMessages([]);
            }}
          />
        )}

        {activeScreen === 'settings' && currentUser && (
          <SettingsScreen
            currentUsername={currentUser.displayName}
            isDiscoveryVisible={isDiscoveryVisible}
            onRegenerateUsername={handleRegenerateName}
            onToggleVisibility={setIsDiscoveryVisible}
            onClearChatHistory={handleClearHistory}
            onBack={() => setActiveScreen('home')}
            onOpenSourceInspector={() => setActiveScreen('inspector')}
          />
        )}

        {activeScreen === 'inspector' && (
          <AndroidSourceInspector onBack={() => setActiveScreen('settings')} />
        )}

        {/* Connection Request Overlay Dialog */}
        {pendingConnection && currentUser && (
          <ConnectionRequestDialog
            myUsername={currentUser.displayName}
            peerUsername={pendingConnection.peerName}
            verificationCode={pendingConnection.authCode}
            isIncoming={pendingConnection.isIncoming}
            isConnecting={isConnecting}
            statusLine={
              isConnecting
                ? `Connecting to ${pendingConnection.peerName}…`
                : `Waiting for ${pendingConnection.peerName}…`
            }
            onAccept={handleAcceptConnection}
            onReject={handleRejectConnection}
          />
        )}

        {/* Fast QR Handshake Modal */}
        {showQrModal && currentUser && (
          <QrHandshakeModal
            currentUser={currentUser}
            isOpen={showQrModal}
            onClose={() => setShowQrModal(false)}
            onPairFromQr={handlePairFromQr}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

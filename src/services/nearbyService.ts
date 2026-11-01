import {
  UserProfile,
  DiscoveredPeer,
  ChatMessage,
  FileMetadata,
  generateVerificationCode,
  generateMessageId,
} from '../logic/nearTalkLogic.ts';

export type NearbyServiceEvent =
  | { type: 'peer_found'; peer: DiscoveredPeer }
  | { type: 'peer_lost'; endpointId: string }
  | {
      type: 'connection_initiated';
      endpointId: string;
      peerName: string;
      authCode: string;
      isIncoming: boolean;
    }
  | { type: 'connection_result'; endpointId: string; success: boolean }
  | { type: 'disconnected'; endpointId: string }
  | {
      type: 'message_received';
      endpointId: string;
      text: string;
      timestamp: number;
      messageType?: 'text' | 'image' | 'file';
      fileMetadata?: FileMetadata;
      expiresAt?: number;
    }
  | { type: 'error'; message: string };

type Listener = (event: NearbyServiceEvent) => void;

class NearbyService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private isScanning = false;
  private isAdvertising = false;
  private currentUser: UserProfile | null = null;
  private discoveredPeers: Map<string, DiscoveredPeer> = new Map();
  private activeConnections: Set<string> = new Set();
  private mockDiscoveryTimer: number | null = null;
  private mockReplyTimer: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('neartalk_nearby_p2p');
      this.channel.onmessage = this.handleChannelMessage.bind(this);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: NearbyServiceEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  public setUser(user: UserProfile) {
    this.currentUser = user;
  }

  public startDiscovery() {
    this.isScanning = true;
    this.discoveredPeers.clear();

    // Broadcast discovery probe to any peer tabs
    if (this.channel && this.currentUser) {
      this.channel.postMessage({
        type: 'DISCOVERY_PROBE',
        from: this.currentUser,
      });
    }

    // Also initiate simulated nearby device detection after 1.5s if no tab found
    if (this.mockDiscoveryTimer) clearTimeout(this.mockDiscoveryTimer);
    this.mockDiscoveryTimer = window.setTimeout(() => {
      if (this.isScanning && this.discoveredPeers.size === 0) {
        this.addMockPeer('EchoHawk42', 'EH');
        setTimeout(() => {
          if (this.isScanning) {
            this.addMockPeer('CalmOtter19', 'CO');
          }
        }, 1200);
      }
    }, 1200);
  }

  public stopDiscovery() {
    this.isScanning = false;
    if (this.mockDiscoveryTimer) {
      clearTimeout(this.mockDiscoveryTimer);
      this.mockDiscoveryTimer = null;
    }
  }

  public startAdvertising() {
    this.isAdvertising = true;
    if (this.channel && this.currentUser) {
      this.channel.postMessage({
        type: 'ADVERTISE_PRESENCE',
        from: this.currentUser,
      });
    }
  }

  public stopAdvertising() {
    this.isAdvertising = false;
  }

  private addMockPeer(displayName: string, avatarIdentifier: string) {
    const endpointId = 'mock_' + displayName.toLowerCase();
    const peer: DiscoveredPeer = {
      endpointId,
      deviceId: 'dev_' + displayName,
      displayName,
      avatarIdentifier,
      status: 'available',
      lastSeen: Date.now(),
    };
    this.discoveredPeers.set(endpointId, peer);
    this.emit({ type: 'peer_found', peer });
  }

  public requestConnection(targetEndpointId: string) {
    const peer = this.discoveredPeers.get(targetEndpointId);
    if (!peer || !this.currentUser) return;

    const authCode = generateVerificationCode();

    if (targetEndpointId.startsWith('mock_')) {
      // Simulate real verification handshake after 400ms
      setTimeout(() => {
        this.emit({
          type: 'connection_initiated',
          endpointId: targetEndpointId,
          peerName: peer.displayName,
          authCode,
          isIncoming: false,
        });
      }, 400);
    } else if (this.channel) {
      this.channel.postMessage({
        type: 'CONNECT_REQUEST',
        toEndpoint: targetEndpointId,
        from: this.currentUser,
        authCode,
      });
      // Show local connection card
      this.emit({
        type: 'connection_initiated',
        endpointId: targetEndpointId,
        peerName: peer.displayName,
        authCode,
        isIncoming: false,
      });
    }
  }

  public acceptConnection(endpointId: string) {
    if (endpointId.startsWith('mock_')) {
      setTimeout(() => {
        this.activeConnections.add(endpointId);
        const peer = this.discoveredPeers.get(endpointId);
        if (peer) peer.status = 'connected';
        this.emit({ type: 'connection_result', endpointId, success: true });
      }, 350);
    } else if (this.channel && this.currentUser) {
      this.activeConnections.add(endpointId);
      this.channel.postMessage({
        type: 'CONNECT_ACCEPT',
        toEndpoint: endpointId,
        from: this.currentUser,
      });
      this.emit({ type: 'connection_result', endpointId, success: true });
    }
  }

  public rejectConnection(endpointId: string) {
    if (this.channel && this.currentUser) {
      this.channel.postMessage({
        type: 'CONNECT_REJECT',
        toEndpoint: endpointId,
        from: this.currentUser,
      });
    }
    const peer = this.discoveredPeers.get(endpointId);
    if (peer) peer.status = 'available';
  }

  public sendMessage(
    endpointId: string,
    text: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileMetadata?: FileMetadata,
    expiresAt?: number
  ) {
    if (endpointId.startsWith('mock_')) {
      // Simulated peer response after 1.4s
      if (this.mockReplyTimer) clearTimeout(this.mockReplyTimer);
      this.mockReplyTimer = window.setTimeout(() => {
        const textReplies = [
          'Direct connection received! Zero internet required.',
          'Signal is clear on Nearby Connections.',
          'Got your message! Stored directly on this device.',
          'Testing peer-to-peer transmission: perfect fidelity.',
        ];
        const randomReply =
          messageType !== 'text'
            ? `Offline raw ${messageType} received without compression. Byte checksum verified.`
            : textReplies[Math.floor(Math.random() * textReplies.length)];

        this.emit({
          type: 'message_received',
          endpointId,
          text: randomReply,
          timestamp: Date.now(),
          messageType: 'text',
          expiresAt,
        });
      }, 1400);
    } else if (this.channel && this.currentUser) {
      this.channel.postMessage({
        type: 'CHAT_MESSAGE',
        toEndpoint: endpointId,
        fromEndpoint: this.currentUser.deviceId,
        text,
        messageType,
        fileMetadata,
        expiresAt,
        timestamp: Date.now(),
      });
    }
  }

  public disconnect(endpointId: string) {
    this.activeConnections.delete(endpointId);
    if (this.channel && this.currentUser) {
      this.channel.postMessage({
        type: 'DISCONNECT',
        toEndpoint: endpointId,
        from: this.currentUser,
      });
    }
    this.emit({ type: 'disconnected', endpointId });
  }

  private handleChannelMessage(e: MessageEvent) {
    const data = e.data;
    if (!data || !this.currentUser) return;

    // Ignore messages from self
    if (data.from?.deviceId === this.currentUser.deviceId) return;

    switch (data.type) {
      case 'DISCOVERY_PROBE': {
        // If we are advertising, announce presence back
        if (this.isAdvertising && this.channel) {
          this.channel.postMessage({
            type: 'ADVERTISE_PRESENCE',
            from: this.currentUser,
          });
        }
        break;
      }
      case 'ADVERTISE_PRESENCE': {
        if (this.isScanning && data.from) {
          const peer: DiscoveredPeer = {
            endpointId: data.from.deviceId,
            deviceId: data.from.deviceId,
            displayName: data.from.displayName,
            avatarIdentifier: data.from.avatarIdentifier || data.from.displayName.slice(0, 2),
            status: 'available',
            lastSeen: Date.now(),
          };
          this.discoveredPeers.set(peer.endpointId, peer);
          this.emit({ type: 'peer_found', peer });
        }
        break;
      }
      case 'CONNECT_REQUEST': {
        if (data.toEndpoint === this.currentUser.deviceId) {
          this.emit({
            type: 'connection_initiated',
            endpointId: data.from.deviceId,
            peerName: data.from.displayName,
            authCode: data.authCode,
            isIncoming: true,
          });
        }
        break;
      }
      case 'CONNECT_ACCEPT': {
        if (data.toEndpoint === this.currentUser.deviceId) {
          this.activeConnections.add(data.from.deviceId);
          this.emit({
            type: 'connection_result',
            endpointId: data.from.deviceId,
            success: true,
          });
        }
        break;
      }
      case 'CONNECT_REJECT': {
        if (data.toEndpoint === this.currentUser.deviceId) {
          this.emit({
            type: 'connection_result',
            endpointId: data.from.deviceId,
            success: false,
          });
        }
        break;
      }
      case 'CHAT_MESSAGE': {
        if (data.toEndpoint === this.currentUser.deviceId) {
          this.emit({
            type: 'message_received',
            endpointId: data.fromEndpoint,
            text: data.text,
            timestamp: data.timestamp || Date.now(),
            messageType: data.messageType || 'text',
            fileMetadata: data.fileMetadata,
            expiresAt: data.expiresAt,
          });
        }
        break;
      }
      case 'DISCONNECT': {
        if (data.toEndpoint === this.currentUser.deviceId) {
          this.activeConnections.delete(data.from.deviceId);
          this.emit({ type: 'disconnected', endpointId: data.from.deviceId });
        }
        break;
      }
    }
  }
}

export const nearbyService = new NearbyService();

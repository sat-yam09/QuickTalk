/**
 * Core business and state machine logic for NearTalk Offline Messenger.
 * Pure logic decoupled from UI to allow deterministic unit testing.
 */

export interface UserProfile {
  deviceId: string;
  displayName: string;
  avatarIdentifier: string;
  createdAt: number;
}

export type ConnectionStatus =
  | 'idle'
  | 'scanning'
  | 'discovered'
  | 'requesting'
  | 'verifying'
  | 'connected'
  | 'disconnected'
  | 'rejected'
  | 'error';

export type DeliveryStatus = 'sending' | 'sent' | 'failed';

export interface DiscoveredPeer {
  endpointId: string;
  deviceId: string;
  displayName: string;
  avatarIdentifier: string;
  rssi?: number;
  status: 'available' | 'connecting' | 'connected';
  lastSeen: number;
}

export type DisappearingTimerOption = 'off' | '30s' | '1m' | '5m' | '1h' | 'disconnect';

export interface FileMetadata {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileData?: string; // Base64 data URL
  transferProgress?: number; // 0-100 for offline progress indicator
}

export interface ChatMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  messageContent: string;
  timestamp: number;
  deliveryStatus: DeliveryStatus;
  messageType: 'text' | 'image' | 'file';
  fileMetadata?: FileMetadata;
  expiresAt?: number; // Self-destruct timestamp
  burnOnDisconnect?: boolean;
}

export interface Conversation {
  conversationId: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  updatedAt: number;
}

const ADJECTIVES = [
  'Swift', 'Echo', 'Calm', 'Brave', 'Quiet', 'Solar', 'Lunar', 'Silver',
  'Slate', 'Carbon', 'Mono', 'Wild', 'Cozy', 'Nimble', 'Frost', 'Onyx'
];

const NOUNS = [
  'Fox', 'Hawk', 'Otter', 'Wolf', 'Falcon', 'Deer', 'Lynx', 'Badger',
  'Bear', 'Raven', 'Panda', 'Eagle', 'Owl', 'Robin', 'Tiger', 'Seal'
];

export function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${adj}${noun}${num}`;
}

export function generateVerificationCode(): string {
  // 6-digit numeric verification code formatted with space like Google Quick Share (e.g. "482 910")
  const num = Math.floor(100000 + Math.random() * 900000);
  const str = num.toString();
  return `${str.slice(0, 3)} ${str.slice(3)}`;
}

export function generateDeviceId(): string {
  return 'dev_' + Math.random().toString(36).substring(2, 10);
}

export function generateMessageId(): string {
  return 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

/**
 * Determines whether two consecutive messages should be visually grouped together.
 * Messages are grouped if sent by the same user within 2 minutes.
 */
export function shouldGroupMessages(current: ChatMessage, previous?: ChatMessage): boolean {
  if (!previous) return false;
  if (current.senderId !== previous.senderId) return false;
  const timeDifference = Math.abs(current.timestamp - previous.timestamp);
  return timeDifference < 120000; // 2 minutes
}

/**
 * Formats a message timestamp into a readable 12-hour or 24-hour time (e.g., "10:42 AM").
 */
export function formatMessageTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Extracts initials from a username, preferring CamelCase words (e.g., "NeonHawk42" -> "NH")
 */
export function getInitials(name: string): string {
  if (!name) return 'NT';
  const camelMatches = name.match(/[A-Z][a-z]*/g);
  if (camelMatches && camelMatches.length >= 2) {
    return (camelMatches[0][0] + camelMatches[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Validates display name input. Must be 2-30 characters, non-empty after trimming.
 */
export function validateDisplayName(name: string): { isValid: boolean; error?: string } {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters.' };
  }
  if (trimmed.length > 30) {
    return { isValid: false, error: 'Name cannot exceed 30 characters.' };
  }
  return { isValid: true };
}

/**
 * Calculates whether a scroll container is close to the bottom within a given tolerance threshold in pixels.
 */
export function isScrolledNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number = 80
): boolean {
  const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
  return distanceFromBottom <= threshold;
}

/**
 * Formats raw file byte count to human readable (e.g., 512 B, 1.4 MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Calculates message expiration timestamp based on selected timer.
 */
export function calculateMessageExpiration(
  timer: DisappearingTimerOption,
  fromTimestamp: number = Date.now()
): { expiresAt?: number; burnOnDisconnect?: boolean } {
  switch (timer) {
    case '30s':
      return { expiresAt: fromTimestamp + 30 * 1000 };
    case '1m':
      return { expiresAt: fromTimestamp + 60 * 1000 };
    case '5m':
      return { expiresAt: fromTimestamp + 5 * 60 * 1000 };
    case '1h':
      return { expiresAt: fromTimestamp + 60 * 60 * 1000 };
    case 'disconnect':
      return { burnOnDisconnect: true };
    default:
      return {};
  }
}

/**
 * Purges expired messages based on current timestamp.
 */
export function filterExpiredMessages(
  messages: ChatMessage[],
  currentTime: number = Date.now()
): ChatMessage[] {
  return messages.filter((msg) => {
    if (!msg.expiresAt) return true;
    return msg.expiresAt > currentTime;
  });
}

/**
 * Formats remaining seconds or minutes for disappearing message countdown badge.
 */
export function formatExpirationRemaining(expiresAt: number, currentTime: number = Date.now()): string {
  const diffMs = expiresAt - currentTime;
  if (diffMs <= 0) return '0s';
  const diffSec = Math.ceil(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s`;
  const diffMin = Math.ceil(diffSec / 60);
  return `${diffMin}m`;
}

/**
 * Generates pairing string payload for QR Handshake.
 */
export function generatePairingPayload(user: UserProfile, code: string): string {
  return JSON.stringify({
    app: 'QuickTalk',
    v: 1,
    deviceId: user.deviceId,
    displayName: user.displayName,
    code,
    timestamp: Date.now(),
  });
}

/**
 * Parses and validates pairing string payload from scanned QR Code.
 */
export function parsePairingPayload(
  raw: string
): { deviceId: string; displayName: string; code: string } | null {
  try {
    const data = JSON.parse(raw);
    if (data.app === 'QuickTalk' && data.deviceId && data.displayName && data.code) {
      return {
        deviceId: String(data.deviceId),
        displayName: String(data.displayName),
        code: String(data.code),
      };
    }
    return null;
  } catch {
    return null;
  }
}



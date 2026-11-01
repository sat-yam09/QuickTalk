import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRandomUsername,
  generateVerificationCode,
  validateDisplayName,
  shouldGroupMessages,
  formatMessageTime,
  getInitials,
  isScrolledNearBottom,
  formatFileSize,
  calculateMessageExpiration,
  filterExpiredMessages,
  generatePairingPayload,
  parsePairingPayload,
  ChatMessage,
  UserProfile,
} from './nearTalkLogic.ts';
import { HAPTIC_PATTERNS } from '../utils/haptics.ts';

test('generateRandomUsername produces non-empty username with digits', () => {
  const username = generateRandomUsername();
  assert.ok(username.length >= 6);
  assert.match(username, /^[A-Z][a-z]+[A-Z][a-z]+\d{2}$/);
});

test('generateVerificationCode produces 6-digit spaced string', () => {
  const code = generateVerificationCode();
  assert.match(code, /^\d{3}\s\d{3}$/);
});

test('validateDisplayName handles valid and invalid inputs', () => {
  assert.deepEqual(validateDisplayName(''), { isValid: false, error: 'Name must be at least 2 characters.' });
  assert.deepEqual(validateDisplayName('a'), { isValid: false, error: 'Name must be at least 2 characters.' });
  assert.deepEqual(validateDisplayName('SwiftFox83'), { isValid: true });
  assert.deepEqual(validateDisplayName('A'.repeat(31)), { isValid: false, error: 'Name cannot exceed 30 characters.' });
});

test('shouldGroupMessages groups messages from same sender within 2 minutes', () => {
  const msg1: ChatMessage = {
    messageId: '1',
    conversationId: 'c1',
    senderId: 'user1',
    messageContent: 'Hello',
    timestamp: 1000000,
    deliveryStatus: 'sent',
    messageType: 'text',
  };

  const msg2: ChatMessage = {
    messageId: '2',
    conversationId: 'c1',
    senderId: 'user1',
    messageContent: 'How are you?',
    timestamp: 1000000 + 30000, // 30s later
    deliveryStatus: 'sent',
    messageType: 'text',
  };

  const msg3DifferentUser: ChatMessage = {
    messageId: '3',
    conversationId: 'c1',
    senderId: 'user2',
    messageContent: 'Hi there!',
    timestamp: 1000000 + 35000,
    deliveryStatus: 'sent',
    messageType: 'text',
  };

  const msg4LongLater: ChatMessage = {
    messageId: '4',
    conversationId: 'c1',
    senderId: 'user1',
    messageContent: 'Still there?',
    timestamp: 1000000 + 150000, // 2.5 minutes later
    deliveryStatus: 'sent',
    messageType: 'text',
  };

  assert.equal(shouldGroupMessages(msg2, msg1), true);
  assert.equal(shouldGroupMessages(msg3DifferentUser, msg2), false);
  assert.equal(shouldGroupMessages(msg4LongLater, msg1), false);
  assert.equal(shouldGroupMessages(msg1, undefined), false);
});

test('getInitials extracts camelCase initials correctly', () => {
  assert.equal(getInitials('NeonHawk42'), 'NH');
  assert.equal(getInitials('SwiftFox83'), 'SF');
  assert.equal(getInitials('Alex'), 'AL');
  assert.equal(getInitials(''), 'NT');
});

test('formatMessageTime formats timestamp without throwing', () => {
  const formatted = formatMessageTime(1700000000000);
  assert.ok(typeof formatted === 'string' && formatted.length > 0);
});

test('isScrolledNearBottom detects scroll near bottom within threshold', () => {
  // At the bottom: scrollHeight = 1000, clientHeight = 500, scrollTop = 500
  assert.equal(isScrolledNearBottom(500, 1000, 500, 80), true);

  // Near the bottom: distance = 1000 - (450 + 500) = 50px (within 80px)
  assert.equal(isScrolledNearBottom(450, 1000, 500, 80), true);

  // Scrolled up: distance = 1000 - (300 + 500) = 200px (exceeds 80px)
  assert.equal(isScrolledNearBottom(300, 1000, 500, 80), false);
});

test('HAPTIC_PATTERNS contains valid positive duration arrays', () => {
  assert.ok(Array.isArray(HAPTIC_PATTERNS.selection) && HAPTIC_PATTERNS.selection[0] > 0);
  assert.ok(Array.isArray(HAPTIC_PATTERNS.impact) && HAPTIC_PATTERNS.impact[0] > 0);
  assert.ok(Array.isArray(HAPTIC_PATTERNS.success) && HAPTIC_PATTERNS.success.length >= 2);
  assert.ok(Array.isArray(HAPTIC_PATTERNS.warning) && HAPTIC_PATTERNS.warning.length >= 2);
});

test('formatFileSize converts bytes correctly', () => {
  assert.equal(formatFileSize(500), '500 B');
  assert.equal(formatFileSize(2048), '2.0 KB');
  assert.equal(formatFileSize(5242880), '5.0 MB');
});

test('calculateMessageExpiration sets future timestamps correctly', () => {
  const now = 1000000;
  assert.deepEqual(calculateMessageExpiration('off', now), {});
  assert.deepEqual(calculateMessageExpiration('30s', now), { expiresAt: 1030000 });
  assert.deepEqual(calculateMessageExpiration('5m', now), { expiresAt: 1300000 });
  assert.deepEqual(calculateMessageExpiration('disconnect', now), { burnOnDisconnect: true });
});

test('filterExpiredMessages removes only expired messages', () => {
  const now = 1000000;
  const msgs: ChatMessage[] = [
    {
      messageId: '1',
      conversationId: 'c1',
      senderId: 'u1',
      messageContent: 'Permanent',
      timestamp: now - 5000,
      deliveryStatus: 'sent',
      messageType: 'text',
    },
    {
      messageId: '2',
      conversationId: 'c1',
      senderId: 'u1',
      messageContent: 'Expired',
      timestamp: now - 5000,
      deliveryStatus: 'sent',
      messageType: 'text',
      expiresAt: now - 1000, // expired
    },
    {
      messageId: '3',
      conversationId: 'c1',
      senderId: 'u1',
      messageContent: 'Active',
      timestamp: now - 5000,
      deliveryStatus: 'sent',
      messageType: 'text',
      expiresAt: now + 10000, // still active
    },
  ];
  const filtered = filterExpiredMessages(msgs, now);
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].messageId, '1');
  assert.equal(filtered[1].messageId, '3');
});

test('generatePairingPayload and parsePairingPayload handle round-trip pairing', () => {
  const user: UserProfile = {
    deviceId: 'dev_12345',
    displayName: 'SwiftFox',
    avatarIdentifier: 'SF',
    createdAt: 1000000,
  };
  const payload = generatePairingPayload(user, '824 195');
  const parsed = parsePairingPayload(payload);
  assert.ok(parsed !== null);
  assert.equal(parsed.deviceId, 'dev_12345');
  assert.equal(parsed.displayName, 'SwiftFox');
  assert.equal(parsed.code, '824 195');

  assert.equal(parsePairingPayload('invalid json'), null);
  assert.equal(parsePairingPayload('{"other":"app"}'), null);
});



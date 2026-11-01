import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MoreVertical, Trash2, ChevronDown, Timer, Check } from 'lucide-react';
import { StatusDot, MessageBubble, Composer } from '../components/CommonComponents.tsx';
import {
  ChatMessage,
  shouldGroupMessages,
  formatMessageTime,
  isScrolledNearBottom,
  DisappearingTimerOption,
  formatExpirationRemaining,
} from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

interface ChatScreenProps {
  peerName: string;
  peerAvatar: string;
  isConnected: boolean;
  connectionStatusText: string;
  messages: ChatMessage[];
  currentUserId: string;
  disappearingOption: DisappearingTimerOption;
  onSetDisappearingOption: (opt: DisappearingTimerOption) => void;
  onSendMessage: (text: string) => void;
  onSendFile: (file: File) => void;
  onBack: () => void;
  onClearChat?: () => void;
}

const TIMER_OPTIONS: { id: DisappearingTimerOption; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: '30s', label: '30 seconds' },
  { id: '1m', label: '1 minute' },
  { id: '5m', label: '5 minutes' },
  { id: '1h', label: '1 hour' },
  { id: 'disconnect', label: 'Burn on disconnect' },
];

export const ChatScreen: React.FC<ChatScreenProps> = ({
  peerName,
  peerAvatar,
  isConnected,
  connectionStatusText,
  messages,
  currentUserId,
  disappearingOption,
  onSetDisappearingOption,
  onSendMessage,
  onSendFile,
  onBack,
  onClearChat,
}) => {
  const [draft, setDraft] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [showScrollBottomPill, setShowScrollBottomPill] = useState(false);
  const [unreadWhileScrolled, setUnreadWhileScrolled] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isUserAtBottomRef = useRef<boolean>(true);
  const lastMessageCountRef = useRef<number>(messages.length);

  // Tick clock every second for live countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll position monitor: determines if user is at the bottom or reviewed upwards
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isNearBottom = isScrolledNearBottom(
      container.scrollTop,
      container.scrollHeight,
      container.clientHeight,
      75
    );
    isUserAtBottomRef.current = isNearBottom;
    setShowScrollBottomPill(!isNearBottom);
    if (isNearBottom) {
      setUnreadWhileScrolled(0);
    }
  };

  // Optimized message list auto-scroll: locks to bottom unless user scrolled up
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    const latestMessage = messages[messages.length - 1];
    const isMyMessage = latestMessage?.senderId === currentUserId;

    if (isUserAtBottomRef.current || isMyMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadWhileScrolled(0);
      setShowScrollBottomPill(false);
      isUserAtBottomRef.current = true;
    } else if (isNewMessage) {
      setUnreadWhileScrolled((prev) => prev + 1);
    }

    lastMessageCountRef.current = messages.length;
  }, [messages, currentUserId]);

  const scrollToBottom = () => {
    haptics.selection();
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    isUserAtBottomRef.current = true;
    setShowScrollBottomPill(false);
    setUnreadWhileScrolled(0);
  };

  const handleSend = () => {
    if (draft.trim()) {
      isUserAtBottomRef.current = true;
      onSendMessage(draft.trim());
      setDraft('');
    }
  };

  const peerInitials = peerAvatar.slice(0, 2).toUpperCase() || peerName.slice(0, 2).toUpperCase();

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[var(--bg-color)] screen-enter relative">
      {/* Top Bar */}
      <div className="w-full px-3 py-2.5 flex items-center justify-between border-b border-[var(--surface-variant)]/40 bg-[var(--bg-color)] z-20 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onBack();
            }}
            aria-label="Back"
            className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] cursor-pointer active:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Avatar (32dp) */}
          <div className="w-8 h-8 rounded-full bg-[var(--surface-variant)] flex items-center justify-center text-[12px] font-semibold text-[var(--text-primary)] shrink-0 select-none">
            {peerInitials}
          </div>

          <div className="min-w-0">
            <div className="font-semibold text-[16px] leading-[20px] text-[var(--text-primary)] truncate">
              {peerName}
            </div>
            <div className="flex items-center gap-1.5 leading-[14px] mt-0.5">
              <StatusDot status={isConnected ? 'ready' : 'off'} className="!w-1.5 !h-1.5" />
              <span className="text-[11px] text-[var(--text-secondary)]">
                {connectionStatusText}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Disappearing Messages Timer Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setShowTimerMenu(!showTimerMenu);
                setShowMenu(false);
              }}
              title="Disappearing messages"
              aria-label="Disappearing messages"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                disappearingOption !== 'off'
                  ? 'bg-[var(--accent-color)] text-[var(--on-accent-color)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Timer className="w-4 h-4" />
            </button>

            {/* Disappearing Options Menu */}
            {showTimerMenu && (
              <div className="absolute right-0 top-11 w-52 rounded-[16px] bg-[var(--surface-color)] border border-[var(--surface-variant)] shadow-xl p-1.5 z-50 screen-enter">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Disappearing Messages
                </div>
                {TIMER_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      haptics.selection();
                      onSetDisappearingOption(opt.id);
                      setShowTimerMenu(false);
                    }}
                    className="w-full px-3 py-2 rounded-[10px] text-left text-[13px] text-[var(--text-primary)] hover:bg-[var(--surface-variant)] flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    {disappearingOption === opt.id && <Check className="w-4 h-4 text-[var(--accent-color)]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* More options menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setShowMenu(!showMenu);
                setShowTimerMenu(false);
              }}
              aria-label="More options"
              className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] cursor-pointer active:opacity-70"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-44 rounded-[16px] bg-[var(--surface-color)] border border-[var(--surface-variant)] shadow-lg py-1.5 z-50">
                <button
                  type="button"
                  onClick={() => {
                    haptics.warning();
                    setShowMenu(false);
                    onClearChat?.();
                  }}
                  className="w-full px-4 py-2.5 text-left text-[14px] text-[var(--text-primary)] flex items-center gap-2 hover:bg-[var(--surface-variant)]/50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-[var(--error-color)]" />
                  Clear this chat
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disappearing indicator notification pill if active */}
      {disappearingOption !== 'off' && (
        <div className="w-full py-1 px-4 bg-[var(--surface-variant)]/60 text-center text-[11px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5">
          <Timer className="w-3 h-3 text-[var(--accent-color)]" />
          <span>
            {disappearingOption === 'disconnect'
              ? 'Messages will burn when session disconnects'
              : `Messages disappear after ${TIMER_OPTIONS.find((t) => t.id === disappearingOption)?.label}`}
          </span>
        </div>
      )}

      {/* Chat Body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 flex flex-col no-scrollbar min-h-0 relative"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-center p-6 select-none">
            <p className="text-[13px] text-[var(--text-secondary)] max-w-[260px]">
              Say hello. Messages and files transfer directly between your devices without compression.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg, index) => {
              const isFromMe = msg.senderId === currentUserId;
              const prevMsg = index > 0 ? messages[index - 1] : undefined;
              const isConsecutive = shouldGroupMessages(msg, prevMsg);

              const spacingClass = index === 0 ? 'mt-1' : isConsecutive ? 'mt-0.5' : 'mt-2';

              const expirationRemaining = msg.expiresAt
                ? formatExpirationRemaining(msg.expiresAt, currentTime)
                : undefined;

              return (
                <div key={msg.messageId} className={spacingClass}>
                  <MessageBubble
                    text={msg.messageContent}
                    timestamp={formatMessageTime(msg.timestamp)}
                    isFromMe={isFromMe}
                    deliveryStatus={msg.deliveryStatus}
                    isConsecutive={isConsecutive}
                    messageType={msg.messageType}
                    fileMetadata={msg.fileMetadata}
                    expirationRemaining={expirationRemaining}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}

        {/* Floating Jump to Bottom Button */}
        {showScrollBottomPill && (
          <button
            type="button"
            onClick={scrollToBottom}
            aria-label="Scroll to newest messages"
            className="fixed bottom-20 right-6 z-30 px-3.5 py-1.5 rounded-full bg-[var(--surface-color)] text-[var(--text-primary)] border border-[var(--surface-variant)] shadow-md flex items-center gap-1.5 text-[12px] font-medium cursor-pointer active:scale-95 transition-all screen-enter"
          >
            <ChevronDown className="w-4 h-4" />
            {unreadWhileScrolled > 0 ? (
              <span>{unreadWhileScrolled} new</span>
            ) : (
              <span>Latest</span>
            )}
          </button>
        )}
      </div>

      {/* Composer: pinned bottom, with attachment picker */}
      <Composer
        value={draft}
        onChange={setDraft}
        onSend={handleSend}
        onAttachFile={onSendFile}
        placeholder="Message…"
      />
    </div>
  );
};

import React, { useRef, useState } from 'react';
import {
  Check,
  Send,
  Radio,
  Loader2,
  Link2,
  Paperclip,
  Image as ImageIcon,
  FileText,
  Download,
  Timer,
  X,
} from 'lucide-react';
import { FileMetadata, formatFileSize } from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

export type StatusDotState = 'ready' | 'off' | 'problem';

export const StatusDot: React.FC<{ status: StatusDotState; className?: string }> = ({
  status,
  className = '',
}) => {
  const colorClass =
    status === 'ready'
      ? 'bg-[var(--status-ready)]'
      : status === 'off'
      ? 'bg-[var(--status-off)]'
      : 'bg-[var(--status-problem)]';

  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colorClass} ${className}`} />;
};

export const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}> = ({ children, onClick, disabled = false, className = '', type = 'button' }) => {
  const handleClick = () => {
    haptics.selection();
    onClick?.();
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={`w-full min-h-[48px] px-6 py-3 rounded-full font-medium text-[16px] transition-opacity duration-150 flex items-center justify-center cursor-pointer select-none active:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--accent-color)] text-[var(--on-accent-color)] ${className}`}
    >
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}> = ({ children, onClick, disabled = false, className = '' }) => {
  const handleClick = () => {
    haptics.selection();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full min-h-[48px] px-6 py-3 rounded-full font-medium text-[16px] transition-colors duration-150 flex items-center justify-center cursor-pointer select-none active:bg-black/5 dark:active:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed border border-[var(--surface-variant)] text-[var(--text-primary)] bg-transparent ${className}`}
    >
      {children}
    </button>
  );
};

export const DeviceRow: React.FC<{
  username: string;
  statusText: string;
  avatarText: string;
  onConnect: () => void;
  isConnecting?: boolean;
  isConnected?: boolean;
}> = ({ username, statusText, avatarText, onConnect, isConnecting = false, isConnected = false }) => {
  const handleConnectClick = () => {
    haptics.impact();
    onConnect();
  };

  const renderStatusIcon = () => {
    if (isConnected) {
      return <Link2 className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />;
    }
    if (isConnecting) {
      return <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-secondary)] shrink-0" />;
    }
    return <Radio className="w-3.5 h-3.5 text-[var(--text-secondary)] shrink-0" />;
  };

  return (
    <div className="w-full flex items-center justify-between p-4 rounded-[16px] bg-[var(--surface-color)] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[14px] bg-[var(--surface-variant)] text-[var(--text-primary)] shrink-0 select-none">
          {avatarText.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-[16px] text-[var(--text-primary)] truncate">
            {username}
          </div>
          <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mt-0.5">
            {renderStatusIcon()}
            <span className="truncate">{statusText}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleConnectClick}
        disabled={isConnecting || isConnected}
        className={`ml-3 px-4 py-1.5 rounded-full text-[13px] font-medium transition-opacity shrink-0 cursor-pointer disabled:cursor-default select-none ${
          isConnected
            ? 'bg-[var(--surface-variant)] text-[var(--text-secondary)]'
            : 'bg-[var(--accent-color)] text-[var(--on-accent-color)] active:opacity-85'
        }`}
      >
        {isConnected ? 'Connected' : isConnecting ? 'Connecting…' : 'Connect'}
      </button>
    </div>
  );
};

export const MessageBubble: React.FC<{
  text: string;
  timestamp: string;
  isFromMe: boolean;
  deliveryStatus?: 'sending' | 'sent' | 'failed';
  isConsecutive?: boolean;
  messageType?: 'text' | 'image' | 'file';
  fileMetadata?: FileMetadata;
  expirationRemaining?: string;
  onRetry?: () => void;
}> = ({
  text,
  timestamp,
  isFromMe,
  deliveryStatus = 'sent',
  messageType = 'text',
  fileMetadata,
  expirationRemaining,
  onRetry,
}) => {
  const [showLightbox, setShowLightbox] = useState(false);

  // 18dp radius with corner nearest sender squared to 6dp
  const bubbleShape = isFromMe
    ? 'rounded-[18px] rounded-br-[6px]'
    : 'rounded-[18px] rounded-bl-[6px]';

  const bgColor = isFromMe ? 'bg-[var(--accent-color)]' : 'bg-[var(--surface-color)]';
  const textColor = isFromMe ? 'text-[var(--on-accent-color)]' : 'text-[var(--text-primary)]';
  const timeColor = isFromMe ? 'text-[var(--on-accent-color)]/70' : 'text-[var(--text-secondary)]';

  const handleDownload = () => {
    if (!fileMetadata?.fileData) return;
    haptics.selection();
    const a = document.createElement('a');
    a.href = fileMetadata.fileData;
    a.download = fileMetadata.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isTransferring =
    fileMetadata?.transferProgress !== undefined && fileMetadata.transferProgress < 100;

  return (
    <div className={`w-full flex ${isFromMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] px-3.5 py-2.5 ${bubbleShape} ${bgColor} ${textColor} flex flex-col break-words shadow-none`}
      >
        {/* Offline Image (Full Quality, No Compression) */}
        {messageType === 'image' && fileMetadata?.fileData && (
          <div className="mb-2">
            <div
              onClick={() => {
                haptics.selection();
                setShowLightbox(true);
              }}
              className="rounded-[12px] overflow-hidden max-h-60 bg-black/10 cursor-pointer relative group"
            >
              <img
                src={fileMetadata.fileData}
                alt={fileMetadata.fileName}
                className="w-full h-auto object-cover max-h-60 block"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-medium">
                View Full Quality
              </div>
            </div>

            {/* Offline transfer progress */}
            {isTransferring && (
              <div className="w-full mt-1.5">
                <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-current transition-all duration-200"
                    style={{ width: `${fileMetadata.transferProgress}%` }}
                  />
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 text-right">
                  Streaming {fileMetadata.transferProgress}% ({formatFileSize(fileMetadata.fileSize)})
                </div>
              </div>
            )}
          </div>
        )}

        {/* Offline File / Document (Exact Raw Bytes) */}
        {messageType === 'file' && fileMetadata && (
          <div className="flex items-center gap-2.5 p-2 rounded-[12px] bg-black/5 dark:bg-white/5 mb-1.5">
            <div className="w-9 h-9 rounded-[8px] bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium truncate">{fileMetadata.fileName}</div>
              <div className="text-[11px] opacity-70">
                {formatFileSize(fileMetadata.fileSize)} • Raw Direct
              </div>
            </div>
            {fileMetadata.fileData && (
              <button
                type="button"
                onClick={handleDownload}
                aria-label="Download file"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 hover:opacity-80 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Text content if present */}
        {text && (
          <span className="text-[16px] leading-[22px] whitespace-pre-wrap select-text">{text}</span>
        )}

        {/* Message Footer: Timestamp, Disappearing countdown badge, Delivery Status */}
        <div className={`flex items-center justify-end gap-1.5 mt-1 text-[11px] select-none ${timeColor}`}>
          {/* Disappearing timer badge */}
          {expirationRemaining && (
            <span className="flex items-center gap-0.5 text-[10px] font-mono opacity-85 mr-1 bg-black/10 dark:bg-white/10 px-1.5 py-0.2 rounded-full">
              <Timer className="w-2.5 h-2.5" />
              <span>{expirationRemaining}</span>
            </span>
          )}

          <span>{timestamp}</span>

          {isFromMe && (
            <span className="flex items-center ml-0.5">
              {deliveryStatus === 'sending' && <span className="text-[10px]">Sending</span>}
              {deliveryStatus === 'sent' && <Check className="w-3 h-3 stroke-[2.5]" />}
              {deliveryStatus === 'failed' && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="text-[var(--error-color)] font-medium text-[10px] underline cursor-pointer"
                >
                  Failed (retry)
                </button>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Full-Quality Lightbox Modal */}
      {showLightbox && messageType === 'image' && fileMetadata?.fileData && (
        <div
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4 screen-enter cursor-zoom-out"
        >
          <div className="absolute top-4 right-4 flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="px-3.5 py-1.5 rounded-full bg-white/20 text-white text-[13px] font-medium flex items-center gap-1.5 cursor-pointer hover:bg-white/30"
            >
              <Download className="w-4 h-4" />
              Save Original ({formatFileSize(fileMetadata.fileSize)})
            </button>
            <button
              type="button"
              onClick={() => setShowLightbox(false)}
              className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={fileMetadata.fileData}
            alt={fileMetadata.fileName}
            className="max-w-full max-h-[85vh] object-contain rounded-[12px] shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};

export const Composer: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  onAttachFile?: (file: File) => void;
  placeholder?: string;
}> = ({ value, onChange, onSend, onAttachFile, placeholder = 'Message…' }) => {
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendAction = () => {
    if (isEnabled) {
      haptics.impact();
      onSend();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAction();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAttachFile) {
      haptics.impact();
      onAttachFile(file);
      setShowAttachMenu(false);
      // Reset input so re-selecting same file works
      e.target.value = '';
    }
  };

  const isEnabled = value.trim().length > 0;

  return (
    <div className="w-full bg-[var(--bg-color)] px-3 py-2.5 flex items-end gap-2 border-t border-[var(--surface-variant)]/40 relative">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Attachment Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            haptics.selection();
            setShowAttachMenu(!showAttachMenu);
          }}
          aria-label="Attach photo or file"
          className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:bg-[var(--surface-variant)] transition-colors cursor-pointer select-none"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Attachment Options Popup */}
        {showAttachMenu && (
          <div className="absolute left-0 bottom-12 w-48 rounded-[16px] bg-[var(--surface-color)] border border-[var(--surface-variant)] shadow-xl p-1.5 z-40 screen-enter">
            <button
              type="button"
              onClick={() => {
                imageInputRef.current?.click();
                setShowAttachMenu(false);
              }}
              className="w-full px-3 py-2 rounded-[10px] text-left text-[14px] text-[var(--text-primary)] hover:bg-[var(--surface-variant)] flex items-center gap-2.5 cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[var(--accent-color)]" />
              <span>Photo (Raw Quality)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                fileInputRef.current?.click();
                setShowAttachMenu(false);
              }}
              className="w-full px-3 py-2 rounded-[10px] text-left text-[14px] text-[var(--text-primary)] hover:bg-[var(--surface-variant)] flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[var(--accent-color)]" />
              <span>Document / File</span>
            </button>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="flex-1 bg-[var(--surface-variant)] rounded-[24px] px-4 py-2 flex items-center min-h-[44px]">
        <textarea
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 outline-none resize-none text-[15px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 leading-[20px] max-h-[120px] no-scrollbar"
          style={{ height: 'auto' }}
        />
      </div>

      {/* Send Button */}
      <button
        type="button"
        onClick={handleSendAction}
        disabled={!isEnabled}
        aria-label="Send message"
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-opacity cursor-pointer disabled:cursor-default select-none ${
          isEnabled
            ? 'bg-[var(--accent-color)] text-[var(--on-accent-color)] active:opacity-85'
            : 'bg-[var(--surface-variant)] text-[var(--text-disabled)]'
        }`}
      >
        <Send className="w-4 h-4 ml-0.5" />
      </button>
    </div>
  );
};

export const SettingsRow: React.FC<{
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailingContent?: React.ReactNode;
  isDestructive?: boolean;
}> = ({ title, subtitle, onClick, trailingContent, isDestructive = false }) => {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`min-h-[56px] px-4 py-3 flex items-center justify-between border-b border-[var(--surface-variant)]/30 last:border-b-0 transition-colors ${
        onClick ? 'cursor-pointer active:bg-[var(--surface-variant)]/40 select-none' : ''
      }`}
    >
      <div className="flex-1 pr-3">
        <div
          className={`text-[16px] font-medium leading-[22px] ${
            isDestructive ? 'text-[var(--error-color)]' : 'text-[var(--text-primary)]'
          }`}
        >
          {title}
        </div>
        {subtitle && (
          <div className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-0.5">
            {subtitle}
          </div>
        )}
      </div>
      {trailingContent && <div className="shrink-0">{trailingContent}</div>}
    </div>
  );
};

export const ErrorCard: React.FC<{
  message: string;
  actionText: string;
  onAction: () => void;
}> = ({ message, actionText, onAction }) => {
  return (
    <div className="p-4 rounded-[16px] bg-[var(--surface-color)] border border-[var(--surface-variant)] text-center">
      <div className="text-[13px] text-[var(--error-color)] mb-3 leading-[18px]">{message}</div>
      <button
        type="button"
        onClick={onAction}
        className="px-4 py-1.5 rounded-full bg-[var(--accent-color)] text-[var(--on-accent-color)] text-[12px] font-medium cursor-pointer active:opacity-85"
      >
        {actionText}
      </button>
    </div>
  );
};

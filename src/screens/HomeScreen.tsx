import React from 'react';
import { Radio, Settings as SettingsIcon, QrCode } from 'lucide-react';
import {
  StatusDot,
  StatusDotState,
  PrimaryButton,
  SecondaryButton,
  DeviceRow,
  ErrorCard,
} from '../components/CommonComponents.tsx';
import { DiscoveredPeer } from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

export type HomeDiscoveryState = 'idle' | 'scanning' | 'empty' | 'error';

interface HomeScreenProps {
  myUsername: string;
  discoveryState: HomeDiscoveryState;
  discoveredPeers: DiscoveredPeer[];
  statusDotState: StatusDotState;
  errorMessage?: string;
  errorActionText?: string;
  onErrorAction?: () => void;
  onStartDiscovery: () => void;
  onStopDiscovery: () => void;
  onConnectToPeer: (peer: DiscoveredPeer) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenQrHandshake?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  myUsername,
  discoveryState,
  discoveredPeers,
  statusDotState,
  errorMessage,
  errorActionText,
  onErrorAction,
  onStartDiscovery,
  onStopDiscovery,
  onConnectToPeer,
  onOpenSettings,
  onOpenProfile,
  onOpenQrHandshake,
}) => {
  const myInitials = myUsername.slice(0, 2).toUpperCase() || 'QT';

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 screen-enter">
      {/* Top Bar: logo + "QuickTalk" + status dot | avatar chip + qr button + settings icon */}
      <div className="w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-[var(--surface-variant)] flex items-center justify-center text-[var(--accent-color)] select-none">
            <Radio className="w-5 h-5" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold text-[var(--text-primary)] tracking-tight">
              QuickTalk
            </span>
            <StatusDot status={statusDotState} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Handshake quick pair button */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onOpenQrHandshake?.();
            }}
            aria-label="QR Handshake"
            title="Fast QR Handshake"
            className="w-9 h-9 rounded-full bg-[var(--surface-variant)] text-[var(--text-primary)] flex items-center justify-center cursor-pointer select-none active:opacity-80"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* User profile avatar chip */}
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Profile"
            className="w-9 h-9 rounded-full bg-[var(--surface-variant)] text-[var(--accent-color)] font-semibold text-[13px] flex items-center justify-center cursor-pointer select-none active:opacity-80"
          >
            {myInitials}
          </button>

          {/* Settings icon */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="w-10 h-10 flex items-center justify-center text-[var(--text-primary)] cursor-pointer active:opacity-70 transition-opacity"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 w-full flex flex-col my-3 min-h-0">
        {discoveredPeers.length === 0 ? (
          // Vertically centered hero when empty
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            {/* Calm pulsing radar circle while scanning, static when idle */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-5">
              {discoveryState === 'scanning' && (
                <div className="absolute inset-0 rounded-full bg-[var(--accent-color)] animate-radar pointer-events-none" />
              )}
              <div className="w-18 h-18 rounded-full bg-[var(--surface-variant)] flex items-center justify-center text-[var(--accent-color)] z-10 select-none">
                <Radio className="w-9 h-9" />
              </div>
            </div>

            <h2 className="text-[18px] font-medium text-[var(--text-primary)]">
              Looking for people nearby
            </h2>

            <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 max-w-[280px]">
              Discover and connect with nearby devices.
            </p>

            <div className="mt-5 min-h-[24px]">
              {discoveryState === 'scanning' && (
                <span className="text-[13px] text-[var(--text-secondary)]">Searching…</span>
              )}
              {discoveryState === 'empty' && (
                <span className="text-[13px] text-[var(--text-secondary)]">No one nearby yet</span>
              )}
              {discoveryState === 'error' && errorMessage && errorActionText && onErrorAction && (
                <div className="w-full max-w-[320px] mt-2">
                  <ErrorCard
                    message={errorMessage}
                    actionText={errorActionText}
                    onAction={onErrorAction}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          // Discovered Nearby Devices list
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar">
            <div className="text-[13px] text-[var(--text-secondary)] mb-2 px-1">
              {discoveryState === 'scanning' ? 'Searching for nearby devices…' : 'Nearby devices'}
            </div>

            <div className="flex flex-col gap-2">
              {discoveredPeers.map((peer) => (
                <DeviceRow
                  key={peer.endpointId}
                  username={peer.displayName}
                  statusText={
                    peer.status === 'connecting'
                      ? 'Connecting…'
                      : peer.status === 'connected'
                      ? 'Connected'
                      : 'Available'
                  }
                  avatarText={peer.avatarIdentifier || peer.displayName}
                  isConnecting={peer.status === 'connecting'}
                  isConnected={peer.status === 'connected'}
                  onConnect={() => onConnectToPeer(peer)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Section: Start discovery (filled accent) / Stop (outlined neutral, never red) */}
      <div className="w-full pt-2">
        {discoveryState === 'scanning' ? (
          <SecondaryButton onClick={onStopDiscovery}>Stop</SecondaryButton>
        ) : (
          <PrimaryButton onClick={onStartDiscovery}>Start discovery</PrimaryButton>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { ArrowLeft, Dices, Check, Code, Shield } from 'lucide-react';
import { SettingsRow } from '../components/CommonComponents.tsx';
import { useTheme, ThemeMode } from '../theme/ThemeContext.tsx';
import { haptics } from '../utils/haptics.ts';

interface SettingsScreenProps {
  currentUsername: string;
  isDiscoveryVisible: boolean;
  onRegenerateUsername: () => void;
  onToggleVisibility: (visible: boolean) => void;
  onClearChatHistory: () => void;
  onBack: () => void;
  onOpenSourceInspector?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  currentUsername,
  isDiscoveryVisible,
  onRegenerateUsername,
  onToggleVisibility,
  onClearChatHistory,
  onBack,
  onOpenSourceInspector,
}) => {
  const { themeMode, setThemeMode } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(true);

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[var(--bg-color)] screen-enter">
      {/* Top Bar */}
      <div className="w-full px-3 py-2.5 flex items-center gap-3 border-b border-[var(--surface-variant)]/40 bg-[var(--bg-color)] shrink-0">
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
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)]">Settings</h2>
      </div>

      {/* Settings Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 no-scrollbar min-h-0">
        {/* Profile Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            PROFILE
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title={currentUsername}
              subtitle="Tap dice to regenerate your temporary name"
              trailingContent={
                <button
                  type="button"
                  onClick={() => {
                    haptics.selection();
                    onRegenerateUsername();
                  }}
                  aria-label="Regenerate temporary username"
                  className="p-2 text-[var(--accent-color)] cursor-pointer active:opacity-70"
                >
                  <Dices className="w-5 h-5" />
                </button>
              }
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            PRIVACY
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title="Discovery Visibility"
              subtitle={
                isDiscoveryVisible
                  ? 'Nearby devices can discover you'
                  : 'Hidden from nearby devices'
              }
              trailingContent={
                <button
                  type="button"
                  role="switch"
                  aria-checked={isDiscoveryVisible}
                  onClick={() => {
                    haptics.selection();
                    onToggleVisibility(!isDiscoveryVisible);
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                    isDiscoveryVisible
                      ? 'bg-[var(--accent-color)]'
                      : 'bg-[var(--surface-variant)]'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                      isDiscoveryVisible ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              }
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            APPEARANCE
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title="System Default"
              onClick={() => {
                haptics.selection();
                setThemeMode('system');
              }}
              trailingContent={
                themeMode === 'system' ? (
                  <Check className="w-5 h-5 text-[var(--accent-color)]" />
                ) : null
              }
            />
            <SettingsRow
              title="Dark Theme"
              onClick={() => {
                haptics.selection();
                setThemeMode('dark');
              }}
              trailingContent={
                themeMode === 'dark' ? (
                  <Check className="w-5 h-5 text-[var(--accent-color)]" />
                ) : null
              }
            />
            <SettingsRow
              title="Light Theme"
              onClick={() => {
                haptics.selection();
                setThemeMode('light');
              }}
              trailingContent={
                themeMode === 'light' ? (
                  <Check className="w-5 h-5 text-[var(--accent-color)]" />
                ) : null
              }
            />
          </div>
        </div>

        {/* Permissions Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            PERMISSIONS
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title="Bluetooth & Nearby Devices"
              subtitle={
                permissionsGranted
                  ? 'Active and granted (BLE & Wi-Fi Direct)'
                  : 'Required to discover and pair with nearby devices'
              }
              trailingContent={
                permissionsGranted ? (
                  <Check className="w-5 h-5 text-[var(--accent-color)]" />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPermissionsGranted(true)}
                    className="px-3 py-1 rounded-full text-[13px] font-medium text-[var(--accent-color)] cursor-pointer"
                  >
                    Fix
                  </button>
                )
              }
            />
          </div>
        </div>

        {/* Native Android Project Source Code Section */}
        {onOpenSourceInspector && (
          <div>
            <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
              DEVELOPER & ARCHITECTURE
            </div>
            <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
              <SettingsRow
                title="View Native Android Code"
                subtitle="Inspect Kotlin, Compose, Room, and Gradle files"
                onClick={onOpenSourceInspector}
                trailingContent={
                  <Code className="w-5 h-5 text-[var(--text-secondary)]" />
                }
              />
            </div>
          </div>
        )}

        {/* Data Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            DATA
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title="Clear chat history"
              subtitle="Permanently wipe local conversation database"
              isDestructive
              onClick={() => setShowClearConfirm(true)}
            />
          </div>
        </div>

        {/* About Section */}
        <div>
          <div className="text-[13px] text-[var(--text-secondary)] font-normal mb-2 px-1 tracking-wide">
            ABOUT
          </div>
          <div className="rounded-[16px] bg-[var(--surface-color)] overflow-hidden">
            <SettingsRow
              title="QuickTalk v1.0.0"
              subtitle="Messages go directly between devices. No servers."
            />
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* Confirmation Modal for Clearing Chat History */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 screen-enter">
          <div className="w-full max-w-[320px] rounded-[20px] bg-[var(--surface-color)] p-5 border border-[var(--surface-variant)]/60">
            <h4 className="text-[17px] font-medium text-[var(--text-primary)]">
              Clear all chat history?
            </h4>
            <p className="text-[13px] text-[var(--text-secondary)] mt-2 leading-[18px]">
              This will permanently delete all stored local conversations and messages from this device.
            </p>
            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-full text-[14px] text-[var(--text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  haptics.warning();
                  onClearChatHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-full text-[14px] font-medium text-[var(--error-color)] cursor-pointer active:opacity-80"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

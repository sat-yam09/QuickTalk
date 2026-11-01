import React, { useState } from 'react';
import { Radio, Dices } from 'lucide-react';
import { PrimaryButton } from '../components/CommonComponents.tsx';
import { generateRandomUsername, validateDisplayName } from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

interface WelcomeScreenProps {
  initialUsername: string;
  onContinue: (username: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ initialUsername, onContinue }) => {
  const [username, setUsername] = useState(initialUsername || generateRandomUsername());
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleRegenerate = () => {
    haptics.selection();
    const newName = generateRandomUsername();
    setUsername(newName);
    setValidationError(null);
  };

  const handleContinue = () => {
    const check = validateDisplayName(username);
    if (!check.isValid) {
      setValidationError(check.error || 'Invalid name');
      return;
    }
    onContinue(username.trim());
  };

  const initials = username.trim().slice(0, 2).toUpperCase() || 'QT';

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 screen-enter">
      {/* Top spacing */}
      <div className="h-6" />

      {/* Main Identity Content */}
      <div className="flex flex-col items-center text-center max-w-[340px] mx-auto w-full">
        {/* Radar-wave icon in a rounded square logo mark */}
        <div className="w-14 h-14 rounded-[16px] bg-[var(--surface-variant)] flex items-center justify-center text-[var(--accent-color)] mb-4 select-none">
          <Radio className="w-7 h-7" />
        </div>

        <h1 className="text-[22px] font-semibold text-[var(--text-primary)] tracking-tight">
          QuickTalk
        </h1>

        <p className="text-[14px] leading-[20px] text-[var(--text-secondary)] mt-2 px-2">
          Private messaging with people nearby. No internet, no phone number.
        </p>

        {/* Avatar preview */}
        <div className="mt-8 mb-6">
          <div className="w-20 h-20 rounded-full bg-[var(--surface-variant)] flex items-center justify-center text-[22px] font-semibold text-[var(--accent-color)] select-none">
            {initials}
          </div>
        </div>

        {/* Username field with dice regenerate icon */}
        <div className="w-full relative">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setValidationError(null);
            }}
            placeholder="Choose display name"
            maxLength={30}
            className="w-full min-h-[52px] px-4 pr-12 rounded-[16px] bg-[var(--surface-color)] border border-[var(--surface-variant)] text-[16px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] transition-colors text-center font-medium"
          />
          <button
            type="button"
            onClick={handleRegenerate}
            aria-label="Regenerate random username"
            title="Generate random name"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[var(--accent-color)] cursor-pointer active:opacity-70 transition-opacity"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>

        {validationError && (
          <div className="mt-2 text-[13px] text-[var(--error-color)]">{validationError}</div>
        )}
      </div>

      {/* Bottom Action Section */}
      <div className="w-full flex flex-col items-center max-w-[340px] mx-auto">
        <PrimaryButton onClick={handleContinue} disabled={username.trim().length === 0}>
          Continue
        </PrimaryButton>

        <p className="text-[13px] text-[var(--text-secondary)] text-center mt-3 select-none">
          Your name is stored only on this device.
        </p>

        <div className="h-4" />
      </div>
    </div>
  );
};

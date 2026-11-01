import React from 'react';
import { PrimaryButton, SecondaryButton } from '../components/CommonComponents.tsx';
import { getInitials } from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

interface ConnectionRequestDialogProps {
  myUsername: string;
  peerUsername: string;
  verificationCode: string;
  isIncoming?: boolean;
  statusLine?: string;
  isConnecting?: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const ConnectionRequestDialog: React.FC<ConnectionRequestDialogProps> = ({
  myUsername,
  peerUsername,
  verificationCode,
  isIncoming = true,
  statusLine,
  isConnecting = false,
  onAccept,
  onReject,
}) => {
  const myInitials = getInitials(myUsername);
  const peerInitials = getInitials(peerUsername);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 screen-enter">
      <div className="w-full max-w-[340px] rounded-[24px] bg-[var(--surface-color)] p-6 flex flex-col items-center text-center shadow-none border border-[var(--surface-variant)]/50">
        {/* Avatars joined by a thin line */}
        <div className="flex items-center justify-center w-full my-2">
          {/* My Avatar */}
          <div className="w-13 h-13 rounded-full bg-[var(--surface-variant)] flex items-center justify-center font-semibold text-[15px] text-[var(--accent-color)] shrink-0 select-none">
            {myInitials}
          </div>

          {/* Thin connecting line */}
          <div className="w-12 h-0.5 bg-[var(--accent-color)]/50 shrink-0" />

          {/* Peer Avatar */}
          <div className="w-13 h-13 rounded-full bg-[var(--surface-variant)] flex items-center justify-center font-semibold text-[15px] text-[var(--text-primary)] shrink-0 select-none">
            {peerInitials}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[18px] font-medium text-[var(--text-primary)] mt-4">
          {isIncoming ? `${peerUsername} wants to connect` : `Connecting to ${peerUsername}`}
        </h3>

        {/* Large 28sp verification code */}
        <div className="text-[28px] font-bold text-[var(--accent-color)] tracking-[3px] mt-4 select-all">
          {verificationCode}
        </div>

        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 px-2">
          Check that this code matches on both devices.
        </p>

        {/* Action buttons: Accept (filled accent), Reject (outlined neutral) */}
        <div className="w-full flex items-center gap-3 mt-6">
          <div className="flex-1">
            <SecondaryButton
              onClick={() => {
                haptics.warning();
                onReject();
              }}
              disabled={isConnecting}
            >
              Reject
            </SecondaryButton>
          </div>
          <div className="flex-1">
            <PrimaryButton
              onClick={() => {
                haptics.success();
                onAccept();
              }}
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting…' : 'Accept'}
            </PrimaryButton>
          </div>
        </div>

        {/* Status line below */}
        {statusLine && (
          <div className="text-[12px] text-[var(--text-secondary)] mt-3">
            {statusLine}
          </div>
        )}
      </div>
    </div>
  );
};

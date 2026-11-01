import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, ScanLine, Check, Copy } from 'lucide-react';
import { UserProfile, generateVerificationCode, generatePairingPayload, parsePairingPayload } from '../logic/nearTalkLogic.ts';
import { haptics } from '../utils/haptics.ts';

interface QrHandshakeModalProps {
  currentUser: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onPairFromQr: (peer: { deviceId: string; displayName: string; code: string }) => void;
}

export const QrHandshakeModal: React.FC<QrHandshakeModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onPairFromQr,
}) => {
  const [activeTab, setActiveTab] = useState<'my_qr' | 'scan'>('my_qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [authCode] = useState(() => generateVerificationCode());
  const [simulatedScanSuccess, setSimulatedScanSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const payload = generatePairingPayload(currentUser, authCode);
    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation failed', err));
  }, [isOpen, currentUser, authCode]);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    haptics.success();
    setSimulatedScanSuccess(true);
    setTimeout(() => {
      onPairFromQr({
        deviceId: 'qr_peer_echohawk',
        displayName: 'EchoHawk42',
        code: authCode,
      });
      onClose();
    }, 900);
  };

  const handleCopyCode = () => {
    haptics.selection();
    navigator.clipboard?.writeText(authCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 screen-enter">
      <div className="w-full max-w-[360px] rounded-[24px] bg-[var(--surface-color)] border border-[var(--surface-variant)]/60 overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-[var(--surface-variant)]/40">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[var(--accent-color)]" />
            <h3 className="text-[17px] font-semibold text-[var(--text-primary)]">Fast QR Handshake</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onClose();
            }}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Control */}
        <div className="px-5 pt-3">
          <div className="w-full grid grid-cols-2 p-1 rounded-full bg-[var(--surface-variant)]">
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab('my_qr');
              }}
              className={`py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'my_qr'
                  ? 'bg-[var(--accent-color)] text-[var(--on-accent-color)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              My QR Code
            </button>
            <button
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab('scan');
              }}
              className={`py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                activeTab === 'scan'
                  ? 'bg-[var(--accent-color)] text-[var(--on-accent-color)] shadow-sm'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              Scan Peer QR
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col items-center text-center">
          {activeTab === 'my_qr' ? (
            <div className="flex flex-col items-center w-full">
              {/* QR Image Box */}
              <div className="p-3 bg-white rounded-[20px] shadow-sm mb-4">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QuickTalk pairing QR code"
                    className="w-48 h-48 select-none block"
                  />
                ) : (
                  <div className="w-48 h-48 bg-zinc-100 flex items-center justify-center text-[12px] text-zinc-500">
                    Generating QR…
                  </div>
                )}
              </div>

              <div className="font-semibold text-[17px] text-[var(--text-primary)]">
                {currentUser.displayName}
              </div>

              {/* Authentication PIN badge */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="mt-2 px-3 py-1 rounded-full bg-[var(--surface-variant)] text-[13px] font-mono font-medium text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer active:opacity-75"
              >
                <span>Pairing PIN: {authCode}</span>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
              </button>

              <p className="text-[12px] text-[var(--text-secondary)] mt-3 max-w-[260px] leading-[18px]">
                Scan with a nearby device to connect instantly without waiting for radio discovery.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              {/* Camera Viewfinder View */}
              <div className="w-56 h-56 rounded-[20px] bg-black relative flex items-center justify-center overflow-hidden border border-zinc-800 mb-4">
                {/* Viewfinder Target Corners */}
                <div className="absolute inset-4 border-2 border-white/40 rounded-[12px] pointer-events-none" />
                
                {/* Subtle animated scan beam */}
                <div className="absolute inset-x-4 top-4 h-0.5 bg-white/90 animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />

                <div className="flex flex-col items-center text-zinc-400 select-none z-10 p-4">
                  <ScanLine className="w-8 h-8 text-white mb-2 animate-bounce" />
                  <span className="text-[12px]">Position peer's QR code within the frame</span>
                </div>

                {simulatedScanSuccess && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center text-white z-20 screen-enter">
                    <Check className="w-10 h-10 mb-2 stroke-[3]" />
                    <span className="text-[14px] font-semibold">Matched EchoHawk42</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={simulatedScanSuccess}
                className="w-full py-2.5 px-4 rounded-full bg-[var(--accent-color)] text-[var(--on-accent-color)] font-medium text-[14px] cursor-pointer active:opacity-85 disabled:opacity-50"
              >
                {simulatedScanSuccess ? 'Connecting…' : 'Simulate Scan (EchoHawk42)'}
              </button>

              <p className="text-[12px] text-[var(--text-secondary)] mt-3 max-w-[260px]">
                Instant cryptographic handshake verifies identities peer-to-peer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

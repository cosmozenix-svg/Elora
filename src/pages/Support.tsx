import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, QrCode, Shield, Users, MessageCircle } from 'lucide-react';

function TelegramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"/>
    </svg>
  );
}

export default function Support() {
  const navigate = useNavigate();
  const [showQrPreview, setShowQrPreview] = useState(false);

  const supportOptions = [
    {
      id: 'telegram',
      title: 'Telegram',
      subtitle: '@business_elora',
      description: 'Chat directly with Elora official support agent',
      url: 'https://t.me/business_elora',
      btnText: 'Open Telegram',
      gradient: 'from-sky-500 to-blue-600',
      badge: 'Direct Chat',
      icon: MessageCircle
    },
    {
      id: 'telegram-qr',
      title: 'Telegram QR',
      subtitle: 'Scan or View Official QR Code',
      description: 'Quickly connect to support via Telegram scan',
      url: 'https://cdn.phototourl.com/free/2026-09-19-72898d94-3892-4810-9389-33a2b18864fa.png',
      btnText: 'Open Telegram QR',
      gradient: 'from-blue-600 to-indigo-600',
      badge: 'QR Code',
      icon: QrCode
    },
    {
      id: 'support-group',
      title: 'Support Group',
      subtitle: 'Elora Official Community',
      description: 'Join community group for queries, updates & tips',
      url: 'https://t.me/+CfrGgYmz5h4wOTll',
      btnText: 'Join Support Group',
      gradient: 'from-indigo-600 to-purple-600',
      badge: 'Community',
      icon: Users
    },
  ];

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Help & Support</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Official Telegram support channels</p>
        </div>
      </div>

      {/* Support Hero Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-white p-4 rounded-2xl shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/15 dark:bg-white/10 p-2 shrink-0 backdrop-blur-xs flex items-center justify-center border border-white/20">
            <TelegramIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white inline-block mb-1">
              Active Support
            </span>
            <h3 className="text-sm font-bold text-white">Need Help with Elora?</h3>
            <p className="text-xs text-blue-100 dark:text-blue-200 mt-0.5">
              Connect through our official Telegram channels for fast resolution.
            </p>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Support Action Buttons */}
      <div className="space-y-2.5">
        {supportOptions.map((opt) => (
          <div
            key={opt.id}
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3.5 rounded-2xl shadow-xs transition-all hover:border-blue-400 dark:hover:border-blue-700"
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#229ED9] flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/50">
                  <TelegramIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{opt.title}</h4>
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-medium">{opt.subtitle}</p>
                </div>
              </div>

              {opt.id === 'telegram-qr' && (
                <button
                  onClick={() => setShowQrPreview(!showQrPreview)}
                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold underline shrink-0 mt-0.5"
                >
                  {showQrPreview ? 'Hide QR' : 'View QR'}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              {opt.description}
            </p>

            {/* Direct Link Button with Telegram Icon */}
            <a
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 bg-[#229ED9] hover:bg-[#1e8ec3] active:scale-[0.98] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <TelegramIcon className="w-4 h-4 text-white shrink-0" />
              <span>{opt.btnText}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        ))}
      </div>

      {/* QR Code Inline View / Expandable */}
      {showQrPreview && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
          <div className="flex justify-between items-center mb-2 px-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Telegram QR Code</h4>
            <span className="text-[10px] text-slate-400">Scan via Telegram app</span>
          </div>
          <div className="p-2 bg-white rounded-xl border border-slate-200 inline-block mx-auto shadow-xs">
            <img
              src="https://cdn.phototourl.com/free/2026-09-19-72898d94-3892-4810-9389-33a2b18864fa.png"
              alt="Telegram Support QR"
              className="w-48 h-48 object-contain rounded-lg mx-auto"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
            Scan with your smartphone camera or Telegram app to open support chat.
          </p>
        </div>
      )}

      {/* Trust & Safety footer note */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl border border-slate-200/60 dark:border-slate-800/80 flex items-center gap-2.5 text-[10px] text-slate-500 dark:text-slate-400">
        <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
        <span>Elora official admins will never ask for your account password or PIN.</span>
      </div>
    </div>
  );
}

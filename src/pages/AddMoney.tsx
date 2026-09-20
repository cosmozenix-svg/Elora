import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Check, Copy, AlertCircle, Clock, ShieldCheck, HelpCircle, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import EloCoin from '../components/EloCoin';

interface DepositGatewayNumber {
  id: 'bkash' | 'nagad' | 'rocket';
  name: string;
  number: string;
  color: string;
  badgeBg: string;
  borderActive: string;
  lightBg: string;
  darkBg: string;
}

const DEPOSIT_NUMBERS: DepositGatewayNumber[] = [
  {
    id: 'bkash',
    name: 'bKash',
    number: '01914905654',
    color: 'text-pink-600 dark:text-pink-400',
    badgeBg: 'bg-pink-600 text-white',
    borderActive: 'border-pink-500 ring-pink-500/30',
    lightBg: 'bg-pink-50/70',
    darkBg: 'dark:bg-pink-950/30'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    number: '01973674619',
    color: 'text-orange-600 dark:text-orange-400',
    badgeBg: 'bg-orange-600 text-white',
    borderActive: 'border-orange-500 ring-orange-500/30',
    lightBg: 'bg-orange-50/70',
    darkBg: 'dark:bg-orange-950/30'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    number: '01913414539',
    color: 'text-purple-600 dark:text-purple-400',
    badgeBg: 'bg-purple-600 text-white',
    borderActive: 'border-purple-500 ring-purple-500/30',
    lightBg: 'bg-purple-50/70',
    darkBg: 'dark:bg-purple-950/30'
  }
];

export default function AddMoney() {
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [bdtAmount, setBdtAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    method: string;
    bdt: number;
    coins: number;
    trxId: string;
  } | null>(null);

  const { currentUser, addBalance } = useAppStore();
  const navigate = useNavigate();

  const handleCopy = async (num: string, id: string) => {
    try {
      await navigator.clipboard.writeText(num);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      const el = document.createElement('textarea');
      el.value = num;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const parsedBdt = parseFloat(bdtAmount) || 0;
  const calculatedCoins = parsedBdt * 1000;

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;
    if (parsedBdt <= 0) return;
    const cleanTrx = trxId.trim().toUpperCase();
    if (!cleanTrx) return;

    const coinsToAdd = parsedBdt * 1000;
    setIsSubmitting(true);

    try {
      await addBalance(currentUser.id, coinsToAdd, method, cleanTrx);
      setSubmittedData({
        method,
        bdt: parsedBdt,
        coins: coinsToAdd,
        trxId: cleanTrx
      });
      setShowSuccessModal(true);
      setBdtAmount('');
      setTrxId('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-3 pb-8">
      {/* Top Navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Add Elo Coins</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Deposit BDT securely to replenish wallet</p>
        </div>
      </div>

      {/* 1. Copyable Official Phone Numbers at the Very Top */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Official Deposit Numbers
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Send money directly to any of the numbers below
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Send Money
          </span>
        </div>

        <div className="space-y-2">
          {DEPOSIT_NUMBERS.map((gateway, index) => {
            const isCopied = copiedId === gateway.id;
            return (
              <div
                key={gateway.id}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                  gateway.lightBg,
                  gateway.darkBg,
                  method === gateway.id
                    ? "border-blue-500/80 dark:border-blue-500/80 shadow-xs"
                    : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xs font-bold font-mono text-slate-400 dark:text-slate-500 w-3 shrink-0">
                    {index + 1}.
                  </span>
                  <span className={cn("px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0", gateway.badgeBg)}>
                    {gateway.name}
                  </span>
                  <span className="font-mono font-bold text-sm tracking-wider text-slate-900 dark:text-slate-100 select-all truncate">
                    {gateway.number}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(gateway.number, gateway.id)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95",
                    isCopied
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
                  )}
                  title={`Copy ${gateway.name} number`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-white" />
                      <span className="text-[10px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Official Instructions */}
      <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 p-3.5 rounded-2xl text-left space-y-2">
        <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Important Deposit Instructions:</span>
        </div>
        <ol className="space-y-1.5 text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed font-medium pl-1">
          <li className="flex items-start gap-1.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">1.</span>
            <span>Send money on these numbers the amount you want.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">2.</span>
            <span>If anything wrong happens, contact support through SUPPORT section.</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">3.</span>
            <span>Make sure you provide right Transaction ID or the payment will not be done.</span>
          </li>
        </ol>
      </div>

      {/* Conversion Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <EloCoin size="sm" />
          <div className="text-xs">
            <p className="font-bold text-blue-950 dark:text-blue-200">
              Exchange Rate: 1 BDT = 1,000 Elo coins
            </p>
            <p className="text-blue-700 dark:text-blue-300 text-[10px]">
              Coins are credited once verified by admins
            </p>
          </div>
        </div>
        <Link
          to="/support"
          className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          <HelpCircle className="w-3 h-3" /> Support
        </Link>
      </div>

      {/* 3. Deposit Submission Form */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleAdd} className="space-y-3.5">
          {/* Select Gateway */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              1. Select Used Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DEPOSIT_NUMBERS.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setMethod(g.id)}
                  className={cn(
                    "py-2.5 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-0.5",
                    method === g.id
                      ? `${g.badgeBg} shadow-xs border-transparent scale-[1.02]`
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                  )}
                >
                  <span>{g.name}</span>
                  <span className={cn(
                    "text-[9px] font-mono",
                    method === g.id ? "text-white/80" : "text-slate-400"
                  )}>
                    {g.number.slice(0, 5)}...
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Sent */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              2. Sent Amount (BDT)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500 text-xs">
                ৳
              </span>
              <input
                required
                type="number"
                min="10"
                step="1"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 pl-7 pr-3 text-xs font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={bdtAmount}
                onChange={e => setBdtAmount(e.target.value)}
                placeholder="e.g. 150"
              />
            </div>
            
            {/* Live Coin Calculation */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Calculated Coins to credit:</span>
              <div className="flex items-center gap-1.5 font-mono font-bold text-amber-600 dark:text-amber-400">
                <EloCoin size="xs" />
                <span>{calculatedCoins.toLocaleString()} Elo coins</span>
              </div>
            </div>

            {/* Quick deposit pills */}
            <div className="flex gap-1.5 mt-2">
              {[50, 100, 150, 200, 500].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setBdtAmount(val.toString())}
                  className={cn(
                    "flex-1 py-1 text-[10px] font-bold font-mono rounded-lg transition-colors border",
                    bdtAmount === val.toString()
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  )}
                >
                  ৳{val}
                </button>
              ))}
            </div>
          </div>

          {/* Transaction ID */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                3. Transaction ID (TrxID)
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                From SMS / App receipt
              </span>
            </div>
            <input
              required
              type="text"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors uppercase tracking-wider"
              value={trxId}
              onChange={e => setTrxId(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
              placeholder="e.g. 9J8A7D6F"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              * Make sure you provide right Transaction ID or the payment will not be done.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || parsedBdt <= 0 || !trxId.trim()}
            className={cn(
              "w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs text-white transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]",
              isSubmitting || parsedBdt <= 0 || !trxId.trim()
                ? "bg-slate-400 cursor-not-allowed opacity-60"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            )}
          >
            <EloCoin size="xs" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Deposit for Verification'}</span>
          </button>
        </form>
      </div>

      {/* 4. Requested Pop-up Screen upon Session Submission */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            {/* Status Icon */}
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            {/* Exact Required Popup Notification */}
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                Session Submitted
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                "Your Add Money Session Was Successful. Wait few moments until the admins verify your activity. It might take several few moments. Check back later."
              </p>
            </div>

            {/* Submission Summary Details */}
            {submittedData && (
              <div className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-left space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Gateway:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 uppercase">
                    {submittedData.method}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Amount Sent:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ৳{submittedData.bdt.toFixed(2)} BDT
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Coins Requested:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <EloCoin size="xs" /> +{submittedData.coins.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>TrxID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 uppercase">
                    {submittedData.trxId}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                  <span>Status:</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Pending Verification
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/index')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>View Activity in Index</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/');
                }}
                className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

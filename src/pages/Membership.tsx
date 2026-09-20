import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { 
  ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, 
  Lock, Unlock, ArrowRight, Zap, Gift, HelpCircle,
  AlertCircle, ChevronRight, PlusCircle, Check
} from 'lucide-react';
import PremiumEIcon from '../components/PremiumEIcon';
import EloCoin from '../components/EloCoin';
import { cn } from '../lib/utils';

export default function Membership() {
  const { currentUser, purchaseMembership } = useAppStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!currentUser) return null;

  const isMember = Boolean(currentUser.isMember);
  const costInCoins = 150000;
  const costInBdt = 150;
  const hasEnoughCoins = currentUser.balance >= costInCoins;
  const coinsNeeded = Math.max(0, costInCoins - currentUser.balance);

  const handlePurchase = async () => {
    setError('');
    if (isMember) return;
    if (!hasEnoughCoins) {
      setError(`Insufficient balance. You need ${costInCoins.toLocaleString()} Elo Coins (150 BDT) in your balance.`);
      return;
    }

    setLoading(true);
    try {
      await purchaseMembership(currentUser.id);
      setSuccessCelebration(true);
    } catch (err: any) {
      setError(err.message || 'Failed to activate membership. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Top App Bar / Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Membership</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Exclusive privileges & unlocked cashouts</p>
          </div>
        </div>

        {isMember && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-[10px] shadow-xs uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-slate-950" /> Permanent
          </span>
        )}
      </div>

      {/* Success Celebration Screen */}
      {successCelebration ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-amber-300 dark:border-amber-600/50 text-center transition-all animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 p-1 mx-auto mb-4 shadow-lg shadow-amber-500/25 flex items-center justify-center">
            <PremiumEIcon size="lg" showCrown />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
            <Check className="w-3.5 h-3.5" /> Membership Activated!
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            Welcome, Elora Member!
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Your permanent Elora Member status is active. The <strong>Withdraw</strong> section is unlocked, you earn <strong>200 coins/min & 10 coins/tap</strong> in the Earn section, and <strong>+20,000 bonus coins</strong> have been instantly credited to your account!
          </p>

          <div className="mt-4 p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Withdraw Section:</span>
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">UNLOCKED</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Earn Rates:</span>
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">200/min & 10/tap</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Welcome Bonus:</span>
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">+20,000 Coins Credited</span>
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => navigate('/withdraw')}
              className="flex-1 py-2.5 px-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Go to Withdraw</span>
            </button>
            <button
              onClick={() => setSuccessCelebration(false)}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              View Membership
            </button>
          </div>
        </div>
      ) : null}

      {/* Main Membership Plan Card */}
      {!successCelebration && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border-2 border-amber-400/80 dark:border-amber-500/80 shadow-md transition-all">
          {/* Ambient Lighting Accents */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Card Header & Badge */}
          <div className="p-5 pb-4 relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <PremiumEIcon size="lg" showCrown className="shadow-lg shadow-amber-500/20" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                      Elora Member
                    </h3>
                  </div>
                  <p className="text-[11px] font-medium text-amber-300/90 tracking-wide uppercase">
                    Permanent Lifetime Access
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                  {isMember ? 'Active' : 'Premium'}
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Membership Price
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">150 BDT</span>
                  <span className="text-xs text-slate-400">or</span>
                  <div className="inline-flex items-center gap-1 font-mono font-bold text-amber-200 text-sm">
                    <EloCoin size="xs" />
                    <span>150,000 coins</span>
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                One-Time Payment
              </span>
            </div>
          </div>

          {/* Description & Perks List */}
          <div className="bg-slate-950/80 p-5 pt-4 border-t border-slate-800/80 relative z-10 space-y-3">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Membership Privileges & Description
            </p>

            <div className="space-y-2.5">
              {/* Perk 1: Unlocks Withdraw section */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>*Unlocks Withdraw section.</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Instantly cash out your Elo coins to bKash, Nagad, Rocket, or Upay anytime with zero lock barriers.
                  </p>
                </div>
              </div>

              {/* Perk 2: Boosted Earning Rates */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>*Boosted Earning Rates</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Earn 200 Elo coins in the "Earn" section (instead of 100 coins) and 10 coins per tap (instead of 5 coins).
                  </p>
                </div>
              </div>

              {/* Perk 3: Get Extra 20K Coins */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <span>*Get Extra 20K Coins Instantly</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                    Instant bonus! Whenever you buy the membership, get 20,000 Elo Coins instantly credited to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* Why This Membership Explanation */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Why this membership?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  The <strong className="text-white">"Withdraw"</strong> section remains locked totally without this membership. If the user purchases membership, then the withdraw section will be unlocked (Other sections remain stable and unlocked). So we can use the withdraw section only if we purchase the membership.
                </p>
              </div>
            </div>

            {/* Error notice */}
            {error && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Balance & Action Controller */}
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-slate-400 font-medium">Your Current Balance:</span>
                <div className="flex items-center gap-1 font-mono font-bold text-white">
                  <EloCoin size="xs" />
                  <span>{currentUser.balance.toLocaleString()} coins</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (৳{(currentUser.balance / 1000).toFixed(2)} BDT)
                  </span>
                </div>
              </div>

              {isMember ? (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-emerald-200">You are an Elora Member</p>
                      <p className="text-[10px] text-emerald-400">Withdraw section unlocked forever</p>
                    </div>
                  </div>
                  <Link
                    to="/withdraw"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <span>Withdraw</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : hasEnoughCoins ? (
                <button
                  type="button"
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <PremiumEIcon size="sm" showCrown />
                  <span>{loading ? 'Activating Membership...' : 'Purchase Elora Member (150 BDT / 150k Coins)'}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Short by: <strong className="text-rose-400 font-mono font-bold">{coinsNeeded.toLocaleString()} coins</strong> (৳{(coinsNeeded / 1000).toFixed(2)} BDT)</span>
                    <span className="text-[10px] text-slate-400">Need 150,000 coins</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/add-money')}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add Balance via bKash / Nagad (150 BDT)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extra Trust & Guarantee Information Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Membership Guarantee</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Permanent Access</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
              One-time activation. No monthly subscription or renewals.
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200 block">Zero Cashout Limits</span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">
              Full access to instant withdraw to all 4 supported gateways.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

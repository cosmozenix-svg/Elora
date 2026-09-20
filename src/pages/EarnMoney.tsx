import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Clock, Sparkles, Zap, Coins, Flame } from 'lucide-react';
import EloCoin from '../components/EloCoin';
import PremiumEIcon from '../components/PremiumEIcon';
import { cn } from '../lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export default function EarnMoney() {
  const [seconds, setSeconds] = useState(0);
  const [tapCount, setTapCount] = useState(0);
  const [tapCoinsEarned, setTapCoinsEarned] = useState(0);
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [isCoinPressed, setIsCoinPressed] = useState(false);

  const { currentUser, earnMoney, addTransaction } = useAppStore();
  const navigate = useNavigate();

  const isMember = Boolean(currentUser?.isMember);

  // AFK: 100 coins per minute (Elora Member gets 200 coins/min)
  const baseCoinsPerMinute = 100;
  const coinsPerMinute = isMember ? 200 : baseCoinsPerMinute;

  // Tap: 5 coins per tap (Elora Member gets 10 coins/tap)
  const baseCoinsPerTap = 5;
  const coinsPerTap = isMember ? 10 : baseCoinsPerTap;

  // Batching refs for rapid tapping persistence
  const pendingTapsRef = useRef<{ count: number; coins: number }>({ count: 0, coins: 0 });
  const batchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronized refs to keep interval and tap handlers completely decoupled from re-renders
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const coinsPerMinuteRef = useRef(coinsPerMinute);
  coinsPerMinuteRef.current = coinsPerMinute;

  const coinsPerTapRef = useRef(coinsPerTap);
  coinsPerTapRef.current = coinsPerTap;

  const earnMoneyRef = useRef(earnMoney);
  earnMoneyRef.current = earnMoney;

  const addTransactionRef = useRef(addTransaction);
  addTransactionRef.current = addTransaction;

  // Flush batched tap coins to Firestore and transaction history
  const flushTapBatch = useCallback(async () => {
    const user = currentUserRef.current;
    const { count, coins } = pendingTapsRef.current;
    if (!user || count === 0 || coins === 0) return;

    // Reset pending
    pendingTapsRef.current = { count: 0, coins: 0 };

    try {
      // Sync balance to firestore
      const storeState = useAppStore.getState();
      const freshUser = storeState.users.find(u => u.id === user.id);
      if (freshUser) {
        await updateDoc(doc(db, 'users', String(user.id)), { balance: freshUser.balance });
      }

      // Record a clean grouped transaction for this tapping session batch
      await addTransactionRef.current({
        userId: user.id,
        type: 'earn',
        amount: coins,
        status: 'completed',
        date: new Date().toISOString(),
        reference: `Screen tap reward (+${coins.toLocaleString()} coins, ${count} taps)`
      });
    } catch (err) {
      console.warn('Failed to flush tap earnings batch:', err);
    }
  }, []);

  // Cleanup on unmount: flush any pending taps
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
      flushTapBatch();
    };
  }, [flushTapBatch]);

  const secondsRef = useRef(0);
  const lastAwardedMinuteRef = useRef(0);

  // AFK Continuous Timer: runs smoothly every 1000ms without being interrupted or reset by taps, and strictly fires reward once per elapsed minute
  useEffect(() => {
    const interval = setInterval(() => {
      secondsRef.current += 1;
      const currentSeconds = secondsRef.current;
      setSeconds(currentSeconds);

      const currentMinute = Math.floor(currentSeconds / 60);
      if (currentMinute > lastAwardedMinuteRef.current && currentUserRef.current) {
        lastAwardedMinuteRef.current = currentMinute;
        earnMoneyRef.current(
          currentUserRef.current.id,
          coinsPerMinuteRef.current,
          `AFK time reward (${currentMinute}m)`
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle Tap Action anywhere on the screen / tap card
  const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const user = currentUserRef.current;
    if (!user) return;

    // Don't trigger if user clicked an interactive control like back button or link
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, select')) {
      return;
    }

    const currentCoinsPerTap = coinsPerTapRef.current;

    // Determine tap coordinates for floating coin animation
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if ('clientX' in e && e.clientX && e.clientY) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    // Spawn floating coin
    const newFloating: FloatingCoin = {
      id: Date.now() + Math.random(),
      x: clientX,
      y: clientY,
      amount: currentCoinsPerTap
    };

    setFloatingCoins(prev => [...prev.slice(-15), newFloating]);

    // Animate coin press
    setIsCoinPressed(true);
    setTimeout(() => setIsCoinPressed(false), 120);

    // Light vibration if supported on device
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }

    // Update local session stats
    setTapCount(c => c + 1);
    setTapCoinsEarned(c => c + currentCoinsPerTap);

    // Optimistically update store's balance immediately for real-time responsiveness
    const currentBal = useAppStore.getState().currentUser?.balance || 0;
    const newBal = currentBal + currentCoinsPerTap;
    useAppStore.setState(s => ({
      users: s.users.map(u => u.id === user.id ? { ...u, balance: newBal } : u),
      currentUser: s.currentUser ? { ...s.currentUser, balance: newBal } : null
    }));

    // Accumulate into pending batch
    pendingTapsRef.current.count += 1;
    pendingTapsRef.current.coins += currentCoinsPerTap;

    // Reset debounce timer for batch flush (flushes 700ms after user pauses tapping)
    if (batchTimerRef.current) {
      clearTimeout(batchTimerRef.current);
    }
    batchTimerRef.current = setTimeout(() => {
      flushTapBatch();
    }, 700);
  }, [flushTapBatch]);

  // Clean up floating coins after animation completes
  useEffect(() => {
    if (floatingCoins.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingCoins(prev => prev.filter(c => Date.now() - c.id < 750));
    }, 800);
    return () => clearTimeout(timer);
  }, [floatingCoins]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const minutesPassed = Math.floor(seconds / 60);
  const afkCoinsEarned = minutesPassed * coinsPerMinute;
  const totalSessionCoins = afkCoinsEarned + tapCoinsEarned;

  return (
    <div 
      className="relative w-full space-y-3 select-none min-h-[520px]"
      onClick={handleTap}
    >
      {/* Floating Animated Coin Particles on Tap */}
      {floatingCoins.map(coin => (
        <div
          key={coin.id}
          className="fixed z-50 pointer-events-none flex items-center gap-1 font-mono font-black text-sm px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-lg border border-amber-300 animate-float-up"
          style={{
            left: `${coin.x}px`,
            top: `${coin.y}px`
          }}
        >
          <EloCoin size="xs" />
          <span>+{coin.amount}</span>
        </div>
      ))}

      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(-1);
            }}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Earn Elo Coins</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              AFK: {coinsPerMinute.toLocaleString()} coins/min • Tap: +{coinsPerTap} coins/tap
            </p>
          </div>
        </div>

        {/* Live Balance Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 rounded-full shadow-xs">
          <EloCoin size="xs" />
          <span className="font-mono font-bold text-xs text-amber-900 dark:text-amber-200">
            {currentUser?.balance.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Membership Boost Indicator */}
      {isMember ? (
        <div className="p-2.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300 dark:border-amber-700/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PremiumEIcon size="xs" showCrown />
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span>*200% More Earning Active</span>
              </p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                AFK: 200 coins/min • Taps: +10 coins/tap (Boosted)
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs shrink-0">
            BOOSTED
          </span>
        </div>
      ) : (
        <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <p className="text-[11px] text-purple-900 dark:text-purple-200">
              Want <strong>Boosted Earning</strong> (200/min & +10/tap)?
            </p>
          </div>
          <Link
            to="/membership"
            onClick={e => e.stopPropagation()}
            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-colors shrink-0 shadow-xs"
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Main Interactive Screen Tap Arena & Coin */}
      <div 
        className={cn(
          "relative overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-center transition-all cursor-pointer",
          "hover:border-amber-400/80 dark:hover:border-amber-600/80 active:bg-slate-100/70 dark:active:bg-slate-900/90"
        )}
      >
        {/* Subtle Background Glow Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Tap Prompt Header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-[11px] font-black uppercase tracking-wider mb-3">
          <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Tap Screen for +{coinsPerTap} Coins</span>
        </div>

        {/* Big Interactive Coin */}
        <div className="relative my-2 flex justify-center items-center">
          <div 
            className={cn(
              "relative flex items-center justify-center transition-transform duration-100",
              isCoinPressed ? "scale-90" : "scale-100"
            )}
          >
            {/* Pulsing Ripple Rings */}
            <div className="absolute w-36 h-36 rounded-full border border-amber-400/30 dark:border-amber-500/20 animate-ping opacity-30 pointer-events-none" />
            <div className="absolute w-28 h-28 rounded-full border-2 border-dashed border-amber-400/40 dark:border-amber-500/30 animate-spin opacity-40 pointer-events-none" style={{ animationDuration: '14s' }} />

            {/* Central Tap Coin Button */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 dark:from-amber-400 dark:via-amber-500 dark:to-amber-700 shadow-lg shadow-amber-500/25 border-4 border-amber-100 dark:border-amber-300 flex items-center justify-center">
              <EloCoin size="lg" className="w-14 h-14 drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Live Tap Counter */}
        <div className="mt-2 space-y-0.5">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {tapCount > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-mono">
                {tapCount} Taps • +{tapCoinsEarned.toLocaleString()} Coins Earned
              </span>
            ) : (
              <span>Tap anywhere inside this section to start earning!</span>
            )}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            Every screen tap instantly grants +{coinsPerTap} Elo coins directly to your balance
          </p>
        </div>
      </div>

      {/* Dual Earnings Dashboard: AFK + Taps */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* AFK Status Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                AFK Engine
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Running
            </span>
          </div>

          <div className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">
            {formatTime(seconds)}
          </div>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-0.5">
            +{afkCoinsEarned.toLocaleString()} coins ({coinsPerMinute}/min)
          </p>
        </div>

        {/* Tap Status Card */}
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">
                Screen Taps
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
              +{coinsPerTap}/tap
            </span>
          </div>

          <div className="font-mono text-xl font-black text-slate-900 dark:text-slate-100">
            {tapCount} <span className="text-xs font-normal text-slate-400">taps</span>
          </div>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
            +{tapCoinsEarned.toLocaleString()} coins collected
          </p>
        </div>
      </div>

      {/* Combined Session Total Banner */}
      <div className="p-3 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white rounded-xl font-bold flex justify-between items-center shadow-xs">
        <div>
          <span className="text-xs block text-purple-200 font-normal">Total Session Earnings</span>
          <span className="text-[10px] text-purple-300">AFK auto-credits + Screen taps combined</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-base">
          <EloCoin size="sm" />
          <span>+{totalSessionCoins.toLocaleString()}</span>
          <span className="text-xs font-normal text-purple-200">
            (≈ {(totalSessionCoins / 1000).toFixed(2)} BDT)
          </span>
        </div>
      </div>

      {/* How It Works Guidelines */}
      <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-left space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-bold text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>How Earning Works in this Section:</span>
        </div>
        <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          <p className="flex items-start gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
            <span>
              <strong>AFK Earning:</strong> Keep this screen open to automatically collect <strong>{coinsPerMinute.toLocaleString()} Elo coins</strong> every 60 seconds into your balance.
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
            <span>
              <strong>Tap Earning:</strong> Tap anywhere on the screen while remaining in the Earn section to collect an extra <strong>{coinsPerTap.toLocaleString()} Elo coins</strong> with every single tap.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

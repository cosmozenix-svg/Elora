import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';

export default function EarnMoney() {
  const [seconds, setSeconds] = useState(0);
  const { currentUser, earnMoney } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        const next = s + 1;
        if (next > 0 && next % 60 === 0 && currentUser) {
          earnMoney(currentUser.id, 5);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser, earnMoney]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Earn Money</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Earn 5 BDT per minute active</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-center transition-colors">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mb-3 shadow-xs">
          <Clock className="h-7 w-7 animate-pulse" />
        </div>
        
        <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-wider mb-1">
          {formatTime(seconds)}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mb-4">Active Session Duration</p>
        
        <div className="bg-purple-50 dark:bg-purple-950/30 p-3 rounded-xl border border-purple-100 dark:border-purple-900/50 text-left mb-3">
          <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Activity Reward</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Keep this screen open on your Android device to automatically earn <span className="text-purple-700 dark:text-purple-300 font-bold">5.00 BDT</span> every 60 seconds into your balance.
          </p>
        </div>

        <div className="p-3 bg-purple-600 dark:bg-purple-700 text-white rounded-xl font-bold flex justify-between items-center shadow-xs">
          <span className="text-xs">Session Earnings</span>
          <span className="text-base font-mono">{(Math.floor(seconds / 60) * 5).toFixed(2)} BDT</span>
        </div>
      </div>
    </div>
  );
}

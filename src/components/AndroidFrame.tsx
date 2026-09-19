import { ReactNode, useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../lib/store';
import { cn } from '../lib/utils';

interface AndroidFrameProps {
  children: ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const [currentTime, setCurrentTime] = useState('');
  const { theme, toggleTheme } = useAppStore();

  useEffect(() => {
    // Keep documentElement class in sync with store theme
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-0 sm:p-3 md:p-6 overflow-x-hidden transition-colors duration-300">
      {/* Subtle Desktop Device Tag with Global Theme Switch */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[480px] mb-2 px-2 text-xs font-medium text-slate-400 tracking-wide select-none">
        <div className="flex items-center gap-2">
          <img 
            src="/icon.png" 
            alt="Elora" 
            className="w-4 h-4 rounded-md object-contain" 
            referrerPolicy="no-referrer" 
          />
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Elora • Android (9:16)</span>
        </div>

        {/* Global theme quick pill */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all cursor-pointer text-[11px] shadow-xs active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Global Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-200">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-200">Dark</span>
            </>
          )}
        </button>
      </div>

      {/* Android Device Chassis with 9:16 Aspect Ratio */}
      <div className={cn(
        "relative w-full sm:w-auto h-[100dvh] sm:h-[94vh] sm:max-h-[890px] sm:aspect-[9/16] max-w-[480px]",
        "bg-slate-900 sm:rounded-[44px] sm:p-[8px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08)]",
        "flex flex-col ring-1 ring-slate-800 dark:ring-slate-700/50 transition-all duration-300",
        theme === 'dark' && "dark"
      )}>
        
        {/* Hardware side buttons (Desktop view only) */}
        <div className="hidden sm:block absolute -right-[9px] top-28 w-[3px] h-12 bg-slate-700 rounded-r shadow-sm" title="Power" />
        <div className="hidden sm:block absolute -left-[9px] top-24 w-[3px] h-20 bg-slate-700 rounded-l shadow-sm" title="Volume" />

        {/* Top Speaker ear-piece cutout */}
        <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-40" />

        {/* Inner Screen Display */}
        <div className="relative w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 sm:rounded-[36px] overflow-hidden flex flex-col shadow-inner transition-colors duration-300">
          
          {/* Android Status Bar */}
          <div className="h-9 w-full px-5 pt-1.5 flex items-center justify-between z-30 shrink-0 bg-transparent text-slate-800 dark:text-slate-200 select-none">
            {/* Left: Clock */}
            <div className="flex items-center gap-1.5 w-20">
              <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {currentTime || '12:30'}
              </span>
            </div>

            {/* Center: Camera Punch-Hole */}
            <div className="flex justify-center items-center">
              <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-slate-800/40 dark:ring-slate-700/50 shadow-inner flex items-center justify-center">
                <div className="w-1 h-1 bg-slate-900 rounded-full"></div>
              </div>
            </div>

            {/* Right: Status Icons + Quick Mini Theme Toggle */}
            <div className="flex items-center justify-end gap-1.5 w-20 text-slate-800 dark:text-slate-200">
              <button 
                onClick={toggleTheme}
                className="p-0.5 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800/60 transition-colors mr-0.5"
                title={`Toggle ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3 h-3 text-amber-400" />
                ) : (
                  <Moon className="w-3 h-3 text-slate-600" />
                )}
              </button>
              <span className="text-[10px] font-bold tracking-tighter text-slate-700 dark:text-slate-300">5G</span>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <Battery className="w-4 h-4 fill-slate-800 dark:fill-slate-200" />
                <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300">92%</span>
              </div>
            </div>
          </div>

          {/* App Scrollable Content Container */}
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {children}
          </div>

          {/* Android Bottom Gesture Navigation Pill */}
          <div className="h-5 w-full flex items-center justify-center shrink-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-xs z-30 select-none pb-1 transition-colors duration-300">
            <div className="w-28 h-1 bg-slate-400/80 dark:bg-slate-600 rounded-full hover:bg-slate-500 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

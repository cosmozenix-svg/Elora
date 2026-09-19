import { ReactNode, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { cn } from '../lib/utils';

interface AndroidFrameProps {
  children: ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const { theme } = useAppStore();

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

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-0 sm:p-4 md:p-6 transition-colors duration-300">
      {/* 9:16 Portrait Website Container */}
      <div
        id="elora-web-container"
        className={cn(
          "w-full max-w-[460px] h-[100dvh] sm:h-[92vh] sm:max-h-[890px] sm:aspect-[9/16]",
          "bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100",
          "sm:rounded-2xl sm:shadow-2xl sm:border sm:border-slate-200/80 dark:sm:border-slate-800",
          "flex flex-col overflow-hidden relative transition-colors duration-300",
          theme === 'dark' && "dark"
        )}
      >
        {/* Web Scrollable Content Container */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}

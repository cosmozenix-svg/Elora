import { ReactNode } from "react";
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { LogOut, Home, Send, PlusCircle, History, User, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { CARTOON_AVATARS } from '../data/avatars';

export default function Layout({ children }: { children: ReactNode }) {
  const { currentUser, logoutUser, theme, toggleTheme } = useAppStore();
  const location = useLocation();

  const userAvatar = currentUser?.profilePic && !currentUser.profilePic.includes('unsplash.com')
    ? currentUser.profilePic
    : CARTOON_AVATARS[0].url;

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Send', path: '/send-money', icon: Send },
    { label: 'Add', path: '/add-money', icon: PlusCircle },
    { label: 'History', path: '/history', icon: History },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="flex-1 flex flex-col w-full bg-slate-50 dark:bg-slate-950 min-h-full transition-colors duration-300">
      {/* Android Top App Bar */}
      <header className="sticky top-0 z-20 bg-blue-600 dark:bg-slate-900 text-white shadow-sm px-4 py-3 flex items-center justify-between border-b border-transparent dark:border-slate-800 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-white shadow-xs p-0.5 shrink-0 flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform">
            <img 
              src="/icon.png" 
              alt="Elora Logo" 
              className="w-full h-full object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Elora</h1>
            {currentUser && (
              <p className="text-[10px] text-blue-200 dark:text-blue-400 font-medium">ID: {currentUser.id}</p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {/* Global Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full hover:bg-white/10 dark:hover:bg-slate-800 transition-colors text-blue-100 dark:text-amber-300 hover:text-white"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {currentUser && (
            <>
              <Link 
                to="/profile" 
                className="flex items-center gap-2 bg-blue-700/60 dark:bg-slate-800 hover:bg-blue-700 dark:hover:bg-slate-700 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border border-white/10 dark:border-slate-700"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 dark:bg-slate-700 flex items-center justify-center p-0.5">
                  <img 
                    src={userAvatar} 
                    alt="Avatar" 
                    className="w-full h-full object-contain rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="max-w-[70px] truncate text-slate-100">{currentUser.fullName.split(' ')[0]}</span>
              </Link>

              <button
                onClick={logoutUser}
                className="p-1.5 hover:bg-white/10 dark:hover:bg-slate-800 rounded-full transition-colors text-blue-100 dark:text-slate-300 hover:text-white"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full px-4 py-5 pb-24 text-slate-900 dark:text-slate-100">
        {children}
      </main>

      {/* Android Material Bottom Navigation Bar */}
      <nav className="sticky bottom-0 left-0 right-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-sm select-none transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-blue-600 dark:text-blue-400 font-semibold" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
              )}
            >
              <div className={cn(
                "w-10 h-7 rounded-full flex items-center justify-center transition-colors mb-0.5",
                isActive 
                  ? "bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400" 
                  : "text-slate-500 dark:text-slate-400"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

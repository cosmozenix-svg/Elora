import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Mail, Lock, Sun, Moon, Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      loginUser(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6 w-full max-w-sm mx-auto my-auto relative">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-2 right-4">
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-xs transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200/80 dark:border-slate-700 p-1 mb-3 overflow-hidden">
          <img 
            src="/icon.png" 
            alt="Elora App Icon" 
            className="w-full h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Elora</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Everything Possible With Elora</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 text-center">Sign in to Elora</h2>

        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email address</label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 text-sm border-slate-300 dark:border-slate-700 rounded-xl py-2.5 border outline-none bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <div className="relative rounded-xl shadow-xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 text-sm border-slate-300 dark:border-slate-700 rounded-xl py-2.5 border outline-none bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.98] transition-all flex justify-center items-center"
          >
            Sign in
          </button>
        </form>

        <div className="mt-5 text-center text-xs">
          <span className="text-slate-600 dark:text-slate-400">Don't have an account? </span>
          <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Register here
          </Link>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-center">
          <Link 
            to="/admin/login" 
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

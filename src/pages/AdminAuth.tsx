import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { Shield, ArrowLeft, Sun, Moon } from 'lucide-react';

export default function AdminAuth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { loginAdmin, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      loginAdmin(username, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-6 w-full max-w-sm mx-auto my-auto relative">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to User Login
        </Link>
        <button
          onClick={toggleTheme}
          type="button"
          className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-750 shadow-xs transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 mb-3">
          <Shield className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Admin Portal</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Elora Mobile Management Console</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Admin Username</label>
            <input
              required
              type="text"
              placeholder="e.g. admin"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Admin Password</label>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 active:scale-[0.98] transition-all cursor-pointer"
          >
            Authenticate Admin
          </button>

          <button
            type="button"
            onClick={() => {
              setUsername('admin');
              setPassword('admin123');
              try {
                loginAdmin('admin', 'admin123');
                navigate('/admin');
              } catch (err: any) {
                setError(err.message);
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 active:scale-[0.98] transition-all flex justify-center items-center gap-1.5 cursor-pointer"
          >
            <span>⚡ 1-Click Admin Login (admin / admin123)</span>
          </button>
        </form>
      </div>
    </div>
  );
}

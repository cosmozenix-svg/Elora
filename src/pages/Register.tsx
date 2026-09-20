import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { CheckCircle2, ArrowLeft, Dices, Sun, Moon, Gift, Sparkles, Check, AlertCircle } from 'lucide-react';
import { CARTOON_AVATARS, getRandomCartoonAvatar } from '../data/avatars';
import { cn } from '../lib/utils';
import EloCoin from '../components/EloCoin';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    termsAccepted: false
  });
  const [selectedAvatar, setSelectedAvatar] = useState(() => CARTOON_AVATARS[0].url);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedReferral, setSubmittedReferral] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { registerUser, users, theme, toggleTheme } = useAppStore();
  const navigate = useNavigate();

  const handleShuffleAvatar = () => {
    setSelectedAvatar(getRandomCartoonAvatar());
  };

  const cleanRef = formData.referralCode.trim().toUpperCase();
  const matchedReferrer = cleanRef
    ? users.find((u) => u.referralCode?.toUpperCase() === cleanRef && u.status === 'active')
    : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (users.some(u => u.username.toLowerCase() === formData.username.toLowerCase())) {
      return setError('Username is already taken');
    }
    if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      return setError('Email is already registered');
    }

    if (cleanRef && !matchedReferrer) {
      return setError('The entered referral code is invalid or the account is not yet active. Please check or leave blank.');
    }

    setIsSubmitting(true);
    try {
      await registerUser({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        balance: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        profilePic: selectedAvatar
      }, cleanRef || undefined);

      setSubmittedReferral(cleanRef);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col justify-center px-4 py-8 w-full max-w-sm mx-auto text-center my-auto">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/80 dark:border-slate-700 p-1 mx-auto mb-4 flex items-center justify-center">
            <img src="/icon.png" alt="Elora Icon" className="w-full h-full object-contain rounded-xl" referrerPolicy="no-referrer" />
          </div>
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Account Created!</h2>
          
          {submittedReferral ? (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-left flex items-start gap-2.5">
              <EloCoin size="sm" className="shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  2,500 Elo Coins Bonus Unlocked!
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
                  Referral code <span className="font-mono font-bold text-amber-800 dark:text-amber-200">{submittedReferral}</span> applied. The referrer also received 5,000 coins bonus!
                </p>
              </div>
            </div>
          ) : null}

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
            Your registration is pending admin approval. You will be able to log in as soon as your account is approved.
          </p>
          <Link
            to="/login"
            className="w-full inline-block py-2.5 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col px-4 py-5 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
            <img src="/icon.png" alt="Elora Icon" className="w-full h-full object-contain rounded-lg" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Create Account</h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Join the Elora mobile platform</p>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form className="space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          {/* Avatar Picker */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Select Avatar</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-blue-500 shadow-xs p-0.5 shrink-0 flex items-center justify-center">
                <img 
                  src={selectedAvatar} 
                  alt="Selected Avatar" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {CARTOON_AVATARS.slice(0, 5).map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setSelectedAvatar(av.url)}
                    className={cn(
                      "w-8 h-8 rounded-lg p-0.5 border shrink-0 bg-white dark:bg-slate-800 transition-transform",
                      selectedAvatar === av.url ? "border-blue-600 scale-105" : "border-slate-200 dark:border-slate-700 opacity-70"
                    )}
                  >
                    <img src={av.url} alt={av.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleShuffleAvatar}
                title="Shuffle Random Avatar"
                className="p-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg shrink-0 transition-colors"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              required
              type="text"
              placeholder="e.g. John Doe"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Username</label>
            <input
              required
              type="text"
              placeholder="e.g. johndoe"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              required
              type="email"
              placeholder="john@example.com"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
            <input
              required
              type="password"
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <input
              required
              type="password"
              minLength={6}
              placeholder="Repeat password"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          {/* Referral code (Optional) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Referral code (Optional)
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-800/40">
                <Gift className="w-3 h-3" /> +2,500 Coins
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                maxLength={8}
                placeholder="e.g. HG67UC"
                className={cn(
                  "w-full border rounded-xl py-2 pl-3 pr-9 text-xs font-mono uppercase tracking-wider outline-none transition-colors",
                  "bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500",
                  cleanRef && matchedReferrer
                    ? "border-emerald-500 ring-1 ring-emerald-500/30"
                    : cleanRef && !matchedReferrer
                    ? "border-rose-400 dark:border-rose-600 ring-1 ring-rose-500/20"
                    : "border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                )}
                value={formData.referralCode}
                onChange={e => setFormData({ ...formData, referralCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {cleanRef && matchedReferrer ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : cleanRef && !matchedReferrer ? (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </div>

            {cleanRef && matchedReferrer ? (
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span>✓ Invited by {matchedReferrer.fullName} (@{matchedReferrer.username})</span>
                <span className="font-bold">• +2,500 Elo coins</span>
              </p>
            ) : cleanRef && !matchedReferrer ? (
              <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                Referral code not found or account not approved yet.
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                Enter code from an approved user's profile to get 2,500 Elo coins welcome bonus!
              </p>
            )}
          </div>

          <div className="flex items-center pt-1">
            <input
              required
              id="terms"
              type="checkbox"
              className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 rounded"
              checked={formData.termsAccepted}
              onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
            />
            <label htmlFor="terms" className="ml-2 block text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              I accept the Terms & Conditions
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">Already registered? </span>
          <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

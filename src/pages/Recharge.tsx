import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Smartphone, Zap, CheckCircle2, ShieldCheck, PhoneCall } from 'lucide-react';

const QUICK_AMOUNTS = [20, 50, 100, 200, 300, 500];

export default function Recharge() {
  const [phone, setPhone] = useState('+8801');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [rechargeDetails, setRechargeDetails] = useState<{ phone: string; amount: number } | null>(null);

  const { currentUser, rechargeMobile } = useAppStore();
  const navigate = useNavigate();

  // Helper to format phone as +8801XXX-XXXXXX
  const handlePhoneChange = (val: string) => {
    // Keep +8801 prefix if deleted
    let clean = val.replace(/[^\d+]/g, '');
    if (!clean.startsWith('+8801')) {
      if (clean.startsWith('01')) {
        clean = '+88' + clean;
      } else if (clean.startsWith('1')) {
        clean = '+880' + clean;
      } else if (!clean.startsWith('+')) {
        clean = '+8801' + clean.replace(/^\+?8801?/, '');
      }
    }
    
    // Format if long enough
    setPhone(clean);
  };

  // Detect operator from phone prefix
  const getOperator = (num: string) => {
    const raw = num.replace(/[^\d]/g, '');
    // BD format 8801XXXXXXXXX -> prefix is 8801X
    if (raw.length >= 5) {
      const code = raw.slice(3, 5); // 13, 14, 15, 16, 17, 18, 19
      if (code === '17' || code === '13') return { name: 'Grameenphone', color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800' };
      if (code === '19' || code === '14') return { name: 'Banglalink', color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800' };
      if (code === '18') return { name: 'Robi', color: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200 dark:border-red-800' };
      if (code === '16') return { name: 'Airtel', color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800' };
      if (code === '15') return { name: 'Teletalk', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' };
    }
    return null;
  };

  const operator = getOperator(phone);

  const handleRecharge = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    // Validate phone number: BD phone numbers have 11 digits (with +880 total 14 chars)
    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 11 || digitsOnly.length > 13) {
      return setError('Please enter a valid 11-digit phone number (+8801XXX-XXXXXX)');
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('Please enter a valid recharge amount.');
    }

    if (parsedAmount > currentUser.balance) {
      return setError(`Insufficient balance. Current balance is ${currentUser.balance.toFixed(2)} BDT.`);
    }

    if (currentUser.password !== password) {
      return setError('Incorrect account password.');
    }

    try {
      rechargeMobile(currentUser.id, phone, parsedAmount);
      setRechargeDetails({ phone, amount: parsedAmount });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to complete recharge.');
    }
  };

  if (success && rechargeDetails) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-center transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 mx-auto flex items-center justify-center mb-3 border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recharge Successful!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mobile top-up processed and deducted from your balance.
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Recipient Phone</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{rechargeDetails.phone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Recharge Amount</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">-{rechargeDetails.amount.toFixed(2)} BDT</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Remaining Balance</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{currentUser?.balance.toFixed(2)} BDT</span>
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => {
                setSuccess(false);
                setAmount('');
                setPassword('');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Recharge Another
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Mobile Recharge</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Instant top-up for any prepaid/postpaid number</p>
        </div>
      </div>

      {/* Balance Widget */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[10px] text-amber-100 uppercase font-semibold tracking-wider">Available Balance</p>
          <p className="text-lg font-mono font-bold">{currentUser?.balance.toFixed(2)} <span className="text-xs">BDT</span></p>
        </div>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
          <Smartphone className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleRecharge} className="space-y-3.5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          {/* Phone Number */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                Phone Number <span className="text-slate-400 font-normal">(+8801XXX-XXXXXX)</span>
              </label>
              {operator && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${operator.color}`}>
                  {operator.name}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                required
                type="text"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                placeholder="+8801712-345678"
              />
              <PhoneCall className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Recharge Amount (BDT)</label>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                Min: 10 BDT
              </span>
            </div>
            <input
              required
              type="number"
              min="10"
              step="1"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 50"
            />

            {/* Quick Amount Chips */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {QUICK_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-1 text-[11px] font-bold font-mono rounded-lg border transition-all ${
                    amount === amt.toString()
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Account Password */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <input
                required
                type="password"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your account password"
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Complete Recharge
          </button>
        </form>
      </div>
    </div>
  );
}

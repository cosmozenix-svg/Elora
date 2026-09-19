import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Landmark, CheckCircle2, ShieldCheck, Wallet, ArrowDownToLine } from 'lucide-react';

interface WithdrawalProvider {
  id: 'bkash' | 'nagad' | 'rocket' | 'upay';
  name: string;
  themeColor: string;
  badgeBg: string;
  borderActive: string;
  textColor: string;
  prefix: string;
}

const PROVIDERS: WithdrawalProvider[] = [
  {
    id: 'bkash',
    name: 'bKash',
    themeColor: 'bg-[#E2136E]',
    badgeBg: 'bg-pink-50 dark:bg-pink-950/40',
    borderActive: 'border-[#E2136E] ring-2 ring-[#E2136E]/20',
    textColor: 'text-[#E2136E]',
    prefix: 'BKASH'
  },
  {
    id: 'nagad',
    name: 'Nagad',
    themeColor: 'bg-[#F7941D]',
    badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
    borderActive: 'border-[#F7941D] ring-2 ring-[#F7941D]/20',
    textColor: 'text-[#F7941D]',
    prefix: 'NAGAD'
  },
  {
    id: 'rocket',
    name: 'Rocket',
    themeColor: 'bg-[#8C3494]',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    borderActive: 'border-[#8C3494] ring-2 ring-[#8C3494]/20',
    textColor: 'text-[#8C3494]',
    prefix: 'ROCKET'
  },
  {
    id: 'upay',
    name: 'Upay',
    themeColor: 'bg-[#007AC1]',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    borderActive: 'border-[#007AC1] ring-2 ring-[#007AC1]/20',
    textColor: 'text-[#007AC1]',
    prefix: 'UPAY'
  },
];

const QUICK_WITHDRAW_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

export default function Withdraw() {
  const [selectedProvider, setSelectedProvider] = useState<WithdrawalProvider>(PROVIDERS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState<{
    provider: string;
    accountNumber: string;
    amount: number;
  } | null>(null);

  const { currentUser, withdrawMoney } = useAppStore();
  const navigate = useNavigate();

  const handleWithdraw = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    // Validate account number (standard Bangladeshi mobile number, e.g. 017XXXXXXXX or +8801XXXXXXXXX)
    const cleanAccount = accountNumber.replace(/[^\d+]/g, '');
    if (cleanAccount.length < 11) {
      return setError(`Please enter a valid 11-digit ${selectedProvider.name} wallet number.`);
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('Please enter a valid withdrawal amount.');
    }

    if (parsedAmount > currentUser.balance) {
      return setError(`Insufficient balance. Available: ${currentUser.balance.toFixed(2)} BDT.`);
    }

    if (currentUser.password !== password) {
      return setError('Incorrect account password.');
    }

    try {
      withdrawMoney(currentUser.id, selectedProvider.name, cleanAccount, parsedAmount);
      setWithdrawalDetails({
        provider: selectedProvider.name,
        accountNumber: cleanAccount,
        amount: parsedAmount
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed.');
    }
  };

  if (success && withdrawalDetails) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-center transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-3 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Withdrawal Successful!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Funds have been successfully withdrawn and deducted from your account.
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Payment Method</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{withdrawalDetails.provider}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{withdrawalDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Withdraw Amount</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">-{withdrawalDetails.amount.toFixed(2)} BDT</span>
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
                setAccountNumber('');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Withdraw Again
            </button>
            <button
              onClick={() => navigate('/history')}
              className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
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
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Withdraw Money</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Transfer funds to your mobile wallet</p>
        </div>
      </div>

      {/* Available Balance Header */}
      <div className="bg-gradient-to-r from-rose-600 to-rose-700 dark:from-rose-700 dark:to-rose-800 text-white p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[10px] text-rose-100 uppercase font-semibold tracking-wider">Withdrawable Balance</p>
          <p className="text-lg font-mono font-bold">{currentUser?.balance.toFixed(2)} <span className="text-xs">BDT</span></p>
        </div>
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
          <Landmark className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleWithdraw} className="space-y-3.5">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}

          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Withdrawal Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PROVIDERS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProvider(p)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedProvider.id === p.id
                      ? `${p.borderActive} bg-white dark:bg-slate-800 shadow-xs font-bold`
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${p.themeColor} mx-auto mb-1`} />
                  <span className={`text-[11px] block font-bold ${selectedProvider.id === p.id ? p.textColor : ''}`}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              {selectedProvider.name} Number
            </label>
            <div className="relative">
              <input
                required
                type="text"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
              />
              <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Amount (BDT)</label>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                Min: 50 BDT
              </span>
            </div>
            <input
              required
              type="number"
              min="50"
              step="1"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />

            {/* Quick Withdraw Pills */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {QUICK_WITHDRAW_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt.toString())}
                  className={`py-1 text-[11px] font-bold font-mono rounded-lg border transition-all ${
                    amount === amt.toString()
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                  }`}
                >
                  ৳{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Account Password Confirmation */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <input
                required
                type="password"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your account password"
              />
              <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl shadow-xs text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ArrowDownToLine className="w-4 h-4" /> Withdraw Money
          </button>
        </form>
      </div>
    </div>
  );
}

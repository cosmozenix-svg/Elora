import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { 
  ArrowLeft, Landmark, CheckCircle2, ShieldCheck, Wallet, 
  ArrowDownToLine, ArrowRightLeft, Info, Lock, Unlock, Sparkles, Zap, Gift 
} from 'lucide-react';
import EloCoin from '../components/EloCoin';
import PremiumEIcon from '../components/PremiumEIcon';

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

const QUICK_COIN_AMOUNTS = [
  { coins: 100000, label: '100k', bdt: '100 BDT' },
  { coins: 200000, label: '200k', bdt: '200 BDT' },
  { coins: 500000, label: '500k', bdt: '500 BDT' },
  { coins: 1000000, label: '1M', bdt: '1,000 BDT' },
  { coins: 2000000, label: '2M', bdt: '2,000 BDT' },
];

export default function Withdraw() {
  const [selectedProvider, setSelectedProvider] = useState<WithdrawalProvider>(PROVIDERS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amountCoins, setAmountCoins] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [withdrawalDetails, setWithdrawalDetails] = useState<{
    provider: string;
    accountNumber: string;
    coins: number;
    bdt: number;
  } | null>(null);

  const { currentUser, withdrawMoney } = useAppStore();
  const navigate = useNavigate();

  const numCoins = parseFloat(amountCoins) || 0;
  const bdtCalculated = numCoins > 0 ? (numCoins / 1000) : 0;

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) return;

    // Validate account number (standard Bangladeshi mobile number)
    const cleanAccount = accountNumber.replace(/[^\d+]/g, '');
    if (cleanAccount.length < 11) {
      return setError(`Please enter a valid 11-digit ${selectedProvider.name} wallet number.`);
    }

    const parsedCoins = parseFloat(amountCoins);
    if (isNaN(parsedCoins) || parsedCoins <= 0) {
      return setError('Please enter a valid amount of Elo coins.');
    }

    // Minimum 100,000 coins (100 BDT)
    if (parsedCoins < 100000) {
      return setError('Minimum withdrawal is 100,000 Elo coins (100 BDT). 1,000 coins = 1 BDT.');
    }

    if (parsedCoins > currentUser.balance) {
      return setError(`Insufficient balance. You have ${currentUser.balance.toLocaleString()} Elo coins.`);
    }

    if (currentUser.password !== password) {
      return setError('Incorrect account password.');
    }

    try {
      await withdrawMoney(currentUser.id, selectedProvider.name, cleanAccount, parsedCoins);
      setWithdrawalDetails({
        provider: selectedProvider.name,
        accountNumber: cleanAccount,
        coins: parsedCoins,
        bdt: parsedCoins / 1000
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
            Coins converted & payout dispatched via {withdrawalDetails.provider}.
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Payment Gateway</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{withdrawalDetails.provider}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Target Number</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{withdrawalDetails.accountNumber}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Coins Deducted</span>
              <div className="flex items-center gap-1 font-mono font-bold text-rose-600 dark:text-rose-400">
                <EloCoin size="xs" />
                <span>-{withdrawalDetails.coins.toLocaleString()} coins</span>
              </div>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-200/80 dark:border-slate-700/60 pt-1.5">
              <span className="text-slate-600 dark:text-slate-300 font-semibold">BDT Payout (1000 coins = 1 BDT)</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                ৳{withdrawalDetails.bdt.toFixed(2)} BDT
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400">Remaining Balance</span>
              <div className="flex items-center gap-1 font-mono font-bold text-slate-800 dark:text-slate-200">
                <EloCoin size="xs" />
                <span>{currentUser?.balance.toLocaleString()} coins</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 mt-5">
            <button
              onClick={() => {
                setSuccess(false);
                setAmountCoins('');
                setPassword('');
                setAccountNumber('');
              }}
              className="flex-1 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              Withdraw Again
            </button>
            <button
              onClick={() => navigate('/index')}
              className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              View Index
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Withdraw section is locked without Elora Member status
  if (!currentUser?.isMember) {
    return (
      <div className="w-full space-y-4">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Withdraw Elo Coins</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Section status</p>
          </div>
        </div>

        {/* Locked Card */}
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-300/80 dark:border-rose-800/80 shadow-xs p-6 text-center transition-colors">
          <div className="relative z-10">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-800 flex items-center justify-center">
                <Lock className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5">
                <PremiumEIcon size="sm" showCrown />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[10px] font-bold uppercase tracking-wider mb-2">
              <Lock className="w-3.5 h-3.5" /> Section Locked
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Withdraw Section is Locked
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              The "Withdraw" section remains locked without an <strong>Elora Member</strong> status. Once you purchase the membership, the withdraw section will be unlocked permanently.
            </p>

            {/* Membership Perks Checklist */}
            <div className="mt-5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 text-left space-y-2.5 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Elora Member Privileges:
              </p>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Unlock className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">*Unlocks Withdraw section.</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">*200% More Earning.</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-200">
                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold">*Get Extra 20K Coins.</span>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="mt-4 p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between text-xs">
              <span className="text-amber-900 dark:text-amber-300 font-medium">Permanent Membership:</span>
              <span className="font-mono font-bold text-amber-800 dark:text-amber-200">150 BDT / 150,000 Coins</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <Link
                to="/membership"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <PremiumEIcon size="xs" showCrown />
                <span>Unlock Withdraw with Elora Member</span>
              </Link>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Top Header */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Withdraw Elo Coins</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Convert coins into BDT via mobile wallet</p>
        </div>
      </div>

      {/* Elora Member Unlocked Verified Banner */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PremiumEIcon size="xs" showCrown />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Elora Member: Withdraw Unlocked</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Permanent payout privileges active</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1">
          <Unlock className="w-3 h-3" /> Unlocked
        </span>
      </div>

      {/* Available Balance Header */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-700 to-rose-800 dark:from-rose-700 dark:to-rose-900 text-white p-4 rounded-2xl shadow-xs">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-rose-100 uppercase font-semibold tracking-wider">Withdrawable Coin Balance</p>
            <div className="flex items-center gap-2 mt-1">
              <EloCoin size="md" />
              <span className="text-2xl font-mono font-black text-white">
                {currentUser?.balance.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-200">coins</span>
            </div>
            <p className="text-[11px] text-rose-100/90 mt-1 font-medium">
              ≈ {((currentUser?.balance || 0) / 1000).toFixed(2)} BDT payout value
            </p>
          </div>
          <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-xs">
            <Landmark className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Rate and Minimum Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 rounded-xl flex items-start gap-2.5">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-amber-900 dark:text-amber-200">
            Conversion Rate: 1,000 Elo coins = 1 BDT
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-[11px] mt-0.5">
            Minimum withdrawal is <span className="font-bold font-mono">100,000 coins</span> (= 100 BDT).
          </p>
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
              {selectedProvider.name} Wallet Number
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

          {/* Amount in Elo Coins */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <EloCoin size="xs" /> Amount (Elo coins)
              </label>
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                Min: 100,000 coins (100 BDT)
              </span>
            </div>
            <div className="relative">
              <input
                required
                type="number"
                min="100000"
                step="1000"
                className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors font-bold"
                value={amountCoins}
                onChange={e => setAmountCoins(e.target.value)}
                placeholder="e.g. 100000"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <EloCoin size="xs" />
              </div>
            </div>

            {/* Live conversion display */}
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                <span>You will receive:</span>
              </div>
              <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                ৳{bdtCalculated.toFixed(2)} BDT
              </div>
            </div>

            {/* Quick Withdraw Pills */}
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {QUICK_COIN_AMOUNTS.map(item => (
                <button
                  key={item.coins}
                  type="button"
                  onClick={() => setAmountCoins(item.coins.toString())}
                  className={`py-1 px-1 text-center rounded-lg border transition-all ${
                    amountCoins === item.coins.toString()
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-rose-300'
                  }`}
                >
                  <span className="block text-[10px] font-bold font-mono">{item.label}</span>
                  <span className="block text-[8.5px] opacity-80">{item.bdt}</span>
                </button>
              ))}
            </div>
            
            {currentUser && currentUser.balance >= 100000 && (
              <button
                type="button"
                onClick={() => setAmountCoins(Math.floor(currentUser.balance).toString())}
                className="w-full mt-1.5 py-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg border border-rose-200 dark:border-rose-900/50 transition-colors"
              >
                Withdraw All ({currentUser.balance.toLocaleString()} coins = {(currentUser.balance / 1000).toFixed(2)} BDT)
              </button>
            )}
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
            <ArrowDownToLine className="w-4 h-4" /> Withdraw {bdtCalculated > 0 ? `৳${bdtCalculated.toFixed(2)} BDT` : 'Elo Coins'}
          </button>
        </form>
      </div>
    </div>
  );
}

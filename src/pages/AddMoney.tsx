import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AddMoney() {
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'upay'>('bkash');
  const [amount, setAmount] = useState('');
  const [trxId, setTrxId] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { currentUser, addBalance } = useAppStore();
  const navigate = useNavigate();

  const methods = [
    { id: 'bkash', name: 'bKash', color: 'bg-pink-600 border-pink-600' },
    { id: 'nagad', name: 'Nagad', color: 'bg-orange-600 border-orange-600' },
    { id: 'rocket', name: 'Rocket', color: 'bg-purple-600 border-purple-600' },
    { id: 'upay', name: 'Upay', color: 'bg-blue-600 border-blue-600' }
  ];

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    try {
      addBalance(currentUser.id, parsedAmount, method, trxId);
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center text-center p-6 my-auto">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">Deposit Successful!</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">The amount has been credited to your balance.</p>
      </div>
    );
  }

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Add Money</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Deposit via mobile banking</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">Select Gateway</label>
            <div className="grid grid-cols-4 gap-1.5">
              {methods.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={cn(
                    "py-2 px-1 rounded-xl text-xs font-bold border transition-all text-center",
                    method === m.id
                      ? `${m.color} text-white shadow-xs border-transparent`
                      : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750"
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (BDT)</label>
            <input
              required
              type="number"
              min="10"
              step="0.01"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Min. 10.00"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Transaction ID (TrxID)</label>
            <input
              required
              type="text"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors uppercase"
              value={trxId}
              onChange={e => setTrxId(e.target.value)}
              placeholder="e.g. 9J8A7D6F"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
          >
            Confirm Deposit
          </button>
        </form>
      </div>
    </div>
  );
}

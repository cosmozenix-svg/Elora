import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, Send } from 'lucide-react';

export default function SendMoney() {
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { currentUser, sendMoney } = useAppStore();
  const navigate = useNavigate();

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!currentUser) return;
    if (currentUser.password !== password) {
      return setError('Incorrect password.');
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return setError('Invalid amount.');
    }

    try {
      sendMoney(currentUser.id, parseInt(receiverId), parsedAmount, reference);
      navigate('/history');
    } catch (err: any) {
      setError(err.message);
    }
  };

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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Send Money</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Instant peer-to-peer transfer</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleSend} className="space-y-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 p-2.5 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Receiver User ID</label>
            <input
              required
              type="number"
              min="10000"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              placeholder="e.g. 10001"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Amount (BDT)</label>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                Bal: {currentUser?.balance.toFixed(2)} BDT
              </span>
            </div>
            <input
              required
              type="number"
              min="1"
              step="0.01"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs font-mono outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Reference / Note</label>
            <input
              required
              type="text"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="What is this transfer for?"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
            <input
              required
              type="password"
              className="w-full border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password to authorize"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 active:scale-[0.98] transition-all shadow-sm mt-3"
          >
            <Send className="h-4 w-4" />
            Send Transfer Now
          </button>
        </form>
      </div>
    </div>
  );
}

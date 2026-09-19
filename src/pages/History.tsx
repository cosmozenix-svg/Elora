import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, PlusCircle, AlertCircle, Clock, Smartphone, Landmark } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { Transaction } from '../types';

export default function History() {
  const { currentUser, transactions } = useAppStore();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const userTransactions = transactions
    .filter(t => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send': return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'add': return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'recharge': return <Smartphone className="h-4 w-4 text-amber-500" />;
      case 'withdraw': return <Landmark className="h-4 w-4 text-rose-500" />;
      case 'earn': return <Clock className="h-4 w-4 text-purple-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default: return <ArrowUpRight className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTransactionLabel = (type: Transaction['type'], relatedUserId?: number) => {
    switch (type) {
      case 'send': return `Transfer to ID: ${relatedUserId}`;
      case 'receive': return `Received from ID: ${relatedUserId}`;
      case 'add': return 'Added Balance';
      case 'recharge': return 'Mobile Recharge';
      case 'withdraw': return 'Withdrawal';
      case 'earn': return 'Earned from Activity';
      case 'warning': return 'Account Warning';
      default: return 'Transaction';
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Transaction History</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">All account activity</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
        {userTransactions.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 dark:text-slate-500 text-xs">
            No transactions found yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {userTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 leading-tight">
                      {getTransactionLabel(tx.type, tx.relatedUserId)}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(tx.date)}</p>
                    {tx.reference && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">"{tx.reference}"</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {tx.type === 'warning' ? (
                    <span className="font-bold text-amber-500 text-xs">WARNING</span>
                  ) : (
                    <span className={`font-bold font-mono text-xs ${
                      ['receive', 'add', 'earn'].includes(tx.type)
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : tx.type === 'withdraw'
                        ? 'text-rose-600 dark:text-rose-400'
                        : tx.type === 'recharge'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {['receive', 'add', 'earn'].includes(tx.type) ? '+' : '-'}{tx.amount.toFixed(2)}
                    </span>
                  )}
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

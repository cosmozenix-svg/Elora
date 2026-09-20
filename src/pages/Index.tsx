import { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { 
  ArrowLeft, ArrowUpRight, ArrowDownLeft, PlusCircle, AlertCircle, 
  Clock, Smartphone, Landmark, CheckCircle2, XCircle, Copy, Check, 
  Megaphone, Search, ChevronRight, Info, ShieldCheck, Sparkles, 
  HelpCircle, ReceiptText, Wallet
} from 'lucide-react';
import { formatDate, cn } from '../lib/utils';
import { Transaction } from '../types';
import EloCoin from '../components/EloCoin';

export default function Index() {
  const { currentUser, transactions } = useAppStore();
  const navigate = useNavigate();
  const { txId } = useParams<{ txId?: string }>();

  // Search & Filter States
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out' | 'notices' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(txId || null);
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  // Filter transactions for this user
  const userTransactions = useMemo(() => {
    return transactions
      .filter(t => t.userId === currentUser.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentUser.id]);

  // Selected Transaction for Details View
  const activeTx = useMemo(() => {
    const targetId = txId || selectedTxId;
    if (!targetId) return null;
    return userTransactions.find(t => t.id === targetId) || null;
  }, [userTransactions, txId, selectedTxId]);

  // Filtered List
  const filteredTransactions = useMemo(() => {
    return userTransactions.filter(tx => {
      // Type filtering
      if (filterType === 'in' && !['receive', 'add', 'earn'].includes(tx.type)) return false;
      if (filterType === 'out' && !['send', 'withdraw', 'recharge'].includes(tx.type)) return false;
      if (filterType === 'notices' && !['notice', 'warning'].includes(tx.type)) return false;
      if (filterType === 'pending' && tx.status !== 'pending') return false;

      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = tx.id.toLowerCase().includes(q);
        const matchesRef = tx.reference?.toLowerCase().includes(q);
        const matchesType = tx.type.toLowerCase().includes(q);
        const matchesRelated = tx.relatedUserId?.toString().includes(q);
        if (!matchesId && !matchesRef && !matchesType && !matchesRelated) return false;
      }

      return true;
    });
  }, [userTransactions, filterType, searchQuery]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTransactionIcon = (type: Transaction['type'], className = "h-4 w-4") => {
    switch (type) {
      case 'send': return <ArrowUpRight className={cn(className, "text-red-500")} />;
      case 'receive': return <ArrowDownLeft className={cn(className, "text-emerald-500")} />;
      case 'add': return <PlusCircle className={cn(className, "text-emerald-500")} />;
      case 'recharge': return <Smartphone className={cn(className, "text-amber-500")} />;
      case 'withdraw': return <Landmark className={cn(className, "text-rose-500")} />;
      case 'earn': return <Clock className={cn(className, "text-purple-500")} />;
      case 'notice':
      case 'warning': return <Megaphone className={cn(className, "text-blue-500")} />;
      default: return <ArrowUpRight className={cn(className, "text-slate-500")} />;
    }
  };

  const getTransactionLabel = (type: Transaction['type'], relatedUserId?: number) => {
    switch (type) {
      case 'send': return `Coin Transfer to ID: ${relatedUserId || 'User'}`;
      case 'receive': return `Coins Received from ID: ${relatedUserId || 'User'}`;
      case 'add': return 'Add Money (Deposit)';
      case 'recharge': return 'Mobile Recharge (Legacy)';
      case 'withdraw': return 'Coin Withdrawal';
      case 'earn': return 'Mining & AFK Earnings';
      case 'notice':
      case 'warning': return 'Official System Notice';
      default: return 'Account Activity';
    }
  };

  // -------------------------------------------------------------
  // DETAILED VIEW (Single Activity Screen)
  // -------------------------------------------------------------
  if (activeTx) {
    const isCredit = ['receive', 'add', 'earn'].includes(activeTx.type);
    const isNotice = activeTx.type === 'notice' || activeTx.type === 'warning';
    const isPending = activeTx.status === 'pending';
    const isCompleted = activeTx.status === 'completed';
    const isFailed = activeTx.status === 'failed';

    return (
      <div className="w-full space-y-4 pb-12 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (txId) {
                navigate('/index');
              } else {
                setSelectedTxId(null);
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-bold shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Index</span>
          </button>

          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            Activity #{activeTx.id.slice(-6).toUpperCase()}
          </span>
        </div>

        {/* Primary Activity Overview Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex flex-col items-center text-center">
            {/* Status Icon */}
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs",
              isNotice ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900" :
              isCredit ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900" :
              activeTx.type === 'withdraw' ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900" :
              "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            )}>
              {getTransactionIcon(activeTx.type, "h-7 w-7")}
            </div>

            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {getTransactionLabel(activeTx.type, activeTx.relatedUserId)}
            </h2>

            {/* Coin Amount / Valuation */}
            {!isNotice ? (
              <div className="mt-2 flex flex-col items-center">
                <div className="flex items-center gap-1.5 font-mono font-black text-2xl">
                  <EloCoin size="md" />
                  <span className={cn(
                    isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    {isCredit ? '+' : '-'}{activeTx.amount.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">coins</span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  ≈ ৳{(activeTx.amount / 1000).toFixed(2)} BDT
                </span>
              </div>
            ) : (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200 dark:border-blue-800">
                  <Megaphone className="w-3.5 h-3.5" /> System Bulletin / Broadcast
                </span>
              </div>
            )}

            {/* Status Badge with Live Context */}
            <div className="mt-4 w-full">
              <div className={cn(
                "py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold",
                isCompleted ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
                isPending ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 animate-pulse" :
                "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
              )}>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isPending && <Clock className="w-4 h-4 text-amber-600" />}
                {isFailed && <XCircle className="w-4 h-4 text-rose-600" />}
                <span className="uppercase tracking-wider text-[11px]">
                  {activeTx.status === 'completed' ? 'Transaction Completed' :
                   activeTx.status === 'pending' ? 'Pending Admin Verification' :
                   'Transaction Failed / Rejected'}
                </span>
              </div>

              {isPending && activeTx.type === 'add' && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 text-center mt-2 leading-relaxed">
                  Your Add Money deposit request has been logged. Admin is verifying your payment. Coins will be credited immediately upon approval.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notice / Message Callout Box (Prominently displays warning or notice text) */}
        {(isNotice || activeTx.reference) && (
          <div className={cn(
            "rounded-2xl border p-4 shadow-xs",
            isNotice 
              ? "bg-gradient-to-br from-blue-50/90 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800/80" 
              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
          )}>
            <div className="flex items-center gap-2 mb-2">
              {isNotice ? (
                <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <ReceiptText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              )}
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                {isNotice ? "Official Message / Notice Content" : "Transaction Memo & Reference"}
              </h3>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                {activeTx.reference || "No additional reference provided."}
              </p>
            </div>
          </div>
        )}

        {/* Detailed Breakdown Specs Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">
              Activity Specifications
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Verified Ledger Entry
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {/* Transaction Tracking ID */}
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Tracking ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{activeTx.id}</span>
                <button
                  onClick={() => copyToClipboard(activeTx.id)}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Date & Time */}
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date & Time</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                {formatDate(activeTx.date)}
              </span>
            </div>

            {/* Type */}
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Activity Type</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px]">
                {activeTx.type === 'add' ? 'Deposit (Add Money)' :
                 activeTx.type === 'withdraw' ? 'Withdrawal' :
                 activeTx.type === 'send' ? 'P2P Transfer (Sent)' :
                 activeTx.type === 'receive' ? 'P2P Transfer (Received)' :
                 activeTx.type === 'earn' ? 'Mining / Rewards' :
                 activeTx.type === 'recharge' ? 'Mobile Recharge' :
                 'System Notice'}
              </span>
            </div>

            {/* Related User / Counterparty */}
            {activeTx.relatedUserId && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  {activeTx.type === 'send' ? 'Recipient Account' : 'Sender Account'}
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  User ID #{activeTx.relatedUserId}
                </span>
              </div>
            )}

            {/* Value Conversion */}
            {!isNotice && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Exchange Standard</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                  1,000 Elo Coins = 1 BDT
                </span>
              </div>
            )}

            {/* Current Processing Status */}
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Ledger Status</span>
              <span className={cn(
                "font-bold uppercase text-[10px] px-2 py-0.5 rounded-full border",
                isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800" :
                isPending ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800" :
                "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800"
              )}>
                {activeTx.status}
              </span>
            </div>
          </div>
        </div>

        {/* Support Callout */}
        <div className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-slate-500 dark:text-slate-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Have questions about this record?</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Our support helpline is available 24/7.</p>
            </div>
          </div>
          <Link
            to="/support"
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shrink-0"
          >
            Support
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PRIMARY INDEX LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="w-full space-y-3.5 pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">Index</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Complete account ledger & activity log</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700">
          {userTransactions.length} Total
        </span>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by ID, memo, user, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-xs"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'in', label: 'Coins In (+)' },
          { id: 'out', label: 'Coins Out (-)' },
          { id: 'notices', label: 'Notices' },
          { id: 'pending', label: 'Pending' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shadow-xs",
              filterType === tab.id
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-colors">
        {filteredTransactions.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-400">
              <ReceiptText className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No activities found</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              {searchQuery ? "Try refining your search query" : "Your coin movements and notices will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isNotice = tx.type === 'notice' || tx.type === 'warning';
              const isCredit = ['receive', 'add', 'earn'].includes(tx.type);

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxId(tx.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer active:scale-[0.99] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={cn(
                      "p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-105",
                      isNotice ? "bg-blue-50 dark:bg-blue-950/60" :
                      isCredit ? "bg-emerald-50 dark:bg-emerald-950/60" :
                      tx.type === 'withdraw' ? "bg-rose-50 dark:bg-rose-950/60" :
                      "bg-slate-100 dark:bg-slate-800"
                    )}>
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {getTransactionLabel(tx.type, tx.relatedUserId)}
                        </h4>
                      </div>

                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {formatDate(tx.date)}
                      </p>

                      {tx.reference && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[200px] font-mono">
                          {tx.reference}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      {isNotice ? (
                        <span className="font-bold text-blue-600 dark:text-blue-400 text-xs uppercase px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                          NOTICE
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1 font-mono font-bold text-xs">
                          <EloCoin size="xs" />
                          <span className={cn(
                            isCredit ? 'text-emerald-600 dark:text-emerald-400' :
                            tx.type === 'withdraw' ? 'text-rose-600 dark:text-rose-400' :
                            tx.type === 'recharge' ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          )}>
                            {isCredit ? '+' : '-'}{tx.amount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="mt-1 flex justify-end">
                        <span className={cn(
                          "text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-full border",
                          tx.status === 'completed'
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                            : tx.status === 'pending'
                            ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        )}>
                          {tx.status}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

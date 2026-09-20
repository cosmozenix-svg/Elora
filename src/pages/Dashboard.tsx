import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { 
  Send, PlusCircle, Landmark, Clock, UserCircle, 
  History as HistoryIcon, HeadphonesIcon, Eye, EyeOff, ArrowRight,
  ArrowUpRight, ArrowDownLeft, Lock, Sparkles, Megaphone
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { CARTOON_AVATARS } from '../data/avatars';
import EloCoin from '../components/EloCoin';
import PremiumEIcon from '../components/PremiumEIcon';

export default function Dashboard() {
  const currentUser = useAppStore(state => state.currentUser);
  const transactions = useAppStore(state => state.transactions);
  const [showBalance, setShowBalance] = useState(false);

  if (!currentUser) return null;

  const userAvatar = currentUser.profilePic && !currentUser.profilePic.includes('unsplash.com')
    ? currentUser.profilePic
    : CARTOON_AVATARS[0].url;

  const userTransactions = transactions
    .filter(t => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const isMember = Boolean(currentUser.isMember);

  const options = [
    { title: 'Send', icon: Send, path: '/send-money', color: 'bg-blue-600 text-white' },
    { title: 'Add', icon: PlusCircle, path: '/add-money', color: 'bg-emerald-600 text-white' },
    { 
      title: 'Membership', 
      isPremiumE: true, 
      path: '/membership', 
      color: 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950',
      badge: isMember ? 'Active' : '150 BDT'
    },
    { 
      title: 'Withdraw', 
      icon: Landmark, 
      path: '/withdraw', 
      color: 'bg-rose-600 text-white',
      locked: !isMember
    },
    { title: 'Earn', icon: Clock, path: '/earn-money', color: 'bg-purple-600 text-white' },
    { title: 'Profile', icon: UserCircle, path: '/profile', color: 'bg-teal-600 text-white' },
    { title: 'Index', icon: HistoryIcon, path: '/index', color: 'bg-slate-700 text-white' },
    { title: 'Support', icon: HeadphonesIcon, path: '/support', color: 'bg-indigo-600 text-white' },
  ];

  return (
    <div className="space-y-4">
      {/* Android Mobile Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 dark:border dark:border-slate-800/80 text-white p-4 shadow-sm transition-all">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2.5">
              <Link to="/profile" className="w-10 h-10 rounded-xl bg-white/20 dark:bg-white/10 p-1 border border-white/25 dark:border-white/15 shrink-0 block hover:scale-105 transition-transform">
                <img 
                  src={userAvatar} 
                  alt="Cartoon Avatar" 
                  className="w-full h-full object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div>
                <p className="text-[10px] font-medium text-blue-200 dark:text-blue-300 uppercase tracking-wider">Total Balance</p>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-white leading-tight">{currentUser.fullName}</h2>
                  {isMember && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
                      <Sparkles className="w-2.5 h-2.5" /> Member
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase",
              currentUser.status === 'active' ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30" : "bg-amber-400/20 text-amber-200 border border-amber-400/30"
            )}>
              {currentUser.status}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="flex items-center gap-2.5 bg-white/10 dark:bg-white/5 hover:bg-white/15 dark:hover:bg-white/10 active:scale-[0.98] transition-all px-4 py-2.5 rounded-xl backdrop-blur-xs w-full justify-between"
            >
              <div className="text-left">
                {showBalance ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <EloCoin size="md" />
                      <span className="text-2xl font-black tracking-tight font-mono text-white">
                        {currentUser.balance.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-amber-300">Elo coins</span>
                    </div>
                    <p className="text-[10px] text-blue-200/90 dark:text-blue-300/80 mt-0.5">
                      ≈ {(currentUser.balance / 1000).toFixed(2)} BDT (1,000 coins = 1 BDT)
                    </p>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-blue-100 dark:text-blue-200 tracking-wide">
                    Tap to reveal balance
                  </span>
                )}
              </div>
              <div className="p-1.5 rounded-lg bg-white/15 dark:bg-white/10 text-blue-100 dark:text-blue-200">
                {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </div>
            </button>
          </div>
        </div>

        {/* Decorative ambient background rings */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-28 h-28 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-lg pointer-events-none" />
      </div>

      {/* Android 4-Column Quick Services Grid */}
      <div>
        <div className="flex justify-between items-center px-1 mb-2.5">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight uppercase">Quick Actions</h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">8 Services</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {options.map((opt) => (
            <Link
              key={opt.title}
              to={opt.path}
              className="relative flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-600/60 active:scale-95 transition-all group"
            >
              {/* Optional Lock Indicator */}
              {opt.locked && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 shadow-xs">
                  <Lock className="w-2.5 h-2.5" />
                </div>
              )}

              {/* Optional Member Active Indicator */}
              {opt.title === 'Membership' && isMember && (
                <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              )}

              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 mb-1.5",
                opt.color
              )}>
                {opt.isPremiumE ? (
                  <PremiumEIcon size="sm" showCrown />
                ) : (
                  opt.icon && <opt.icon className="h-5 w-5" />
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center truncate w-full transition-colors">
                {opt.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions Module */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs transition-colors">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight uppercase">Recent Activity</h3>
          <Link to="/index" className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
            See all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {userTransactions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
            No recent activity yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {userTransactions.map((tx) => {
              const isNotice = tx.type === 'notice' || tx.type === 'warning';
              const isCredit = ['receive', 'add', 'earn'].includes(tx.type);

              return (
                <Link
                  key={tx.id}
                  to={`/index/${tx.id}`}
                  className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-1.5 -mx-1.5 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 transition-transform group-hover:scale-105",
                      isNotice ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" :
                      tx.type === 'send' ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400" :
                      tx.type === 'withdraw' ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400" :
                      tx.type === 'recharge' ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400" :
                      "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                    )}>
                      {isNotice ? <Megaphone className="w-4 h-4" /> :
                       tx.type === 'send' ? <ArrowUpRight className="w-4 h-4" /> :
                       tx.type === 'withdraw' ? <Landmark className="w-4 h-4" /> :
                       <ArrowDownLeft className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 capitalize leading-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {isNotice ? 'Official Notice' :
                         tx.type === 'withdraw' ? 'Withdrawal' :
                         tx.type === 'add' ? 'Add Money' :
                         tx.type === 'earn' ? 'Mining Rewards' :
                         tx.type === 'recharge' ? 'Mobile Recharge' :
                         `${tx.type} ${tx.relatedUserId ? `(ID: ${tx.relatedUserId})` : ''}`}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(tx.date)}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-1.5">
                    {isNotice ? (
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                        NOTICE
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <EloCoin size="xs" />
                        <span className={cn(
                          "text-xs font-mono font-bold",
                          isCredit
                            ? "text-emerald-600 dark:text-emerald-400"
                            : tx.type === 'withdraw'
                            ? "text-rose-600 dark:text-rose-400"
                            : tx.type === 'recharge'
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        )}>
                          {isCredit ? '+' : '-'}{tx.amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

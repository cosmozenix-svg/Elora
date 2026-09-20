import { useState, useEffect, useMemo } from 'react';
import { useAppStore, syncFromCloud } from '../lib/store';
import { 
  Search, Shield, Users, CheckCircle, XCircle, AlertTriangle, Ban, Lock, Unlock, 
  ArrowLeft, Edit, Save, Plus, Minus, Check, Sun, Moon, RefreshCw, Crown, 
  Trash2, Megaphone, DollarSign, ArrowUpRight, ArrowDownLeft, FileText, Send, 
  UserCheck, Sliders, Filter, Clock, Smartphone, Sparkles, CheckCircle2,
  HelpCircle, Eye, EyeOff, AlertCircle, Award
} from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { User, Transaction, TransactionType } from '../types';
import { CARTOON_AVATARS } from '../data/avatars';
import EloCoin from '../components/EloCoin';
import PremiumEIcon from '../components/PremiumEIcon';

type AdminTab = 'accounts' | 'deposits' | 'ledger' | 'broadcast';
type UserFilter = 'all' | 'pending' | 'active' | 'members' | 'blocked_banned' | 'high_balance';

export default function AdminDashboard() {
  const { 
    users, 
    logoutAdmin, 
    setUserStatus, 
    warnUser, 
    deleteUser,
    toggleUserMembership,
    broadcastMessage,
    createAdminTransaction,
    transactions, 
    updateUser, 
    theme, 
    toggleTheme, 
    approveDeposit, 
    rejectDeposit 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('accounts');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [search, setSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all');

  // Selected User State for Deep Management
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalTab, setUserModalTab] = useState<'profile' | 'balance' | 'membership' | 'referrals' | 'history'>('profile');
  const [warningMsg, setWarningMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Edit User Form State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    profilePic: '', 
    referralCode: '',
    referredBy: ''
  });

  // Balance Adjustment State
  const [balanceInput, setBalanceInput] = useState('');
  const [customTxType, setCustomTxType] = useState<TransactionType>('earn');
  const [customTxAmount, setCustomTxAmount] = useState('');
  const [customTxRef, setCustomTxRef] = useState('');
  const [customTxAdjustBal, setCustomTxAdjustBal] = useState(true);

  // Broadcast Announcement State
  const [broadcastText, setBroadcastText] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Notifications & Cloud Sync State
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Auto-sync interval from Firestore
  useEffect(() => {
    syncFromCloud();
    const timer = setInterval(() => {
      syncFromCloud();
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncFromCloud();
    setTimeout(() => {
      setIsSyncing(false);
      showNotice('Cloud data refreshed.');
    }, 600);
  };

  const showNotice = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3500);
  };

  // System Analytics KPIs
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const pendingUsersCount = users.filter(u => u.status === 'pending').length;
    const activeUsersCount = users.filter(u => u.status === 'active').length;
    const blockedBannedCount = users.filter(u => u.status === 'blocked' || u.status === 'banned').length;
    const vipMembersCount = users.filter(u => u.isMember).length;
    const totalCoinsInCirculation = users.reduce((sum, u) => sum + (u.balance || 0), 0);
    const pendingDepositsList = transactions.filter(t => t.type === 'add' && t.status === 'pending');
    const totalPendingDepositCoins = pendingDepositsList.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDepositsProcessed = transactions.filter(t => t.type === 'add' && t.status === 'completed').length;
    const totalWithdrawals = transactions.filter(t => t.type === 'withdraw' || t.type === 'recharge').length;

    return {
      totalUsers,
      pendingUsersCount,
      activeUsersCount,
      blockedBannedCount,
      vipMembersCount,
      totalCoinsInCirculation,
      pendingDepositsList,
      totalPendingDepositCoins,
      totalDepositsProcessed,
      totalWithdrawals
    };
  }, [users, transactions]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.fullName.toLowerCase().includes(search.toLowerCase()) || 
        u.status.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        (u.referralCode && u.referralCode.toLowerCase().includes(search.toLowerCase())) ||
        u.id.toString().includes(search);

      if (!matchSearch) return false;

      if (userFilter === 'pending') return u.status === 'pending';
      if (userFilter === 'active') return u.status === 'active';
      if (userFilter === 'members') return Boolean(u.isMember);
      if (userFilter === 'blocked_banned') return u.status === 'blocked' || u.status === 'banned';
      if (userFilter === 'high_balance') return u.balance >= 100000;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, search, userFilter]);

  // Deposit Actions
  const handleApproveDepositClick = async (txId: string, amount: number) => {
    try {
      await approveDeposit(txId);
      showNotice(`Deposit verified: +${amount.toLocaleString()} Elo coins credited to user.`);
    } catch {
      showNotice('Failed to approve deposit', true);
    }
  };

  const handleRejectDepositClick = async (txId: string) => {
    try {
      await rejectDeposit(txId);
      showNotice('Deposit request rejected.');
    } catch {
      showNotice('Failed to reject deposit', true);
    }
  };

  // User Actions
  const handleStatusChange = async (id: number, status: User['status']) => {
    await setUserStatus(id, status);
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, status });
    }
    showNotice(`User status updated to ${status.toUpperCase()}.`);
  };

  const handleDeleteUserClick = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete account for "${name}" (ID: ${id})? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteUser(id);
      setSelectedUser(null);
      showNotice(`Account #${id} (${name}) deleted successfully.`);
    } catch {
      showNotice('Failed to delete account', true);
    }
  };

  const handleToggleMembership = async (userId: number, currentMembership: boolean) => {
    const newStatus = !currentMembership;
    let creditWelcomeBonus = false;
    if (newStatus) {
      creditWelcomeBonus = window.confirm('Credit +20,000 Elo Coins VIP welcome perk to this user account as well?');
    }
    await toggleUserMembership(userId, newStatus, creditWelcomeBonus);
    if (selectedUser?.id === userId) {
      setSelectedUser({
        ...selectedUser,
        isMember: newStatus,
        balance: creditWelcomeBonus ? selectedUser.balance + 20000 : selectedUser.balance,
        membershipPurchasedAt: newStatus ? new Date().toISOString() : undefined
      });
    }
    showNotice(newStatus ? 'Permanent Elora VIP Member activated.' : 'VIP Membership revoked.');
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsEditingUser(false);
    setUserModalTab('profile');
    setShowPassword(false);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      profilePic: user.profilePic || '',
      referralCode: user.referralCode || '',
      referredBy: user.referredBy || ''
    });
    setBalanceInput('');
    setCustomTxAmount('');
    setCustomTxRef('');
  };

  const handleSaveProfile = async () => {
    if (!selectedUser) return;
    const updates: Partial<User> = {
      fullName: editForm.fullName.trim() || selectedUser.fullName,
      email: editForm.email.trim() || selectedUser.email,
      password: editForm.password.trim() || selectedUser.password,
      profilePic: editForm.profilePic.trim() || selectedUser.profilePic,
      referralCode: editForm.referralCode.trim().toUpperCase() || selectedUser.referralCode,
      referredBy: editForm.referredBy.trim().toUpperCase() || undefined
    };

    await updateUser(selectedUser.id, updates);
    setSelectedUser({ ...selectedUser, ...updates });
    setIsEditingUser(false);
    showNotice('User profile updated successfully.');
  };

  const handleBalanceUpdate = async (action: 'add' | 'deduct' | 'set') => {
    if (!selectedUser) return;
    const amt = parseFloat(balanceInput);
    if (isNaN(amt) || amt < 0) return showNotice('Please enter a valid amount', true);
    
    let newBalance = selectedUser.balance;
    if (action === 'add') newBalance += amt;
    if (action === 'deduct') {
      if (amt > newBalance) return showNotice('Deduction exceeds user balance', true);
      newBalance -= amt;
    }
    if (action === 'set') newBalance = amt;

    await updateUser(selectedUser.id, { balance: newBalance });
    await createAdminTransaction(
      selectedUser.id,
      action === 'add' ? 'add' : 'withdraw',
      action === 'deduct' ? amt : (action === 'add' ? amt : Math.abs(newBalance - selectedUser.balance)),
      `Admin Balance Override (${action.toUpperCase()}: ${amt.toLocaleString()} coins)`,
      false
    );
    
    setSelectedUser({ ...selectedUser, balance: newBalance });
    setBalanceInput('');
    showNotice(`Balance updated to ${newBalance.toLocaleString()} Elo coins.`);
  };

  const handleCreateCustomTx = async () => {
    if (!selectedUser) return;
    const amt = parseFloat(customTxAmount);
    if (isNaN(amt) || amt <= 0) return showNotice('Enter valid coin amount', true);
    if (!customTxRef.trim()) return showNotice('Enter a transaction reference note', true);

    await createAdminTransaction(
      selectedUser.id,
      customTxType,
      amt,
      `[ADMIN ENTRY] ${customTxRef.trim()}`,
      customTxAdjustBal
    );

    const isCredit = ['earn', 'add', 'receive'].includes(customTxType);
    const updatedBal = customTxAdjustBal 
      ? (isCredit ? selectedUser.balance + amt : Math.max(0, selectedUser.balance - amt))
      : selectedUser.balance;

    setSelectedUser({ ...selectedUser, balance: updatedBal });
    setCustomTxAmount('');
    setCustomTxRef('');
    showNotice('Custom transaction record created.');
  };

  const handleWarn = async () => {
    if (selectedUser && warningMsg.trim()) {
      await warnUser(selectedUser.id, warningMsg.trim());
      setWarningMsg('');
      showNotice('Notice notification sent to user.');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastText.trim()) return showNotice('Enter announcement text', true);
    setIsBroadcasting(true);
    try {
      await broadcastMessage(broadcastText.trim());
      setBroadcastText('');
      showNotice(`Broadcast notice sent to all ${stats.activeUsersCount} active users.`);
    } catch {
      showNotice('Failed to send broadcast', true);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Filtered Ledger Transactions
  const filteredLedger = useMemo(() => {
    return transactions.filter(t => {
      const u = users.find(user => user.id === t.userId);
      const matchesSearch = 
        t.id.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
        (t.reference && t.reference.toLowerCase().includes(ledgerSearch.toLowerCase())) ||
        t.userId.toString().includes(ledgerSearch) ||
        (u && u.username.toLowerCase().includes(ledgerSearch.toLowerCase()));

      if (!matchesSearch) return false;
      if (ledgerTypeFilter === 'all') return true;
      if (ledgerTypeFilter === 'pending') return t.status === 'pending';
      if (ledgerTypeFilter === 'notice') return t.type === 'notice' || t.type === 'warning';
      return t.type === ledgerTypeFilter;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, users, ledgerSearch, ledgerTypeFilter]);

  // Users referred by the selected user
  const usersReferredBySelected = useMemo(() => {
    if (!selectedUser || !selectedUser.referralCode) return [];
    return users.filter(u => u.referredBy === selectedUser.referralCode);
  }, [users, selectedUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative transition-colors font-sans pb-10">
      {/* Toast Notification */}
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-4 py-2.5 rounded-2xl shadow-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2",
          notification.isError
            ? "bg-rose-50 dark:bg-rose-950/90 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
            : "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
        )}>
          {notification.isError ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl overflow-hidden bg-blue-600 shadow-xs p-1 shrink-0 flex items-center justify-center">
            <img src="/icon.png" alt="Elora Logo" className="w-full h-full object-contain rounded-md" referrerPolicy="no-referrer" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight">Elora Admin Center</h1>
              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded-full uppercase">
                Enterprise
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Total System & User Activity Command</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            type="button"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95"
            title="Refresh database live sync"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-blue-400", isSyncing && "animate-spin text-amber-400")} />
            <span className="hidden sm:inline text-[11px]">Sync Cloud</span>
          </button>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <button 
            onClick={logoutAdmin} 
            className="text-xs bg-rose-600/90 hover:bg-rose-600 text-white py-1.5 px-3 rounded-xl font-bold transition-all shadow-xs active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        
        {/* KPI Analytics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Users */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Total Accounts</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {stats.totalUsers}
            </p>
            <div className="flex items-center gap-2 text-[10px] mt-1 font-medium">
              <span className="text-emerald-600 dark:text-emerald-400">● {stats.activeUsersCount} active</span>
              {stats.pendingUsersCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-bold">● {stats.pendingUsersCount} pending</span>
              )}
            </div>
          </div>

          {/* VIP Members */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>VIP Members</span>
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {stats.vipMembersCount}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Permanent 200% Earners
            </p>
          </div>

          {/* Pending Deposits */}
          <div className={cn(
            "border p-3 rounded-2xl shadow-xs transition-colors",
            stats.pendingDepositsList.length > 0
              ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          )}>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Pending Deposits</span>
              <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono flex items-center gap-1.5">
              <span>{stats.pendingDepositsList.length}</span>
              {stats.pendingDepositsList.length > 0 && (
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  Action Needed
                </span>
              )}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
              +{(stats.totalPendingDepositCoins).toLocaleString()} coins pending
            </p>
          </div>

          {/* Total Platform Coin Supply */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold">
              <span>Coin Supply</span>
              <DollarSign className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono truncate">
              {stats.totalCoinsInCirculation.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              ≈ ৳{(stats.totalCoinsInCirculation / 1000).toFixed(2)} BDT valuation
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-200/70 dark:bg-slate-800/80 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('accounts')}
            className={cn(
              "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              activeTab === 'accounts'
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Accounts ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deposits')}
            className={cn(
              "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative",
              activeTab === 'deposits'
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Deposit Sessions</span>
            {stats.pendingDepositsList.length > 0 && (
              <span className="bg-emerald-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse">
                {stats.pendingDepositsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={cn(
              "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              activeTab === 'ledger'
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={cn(
              "flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5",
              activeTab === 'broadcast'
                ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            )}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Broadcast</span>
          </button>
        </div>

        {/* TAB 1: ACCOUNTS & USER DIRECTORY */}
        {activeTab === 'accounts' && (
          <div className="space-y-3.5">
            {/* Search & Sub-Filter Bar */}
            <div className="space-y-2">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by full name, ID, @username, referral code..." 
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'All Accounts', count: users.length },
                  { id: 'pending', label: 'Pending Approval', count: stats.pendingUsersCount, highlight: stats.pendingUsersCount > 0 },
                  { id: 'members', label: 'VIP Members', count: stats.vipMembersCount },
                  { id: 'active', label: 'Active', count: stats.activeUsersCount },
                  { id: 'high_balance', label: 'High Balance (100k+)', count: users.filter(u => u.balance >= 100000).length },
                  { id: 'blocked_banned', label: 'Blocked / Banned', count: stats.blockedBannedCount }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setUserFilter(f.id as UserFilter)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 text-[11px]",
                      userFilter === f.id
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800",
                      f.highlight && userFilter !== f.id && "border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50/50"
                    )}
                  >
                    <span>{f.label}</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[9px]",
                      userFilter === f.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    )}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Pending Approvals Callout Banner if any */}
            {stats.pendingUsersCount > 0 && userFilter !== 'pending' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-bold text-amber-900 dark:text-amber-200">
                    {stats.pendingUsersCount} new user registrations awaiting admin approval
                  </span>
                </div>
                <button
                  onClick={() => setUserFilter('pending')}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                >
                  Review Approvals
                </button>
              </div>
            )}

            {/* Accounts List Grid / Cards */}
            <div className="space-y-2">
              {filteredUsers.map(user => {
                const isUserPending = user.status === 'pending';
                return (
                  <div 
                    key={user.id} 
                    className={cn(
                      "bg-white dark:bg-slate-900 border p-3 rounded-2xl shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                      isUserPending 
                        ? "border-amber-400/80 dark:border-amber-600/80 bg-amber-50/20 dark:bg-amber-950/20" 
                        : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {/* User Identity & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 p-0.5 flex items-center justify-center">
                        <img 
                          src={user.profilePic && !user.profilePic.includes('unsplash.com') 
                            ? user.profilePic 
                            : CARTOON_AVATARS[0].url
                          } 
                          alt="Avatar" 
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {user.fullName}
                          </span>
                          {user.isMember && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                              <Crown className="w-2.5 h-2.5" /> VIP
                            </span>
                          )}
                          <span className={cn(
                            "px-1.5 py-0.2 rounded-full text-[9px] font-bold capitalize border",
                            user.status === 'active' ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
                            user.status === 'pending' ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800" :
                            user.status === 'blocked' ? "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" :
                            "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                          )}>
                            {user.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                          ID: <strong className="text-slate-700 dark:text-slate-300">{user.id}</strong> • @{user.username} • {user.email}
                        </p>

                        <div className="flex items-center gap-3 text-[10px] mt-1 text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 font-mono font-bold text-amber-600 dark:text-amber-400">
                            <EloCoin size="xs" />
                            <span>{user.balance.toLocaleString()}</span>
                            <span className="text-slate-400 font-normal">
                              (৳{(user.balance / 1000).toFixed(2)})
                            </span>
                          </div>
                          {user.referralCode && (
                            <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                              Ref: {user.referralCode} ({user.referralCount || 0} joined)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      {isUserPending ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(user.id, 'active')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, 'banned')}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600 font-bold text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => openUserDetail(user)}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold text-[11px] rounded-xl border border-blue-200/60 dark:border-blue-800/40 transition-colors flex items-center gap-1"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>

                          <button
                            onClick={() => handleToggleMembership(user.id, Boolean(user.isMember))}
                            className={cn(
                              "p-1.5 rounded-xl border transition-colors",
                              user.isMember
                                ? "bg-amber-50 dark:bg-amber-950/50 text-amber-600 border-amber-200 dark:border-amber-800"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-amber-500"
                            )}
                            title={user.isMember ? "Revoke VIP Membership" : "Grant VIP Membership"}
                          >
                            <Crown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUserClick(user.id, user.fullName)}
                            className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-1">
                  <AlertCircle className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="font-bold text-slate-600 dark:text-slate-300">No accounts match your search/filter</p>
                  <p className="text-[10px]">Try clearing search term or switching filter tabs</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DEPOSIT SESSIONS REVIEW */}
        {activeTab === 'deposits' && (
          <div className="space-y-3.5">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  User Add Money Verification Queue
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Verify bKash / Nagad / Rocket TrxIDs and approve coin credits
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                Rate: 1 BDT = 1,000 Coins
              </span>
            </div>

            {stats.pendingDepositsList.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Deposit Queue is Clear</h4>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                  All user deposit sessions have been verified and processed. New deposits from bKash, Nagad, and Rocket will appear here in real-time.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.pendingDepositsList.map(tx => {
                  const txUser = users.find(u => u.id === tx.userId);
                  const bdtEquivalent = (tx.amount / 1000).toFixed(2);
                  return (
                    <div 
                      key={tx.id} 
                      className="bg-white dark:bg-slate-900 border-2 border-emerald-500/50 dark:border-emerald-500/40 p-4 rounded-2xl shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                              {txUser?.fullName || `User #${tx.userId}`}
                            </h4>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono font-semibold">
                              @{txUser?.username || tx.userId} (ID: {tx.userId})
                            </span>
                          </div>

                          <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 mt-1 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 select-all">
                            {tx.reference || 'Deposit Request'}
                          </p>

                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Submitted: {formatDate(tx.date)}
                          </p>
                        </div>

                        <div className="text-left sm:text-right p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl">
                          <div className="flex items-center sm:justify-end gap-1 font-mono font-black text-amber-600 dark:text-amber-400 text-sm">
                            <EloCoin size="xs" />
                            <span>+{tx.amount.toLocaleString()} coins</span>
                          </div>
                          <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                            Sent Amount: ৳{bdtEquivalent} BDT
                          </p>
                        </div>
                      </div>

                      {/* Verification Controls */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleApproveDepositClick(tx.id, tx.amount)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Credit (+{tx.amount.toLocaleString()} Coins)</span>
                        </button>

                        <button
                          onClick={() => handleRejectDepositClick(tx.id)}
                          className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 py-2 px-4 rounded-xl text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AUDIT LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter transactions by Trx ID, username, reference..."
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  value={ledgerSearch}
                  onChange={e => setLedgerSearch(e.target.value)}
                />
              </div>

              <select
                value={ledgerTypeFilter}
                onChange={e => setLedgerTypeFilter(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="all">All Types ({transactions.length})</option>
                <option value="pending">Pending Only</option>
                <option value="add">Deposits (Add)</option>
                <option value="withdraw">Withdrawals</option>
                <option value="recharge">Mobile Recharges</option>
                <option value="earn">Earnings & Bonuses</option>
                <option value="send">P2P Transfers</option>
                <option value="notice">System Notices</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
                {filteredLedger.map(tx => {
                  const txUser = users.find(u => u.id === tx.userId);
                  const isCredit = ['earn', 'add', 'receive'].includes(tx.type);
                  return (
                    <div key={tx.id} className="p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {txUser?.fullName || `User #${tx.userId}`}
                          </span>
                          <span className="text-[10px] text-blue-500 font-mono">
                            @{txUser?.username || tx.userId}
                          </span>
                          <span className={cn(
                            "px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase",
                            tx.type === 'add' ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" :
                            tx.type === 'withdraw' ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" :
                            tx.type === 'earn' ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300" :
                            tx.type === 'recharge' ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" :
                            (tx.type === 'notice' || tx.type === 'warning') ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" :
                            "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          )}>
                            {tx.type === 'warning' ? 'notice' : tx.type}
                          </span>
                          <span className={cn(
                            "px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase border",
                            tx.status === 'completed' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                            tx.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-200" :
                            "bg-rose-50 text-rose-600 border-rose-200"
                          )}>
                            {tx.status}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                          {tx.reference || 'No reference note'}
                        </p>
                        <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatDate(tx.date)} • ID: <span className="font-mono">{tx.id}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        {tx.type === 'notice' || tx.type === 'warning' ? (
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">NOTICE</span>
                        ) : (
                          <div className={cn(
                            "font-mono font-bold flex items-center gap-1",
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                          )}>
                            <EloCoin size="xs" />
                            <span>{isCredit ? '+' : '-'}{tx.amount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredLedger.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No transactions found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM BROADCAST & ANNOUNCEMENTS */}
        {activeTab === 'broadcast' && (
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Global System Announcement Broadcaster
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Broadcast instant notifications to all {stats.activeUsersCount} active users' transaction log
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder="Type your official announcement here (e.g. Server maintenance scheduled, Weekend bonus event +50% coins!)..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
                value={broadcastText}
                onChange={e => setBroadcastText(e.target.value)}
              />

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400">
                  Target: All {stats.activeUsersCount} active approved accounts
                </span>

                <button
                  onClick={handleSendBroadcast}
                  disabled={isBroadcasting || !broadcastText.trim()}
                  className={cn(
                    "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 active:scale-95",
                    (isBroadcasting || !broadcastText.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast to All Users'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: COMPREHENSIVE USER MANAGEMENT */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0 flex items-center justify-center">
                  <img 
                    src={selectedUser.profilePic && !selectedUser.profilePic.includes('unsplash.com') 
                      ? selectedUser.profilePic 
                      : CARTOON_AVATARS[0].url
                    } 
                    alt="User Avatar" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {selectedUser.fullName}
                    </h3>
                    {selectedUser.isMember && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Crown className="w-2.5 h-2.5" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                    ID: {selectedUser.id} • @{selectedUser.username}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1 gap-1 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold">
              {[
                { id: 'profile', label: 'Profile Info' },
                { id: 'balance', label: 'Balance & Coins' },
                { id: 'membership', label: 'VIP Membership' },
                { id: 'referrals', label: `Referrals (${selectedUser.referralCount || 0})` },
                { id: 'history', label: 'History & Logs' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setUserModalTab(tab.id as any)}
                  className={cn(
                    "flex-1 py-1.5 px-1 text-center rounded-lg transition-all",
                    userModalTab === tab.id
                      ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              
              {/* SUBTAB 1: PROFILE INFO */}
              {userModalTab === 'profile' && (
                <div className="space-y-3">
                  {!isEditingUser ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Status</span>
                        <span className={cn(
                          "font-bold uppercase px-2 py-0.5 rounded-md text-[10px]",
                          selectedUser.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                          selectedUser.status === 'pending' ? "bg-amber-50 text-amber-600" :
                          "bg-rose-50 text-rose-600"
                        )}>
                          {selectedUser.status}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Email Address</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200 select-all">
                          {selectedUser.email}
                        </span>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 items-center">
                        <span className="text-slate-500">Password</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                            {showPassword ? selectedUser.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500">Registered On</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(selectedUser.createdAt)}
                        </span>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => setIsEditingUser(true)}
                          className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit Profile & Credentials
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={e => setEditForm({...editForm, fullName: e.target.value})}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Email</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={e => setEditForm({...editForm, email: e.target.value})}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">Password</label>
                        <input
                          type="text"
                          value={editForm.password}
                          onChange={e => setEditForm({...editForm, password: e.target.value})}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
                        />
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSaveProfile}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </button>
                        <button
                          onClick={() => setIsEditingUser(false)}
                          className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Account Status Control Grid */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Account Access & Restriction</p>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleStatusChange(selectedUser.id, 'active')}
                        className={cn(
                          "py-1.5 rounded-xl font-bold text-[11px] transition-colors",
                          selectedUser.status === 'active'
                            ? "bg-emerald-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        Active
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === 'blocked' ? 'active' : 'blocked')}
                        className={cn(
                          "py-1.5 rounded-xl font-bold text-[11px] transition-colors",
                          selectedUser.status === 'blocked'
                            ? "bg-orange-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {selectedUser.status === 'blocked' ? 'Unblock' : 'Block'}
                      </button>

                      <button
                        onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === 'banned' ? 'active' : 'banned')}
                        className={cn(
                          "py-1.5 rounded-xl font-bold text-[11px] transition-colors",
                          selectedUser.status === 'banned'
                            ? "bg-rose-600 text-white"
                            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {selectedUser.status === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </div>

                  {/* Send Direct Notice */}
                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2">
                    <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-200">
                      Send Notice to this User
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Notice memo or directive..."
                        value={warningMsg}
                        onChange={e => setWarningMsg(e.target.value)}
                        className="flex-1 p-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-xl text-xs outline-none"
                      />
                      <button
                        onClick={handleWarn}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        Send Notice
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: BALANCE & COIN MANAGEMENT */}
              {userModalTab === 'balance' && (
                <div className="space-y-4">
                  {/* Current Balance Card */}
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Account Balance</span>
                      <div className="flex items-center gap-1.5 font-mono font-black text-amber-600 dark:text-amber-400 text-lg mt-0.5">
                        <EloCoin size="sm" />
                        <span>{selectedUser.balance.toLocaleString()} Elo coins</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ≈ ৳{(selectedUser.balance / 1000).toFixed(2)} BDT
                      </span>
                    </div>
                  </div>

                  {/* Quick Preset Balance Modifiers */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Quick Adjust Coins</span>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Amount of Elo coins..."
                        value={balanceInput}
                        onChange={e => setBalanceInput(e.target.value)}
                        className="flex-1 p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold outline-none"
                      />
                      <button
                        onClick={() => handleBalanceUpdate('add')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                      <button
                        onClick={() => handleBalanceUpdate('deduct')}
                        className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Minus className="w-3.5 h-3.5" /> Deduct
                      </button>
                      <button
                        onClick={() => handleBalanceUpdate('set')}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Set
                      </button>
                    </div>

                    {/* Quick amount presets */}
                    <div className="flex gap-1.5">
                      {[1000, 5000, 10000, 50000, 100000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setBalanceInput(val.toString())}
                          className="flex-1 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[10px] font-mono font-bold rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          +{val.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Create Admin Custom Transaction Entry */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Inject Custom Transaction Record
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Type</label>
                        <select
                          value={customTxType}
                          onChange={e => setCustomTxType(e.target.value as any)}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                        >
                          <option value="earn">Reward / Bonus (Earn)</option>
                          <option value="add">Deposit Credit</option>
                          <option value="withdraw">Withdrawal Adjustment</option>
                          <option value="notice">Official Notice (Zero sum)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Coin Amount</label>
                        <input
                          type="number"
                          value={customTxAmount}
                          onChange={e => setCustomTxAmount(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">Reference / Memo</label>
                      <input
                        type="text"
                        value={customTxRef}
                        onChange={e => setCustomTxRef(e.target.value)}
                        placeholder="e.g. Contest 1st Place Winner Reward"
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                        <input
                          type="checkbox"
                          checked={customTxAdjustBal}
                          onChange={e => setCustomTxAdjustBal(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-blue-600"
                        />
                        <span>Also adjust user balance</span>
                      </label>

                      <button
                        onClick={handleCreateCustomTx}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                      >
                        Submit Record
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: VIP MEMBERSHIP */}
              {userModalTab === 'membership' && (
                <div className="space-y-3">
                  <div className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    selectedUser.isMember
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700"
                      : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600">
                        <Crown className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {selectedUser.isMember ? 'VIP Member Status (Active)' : 'Standard User (Non-Member)'}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {selectedUser.isMember 
                            ? `Permanent 200 coins/min AFK rate & withdrawal unlocked (Since ${formatDate(selectedUser.membershipPurchasedAt || selectedUser.createdAt)})`
                            : 'Standard 100 coins/min AFK rate & withdrawal locked'
                          }
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleMembership(selectedUser.id, Boolean(selectedUser.isMember))}
                      className={cn(
                        "px-3.5 py-2 rounded-xl text-xs font-bold transition-all",
                        selectedUser.isMember
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                      )}
                    >
                      {selectedUser.isMember ? 'Revoke VIP' : 'Grant VIP Status'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: REFERRAL NETWORK */}
              {userModalTab === 'referrals' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Referral Code</span>
                      <p className="font-mono font-bold text-blue-600 text-sm mt-0.5">
                        {selectedUser.referralCode || 'None'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">Referred By</span>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5">
                        {selectedUser.referredBy || 'Organic (Direct)'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Users Invited by @{selectedUser.username} ({usersReferredBySelected.length})
                    </h5>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {usersReferredBySelected.map(refUser => (
                        <div key={refUser.id} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100">{refUser.fullName}</span>
                            <span className="text-[10px] text-blue-500 font-mono ml-1.5">@{refUser.username}</span>
                          </div>
                          <div className="text-right font-mono font-bold text-amber-600 text-[11px]">
                            {refUser.balance.toLocaleString()} coins
                          </div>
                        </div>
                      ))}

                      {usersReferredBySelected.length === 0 && (
                        <p className="text-xs text-slate-400 p-4 text-center border border-dashed rounded-xl">
                          No users have registered with this referral code yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: USER HISTORY & LOGS */}
              {userModalTab === 'history' && (
                <div className="space-y-2">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {transactions
                      .filter(t => t.userId === selectedUser.id)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(t => {
                        const isCredit = ['earn', 'add', 'receive'].includes(t.type);
                        return (
                          <div key={t.id} className="p-2.5 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                                {t.type} • <span className="font-mono text-[10px] text-slate-400">{t.reference || t.id}</span>
                              </p>
                              <p className="text-[9px] text-slate-400">{formatDate(t.date)}</p>
                            </div>
                            <div className={cn(
                              "font-mono font-bold",
                              isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                            )}>
                              {isCredit ? '+' : '-'}{t.amount.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

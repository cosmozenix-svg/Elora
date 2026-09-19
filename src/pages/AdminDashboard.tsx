import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Search, Shield, Users, CheckCircle, XCircle, AlertTriangle, Ban, Lock, Unlock, ArrowLeft, Edit, Save, Plus, Minus, Check, Sun, Moon } from 'lucide-react';
import { cn, formatDate } from '../lib/utils';
import { User } from '../types';
import { CARTOON_AVATARS } from '../data/avatars';

export default function AdminDashboard() {
  const { users, logoutAdmin, setUserStatus, warnUser, transactions, updateUser, addTransaction, theme, toggleTheme } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [warningMsg, setWarningMsg] = useState('');

  // Edit State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', password: '', profilePic: '' });

  // Balance State
  const [balanceInput, setBalanceInput] = useState('');
  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  const showNotice = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 3500);
  };

  const filteredUsers = users
    .filter(u => 
      u.fullName.toLowerCase().includes(search.toLowerCase()) || 
      u.status.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toString().includes(search)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const pendingUsers = filteredUsers.filter(u => u.status === 'pending');
  const otherUsers = filteredUsers.filter(u => u.status !== 'pending');

  const handleStatusChange = (id: number, status: User['status']) => {
    setUserStatus(id, status);
    if (selectedUser?.id === id) {
      setSelectedUser({ ...selectedUser, status });
    }
  };

  const handleWarn = () => {
    if (selectedUser && warningMsg.trim()) {
      warnUser(selectedUser.id, warningMsg);
      setWarningMsg('');
      showNotice('Warning sent to user.');
    }
  };

  const openUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsEditingUser(false);
    setEditForm({
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      profilePic: user.profilePic
    });
    setBalanceInput('');
  };

  const handleSaveProfile = () => {
    if (!selectedUser) return;
    updateUser(selectedUser.id, editForm);
    setSelectedUser({ ...selectedUser, ...editForm });
    setIsEditingUser(false);
    showNotice('User information updated.');
  };

  const handleBalanceUpdate = (action: 'add' | 'deduct' | 'set') => {
    if (!selectedUser) return;
    const amt = parseFloat(balanceInput);
    if (isNaN(amt) || amt < 0) return showNotice('Invalid amount', true);
    
    let newBalance = selectedUser.balance;
    if (action === 'add') newBalance += amt;
    if (action === 'deduct') {
      if (amt > newBalance) return showNotice('Insufficient funds', true);
      newBalance -= amt;
    }
    if (action === 'set') newBalance = amt;

    updateUser(selectedUser.id, { balance: newBalance });
    
    addTransaction({
      userId: selectedUser.id,
      type: action === 'add' ? 'add' : 'withdraw',
      amount: action === 'deduct' ? amt : (action === 'add' ? amt : Math.abs(newBalance - selectedUser.balance)),
      status: 'completed',
      date: new Date().toISOString(),
      reference: `Admin Balance Adjustment (${action.toUpperCase()})`
    });
    
    setSelectedUser({ ...selectedUser, balance: newBalance });
    setBalanceInput('');
    showNotice('Balance updated successfully.');
  };

  if (selectedUser) {
    const userTxs = transactions.filter(t => t.userId === selectedUser.id);
    return (
      <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-3 pb-8 relative min-h-screen transition-colors">
        {notification && (
          <div className={cn(
            "fixed top-4 right-4 z-50 px-3 py-2 rounded-xl shadow-lg border text-xs font-semibold transition-all duration-200",
            notification.isError
              ? "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
              : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
          )}>
            {notification.message}
          </div>
        )}
        <div className="w-full">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <ArrowLeft className="h-4 w-4" /> Back to Accounts
            </button>
            <button
              onClick={toggleTheme}
              type="button"
              className="p-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs transition-all"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 flex flex-col gap-5 items-start">
              {/* Left Column: Basic Info */}
              <div className="w-full md:w-1/3">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 mb-3 mx-auto md:mx-0 shadow-xs relative flex items-center justify-center p-1">
                  <img 
                    src={selectedUser.profilePic && !selectedUser.profilePic.includes('unsplash.com') 
                      ? selectedUser.profilePic 
                      : CARTOON_AVATARS[0].url
                    } 
                    alt="Profile" 
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {!isEditingUser ? (
                  <>
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedUser.fullName}</h2>
                      <button onClick={() => setIsEditingUser(true)} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-blue-600 dark:text-blue-400 font-mono mb-4">@{selectedUser.username}</p>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">ID</span>
                        <span className="font-mono text-slate-900 dark:text-slate-100 font-medium">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Status</span>
                        <span className={`font-bold capitalize ${
                          selectedUser.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' :
                          selectedUser.status === 'pending' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                        }`}>{selectedUser.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Email</span>
                        <span className="text-slate-900 dark:text-slate-100 font-medium truncate max-w-[150px]">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Password</span>
                        <span className="text-slate-900 dark:text-slate-100 font-mono font-medium">{selectedUser.password}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Balance</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedUser.balance.toFixed(2)} BDT</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400">Joined</span>
                        <span className="text-slate-900 dark:text-slate-100 font-medium">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100">Edit Information</h3>
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditingUser(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                          <XCircle className="w-5 h-5" />
                        </button>
                        <button onClick={handleSaveProfile} className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg">
                          <Save className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                      <input type="text" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md py-1.5 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={editForm.fullName} onChange={e => setEditForm({...editForm, fullName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Email</label>
                      <input type="email" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md py-1.5 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Password</label>
                      <input type="text" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md py-1.5 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Profile Pic URL</label>
                      <input type="text" className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-md py-1.5 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                        value={editForm.profilePic} onChange={e => setEditForm({...editForm, profilePic: e.target.value})} />
                    </div>
                    <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                      ID and Username cannot be modified.
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Actions & History */}
              <div className="w-full md:w-2/3 space-y-8">
                {/* Actions */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Account Status & Warnings</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-6">
                    {selectedUser.status === 'pending' && (
                      <button onClick={() => handleStatusChange(selectedUser.id, 'active')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                    )}
                    {(selectedUser.status === 'active' || selectedUser.status === 'banned') && (
                      <button onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === 'blocked' ? 'active' : 'blocked')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        {selectedUser.status === 'blocked' ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                        {selectedUser.status === 'blocked' ? 'Unblock' : 'Block / Blacklist'}
                      </button>
                    )}
                    {(selectedUser.status === 'active' || selectedUser.status === 'blocked') && (
                      <button onClick={() => handleStatusChange(selectedUser.id, selectedUser.status === 'banned' ? 'active' : 'banned')} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        {selectedUser.status === 'banned' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        {selectedUser.status === 'banned' ? 'Unban' : 'Ban Account'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Warning message..." 
                      className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg py-2 px-3 outline-none focus:border-amber-500"
                      value={warningMsg}
                      onChange={e => setWarningMsg(e.target.value)}
                    />
                    <button onClick={handleWarn} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                      <AlertTriangle className="h-4 w-4" /> Send Warning
                    </button>
                  </div>
                </div>

                {/* Balance Management */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Balance Management</h3>
                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Amount (BDT)" 
                      className="w-full sm:w-auto flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg py-2 px-3 outline-none focus:border-blue-500"
                      value={balanceInput}
                      onChange={e => setBalanceInput(e.target.value)}
                    />
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => handleBalanceUpdate('add')} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 py-2 px-3 rounded-lg font-semibold transition-colors">
                        <Plus className="w-4 h-4" /> Add
                      </button>
                      <button onClick={() => handleBalanceUpdate('deduct')} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 py-2 px-3 rounded-lg font-semibold transition-colors">
                        <Minus className="w-4 h-4" /> Deduct
                      </button>
                      <button onClick={() => handleBalanceUpdate('set')} className="flex-1 sm:flex-none flex justify-center items-center gap-1 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 py-2 px-3 rounded-lg font-semibold transition-colors">
                        <Check className="w-4 h-4" /> Set
                      </button>
                    </div>
                  </div>
                </div>

                {/* History */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Transaction History</h3>
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
                    {userTxs.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 dark:text-slate-400">No transactions found.</div>
                    ) : (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {userTxs.map(tx => (
                          <div key={tx.id} className="p-3 flex justify-between items-center text-sm">
                            <div>
                              <p className="text-slate-800 dark:text-slate-200 font-medium capitalize">
                                {tx.type === 'recharge' ? 'Mobile Recharge' : tx.type === 'withdraw' ? 'Withdrawal' : tx.type} {tx.relatedUserId ? `(ID: ${tx.relatedUserId})` : ''}
                              </p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs">
                                {formatDate(tx.date)} {tx.reference && `• ${tx.reference}`}
                              </p>
                            </div>
                            <span className={
                              tx.type === 'warning'
                                ? 'text-amber-600 dark:text-amber-400 font-bold text-xs'
                                : ['receive', 'add', 'earn'].includes(tx.type)
                                ? 'text-emerald-600 dark:text-emerald-400 font-mono font-bold'
                                : 'text-rose-600 dark:text-rose-400 font-mono font-bold'
                            }>
                              {tx.type === 'warning' ? 'WARNING' : `${['receive', 'add', 'earn'].includes(tx.type) ? '+' : '-'}${tx.amount > 0 ? tx.amount.toFixed(2) : '0.00'}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative transition-colors">
      {notification && (
        <div className={cn(
          "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all duration-200",
          notification.isError
            ? "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
            : "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
        )}>
          {notification.message}
        </div>
      )}
      <header className="bg-blue-600 dark:bg-slate-900 text-white border-b border-blue-700 dark:border-slate-800 sticky top-0 z-10 shadow-xs px-3 py-2.5 flex justify-between items-center">
        <div className="flex items-center gap-2 text-white">
          <div className="w-6 h-6 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-xs p-0.5 shrink-0 flex items-center justify-center">
            <img src="/icon.png" alt="Elora Icon" className="w-full h-full object-contain rounded-md" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-sm font-bold">Admin Console</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg bg-blue-700 dark:bg-slate-800 hover:bg-blue-800 dark:hover:bg-slate-700 text-white transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button onClick={logoutAdmin} className="text-xs bg-blue-700 dark:bg-slate-800 hover:bg-blue-800 dark:hover:bg-slate-700 text-white py-1.5 px-3 rounded-lg font-semibold transition-colors">
            Logout
          </button>
        </div>
      </header>

      <main className="w-full px-3 py-4 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or username..." 
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {pendingUsers.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Pending Approvals ({pendingUsers.length})
            </h2>
            <div className="space-y-2">
              {pendingUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.fullName}</h3>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">@{user.username} • ID: {user.id}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase">
                      Pending
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleStatusChange(user.id, 'active')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Accept
                    </button>
                    <button onClick={() => handleStatusChange(user.id, 'banned')} className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-1.5 rounded-lg text-xs font-bold transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wide">All Accounts ({otherUsers.length})</h2>
          
          {/* Mobile Card List for 9:16 layout */}
          <div className="space-y-2">
            {otherUsers.map(user => (
              <div key={user.id} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.fullName}</span>
                    <span className={cn(
                      "px-1.5 py-0.2 rounded-full text-[9px] font-bold capitalize border",
                      user.status === 'active' ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" :
                      user.status === 'blocked' ? "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800" :
                      "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                    )}>
                      {user.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    ID: <span className="font-mono">{user.id}</span> • @{user.username}
                  </p>
                  <p className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {user.balance.toFixed(2)} BDT
                  </p>
                </div>
                <button 
                  onClick={() => openUserDetail(user)}
                  className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold text-[11px] rounded-lg transition-colors shrink-0"
                >
                  Details
                </button>
              </div>
            ))}
            {otherUsers.length === 0 && (
              <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No accounts found matching your criteria.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

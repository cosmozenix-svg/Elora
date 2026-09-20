import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Transaction, TransactionType, AppState } from '../types';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { generateReferralCode } from './referral';

const INITIAL_USERS: User[] = [
  {
    id: 10001,
    fullName: 'Demo User',
    username: 'demouser',
    email: 'demo@elora.app',
    password: 'password123',
    balance: 250000,
    status: 'active',
    createdAt: new Date().toISOString(),
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    referralCode: 'HG67UC',
    referralCount: 2
  },
  {
    id: 10002,
    fullName: 'Rahim Ahmed',
    username: 'rahim24',
    email: 'rahim@elora.app',
    password: 'password123',
    balance: 125000,
    status: 'active',
    createdAt: new Date().toISOString(),
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    referralCode: 'RA84XQ',
    referralCount: 1
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'init-tx-1',
    userId: 10001,
    type: 'add',
    amount: 250000,
    status: 'completed',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    reference: 'Welcome Bonus (250,000 Elo coins)'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: INITIAL_USERS,
      transactions: INITIAL_TRANSACTIONS,
      currentUser: null,
      adminIsLoggedIn: false,
      theme: 'light',

      toggleTheme: () => {
        set((state) => {
          const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
          if (typeof document !== 'undefined') {
            if (nextTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { theme: nextTheme };
        });
      },

      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
        set({ theme });
      },

      registerUser: async (userWithoutId, referralCodeInput) => {
        let maxId = 10000;
        const allExistingCodes: string[] = [];
        let firestoreUsers: User[] = [];

        try {
          // Query Firestore directly to guarantee cross-device globally unique ID and fetch users
          const snap = await getDocs(collection(db, 'users'));
          snap.forEach((d) => {
            const data = d.data() as User;
            if (data && typeof data.id === 'number') {
              maxId = Math.max(maxId, data.id);
            }
            if (data && data.referralCode) {
              allExistingCodes.push(data.referralCode);
            }
            if (data) {
              firestoreUsers.push(data);
            }
          });
        } catch (e) {
          console.warn('Could not query max user ID from cloud, using local store fallback:', e);
        }

        const state = get();
        const knownUsers = firestoreUsers.length > 0 ? firestoreUsers : state.users;
        const localMax = state.users.reduce((max, u) => Math.max(max, u.id), 9999);
        const nextId = Math.max(maxId, localMax) + 1;

        // Generate unique 6-character random referral code for the new account
        const generatedCode = generateReferralCode(allExistingCodes);

        let initialBalance = 0;
        let referredByCode: string | undefined = undefined;
        let referrerToReward: User | null = null;

        const cleanRefCode = referralCodeInput?.trim().toUpperCase();
        if (cleanRefCode) {
          // Find the active approved referrer whose code was entered
          const matchedReferrer = knownUsers.find(
            (u) => u.referralCode?.toUpperCase() === cleanRefCode && u.status === 'active'
          );

          if (!matchedReferrer) {
            throw new Error('Invalid referral code. Please check the code or leave it blank.');
          }

          referredByCode = matchedReferrer.referralCode;
          referrerToReward = matchedReferrer;
          // The new user gets 2500 coins bonus in their account
          initialBalance = 2500;
        }

        const newUser: User = { 
          ...userWithoutId, 
          id: nextId,
          balance: initialBalance,
          referralCode: generatedCode,
          referredBy: referredByCode,
          referralCount: 0
        };

        // Save new user to Firestore first so all devices and admin see it immediately
        const path = `users/${newUser.id}`;
        try {
          await setDoc(doc(db, 'users', String(newUser.id)), newUser);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }

        // Process referral bonuses if code was used
        if (referrerToReward && cleanRefCode) {
          // The main user (from whose the code was got) gets 5000 coins bonus
          const newReferrerBalance = (referrerToReward.balance || 0) + 5000;
          const newReferrerCount = (referrerToReward.referralCount || 0) + 1;

          try {
            await updateDoc(doc(db, 'users', String(referrerToReward.id)), {
              balance: newReferrerBalance,
              referralCount: newReferrerCount
            });
          } catch (err) {
            console.warn('Failed to update referrer in Firestore:', err);
          }

          // Transaction record for the referrer (+5000 coins)
          const referrerTx: Transaction = {
            id: `tx-ref-rew-${Date.now()}-${referrerToReward.id}`,
            userId: referrerToReward.id,
            type: 'earn',
            amount: 5000,
            status: 'completed',
            date: new Date().toISOString(),
            relatedUserId: newUser.id,
            reference: `Referral Bonus: @${newUser.username} registered with your code (${cleanRefCode})`
          };

          // Transaction record for the new user (+2500 coins)
          const newUserTx: Transaction = {
            id: `tx-ref-wel-${Date.now()}-${newUser.id}`,
            userId: newUser.id,
            type: 'earn',
            amount: 2500,
            status: 'completed',
            date: new Date().toISOString(),
            relatedUserId: referrerToReward.id,
            reference: `Welcome Referral Bonus: Registered using code ${cleanRefCode}`
          };

          try {
            await setDoc(doc(db, 'transactions', referrerTx.id), referrerTx);
            await setDoc(doc(db, 'transactions', newUserTx.id), newUserTx);
          } catch (err) {
            console.warn('Failed to save referral transactions in Firestore:', err);
          }

          // Optimistically update referrer and transactions in local store
          set((s) => ({
            users: s.users.map((u) => 
              u.id === referrerToReward!.id 
                ? { ...u, balance: newReferrerBalance, referralCount: newReferrerCount }
                : u
            ),
            transactions: [referrerTx, newUserTx, ...s.transactions]
          }));
        }

        // Optimistic local update for new user
        set((s) => ({ users: [...s.users.filter(u => u.id !== newUser.id), newUser] }));
      },

      loginUser: (email, password) => {
        const state = get();
        const user = state.users.find(
          (u) => (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) && u.password === password
        );
        if (!user) throw new Error('Invalid email/username or password.');
        if (user.status === 'pending') throw new Error('Account is pending admin approval.');
        if (user.status === 'banned' || user.status === 'blocked') throw new Error(`Account has been ${user.status}.`);
        
        set({ currentUser: user });
      },

      logoutUser: () => {
        set({ currentUser: null });
      },

      updateUser: async (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser,
        }));

        const path = `users/${userId}`;
        try {
          await updateDoc(doc(db, 'users', String(userId)), updates);
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
      },

      addTransaction: async (transaction) => {
        const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        const newTx: Transaction = { ...transaction, id: uuid };

        set((state) => ({ transactions: [newTx, ...state.transactions] }));

        const path = `transactions/${newTx.id}`;
        try {
          await setDoc(doc(db, 'transactions', newTx.id), newTx);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
      },

      sendMoney: async (senderId, receiverId, amount, reference) => {
        const state = get();
        const sender = state.users.find(u => u.id === senderId);
        const receiver = state.users.find(u => u.id === receiverId);

        if (!sender) throw new Error("Sender not found.");
        if (!receiver) throw new Error("Receiver not found.");
        if (sender.balance < amount) throw new Error("Insufficient balance.");

        // Deduct from sender
        await state.updateUser(sender.id, { balance: sender.balance - amount });
        // Add to receiver
        await state.updateUser(receiver.id, { balance: receiver.balance + amount });

        const now = new Date().toISOString();
        
        // Add transaction record for sender
        await state.addTransaction({
          userId: sender.id,
          type: 'send',
          amount: amount,
          status: 'completed',
          date: now,
          relatedUserId: receiver.id,
          reference
        });

        // Add transaction record for receiver
        await state.addTransaction({
          userId: receiver.id,
          type: 'receive',
          amount: amount,
          status: 'completed',
          date: now,
          relatedUserId: sender.id,
          reference
        });
      },

      addBalance: async (userId, amount, method, trxId) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");

        // Deposit session submitted as pending for admin verification (not directly added to balance)
        await state.addTransaction({
          userId: user.id,
          type: 'add',
          amount: amount,
          status: 'pending',
          date: new Date().toISOString(),
          reference: `${method.toUpperCase()} Deposit - TrxID: ${trxId}`
        });
      },

      earnMoney: async (userId, amount, reference = 'AFK time reward') => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return;

        const updatedBalance = user.balance + amount;
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, balance: u.balance + amount } : u)),
          currentUser: s.currentUser?.id === userId ? { ...s.currentUser, balance: s.currentUser.balance + amount } : s.currentUser,
        }));

        const path = `users/${userId}`;
        try {
          await updateDoc(doc(db, 'users', String(userId)), { balance: updatedBalance });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }
        
        await state.addTransaction({
          userId: user.id,
          type: 'earn',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: reference
        });
      },

      withdrawMoney: async (userId, method, accountNo, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (!user.isMember) {
          throw new Error("Withdraw is locked. You must be an Elora Member to withdraw.");
        }
        if (user.balance < amount) throw new Error("Insufficient coin balance.");

        await state.updateUser(user.id, { balance: user.balance - amount });

        const bdtEquivalent = amount / 1000;
        await state.addTransaction({
          userId: user.id,
          type: 'withdraw',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: `${method.toUpperCase()} - ${accountNo} (${bdtEquivalent.toFixed(2)} BDT payout)`
        });
      },

      purchaseMembership: async (userId) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.isMember) throw new Error("You already hold permanent Elora Member status.");
        
        const MEMBERSHIP_COST = 150000; // 150 BDT = 150,000 coins
        const BONUS_COINS = 20000; // Extra 20k coins perk

        if (user.balance < MEMBERSHIP_COST) {
          throw new Error(`Insufficient balance. You need ${MEMBERSHIP_COST.toLocaleString()} Elo Coins (150 BDT) to purchase Elora Member.`);
        }

        const newBalance = user.balance - MEMBERSHIP_COST + BONUS_COINS;
        const now = new Date().toISOString();

        await state.updateUser(user.id, {
          balance: newBalance,
          isMember: true,
          membershipPurchasedAt: now
        });

        // 1. Transaction record for membership activation
        await state.addTransaction({
          userId: user.id,
          type: 'withdraw',
          amount: MEMBERSHIP_COST,
          status: 'completed',
          date: now,
          reference: 'Elora Member Lifetime Upgrade (150 BDT / 150,000 coins)'
        });

        // 2. Transaction record for the +20K extra coins bonus
        await state.addTransaction({
          userId: user.id,
          type: 'earn',
          amount: BONUS_COINS,
          status: 'completed',
          date: now,
          reference: 'Elora Member Perk: +20,000 Extra Coins Welcome Bonus'
        });
      },

      // Admin actions
      loginAdmin: (username, password) => {
        if (username === 'admin' && password === 'admin123') {
          set({ adminIsLoggedIn: true });
        } else {
          throw new Error("Invalid admin credentials");
        }
      },

      logoutAdmin: () => set({ adminIsLoggedIn: false }),
      
      setUserStatus: async (userId, status) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        const updates: Partial<User> = { status };
        if (status === 'active' && (!user || !user.referralCode)) {
          const existingCodes = state.users.map(u => u.referralCode).filter(Boolean) as string[];
          updates.referralCode = generateReferralCode(existingCodes);
        }
        await state.updateUser(userId, updates);
      },

      warnUser: async (userId, message) => {
        const state = get();
        await state.addTransaction({
          userId: userId,
          type: 'notice',
          amount: 0,
          status: 'completed',
          date: new Date().toISOString(),
          reference: `[NOTICE] ${message}`
        });
      },

      deleteUser: async (id: number) => {
        const path = `users/${id}`;
        try {
          await deleteDoc(doc(db, 'users', String(id)));
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, path);
        }

        set((s) => ({
          users: s.users.filter(u => u.id !== id),
          currentUser: s.currentUser?.id === id ? null : s.currentUser
        }));
      },

      toggleUserMembership: async (id: number, isMember: boolean, creditBonus = false) => {
        const state = get();
        const user = state.users.find(u => u.id === id);
        if (!user) return;

        let newBalance = user.balance;
        if (isMember && creditBonus) {
          newBalance += 20000;
        }

        await state.updateUser(id, {
          isMember,
          balance: newBalance,
          membershipPurchasedAt: isMember ? (user.membershipPurchasedAt || new Date().toISOString()) : undefined
        });

        if (isMember && creditBonus) {
          await state.addTransaction({
            userId: id,
            type: 'earn',
            amount: 20000,
            status: 'completed',
            date: new Date().toISOString(),
            reference: 'Admin Grant: Elora VIP Member Welcome Perk (+20,000 Elo Coins)'
          });
        }
      },

      broadcastMessage: async (message: string) => {
        const state = get();
        const activeUsers = state.users.filter(u => u.status === 'active');
        const now = new Date().toISOString();

        for (const user of activeUsers) {
          await state.addTransaction({
            userId: user.id,
            type: 'notice',
            amount: 0,
            status: 'completed',
            date: now,
            reference: `[SYSTEM NOTICE] ${message}`
          });
        }
      },

      createAdminTransaction: async (userId: number, type: TransactionType, amount: number, reference: string, adjustBalance = true) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return;

        if (adjustBalance && amount > 0) {
          const isCredit = ['earn', 'add', 'receive'].includes(type);
          const newBal = isCredit ? user.balance + amount : Math.max(0, user.balance - amount);
          await state.updateUser(userId, { balance: newBal });
        }

        await state.addTransaction({
          userId,
          type,
          amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference
        });
      },

      approveDeposit: async (transactionId: string) => {
        const state = get();
        const tx = state.transactions.find(t => t.id === transactionId);
        if (!tx || tx.status !== 'pending' || tx.type !== 'add') return;

        const user = state.users.find(u => u.id === tx.userId);
        if (user) {
          await state.updateUser(user.id, { balance: user.balance + tx.amount });
        }

        const updatedTx: Transaction = { ...tx, status: 'completed' };
        const path = `transactions/${tx.id}`;
        try {
          await updateDoc(doc(db, 'transactions', tx.id), { status: 'completed' });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }

        set((s) => ({
          transactions: s.transactions.map(t => t.id === tx.id ? updatedTx : t)
        }));
      },

      rejectDeposit: async (transactionId: string) => {
        const state = get();
        const tx = state.transactions.find(t => t.id === transactionId);
        if (!tx || tx.status !== 'pending') return;

        const updatedTx: Transaction = { ...tx, status: 'failed' };
        const path = `transactions/${tx.id}`;
        try {
          await updateDoc(doc(db, 'transactions', tx.id), { status: 'failed' });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, path);
        }

        set((s) => ({
          transactions: s.transactions.map(t => t.id === tx.id ? updatedTx : t)
        }));
      }
    }),
    {
      name: 'elora-storage',
    }
  )
);

// Real-time Cloud Synchronization with Firestore
let isFirebaseSynced = false;

export async function syncFromCloud() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const cloudUsers: User[] = [];
      const usedCodes: string[] = [];

      snap.forEach((d) => {
        const u = d.data() as User;
        cloudUsers.push(u);
        if (u.referralCode) {
          usedCodes.push(u.referralCode);
        }
      });

      // Ensure every approved/active user has a random 6-character referral code
      for (const u of cloudUsers) {
        if (u.status === 'active' && !u.referralCode) {
          const code = generateReferralCode(usedCodes);
          usedCodes.push(code);
          u.referralCode = code;
          // Asynchronously persist to Firestore
          updateDoc(doc(db, 'users', String(u.id)), { referralCode: code }).catch(() => {});
        }
      }

      cloudUsers.sort((a, b) => a.id - b.id);
      useAppStore.setState((s) => ({
        users: cloudUsers,
        currentUser: s.currentUser ? cloudUsers.find(u => u.id === s.currentUser?.id) || s.currentUser : null
      }));
    }
    const txSnap = await getDocs(collection(db, 'transactions'));
    if (!txSnap.empty) {
      const cloudTxs: Transaction[] = [];
      txSnap.forEach((d) => {
        cloudTxs.push(d.data() as Transaction);
      });
      cloudTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      useAppStore.setState({ transactions: cloudTxs });
    }
  } catch (err) {
    console.warn('Manual cloud sync warning:', err);
  }
}

export function initFirebaseSync() {
  if (isFirebaseSynced) return;
  isFirebaseSynced = true;

  // Immediate pull
  syncFromCloud();

  // 1. Real-time Users synchronization across all devices
  const usersPath = 'users';
  onSnapshot(collection(db, usersPath), async (snapshot) => {
    if (snapshot.empty) {
      // Seed default accounts in Firestore if empty
      for (const u of INITIAL_USERS) {
        try {
          await setDoc(doc(db, 'users', String(u.id)), u);
        } catch {
          // Ignore seeding collisions
        }
      }
      return;
    }

    const cloudUsers: User[] = [];
    snapshot.forEach((d) => {
      cloudUsers.push(d.data() as User);
    });

    cloudUsers.sort((a, b) => a.id - b.id);

    useAppStore.setState((state) => {
      let updatedCurrentUser = state.currentUser;
      if (state.currentUser) {
        const freshUser = cloudUsers.find(u => u.id === state.currentUser?.id);
        if (freshUser) {
          updatedCurrentUser = freshUser;
        }
      }
      return {
        users: cloudUsers,
        currentUser: updatedCurrentUser
      };
    });
  }, (error) => {
    console.warn('Firestore users snapshot warning:', error);
  });

  // 2. Real-time Transactions synchronization
  const txPath = 'transactions';
  onSnapshot(collection(db, txPath), async (snapshot) => {
    if (snapshot.empty) {
      for (const t of INITIAL_TRANSACTIONS) {
        try {
          await setDoc(doc(db, 'transactions', t.id), t);
        } catch {
          // Ignore
        }
      }
      return;
    }

    const cloudTxs: Transaction[] = [];
    snapshot.forEach((d) => {
      cloudTxs.push(d.data() as Transaction);
    });

    cloudTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    useAppStore.setState({
      transactions: cloudTxs
    });
  }, (error) => {
    console.warn('Firestore transactions snapshot warning:', error);
  });
}

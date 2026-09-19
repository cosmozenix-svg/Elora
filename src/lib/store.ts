import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Transaction, AppState } from '../types';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

const INITIAL_USERS: User[] = [
  {
    id: 10001,
    fullName: 'Demo User',
    username: 'demouser',
    email: 'demo@elora.app',
    password: 'password123',
    balance: 2500,
    status: 'active',
    createdAt: new Date().toISOString(),
    profilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 10002,
    fullName: 'Rahim Ahmed',
    username: 'rahim24',
    email: 'rahim@elora.app',
    password: 'password123',
    balance: 850,
    status: 'active',
    createdAt: new Date().toISOString(),
    profilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'init-tx-1',
    userId: 10001,
    type: 'add',
    amount: 2500,
    status: 'completed',
    date: new Date(Date.now() - 3600000 * 24).toISOString(),
    reference: 'Welcome Bonus'
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

      registerUser: async (userWithoutId) => {
        const state = get();
        const maxId = state.users.reduce((max, u) => Math.max(max, u.id), 9999);
        const newUser: User = { ...userWithoutId, id: maxId + 1 };
        
        // Optimistic local update
        set((s) => ({ users: [...s.users, newUser] }));

        // Cloud persistence: save to Firestore so every device and admin sees it in real time
        const path = `users/${newUser.id}`;
        try {
          await setDoc(doc(db, 'users', String(newUser.id)), newUser);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, path);
        }
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

        await state.updateUser(user.id, { balance: user.balance + amount });
        
        await state.addTransaction({
          userId: user.id,
          type: 'add',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: `${method.toUpperCase()} - ${trxId}`
        });
      },

      earnMoney: async (userId, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return;

        await state.updateUser(user.id, { balance: user.balance + amount });
        
        await state.addTransaction({
          userId: user.id,
          type: 'earn',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: 'Time reward'
        });
      },

      rechargeMobile: async (userId, phone, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.balance < amount) throw new Error("Insufficient balance.");

        await state.updateUser(user.id, { balance: user.balance - amount });

        await state.addTransaction({
          userId: user.id,
          type: 'recharge',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: phone
        });
      },

      withdrawMoney: async (userId, method, accountNo, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.balance < amount) throw new Error("Insufficient balance.");

        await state.updateUser(user.id, { balance: user.balance - amount });

        await state.addTransaction({
          userId: user.id,
          type: 'withdraw',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: `${method.toUpperCase()} - ${accountNo}`
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
        await state.updateUser(userId, { status });
      },

      warnUser: async (userId, message) => {
        const state = get();
        await state.addTransaction({
          userId: userId,
          type: 'warning',
          amount: 0,
          status: 'completed',
          date: new Date().toISOString(),
          reference: message
        });
      }
    }),
    {
      name: 'elora-storage',
    }
  )
);

// Real-time Cloud Synchronization with Firestore
let isFirebaseSynced = false;

export function initFirebaseSync() {
  if (isFirebaseSynced) return;
  isFirebaseSynced = true;

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
    handleFirestoreError(error, OperationType.GET, usersPath);
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
    handleFirestoreError(error, OperationType.GET, txPath);
  });
}

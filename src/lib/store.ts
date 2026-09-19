import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Transaction, AppState } from '../types';

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: [],
      transactions: [],
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

      registerUser: (userWithoutId) => {
        set((state) => {
          const maxId = state.users.reduce((max, u) => Math.max(max, u.id), 9999);
          const newUser: User = { ...userWithoutId, id: maxId + 1 };
          return { users: [...state.users, newUser] };
        });
      },

      loginUser: (email, password) => {
        const state = get();
        const user = state.users.find(
          (u) => u.email === email && u.password === password
        );
        if (!user) throw new Error('Invalid email or password.');
        if (user.status === 'pending') throw new Error('Account pending approval. Check your email shortly.');
        if (user.status === 'banned' || user.status === 'blocked') throw new Error(`Account has been ${user.status}.`);
        
        set({ currentUser: user });
      },

      logoutUser: () => {
        set({ currentUser: null });
      },

      updateUser: (userId, updates) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, ...updates } : u)),
          currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser,
        }));
      },

      addTransaction: (transaction) => {
        set((state) => {
          const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
          const newTx = { ...transaction, id: uuid };
          return { transactions: [...state.transactions, newTx] };
        });
      },

      sendMoney: (senderId, receiverId, amount, reference) => {
        const state = get();
        const sender = state.users.find(u => u.id === senderId);
        const receiver = state.users.find(u => u.id === receiverId);

        if (!sender) throw new Error("Sender not found.");
        if (!receiver) throw new Error("Receiver not found.");
        if (sender.balance < amount) throw new Error("Insufficient balance.");

        // Deduct from sender
        state.updateUser(sender.id, { balance: sender.balance - amount });
        // Add to receiver
        state.updateUser(receiver.id, { balance: receiver.balance + amount });

        const now = new Date().toISOString();
        
        // Add transaction record for sender
        state.addTransaction({
          userId: sender.id,
          type: 'send',
          amount: amount,
          status: 'completed',
          date: now,
          relatedUserId: receiver.id,
          reference
        });

        // Add transaction record for receiver
        state.addTransaction({
          userId: receiver.id,
          type: 'receive',
          amount: amount,
          status: 'completed',
          date: now,
          relatedUserId: sender.id,
          reference
        });
      },

      addBalance: (userId, amount, method, trxId) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");

        state.updateUser(user.id, { balance: user.balance + amount });
        
        state.addTransaction({
          userId: user.id,
          type: 'add',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: `${method.toUpperCase()} - ${trxId}`
        });
      },

      earnMoney: (userId, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) return; // Don't throw, just silently fail if not found

        state.updateUser(user.id, { balance: user.balance + amount });
        
        state.addTransaction({
          userId: user.id,
          type: 'earn',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: 'Time reward'
        });
      },

      rechargeMobile: (userId, phone, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.balance < amount) throw new Error("Insufficient balance.");

        state.updateUser(user.id, { balance: user.balance - amount });

        state.addTransaction({
          userId: user.id,
          type: 'recharge',
          amount: amount,
          status: 'completed',
          date: new Date().toISOString(),
          reference: phone
        });
      },

      withdrawMoney: (userId, method, accountNo, amount) => {
        const state = get();
        const user = state.users.find(u => u.id === userId);
        if (!user) throw new Error("User not found.");
        if (user.balance < amount) throw new Error("Insufficient balance.");

        state.updateUser(user.id, { balance: user.balance - amount });

        state.addTransaction({
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
      
      setUserStatus: (userId, status) => {
        const state = get();
        state.updateUser(userId, { status });
      },

      warnUser: (userId, message) => {
        const state = get();
        state.addTransaction({
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

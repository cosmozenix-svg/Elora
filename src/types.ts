export interface User {
  id: number; // Starts from 10000
  fullName: string;
  username: string; // unique
  email: string;
  password: string; // Stored in plain text as requested for admin view prototype
  balance: number;
  status: 'pending' | 'active' | 'blocked' | 'banned';
  createdAt: string;
  profilePic: string; // URL or index
  referralCode?: string; // 6-char uppercase alphanumeric e.g. HG67UC
  referredBy?: string; // Referral code of the user who invited them
  referralCount?: number; // Total users who joined using this user's code
  isMember?: boolean; // Permanent Elora Member status
  membershipPurchasedAt?: string;
}

export type TransactionType = 'send' | 'receive' | 'add' | 'recharge' | 'withdraw' | 'earn' | 'warning' | 'notice';

export interface Transaction {
  id: string;
  userId: number; // The user this transaction record belongs to
  type: TransactionType;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  relatedUserId?: number; // E.g. the receiver if type is 'send'
  reference?: string;
}

export interface AppState {
  users: User[];
  transactions: Transaction[];
  currentUser: User | null;
  adminIsLoggedIn: boolean;
  theme: 'light' | 'dark';

  // Theme Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  // User Actions
  registerUser: (user: Omit<User, 'id'>, referralCode?: string) => Promise<void>;
  loginUser: (email: string, pass: string) => void;
  logoutUser: () => void;
  updateUser: (id: number, updates: Partial<User>) => Promise<void> | void;
  sendMoney: (senderId: number, receiverId: number, amount: number, reference: string) => Promise<void> | void;
  addBalance: (userId: number, amount: number, method: string, trxId: string) => Promise<void> | void;
  earnMoney: (userId: number, amount: number, reference?: string) => Promise<void> | void;
  withdrawMoney: (userId: number, method: string, accountNo: string, amount: number) => Promise<void> | void;
  purchaseMembership: (userId: number) => Promise<void>;
  
  // Internal/Shared Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void> | void;

  // Admin Actions
  loginAdmin: (user: string, pass: string) => void;
  logoutAdmin: () => void;
  setUserStatus: (id: number, status: User['status']) => Promise<void> | void;
  warnUser: (id: number, message: string) => Promise<void> | void;
  deleteUser: (id: number) => Promise<void>;
  toggleUserMembership: (id: number, isMember: boolean, creditBonus?: boolean) => Promise<void>;
  broadcastMessage: (message: string) => Promise<void>;
  createAdminTransaction: (userId: number, type: TransactionType, amount: number, reference: string, adjustBalance?: boolean) => Promise<void>;
  approveDeposit: (transactionId: string) => Promise<void>;
  rejectDeposit: (transactionId: string) => Promise<void>;
}

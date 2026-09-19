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
}

export type TransactionType = 'send' | 'receive' | 'add' | 'recharge' | 'withdraw' | 'earn' | 'warning';

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
  registerUser: (user: Omit<User, 'id'>) => Promise<void> | void;
  loginUser: (email: string, pass: string) => void;
  logoutUser: () => void;
  updateUser: (id: number, updates: Partial<User>) => Promise<void> | void;
  sendMoney: (senderId: number, receiverId: number, amount: number, reference: string) => Promise<void> | void;
  addBalance: (userId: number, amount: number, method: string, trxId: string) => Promise<void> | void;
  earnMoney: (userId: number, amount: number) => Promise<void> | void;
  rechargeMobile: (userId: number, phone: string, amount: number) => Promise<void> | void;
  withdrawMoney: (userId: number, method: string, accountNo: string, amount: number) => Promise<void> | void;
  
  // Internal/Shared Actions
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void> | void;

  // Admin Actions
  loginAdmin: (user: string, pass: string) => void;
  logoutAdmin: () => void;
  setUserStatus: (id: number, status: User['status']) => Promise<void> | void;
  warnUser: (id: number, message: string) => Promise<void> | void;
}

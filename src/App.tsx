import { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './lib/store';
import AndroidFrame from './components/AndroidFrame';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SendMoney from './pages/SendMoney';
import AddMoney from './pages/AddMoney';
import EarnMoney from './pages/EarnMoney';
import Profile from './pages/Profile';
import History from './pages/History';
import Recharge from './pages/Recharge';
import Withdraw from './pages/Withdraw';
import Support from './pages/Support';
import AdminAuth from './pages/AdminAuth';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';
import UnderDevelopment from './pages/UnderDevelopment';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const currentUser = useAppStore((state) => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function AdminGate() {
  const adminIsLoggedIn = useAppStore((state) => state.adminIsLoggedIn);
  if (!adminIsLoggedIn) {
    return <AdminAuth />;
  }
  return <AdminDashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AndroidFrame>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected User Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/send-money" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
          <Route path="/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
          <Route path="/recharge" element={<ProtectedRoute><Recharge /></ProtectedRoute>} />
          <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
          <Route path="/earn-money" element={<ProtectedRoute><EarnMoney /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

          {/* Secret Admin Route - accessed solely via /admin at the end of the URL */}
          <Route path="/admin" element={<AdminGate />} />
          <Route path="/admin/*" element={<AdminGate />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AndroidFrame>
    </BrowserRouter>
  );
}

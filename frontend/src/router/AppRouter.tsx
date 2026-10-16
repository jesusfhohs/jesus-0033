import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DashboardScreen from '@/screens/dashboard/DashboardScreen';
import SaldoScreen from '@/screens/saldo/SaldoScreen';
import MainLayout from '@/components/layout/MainLayout';
import { SaldoProvider } from '@/context/SaldoProvider';

interface AppRouterProps {
  onLogout: () => void;
}

export default function AppRouter({ onLogout }: AppRouterProps) {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route
          element={
            <SaldoProvider>
              <MainLayout onLogout={onLogout} />
            </SaldoProvider>
          }
        >
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/saldo" element={<SaldoScreen />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
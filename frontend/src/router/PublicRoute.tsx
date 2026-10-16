import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth';

export default function PublicRoute() {
  const { isAuthenticated } = getCurrentUser();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

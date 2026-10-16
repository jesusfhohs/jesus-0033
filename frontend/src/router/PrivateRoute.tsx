import { Navigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '@/api/auth';

export default function PrivateRoute() {
  const { isAuthenticated } = getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

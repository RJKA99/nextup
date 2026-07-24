import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <p className="mt-24 text-center text-slate-500">Ladataan…</p>;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

import useAuth from '../context/useAuth';
import { Navigate } from 'react-router-dom';

export default function RequireAuth({ children }) {
  const { user, authLoading } = useAuth();
  
  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

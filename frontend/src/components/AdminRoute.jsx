import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute({ children }) {
  const { user } = useSelector((s) => s.auth);
  if (!user || user.role !== 'ROLE_ADMIN') return <Navigate to="/" replace />;
  return children;
}

import { useAuth } from '../hooks/useAuth';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  requiredRoles?: string[];
}

const ProtectedRoute = ({ requiredRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Tampilkan loading indicator di tengah halaman
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    // Redirect ke halaman login, simpan lokasi asal
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles if required
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    // If user doesn't have required role, redirect to dashboard home
    return <Navigate to="/dashboard" replace />;
  }

  // Jika user ada, tampilkan rute yang di-nest
  return <Outlet />;
};

export default ProtectedRoute;
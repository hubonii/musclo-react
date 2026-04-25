// Route guard component for auth-required route branches.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// Redirects unauthenticated users and preserves requested location for post-login return.
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect state includes the attempted route in `state.from`.
        return <Navigate to="/login" state={{ from: location }} replace/>;
    }

    // Force verification if logged in but not verified
    if (user && !user.email_verified_at) {
        return <Navigate to="/verify-email" replace />;
    }

    return <>{children}</>;
}



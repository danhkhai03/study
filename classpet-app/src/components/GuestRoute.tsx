import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface GuestRouteProps {
    children: React.ReactNode;
}

export default function GuestRoute({ children }: GuestRouteProps) {
    const { isAuthenticated, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/teacher/dashboard" replace />;
    }

    return <>{children}</>;
}

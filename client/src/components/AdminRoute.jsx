import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    // 1. Get role from storage
    const role = localStorage.getItem('role');
    
    // 2. Security Check
    // If role is NOT admin, redirect to Home ("/")
    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // 3. If admin, render the requested page (Outlet)
    return <Outlet />;
};

export default AdminRoute;
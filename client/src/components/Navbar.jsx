import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, Plus, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
    const navigate = useNavigate();
    
    // 1. Get Token and Role from LocalStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    // 2. Check if the user is an Admin
    const isAdmin = role === 'admin';

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role'); // Important: Clear role on logout
        toast.success("Logged out successfully");
        navigate('/auth');
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-darker border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
            {/* Left Side: Logo & Navigation */}
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-accent transition duration-200">
                    <Code2 className="w-7 h-7 text-accent" />
                </Link>

                {/* 👇 CONDITIONAL RENDERING: Only show if isAdmin is true 👇 */}
                {isAdmin && (
                    <Link 
                        to="/admin" 
                        className="flex items-center gap-1 text-sm font-bold text-purple-400 hover:text-purple-300 transition-colors bg-purple-900/10 px-3 py-1.5 rounded-full border border-purple-900/20"
                    >
                        <Plus size={16} />
                        Add Problem
                    </Link>
                )}
            </div>
            
            {/* Right Side: Auth Buttons */}
            <div className="flex gap-4">
                {token ? (
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                ) : (
                    <Link 
                        to="/auth" 
                        className="bg-accent hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-lg shadow-blue-900/20"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
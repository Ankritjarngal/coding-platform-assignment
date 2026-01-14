import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, Plus, Shield, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';
import API from '../api';

const Navbar = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const loadUser = async () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (!token) {
            setUser(null);
            setIsAdmin(false);
            return;
        }

        setIsAdmin(role === 'admin');

        try {
            const { data } = await API.get('/auth/profile');
            setUser({
                name: data.username,
                avatar: data.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${data.username}`
            });
        } catch (e) {
            console.error("Failed to load profile", e);
            if (e.response && e.response.status === 403) {
                localStorage.clear();
                setUser(null);
            }
        }
    };

    useEffect(() => {
        loadUser();

        window.addEventListener('authUpdated', loadUser);
        window.addEventListener('profileUpdated', loadUser);

        return () => {
            window.removeEventListener('authUpdated', loadUser);
            window.removeEventListener('profileUpdated', loadUser);
        };
    }, []);

    const logout = () => {
        localStorage.clear();
        setUser(null);
        setIsAdmin(false);
        toast.success("Logged out");
        navigate('/auth');
    };

    return (
        <nav className="flex justify-between items-center p-4 bg-darker border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90 h-[72px]">
            <div className="flex items-center gap-8">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-accent transition duration-200">
                    <Code2 className="w-7 h-7 text-accent" />
                    <span className="hidden md:block">CodeJudge</span>
                </Link>

  
            </div>
            
            <div className="flex gap-4 items-center">
                {user ? (
                    <div className="relative">
                        <button 
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 focus:outline-none hover:bg-white/5 p-1.5 rounded-full transition-all border border-transparent hover:border-gray-700"
                        >
                            <span className="text-right hidden md:block">
                                <div className="text-sm font-bold text-white leading-tight">{user.name}</div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-wide">{isAdmin ? 'Admin' : 'Student'}</div>
                            </span>
                            <img 
                                src={user.avatar} 
                                alt="Avatar" 
                                className="w-9 h-9 rounded-full border-2 border-gray-700 bg-black object-cover"
                            />
                        </button>

                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-darker border border-gray-700 rounded-xl shadow-2xl py-2 z-20 animate-in fade-in zoom-in-95">
                                    <div className="px-4 py-2 border-b border-gray-700 mb-1 md:hidden">
                                        <div className="text-white font-bold">{user.name}</div>
                                    </div>
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setShowDropdown(false)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Settings size={16} /> Edit Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link 
                                            to="/admin" 
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 transition-colors"
                                        >
                                            <Shield size={16} /> Admin Panel
                                        </Link>
                                    )}
                                    <div className="h-px bg-gray-700 my-1"></div>
                                    <button 
                                        onClick={logout} 
                                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/10 transition-colors"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <Link to="/auth" className="bg-accent hover:bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-lg shadow-blue-900/20">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    // State matches backend expectations: name, email, password
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        
        try {
            const { data } = await API.post(endpoint, form);
            
            if (isLogin) {
                // Login Success
                localStorage.setItem('token', data.token);
                
                // SAVE THE ROLE TO LOCALSTORAGE
                localStorage.setItem('role', data.role); 

                toast.success('Welcome back!');
                navigate('/');
            } else {
                // Register Success
                toast.success('Account created! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            const msg = err.response?.data || 'Something went wrong';
            toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
            <div className="w-full max-w-md bg-darker p-8 rounded-xl border border-gray-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">
                    {isLogin ? 'Login to CodeJudge' : 'Create Account'}
                </h2>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    {/* Name Input (Only for Register) */}
                    {!isLogin && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                            required
                        />
                    )}

                    {/* Email Input */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={form.email}
                        onChange={handleChange}
                        className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                        required
                    />

                    {/* Password Input */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                        required
                    />

                    <button className="bg-accent p-3 rounded font-bold text-white hover:bg-blue-600 transition">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <p className="mt-4 text-center text-gray-400 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span 
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setForm({ name: '', email: '', password: '' }); 
                        }} 
                        className="text-accent cursor-pointer hover:underline"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;
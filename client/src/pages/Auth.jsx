import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ username: '', user_email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/user/login' : '/user/register';
        try {
            const { data } = await API.post(endpoint, form);
            if (isLogin) {
                localStorage.setItem('token', data.token);
                toast.success('Welcome back!');
                navigate('/');
            } else {
                toast.success('Account created! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)]">
            <div className="w-full max-w-md bg-darker p-8 rounded-xl border border-gray-800 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center text-white">
                    {isLogin ? 'Login to CodeJudge' : 'Create Account'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <input
                            type="email"
                            placeholder="Email"
                            className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                            onChange={(e) => setForm({ ...form, user_email: e.target.value })}
                        />
                    )}
                    <input
                        type="text"
                        placeholder="Username"
                        className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="p-3 rounded bg-black border border-gray-700 text-white focus:border-accent outline-none"
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button className="bg-accent p-3 rounded font-bold text-white hover:bg-blue-600 transition">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-400 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => setIsLogin(!isLogin)} className="text-accent cursor-pointer hover:underline">
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Auth;